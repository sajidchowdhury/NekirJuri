// ============================================================
// Madrasha ERP SaaS — API Response Helpers
// ============================================================

import { NextResponse } from 'next/server'
import type { PaginatedResponse, PaginationParams } from './types'

/** Success response with data */
export function success<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status }
  )
}

/** Created response */
export function created<T>(data: T, message?: string) {
  return NextResponse.json(
    { success: true, data, message: message || 'Created successfully' },
    { status: 201 }
  )
}

/** Error response */
export function error(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

/** Not found response */
export function notFound(entity = 'Resource') {
  return NextResponse.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  )
}

/** Unauthorized response */
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

/** Forbidden response */
export function forbidden(message = 'Insufficient permissions') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  )
}

/** Paginated response */
export function paginated<T>(data: T[], total: number, params: PaginationParams): NextResponse<PaginatedResponse<T>> {
  const page = params.page || 1
  const limit = params.limit || 20
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

/** Parse pagination params from URL search params */
export function getPaginationParams(url: URL): PaginationParams {
  return {
    page: Math.max(1, Number(url.searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20)),
    search: url.searchParams.get('search') || undefined,
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: url.searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc',
  }
}

/** Get tenant ID from request headers (set by middleware) */
export function getTenantId(request: Request): number | null {
  const tid = request.headers.get('x-tenant-id')
  return tid ? Number(tid) : null
}

/** Get user ID from request headers */
export function getUserId(request: Request): number | null {
  const uid = request.headers.get('x-user-id')
  return uid ? Number(uid) : null
}

/** Require tenant ID or return error */
export function requireTenantId(request: Request): number | NextResponse {
  const tid = getTenantId(request)
  if (!tid) return unauthorized('Tenant context required')
  return tid
}
