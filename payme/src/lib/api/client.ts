export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

export async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const message =
        body?.errors?.[0]?.message ||
        body?.message ||
        'Something went wrong. Please try again.'
      return { ok: false, status: res.status, message }
    }

    const data = await res.json().catch(() => ({}) as T)
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Unable to connect. Please check your connection and try again.',
    }
  }
}

export function post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

export function get<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'GET' })
}

export function patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PATCH',
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
