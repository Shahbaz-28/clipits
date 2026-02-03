"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  IndianRupee,
  MessageSquare,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SubmissionWithCampaign {
  id: string
  campaign_id: string
  user_id: string
  content_link: string
  media_url: string | null
  platform: string
  status: "pending" | "approved" | "rejected"
  view_count: number
  earnings: number
  submitted_at: string
  rejection_reason: string | null
  campaign: {
    id: string
    title: string
    rate_per_1k: number
    min_payout: number
    max_payout: number
  }
}

function computeEarnings(viewCount: number, ratePer1k: number, minPayout: number, maxPayout: number): number {
  const raw = (viewCount / 1000) * ratePer1k
  const clamped = Math.max(minPayout, Math.min(maxPayout, raw))
  return Math.round(clamped * 100) / 100
}

export function CreatorSubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionWithCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [viewCountInputs, setViewCountInputs] = useState<Record<string, string>>({})
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})

  const loadSubmissions = async () => {
    if (!user?.id) return
    setLoading(true)
    const { data: campaignRows } = await supabase
      .from("campaigns")
      .select("id, title, rate_per_1k, min_payout, max_payout")
      .eq("created_by", user.id)
    const campaignIds = (campaignRows || []).map((c) => c.id)
    if (campaignIds.length === 0) {
      setSubmissions([])
      setLoading(false)
      return
    }
    const { data: subRows, error } = await supabase
      .from("submissions")
      .select("id, campaign_id, user_id, content_link, media_url, platform, status, view_count, earnings, submitted_at, rejection_reason")
      .in("campaign_id", campaignIds)
      .order("submitted_at", { ascending: false })

    if (error) {
      toast.error(error.message)
      setSubmissions([])
      setLoading(false)
      return
    }
    const campaignMap = new Map((campaignRows || []).map((c) => [c.id, c]))
    const list: SubmissionWithCampaign[] = (subRows || []).map((r) => ({
      ...r,
      campaign: campaignMap.get(r.campaign_id)!,
    }))
    setSubmissions(list)
    const inputs: Record<string, string> = {}
    list.forEach((s) => {
      inputs[s.id] = String(s.view_count)
    })
    setViewCountInputs(inputs)
    setLoading(false)
  }

  useEffect(() => {
    loadSubmissions()
  }, [user?.id])

  const handleApprove = async (sub: SubmissionWithCampaign) => {
    setUpdatingId(sub.id)
    const viewCount = parseInt(viewCountInputs[sub.id] ?? "0", 10) || 0
    const earnings = computeEarnings(
      viewCount,
      sub.campaign.rate_per_1k,
      sub.campaign.min_payout,
      sub.campaign.max_payout
    )
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        view_count: viewCount,
        earnings,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        rejection_reason: null,
      })
      .eq("id", sub.id)
    setUpdatingId(null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Submission approved.")
    loadSubmissions()
  }

  const handleReject = async (sub: SubmissionWithCampaign) => {
    const reason = rejectReason[sub.id]?.trim() || "Not approved"
    setUpdatingId(sub.id)
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        rejection_reason: reason,
      })
      .eq("id", sub.id)
    setUpdatingId(null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Submission rejected.")
    setRejectReason((prev) => ({ ...prev, [sub.id]: "" }))
    loadSubmissions()
  }

  const handleSetViewsOnly = async (sub: SubmissionWithCampaign) => {
    if (sub.status !== "approved") return
    const viewCount = parseInt(viewCountInputs[sub.id] ?? "0", 10) || 0
    const earnings = computeEarnings(
      viewCount,
      sub.campaign.rate_per_1k,
      sub.campaign.min_payout,
      sub.campaign.max_payout
    )
    setUpdatingId(sub.id)
    const { error } = await supabase
      .from("submissions")
      .update({ view_count: viewCount, earnings })
      .eq("id", sub.id)
    setUpdatingId(null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Views and earnings updated.")
    loadSubmissions()
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold text-heading-text mb-4">Submissions</h1>
        <p className="text-muted-label mb-6">Review and approve content from clippers</p>
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
        <h1 className="text-2xl font-bold text-heading-text mb-4">Submissions</h1>
        <p className="text-muted-label mb-6">Review and approve content from clippers</p>
        <Card className="bg-main-bg border-border max-w-md p-8 text-center">
          <CardContent className="p-0">
            <div className="w-14 h-14 rounded-full bg-section-bg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-muted-label" />
            </div>
            <h2 className="text-lg font-semibold text-heading-text mb-2">No submissions yet</h2>
            <p className="text-sm text-muted-label">
              When clippers submit content for your campaigns, they will appear here for review.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold text-heading-text mb-4">Submissions</h1>
      <p className="text-muted-label mb-6">Review and approve content from clippers. Set view count to calculate earnings.</p>
      <div className="space-y-4">
        {submissions.map((s) => (
          <Card key={s.id} className="bg-main-bg border-border shadow-md rounded-xl">
            <CardContent className="p-5 space-y-4">
              {/* Media preview (image or video) when clipper uploaded a file */}
              {s.media_url && (
                <div className="rounded-lg overflow-hidden border border-border bg-section-bg max-w-sm">
                  {s.media_url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                    <video
                      src={s.media_url}
                      controls
                      className="w-full max-h-48 object-contain"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={s.media_url}
                      alt="Submitted media"
                      className="w-full max-h-48 object-contain bg-section-bg"
                    />
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-label mb-1">{s.campaign.title}</p>
                  <a
                    href={s.content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-text hover:text-turquoise-accent font-medium flex items-center gap-2 truncate"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{s.content_link}</span>
                  </a>
                  <p className="text-sm text-muted-label mt-1">
                    {s.platform} · Submitted {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === "pending" && (
                    <Badge className="bg-amber-100 text-amber-700 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  )}
                  {s.status === "approved" && (
                    <Badge className="bg-turquoise-accent/10 text-turquoise-accent rounded-md flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </Badge>
                  )}
                  {s.status === "rejected" && (
                    <Badge className="bg-red-100 text-red-700 rounded-md flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </Badge>
                  )}
                  {s.status === "approved" && (
                    <span className="text-lg font-semibold text-turquoise-accent flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {Number(s.earnings).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* View count & actions */}
              <div className="flex flex-wrap items-end gap-4 pt-3 border-t border-border">
                <div className="flex items-end gap-2">
                  <Label className="text-sm text-muted-label flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Views
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={viewCountInputs[s.id] ?? s.view_count}
                    onChange={(e) => setViewCountInputs((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    className="w-24 h-9 bg-section-bg border-border text-body-text rounded-md"
                  />
                </div>
                {s.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      disabled={updatingId === s.id}
                      onClick={() => handleApprove(s)}
                      className="bg-turquoise-accent hover:bg-turquoise-accent/90 text-white"
                    >
                      {updatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      Approve & set views
                    </Button>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[s.id] ?? ""}
                        onChange={(e) => setRejectReason((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        className="w-48 h-9 bg-section-bg border-border text-body-text rounded-md text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === s.id}
                        onClick={() => handleReject(s)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {updatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                        Reject
                      </Button>
                    </div>
                  </>
                )}
                {s.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === s.id}
                    onClick={() => handleSetViewsOnly(s)}
                    className="border-border text-body-text"
                  >
                    {updatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update views"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
