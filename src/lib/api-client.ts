// ============================================================
// Madrasha ERP SaaS — Centralized API Client
// Provides a typed fetch wrapper for frontend→API communication
// ============================================================

/** API Error with status code and message */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Generic API response shape */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated API response shape */
export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Typed fetch wrapper for API calls.
 * - Throws ApiError on non-OK responses
 * - Returns parsed JSON data on success
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      if (body.message) message = body.message;
    } catch {
      // Ignore JSON parse error
    }
    throw new ApiError(message, res.status);
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success && json.error) {
    throw new ApiError(json.error, res.status);
  }
  return json.data as T;
}

/**
 * Fetch a paginated list from an API endpoint.
 * Returns { data, pagination } or throws ApiError.
 */
export async function apiFetchList<T>(
  url: string
): Promise<PaginatedData<T>> {
  const res = await fetch(url);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // Ignore
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

/**
 * POST/PUT data to an API endpoint.
 * Returns parsed response data or throws ApiError.
 */
export async function apiSubmit<T>(
  url: string,
  method: 'POST' | 'PUT',
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json = await res.json();
      if (json.error) message = json.error;
    } catch {
      // Ignore
    }
    throw new ApiError(message, res.status);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data as T;
}

/**
 * DELETE an entity by ID.
 * Returns parsed response data or throws ApiError.
 */
export async function apiDelete<T>(
  url: string
): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' });

  if (!res.ok) {
    let message = `Delete failed (${res.status})`;
    try {
      const json = await res.json();
      if (json.error) message = json.error;
    } catch {
      // Ignore
    }
    throw new ApiError(message, res.status);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data as T;
}
