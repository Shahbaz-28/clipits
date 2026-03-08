"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

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
      const { data, error } = await supabase
        .from("submissions")
        .select("earnings")
        .eq("user_id", user?.id ?? "")
        .eq("status", "approved")
      if (error) {
        toast.error(error.message)
        setBalance(0)
        setLoading(false)
        return
      }
      const total = (data || []).reduce((sum, row) => sum + Number(row.earnings || 0), 0)
      setBalance(total)
      setLoading(false)
    }
    load()
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
