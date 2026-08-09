// ============================================================
// Madrasha ERP SaaS — Rate Limiter
// In-memory sliding window rate limiting
// No external dependencies (Redis not needed for single-instance)
// ============================================================

interface RateLimitEntry {
  timestamps: number[]
}

/** In-memory store for rate limit tracking */
const store = new Map<string, RateLimitEntry>()

/** Clean up expired entries every 5 minutes to prevent memory leaks */
const CLEANUP_INTERVAL = 5 * 60 * 1000
const ENTRY_TTL = 60 * 1000 // max window size we support

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of store) {
    // Remove timestamps older than 1 minute
    entry.timestamps = entry.timestamps.filter(ts => now - ts < ENTRY_TTL)
    // Remove empty entries
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum number of requests within the window */
  maxRequests: number
  /** Key prefix for namespacing (e.g., 'login', 'api') */
  keyPrefix: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Current request count in the window */
  current: number
  /** Maximum allowed requests */
  limit: number
  /** Time when the rate limit resets (ms timestamp) */
  resetAt: number
  /** Seconds until the limit resets (for Retry-After header) */
  retryAfter: number
}

/**
 * Check if a request is rate-limited using a sliding window algorithm.
 *
 * @param key - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup()

  const now = Date.now()
  const storeKey = `${config.keyPrefix}:${key}`
  const windowStart = now - config.windowMs

  // Get or create entry
  let entry = store.get(storeKey)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(storeKey, entry)
  }

  // Remove timestamps outside the current window (sliding window)
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)

  // Check if limit exceeded
  const current = entry.timestamps.length
  const allowed = current < config.maxRequests

  if (allowed) {
    // Record this request
    entry.timestamps.push(now)
  }

  // Calculate reset time (oldest timestamp in window + windowMs)
  const oldestInWindow = entry.timestamps.length > 0 ? entry.timestamps[0] : now
  const resetAt = oldestInWindow + config.windowMs
  const retryAfter = Math.ceil((resetAt - now) / 1000)

  return {
    allowed,
    current: allowed ? current + 1 : current,
    limit: config.maxRequests,
    resetAt,
    retryAfter: Math.max(1, retryAfter),
  }
}

/**
 * Pre-configured rate limit presets for different route types
 */
export const RateLimits = {
  /** Login route: 5 attempts per 15 minutes per IP */
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'login' } satisfies RateLimitConfig,

  /** Registration route: 3 attempts per hour per IP */
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'register' } satisfies RateLimitConfig,

  /** Password reset: 3 attempts per hour per IP */
  forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'forgot-password' } satisfies RateLimitConfig,

  /** General API: 100 requests per minute per IP */
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'api' } satisfies RateLimitConfig,

  /** Write operations (POST/PUT/PATCH): 30 requests per minute per IP */
  write: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'write' } satisfies RateLimitConfig,

  /** Health check: 10 requests per minute per IP */
  health: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'health' } satisfies RateLimitConfig,
} as const

/**
 * Get client IP from request headers (set by Caddy reverse proxy)
 */
export function getClientIp(request: Request): string {
  // Check forwarded headers first (set by Caddy/reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // Fallback for direct connections
  return 'unknown'
}
