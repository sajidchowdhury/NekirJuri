// ============================================================
// Madrasha ERP SaaS — Auth Configuration (NextAuth v4)
// Credentials provider with tenant-aware login
// ============================================================

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { rateLimit, RateLimits } from './rate-limit'

// Track failed login attempts for brute-force protection (defense in depth)
// The middleware also rate-limits by IP, but this adds per-user protection
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of failedLoginAttempts) {
    if (now > entry.lockedUntil) {
      failedLoginAttempts.delete(key)
    }
  }
}, 10 * 60 * 1000)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Brute-force protection: check if account is temporarily locked
        const lockoutKey = credentials.email.toLowerCase()
        const lockoutEntry = failedLoginAttempts.get(lockoutKey)
        if (lockoutEntry && Date.now() < lockoutEntry.lockedUntil) {
          const remainingMinutes = Math.ceil((lockoutEntry.lockedUntil - Date.now()) / 60000)
          throw new Error(`Account temporarily locked. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`)
        }

        const user = await db.user.findFirst({
          where: {
            email: credentials.email,
            deletedAt: null,
            isActive: true,
          },
          include: {
            tenant: true,
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          // Track failed login attempt for brute-force protection
          const existing = failedLoginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
          const newCount = existing.count + 1
          if (newCount >= MAX_FAILED_ATTEMPTS) {
            failedLoginAttempts.set(lockoutKey, {
              count: newCount,
              lockedUntil: Date.now() + LOCKOUT_DURATION,
            })
            throw new Error(`Too many failed attempts. Account locked for 15 minutes.`)
          } else {
            failedLoginAttempts.set(lockoutKey, { count: newCount, lockedUntil: 0 })
          }
          throw new Error('Invalid email or password')
        }

        if (!user.isSuperAdmin && credentials.tenantSlug) {
          if (user.tenant?.slug !== credentials.tenantSlug) {
            throw new Error('Access denied for this institution')
          }
        }

        // Clear failed login attempts on successful login
        failedLoginAttempts.delete(lockoutKey)

        const roles = user.userRoles.map(ur => ur.role.slug)
        const permissions = user.userRoles.flatMap(ur =>
          ur.role.rolePermissions.map(rp => rp.permission.slug)
        )

        // Fetch active subscription for enforcement
        let subscriptionStatus = 'none'
        let subscriptionPlanSlug = ''
        let subscriptionPlanName = ''
        let enforcementLevel = 'blocked'

        if (user.tenantId) {
          const subscription = await db.subscription.findFirst({
            where: { tenantId: user.tenantId, status: { notIn: ['cancelled', 'terminated'] } },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          })

          if (subscription) {
            subscriptionStatus = subscription.status
            subscriptionPlanSlug = subscription.plan.slug
            subscriptionPlanName = subscription.plan.name

            // Compute enforcement level
            const { computeEnforcement } = await import('./subscription')
            const enforcement = computeEnforcement({
              status: subscription.status as any,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              currentPeriodEnd: subscription.currentPeriodEnd,
              gracePeriodEnd: subscription.gracePeriodEnd,
              restrictedEnd: subscription.restrictedEnd,
              trialEnd: subscription.trialEnd,
              features: (subscription.plan.features as string[]) ?? [],
              maxStudents: subscription.plan.maxStudents,
              maxEmployees: subscription.plan.maxEmployees,
              maxStorageMb: subscription.plan.maxStorageMb,
              maxAlbums: subscription.plan.maxAlbums,
              maxImagesPerAlbum: subscription.plan.maxImagesPerAlbum,
              maxImageSizeMb: subscription.plan.maxImageSizeMb,
            })
            enforcementLevel = enforcement.level

            // Update tenant cache if stale
            const { computeTenantCache } = await import('./subscription')
            const cache = computeTenantCache(enforcement)
            if (user.tenant && (user.tenant.subscriptionStatus !== cache.subscriptionStatus || user.tenant.isReadOnly !== cache.isReadOnly)) {
              await db.tenant.update({
                where: { id: user.tenantId },
                data: {
                  subscriptionStatus: cache.subscriptionStatus,
                  isReadOnly: cache.isReadOnly,
                },
              })
            }
          }
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        if (user.tenantId) {
          await db.activityLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.id,
              action: 'user.login',
              entityType: 'user',
              entityId: user.id,
              description: `${user.name} logged in`,
            },
          })
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          tenantId: String(user.tenantId || ''),
          tenantSlug: user.tenant?.slug || '',
          tenantName: user.tenant?.name || '',
          isSuperAdmin: String(user.isSuperAdmin),
          roles: roles.join(','),
          permissions: permissions.join(','),
          subscriptionStatus,
          subscriptionPlanSlug,
          subscriptionPlanName,
          enforcementLevel,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, unknown>
        token.tenantId = u.tenantId as string
        token.tenantSlug = u.tenantSlug as string
        token.tenantName = u.tenantName as string
        token.isSuperAdmin = u.isSuperAdmin as string
        token.roles = u.roles as string
        token.permissions = u.permissions as string
        token.subscriptionStatus = u.subscriptionStatus as string
        token.subscriptionPlanSlug = u.subscriptionPlanSlug as string
        token.subscriptionPlanName = u.subscriptionPlanName as string
        token.enforcementLevel = u.enforcementLevel as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
        session.user.tenantName = token.tenantName as string
        session.user.isSuperAdmin = token.isSuperAdmin === 'true'
        session.user.roles = (token.roles as string || '').split(',').filter(Boolean)
        session.user.permissions = (token.permissions as string || '').split(',').filter(Boolean)
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.subscriptionPlanSlug = token.subscriptionPlanSlug as string
        session.user.subscriptionPlanName = token.subscriptionPlanName as string
        session.user.enforcementLevel = token.enforcementLevel as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Validate that NEXTAUTH_SECRET is set (fail fast in production)
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXTAUTH_SECRET environment variable is required in production. ' +
    'Generate one with: openssl rand -base64 32'
  )
}

declare module 'next-auth' {
  interface User {
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    isSuperAdmin?: string
    roles?: string
    permissions?: string
    subscriptionStatus?: string
    subscriptionPlanSlug?: string
    subscriptionPlanName?: string
    enforcementLevel?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      tenantId: string
      tenantSlug: string
      tenantName: string
      isSuperAdmin: boolean
      roles: string[]
      permissions: string[]
      subscriptionStatus: string
      subscriptionPlanSlug: string
      subscriptionPlanName: string
      enforcementLevel: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    isSuperAdmin?: string
    roles?: string
    permissions?: string
    subscriptionStatus?: string
    subscriptionPlanSlug?: string
    subscriptionPlanName?: string
    enforcementLevel?: string
  }
}
