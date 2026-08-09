// ============================================================
// SYSTEM — Roles API
// GET  /api/roles         — List roles with permissions for tenant
// POST /api/roles         — Create role with optional permission assignments
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
import { roleCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)

    const where: Record<string, unknown> = { tenantId }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const [roles, total] = await Promise.all([
      db.role.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { userRoles: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.role.count({ where }),
    ])

    return paginated(roles, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/roles]', err)
    return error('Failed to fetch roles', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const body = await request.json()

    // Zod validation
    const parsed = roleCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    const { name, slug, description, isSystem, permissionIds } = parsed.data

    // Check slug uniqueness within tenant
    const existing = await db.role.findFirst({
      where: { tenantId, slug },
    })
    if (existing) {
      return error('A role with this slug already exists')
    }

    const role = await db.role.create({
      data: {
        tenantId,
        name,
        slug,
        description,
        isSystem: isSystem ?? false,
        ...(permissionIds &&
          Array.isArray(permissionIds) &&
          permissionIds.length > 0 && {
            rolePermissions: {
              create: permissionIds.map((permissionId: number) => ({
                permissionId,
              })),
            },
          }),
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    })

    return created(role)
  } catch (err) {
    console.error('[POST /api/roles]', err)
    return error('Failed to create role', 500)
  }
}
