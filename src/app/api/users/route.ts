// ============================================================
// SYSTEM — Users API
// GET  /api/users         — List users (paginated, filter by tenantId)
// POST /api/users         — Create user with role assignment & hashed password
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  paginated,
  getPaginationParams,
  requireTenantId,
} from '@/lib/api-utils'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)

    const where: Record<string, unknown> = { tenantId, deletedAt: null }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          uuid: true,
          tenantId: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          isSuperAdmin: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ])

    // Strip passwordHash from response
    return paginated(users, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/users]', err)
    return error('Failed to fetch users', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const body = await request.json()
    const {
      email,
      password,
      name,
      phone,
      avatarUrl,
      isActive,
      isSuperAdmin,
      roleIds,
    } = body as {
      email: string
      password: string
      name: string
      phone?: string
      avatarUrl?: string
      isActive?: boolean
      isSuperAdmin?: boolean
      roleIds?: number[]
    }

    if (!email || !password || !name) {
      return error('email, password, and name are required')
    }

    // Check email uniqueness within tenant
    const existing = await db.user.findFirst({
      where: { tenantId, email },
    })
    if (existing) {
      return error('A user with this email already exists in this tenant')
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await db.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        name,
        phone,
        avatarUrl,
        isActive: isActive ?? true,
        isSuperAdmin: isSuperAdmin ?? false,
        ...(roleIds &&
          Array.isArray(roleIds) &&
          roleIds.length > 0 && {
            userRoles: {
              create: roleIds.map((roleId: number) => ({ roleId })),
            },
          }),
      },
      select: {
        id: true,
        uuid: true,
        tenantId: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    return created(user)
  } catch (err) {
    console.error('[POST /api/users]', err)
    return error('Failed to create user', 500)
  }
}
