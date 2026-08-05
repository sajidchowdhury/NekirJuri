// ============================================================
// Madrasha ERP SaaS — Auth Configuration (NextAuth v4)
// Credentials provider with tenant-aware login
// ============================================================

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'

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
          throw new Error('Invalid email or password')
        }

        if (!user.isSuperAdmin && credentials.tenantSlug) {
          if (user.tenant?.slug !== credentials.tenantSlug) {
            throw new Error('Access denied for this institution')
          }
        }

        const roles = user.userRoles.map(ur => ur.role.slug)
        const permissions = user.userRoles.flatMap(ur =>
          ur.role.rolePermissions.map(rp => rp.permission.slug)
        )

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
  secret: process.env.NEXTAUTH_SECRET || 'madrasha-erp-dev-secret-change-in-production',
}

declare module 'next-auth' {
  interface User {
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    isSuperAdmin?: string
    roles?: string
    permissions?: string
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
  }
}
