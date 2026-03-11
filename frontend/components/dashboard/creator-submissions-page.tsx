"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  IndianRupee,
  Play,
  Instagram,
  X,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
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
  baseline_views: number
  latest_views: number
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

export function CreatorSubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionWithCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; type: "video" | "image" }>({
    isOpen: false,
    url: "",
    type: "video",
  })

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
      .select("id, campaign_id, user_id, content_link, media_url, platform, status, view_count, earnings, baseline_views, latest_views, submitted_at, rejection_reason")
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
    setLoading(false)
  }

  useEffect(() => {
    loadSubmissions()
  }, [user?.id])

  const handleApprove = async (sub: SubmissionWithCampaign) => {
    setUpdatingId(sub.id)

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        rejection_reason: null,
      })
      .eq("id", sub.id)
    if (error) {
      setUpdatingId(null)
      toast.error(error.message)
      return
    }

    try {
      const res = await authFetch("/api/views/fetch-baseline", {
        method: "POST",
        body: JSON.stringify({ submissionId: sub.id, reelUrl: sub.content_link }),
      })
      const result = await res.json()
      if (result.fromApi) {
        toast.success(`Approved! Baseline views captured: ${result.views.toLocaleString()}`)
      } else {
        toast.success("Approved! View tracking will start on the next check.")
      }
    } catch {
      toast.success("Approved! View tracking will start on the next check.")
    }

    setUpdatingId(null)
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

  const handleRefreshViews = async (sub: SubmissionWithCampaign) => {
    setRefreshingId(sub.id)
    try {
      const res = await authFetch("/api/views/refresh-single", {
        method: "POST",
        body: JSON.stringify({ submissionId: sub.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not refresh views.")
      } else if (data.skipped) {
        toast.message("Views not updated", {
          description: data.reason || "New view count was lower than the last recorded value.",
        })
      } else {
        toast.success(
          `Views refreshed to ${data.views?.toLocaleString?.() ?? data.views}. +${
            data.viewsGained?.toLocaleString?.() ?? data.viewsGained
          } gained.`,
        )
      }
      await loadSubmissions()
    } catch (err) {
      console.error(err)
      toast.error("Could not refresh views. Please try again later.")
    } finally {
      setRefreshingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-600 border border-amber-200 rounded-lg flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 space-y-8">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-heading-text mb-2">Submissions</h1>
          <p className="text-muted-label text-base">Review and approve content from clippers</p>
        </div>
        <div className="flex items-center gap-2 py-12 text-muted-label">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading submissions...</span>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col flex-1 space-y-8">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-heading-text mb-2">Submissions</h1>
          <p className="text-muted-label text-base">Review and approve content from clippers</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-white border border-gray-100 max-w-md p-8 text-center shadow-lg rounded-2xl">
            <CardContent className="p-0">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-muted-label" />
              </div>
              <h2 className="text-xl font-bold text-heading-text mb-3">No submissions yet</h2>
              <p className="text-sm text-muted-label">
                When clippers submit content for your campaigns, they will appear here for review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-heading-text mb-2">Submissions</h1>
        <p className="text-muted-label text-base">Review and approve content from clippers. Views and earnings are tracked automatically after approval.</p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-muted-label uppercase tracking-wide">
          <div className="col-span-4">Content</div>
          <div className="col-span-2">Campaign</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Views</div>
          <div className="col-span-1 text-center">Earnings</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {submissions.map((s) => (
            <div key={s.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
              {/* Content */}
              <div className="col-span-4 flex items-center gap-3">
                {s.media_url ? (
                  <button
                    type="button"
                    onClick={() => {
                      const isVideo = s.media_url!.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)
                      setVideoModal({
                        isOpen: true,
                        url: s.media_url!,
                        type: isVideo ? "video" : "image",
                      })
                    }}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group cursor-pointer hover:ring-2 hover:ring-vibrant-red-orange transition-all"
                  >
                    {s.media_url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                      <>
                        <video
                          src={s.media_url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={s.media_url}
                        alt="Submission"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-6 h-6 text-muted-label" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={s.content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-heading-text hover:text-vibrant-red-orange transition-colors flex items-center gap-1.5 truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{s.content_link.split("/").pop() || "View Content"}</span>
                  </a>
                  <p className="text-xs text-muted-label mt-1">
                    {s.platform} · {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Campaign */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-heading-text truncate">{s.campaign.title}</p>
                <p className="text-xs text-muted-label">₹{s.campaign.rate_per_1k}/1K</p>
              </div>

              {/* Status */}
              <div className="col-span-1 flex justify-center">
                {getStatusBadge(s.status)}
              </div>

              {/* Views */}
              <div className="col-span-2 text-center">
                {s.status === "approved" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-label">
                      <span>Base: {s.baseline_views.toLocaleString()}</span>
                      <span>Now: {s.latest_views.toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-heading-text">
                      +{s.view_count.toLocaleString()} gained
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={refreshingId === s.id}
                      onClick={() => handleRefreshViews(s)}
                      className="h-7 px-2 text-[11px] rounded-lg border-gray-200 text-muted-label hover:text-heading-text hover:border-gray-300"
                    >
                      {refreshingId === s.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        "Refresh views now"
                      )}
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-label">—</span>
                )}
              </div>

              {/* Earnings */}
              <div className="col-span-1 text-center">
                {s.status === "approved" ? (
                  <p className="text-sm font-bold text-turquoise-accent flex items-center justify-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <span className="text-sm text-muted-label">—</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-center gap-2">
                {s.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      disabled={updatingId === s.id}
                      onClick={() => handleApprove(s)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
                    >
                      {updatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === s.id}
                      onClick={() => handleReject(s)}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      {updatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </>
                )}
                {s.status === "rejected" && s.rejection_reason && (
                  <span className="text-xs text-muted-label italic max-w-[120px] truncate" title={s.rejection_reason}>
                    {s.rejection_reason}
                  </span>
                )}
                {(s.status === "approved" || s.status === "rejected") && (
                  <span className="text-xs text-muted-label">No actions</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Reason Modal/Input - shown below for pending items */}
      {submissions.some(s => s.status === "pending") && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            <strong>Tip:</strong> Click "Reject" to reject a submission. You can add a rejection reason before clicking.
          </p>
        </div>
      )}

      {/* Video/Image Preview Modal */}
      <Dialog open={videoModal.isOpen} onOpenChange={(open) => setVideoModal({ ...videoModal, isOpen: open })}>
        <DialogContent className="sm:max-w-4xl bg-white border border-gray-100 rounded-2xl p-0 overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {videoModal.type === "video" ? (
              <video
                src={videoModal.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            ) : (
              <img
                src={videoModal.url}
                alt="Submission preview"
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
