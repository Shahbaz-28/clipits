"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Link, Loader2, CheckCircle, XCircle, Clock, ExternalLink, Instagram } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SubmissionRow {
  id: string
  campaign_id: string
  user_id: string
  content_link: string
  platform: string
  status: "pending" | "approved" | "rejected"
  view_count: number
  earnings: number
  submitted_at: string
  rejection_reason: string | null
  campaign?: { title: string }
}

export function MySubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setSubmissions([])
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from("submissions")
        .select("id, campaign_id, user_id, content_link, platform, status, view_count, earnings, submitted_at, rejection_reason")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })

      if (error) {
        toast.error(error.message)
        setSubmissions([])
        setLoading(false)
        return
      }

      const rows = (data || []) as SubmissionRow[]
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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: typeof Clock; label: string }> = {
      pending: { className: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
      approved: { className: "bg-turquoise-accent/10 text-turquoise-accent", icon: CheckCircle, label: "Approved" },
      rejected: { className: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
    }
    const c = config[status] || { className: "bg-gray-100 text-gray-600", icon: Clock, label: status }
    const Icon = c.icon
    return (
      <Badge className={`${c.className} rounded-md flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </Badge>
    )
  }

  const platformIcon = (platform: string) => {
    if (platform === "youtube" || platform === "tiktok") return null
    return <Instagram className="w-4 h-4 text-muted-label" />
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold text-heading-text mb-4">My Submissions</h1>
        <p className="text-muted-label mb-6">Your submitted content and status</p>
        <div className="flex items-center gap-2 py-12 text-muted-label">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading submissions...</span>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold text-heading-text mb-4">My Submissions</h1>
        <p className="text-muted-label mb-6">Your submitted content and status</p>
        <Card className="bg-main-bg border-border max-w-md mx-auto p-8 text-center">
          <CardContent className="p-0">
            <div className="w-14 h-14 rounded-full bg-section-bg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-muted-label" />
            </div>
            <h2 className="text-lg font-semibold text-heading-text mb-2">No submissions yet</h2>
            <p className="text-sm text-muted-label">
              Join a campaign from Explore, then submit your content link from the campaign page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold text-heading-text mb-4">My Submissions</h1>
      <p className="text-muted-label mb-6">Your submitted content and status</p>
      <div className="space-y-4">
        {submissions.map((s) => (
          <Card key={s.id} className="bg-main-bg border-border shadow-md rounded-xl">
            <CardContent className="p-5">
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
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-label">
                    {platformIcon(s.platform)}
                    <span>{s.platform}</span>
                    <span>Submitted {new Date(s.submitted_at).toLocaleDateString()}</span>
                  </div>
                  {s.status === "rejected" && s.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2">Reason: {s.rejection_reason}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {getStatusBadge(s.status)}
                  {s.status === "approved" && (
                    <>
                      <span className="text-sm text-muted-label">{s.view_count.toLocaleString()} views gained</span>
                      <span className="text-lg font-semibold text-turquoise-accent">
                        ₹{Number(s.earnings).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
