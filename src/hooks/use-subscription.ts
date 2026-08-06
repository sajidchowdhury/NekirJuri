'use client'

// ============================================================
// useSubscription — Client-side subscription enforcement hook
// Fetches enforcement status, caches for 5 minutes, and
// provides canWrite/canRead helper functions
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import type { EnforcementResult, EnforcementLevel, SubscriptionStatus } from '@/lib/subscription'

/** Shape returned by the /api/subscriptions/check endpoint */
export interface SubscriptionCheckResponse {
  enforcement: EnforcementResult
  planName?: string
  planSlug?: string
}

/** Cache entry with timestamp */
interface CacheEntry {
  data: SubscriptionCheckResponse
  timestamp: number
}

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL = 5 * 60 * 1000

/** In-memory cache keyed by tenantId */
const cache = new Map<string, CacheEntry>()

/** Return type of the hook */
export interface UseSubscriptionReturn {
  /** Full enforcement result from the API */
  enforcement: EnforcementResult | null
  /** Plan name from the subscription */
  planName: string
  /** Plan slug from the subscription */
  planSlug: string
  /** Loading state */
  loading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Refresh the subscription status (bypasses cache) */
  refresh: () => Promise<void>
  /** Whether the tenant can write (create/update/delete) */
  canWrite: () => boolean
  /** Whether the tenant can read (view) */
  canRead: () => boolean
  /** Convenience: true if enforcement level is 'full' */
  isFullAccess: boolean
  /** Convenience: true if enforcement level is 'readonly' */
  isReadOnly: boolean
  /** Convenience: true if blocked or terminated */
  isBlocked: boolean
}

/**
 * useSubscription fetches and caches the subscription enforcement
 * status for the given tenant.
 *
 * @param tenantId - The tenant ID to check (if empty, returns blocked)
 */
export function useSubscription(tenantId?: string): UseSubscriptionReturn {
  const [enforcement, setEnforcement] = useState<EnforcementResult | null>(null)
  const [planName, setPlanName] = useState<string>('')
  const [planSlug, setPlanSlug] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchCheck = useCallback(async (bypassCache = false) => {
    if (!tenantId) {
      // No tenant → blocked
      setEnforcement({
        level: 'blocked',
        status: 'terminated' as SubscriptionStatus,
        isExpired: true,
        isInTrial: false,
        daysRemaining: 0,
        trialDaysRemaining: 0,
        warnings: ['No tenant associated with this account.'],
        features: [],
        maxStudents: 0,
        maxEmployees: 0,
        maxStorageMb: 0,
      })
      setPlanName('')
      setPlanSlug('')
      setLoading(false)
      return
    }

    // Check cache first
    if (!bypassCache) {
      const cached = cache.get(tenantId)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setEnforcement(cached.data.enforcement)
        setPlanName(cached.data.planName ?? '')
        setPlanSlug(cached.data.planSlug ?? '')
        setLoading(false)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/subscriptions/check?tenantId=${encodeURIComponent(tenantId)}`)
      if (!res.ok) {
        throw new Error(`Failed to check subscription: ${res.status}`)
      }
      const data: SubscriptionCheckResponse = await res.json()

      // Update cache
      cache.set(tenantId, { data, timestamp: Date.now() })

      setEnforcement(data.enforcement)
      setPlanName(data.planName ?? '')
      setPlanSlug(data.planSlug ?? '')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      // On error, default to restricted (safe default)
      setEnforcement({
        level: 'restricted',
        status: 'restricted' as SubscriptionStatus,
        isExpired: false,
        isInTrial: false,
        daysRemaining: 0,
        trialDaysRemaining: 0,
        warnings: ['Unable to verify subscription status.'],
        features: [],
        maxStudents: 0,
        maxEmployees: 0,
        maxStorageMb: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  const refresh = useCallback(async () => {
    await fetchCheck(true)
  }, [fetchCheck])

  // Initial fetch + auto-refresh every 5 minutes
  useEffect(() => {
    fetchCheck()

    // Set up auto-refresh interval
    refreshTimeoutRef.current = setInterval(() => {
      fetchCheck(true)
    }, CACHE_TTL)

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [fetchCheck])

  const canWrite = useCallback((): boolean => {
    if (!enforcement) return false
    return enforcement.level === 'full'
  }, [enforcement])

  const canRead = useCallback((): boolean => {
    if (!enforcement) return false
    // full and readonly can both read
    return enforcement.level === 'full' || enforcement.level === 'readonly'
  }, [enforcement])

  const isFullAccess = enforcement?.level === 'full'
  const isReadOnly = enforcement?.level === 'readonly'
  const isBlocked = enforcement?.level === 'blocked' || enforcement?.level === 'restricted'

  return {
    enforcement,
    planName,
    planSlug,
    loading,
    error,
    refresh,
    canWrite,
    canRead,
    isFullAccess,
    isReadOnly,
    isBlocked,
  }
}

export default useSubscription
