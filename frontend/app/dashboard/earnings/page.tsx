"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Loader2, ExternalLink, Link, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface ApprovedSubmission {
  id: string
  campaign_id: string
  content_link: string
  platform: string
  view_count: number
  earnings: number
  submitted_at: string
  reviewed_at: string | null
  campaign?: { title: string }
}

export default function EarningsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ApprovedSubmission[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setSubmissions([])
      setTotalBalance(0)
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from("submissions")
        .select("id, campaign_id, content_link, platform, view_count, earnings, submitted_at, reviewed_at")
        .eq("user_id", user?.id ?? "")
        .eq("status", "approved")
        .order("reviewed_at", { ascending: false })

      if (error) {
        toast.error(error.message)
        setSubmissions([])
        setTotalBalance(0)
        setLoading(false)
        return
      }

      const rows = (data || []) as ApprovedSubmission[]
      const total = rows.reduce((sum, s) => sum + Number(s.earnings || 0), 0)
      setTotalBalance(total)

      if (rows.length === 0) {
        setSubmissions([])
        setLoading(false)
        return
      }

      const campaignIds = [...new Set(rows.map((r) => r.campaign_id))]
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, title")
        .in("id", campaignIds)
      const campaignMap = new Map((campaigns || []).map((c) => [c.id, c]))
      rows.forEach((r) => {
        r.campaign = campaignMap.get(r.campaign_id) as { title: string } | undefined
      })
      setSubmissions(rows)
      setLoading(false)
    }
    load()
  }, [user?.id])

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-heading-text mb-4">Earnings</h1>
        <p className="text-muted-label mt-1 mb-6">Balance and payout history</p>
        <div className="flex items-center gap-2 py-12 text-muted-label">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading earnings...</span>
        </div>
      </>
    )
  }

  const hasEarnings = submissions.length > 0

  return (
    <>
      <h1 className="text-2xl font-bold text-heading-text mb-4">Earnings</h1>
      <p className="text-muted-label mt-1 mb-6">Balance and payout history</p>

      {!hasEarnings ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-section-bg mb-4">
            <DollarSign className="w-12 h-12 text-muted-label" />
          </div>
          <h2 className="text-xl font-semibold text-heading-text mb-2">No earnings yet</h2>
          <p className="text-muted-label max-w-sm mb-6">
            Earn from approved submissions. Views are tracked automatically and earnings update every few hours.
          </p>
          <Button
            variant="outline"
            className="border-border text-body-text hover:bg-section-bg"
            onClick={() => router.push("/dashboard/explore")}
          >
            Explore campaigns
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Balance card */}
          <Card className="bg-main-bg border-border shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-turquoise-accent/10 flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-turquoise-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-label font-medium">Available balance</p>
                    <p className="text-3xl font-bold text-heading-text">
                      ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <Button
                  disabled
                  variant="outline"
                  className="border-border text-muted-label shrink-0"
                  title="Coming soon"
                >
                  Request payout (coming soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approved submissions list */}
          <div>
            <h2 className="text-lg font-semibold text-heading-text mb-3">Earnings from approved content</h2>
            <div className="space-y-3">
              {submissions.map((s) => (
                <Card key={s.id} className="bg-main-bg border-border shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-label mb-1">{s.campaign?.title ?? "Campaign"}</p>
                        <a
                          href={s.content_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-text hover:text-turquoise-accent font-medium flex items-center gap-2 truncate"
                        >
                          <Link className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{s.content_link}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        <p className="text-xs text-muted-label mt-2">
                          Approved {s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : new Date(s.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-sm text-muted-label">{s.view_count.toLocaleString()} views gained</span>
                        <span className="text-lg font-semibold text-turquoise-accent">
                          ₹{Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
