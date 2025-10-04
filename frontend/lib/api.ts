import { supabase } from './supabase'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', body, headers = {} } = options

  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Failed to get authentication session')
    }
    
    if (!session?.access_token) {
      throw new Error('No authentication token found. Please sign in again.')
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...headers
      }
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${apiUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('API request error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred')
  }
}

export const api = {
  auth: {
    me: () => apiRequest('/auth/me'),
    verify: (token: string) => apiRequest('/auth/verify', { method: 'POST', body: { token } })
  },
  campaigns: {
    getAll: () => apiRequest('/campaigns'),
    getById: (id: string) => apiRequest(`/campaigns/${id}`),
    join: (id: string) => apiRequest(`/campaigns/${id}/join`, { method: 'POST' }),
    create: (data: any) => apiRequest('/campaigns', { method: 'POST', body: data })
  },
  submissions: {
    getAll: () => apiRequest('/submissions'),
    create: (data: any) => apiRequest('/submissions', { method: 'POST', body: data }),
    update: (id: string, data: any) => apiRequest(`/submissions/${id}`, { method: 'PUT', body: data })
  },
  users: {
    getProfile: () => apiRequest('/users/profile'),
    getEarnings: () => apiRequest('/users/earnings'),
    getAnalytics: () => apiRequest('/users/analytics')
  },
  creatorRequests: {
    getAll: () => apiRequest('/creator-requests'),
    getMyRequests: () => apiRequest('/creator-requests/my-requests'),
    create: (data: any) => apiRequest('/creator-requests', { method: 'POST', body: data }),
    getById: (id: string) => apiRequest(`/creator-requests/${id}`),
    updateStatus: (id: string, status: string, notes?: string) => 
      apiRequest(`/creator-requests/${id}/status`, { method: 'PUT', body: { status, admin_notes: notes } })
  },
  admin: {
    getMetrics: () => apiRequest('/admin/metrics'),
    getUsers: () => apiRequest('/admin/users'),
    getSubmissions: () => apiRequest('/admin/submissions'),
    processPayout: (id: string) => apiRequest(`/admin/payouts/${id}/process`, { method: 'POST' })
  }
}
