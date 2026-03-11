import { supabase } from "./supabase"

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`
  }
  return headers
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders()
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
}
