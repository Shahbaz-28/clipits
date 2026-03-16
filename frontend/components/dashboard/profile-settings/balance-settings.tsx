"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { authFetch } from "@/lib/api-client"

export function BalanceSettings() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setBalance(0)
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      try {
        const res = await authFetch("/api/wallet/balance", { method: "POST" })
        const data = await res.json()
        if (!res.ok || data.error) {
          toast.error(data.error || "Could not load wallet balance.")
          setBalance(0)
        } else {
          setBalance(data.availableBalance ?? 0)
        }
      } catch (err) {
        console.error(err)
        toast.error("Could not load wallet balance.")
        setBalance(0)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-heading-text">Balance</h2>
        <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-label" />
            <span className="text-muted-label">Loading balance...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-heading-text">Balance</h2>
      <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-turquoise-accent/10 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-turquoise-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-label font-medium">Available balance</p>
                <p className="text-3xl font-bold text-heading-text">
                  ₹{(balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-label mt-1">From approved submissions</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-border text-body-text hover:bg-section-bg shrink-0">
              <Link href="/dashboard/earnings" className="inline-flex items-center gap-2">
                View earnings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
