"use client"

import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestAuthPage() {
  const { user, session, loading } = useAuth()
  const [apiResult, setApiResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const testApiCall = async () => {
    try {
      setError("")
      const result = await api.getMe()
      setApiResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth State:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify({ user, session: !!session }, null, 2)}
          </pre>
        </div>

        <Button onClick={testApiCall}>Test API Call</Button>

        {apiResult && (
          <div>
            <h2 className="text-lg font-semibold">API Result:</h2>
            <pre className="bg-green-100 p-4 rounded">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div>
            <h2 className="text-lg font-semibold text-red-600">Error:</h2>
            <pre className="bg-red-100 p-4 rounded text-red-600">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
