"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Instagram,
  IndianRupee,
  Play,
  X,
  Search,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SubmissionRow {
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
  campaign?: { title: string }
}

type StatusFilter = "all" | "pending" | "approved" | "rejected"

export function MySubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; type: "video" | "image" }>({
    isOpen: false,
    url: "",
    type: "video",
  })

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setSubmissions([])
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from("submissions")
        .select("id, campaign_id, user_id, content_link, media_url, platform, status, view_count, earnings, baseline_views, latest_views, submitted_at, rejection_reason")
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

  const filtered = submissions.filter((s) => {
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter
    const term = searchTerm.trim().toLowerCase()
    if (!term) return matchesStatus
    const campaignMatch = s.campaign?.title?.toLowerCase().includes(term)
    const linkMatch = s.content_link?.toLowerCase().includes(term)
    return matchesStatus && (campaignMatch || linkMatch)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchTerm])

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
          <h1 className="text-3xl font-bold text-heading-text mb-2">My Submissions</h1>
          <p className="text-muted-label text-base">Track your submitted content and earnings</p>
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
          <h1 className="text-3xl font-bold text-heading-text mb-2">My Submissions</h1>
          <p className="text-muted-label text-base">Track your submitted content and earnings</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-white border border-gray-100 max-w-md p-8 text-center shadow-lg rounded-2xl">
            <CardContent className="p-0">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-muted-label" />
              </div>
              <h2 className="text-xl font-bold text-heading-text mb-3">No submissions yet</h2>
              <p className="text-sm text-muted-label">
                Join a campaign from Explore, then submit your content link from the campaign page.
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
        <h1 className="text-3xl font-bold text-heading-text mb-2">My Submissions</h1>
        <p className="text-muted-label text-base">Track your submitted content and earnings</p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-gray-100 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-9 w-[150px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
              <Input
                placeholder="Search by campaign or link"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>
        </div>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-muted-label uppercase tracking-wide">
          <div className="col-span-4">Content</div>
          <div className="col-span-2">Campaign</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Views</div>
          <div className="col-span-2 text-center">Earnings</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-label text-sm">
              No submissions match your filters.
            </div>
          ) : (
          paginated.map((s) => (
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
                    className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group cursor-pointer hover:ring-2 hover:ring-vibrant-red-orange transition-all"
                  >
                    {s.media_url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                      <>
                        <video
                          src={s.media_url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <Play className="w-4 h-4 text-white" />
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
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-muted-label" />
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
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-label">
                    <Instagram className="w-3 h-3" />
                    <span>{s.platform}</span>
                    <span>·</span>
                    <span>{new Date(s.submitted_at).toLocaleDateString()}</span>
                  </div>
                  {s.status === "rejected" && s.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1 truncate" title={s.rejection_reason}>
                      Reason: {s.rejection_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Campaign */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-heading-text truncate">{s.campaign?.title ?? "Campaign"}</p>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                {getStatusBadge(s.status)}
              </div>

              {/* Views */}
              <div className="col-span-2 text-center">
                {s.status === "approved" ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-label">
                      <span>Base: {s.baseline_views?.toLocaleString() ?? 0}</span>
                      <span>Now: {s.latest_views?.toLocaleString() ?? 0}</span>
                    </div>
                    <p className="text-sm font-semibold text-heading-text">
                      +{s.view_count.toLocaleString()} gained
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-label">—</span>
                )}
              </div>

              {/* Earnings */}
              <div className="col-span-2 text-center">
                {s.status === "approved" ? (
                  <p className="text-sm font-bold text-turquoise-accent flex items-center justify-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <span className="text-sm text-muted-label">—</span>
                )}
              </div>
            </div>
          ))
          )}
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-muted-label">
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

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
