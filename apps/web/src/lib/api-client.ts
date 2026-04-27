const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error.detail || 'An error occurred')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${API_URL}${path}`).then(handleResponse<T>),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>),

  stream: (path: string, body?: unknown, signal?: AbortSignal): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    }).then((res) => {
      if (!res.ok) throw new ApiError(res.status, 'Stream error')
      return res
    }),
}

export { ApiError }
