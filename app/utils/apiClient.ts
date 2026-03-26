import { useAuthStore } from '~/stores/authStore'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Shared API client that auto-injects X-User-Email header
 * from the Pinia auth store on every non-GET request.
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers: extraHeaders = {} } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  // Inject X-User-Email header for mutating requests
  if (method !== 'GET') {
    try {
      const auth = useAuthStore()
      if (auth.email) {
        headers['X-User-Email'] = auth.email
      }
    } catch {
      // Store may not be available in SSR context; skip header
    }
  }

  const response = await $fetch<T>(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  return response
}
