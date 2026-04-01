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

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg flex items-center gap-1.5 text-xs font-bold px-2.5 py-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg flex items-center gap-1.5 text-xs font-bold px-2.5 py-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-xs font-bold px-2.5 py-1">
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
        <div className="border-b border-rippl-black-3 pb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">My Submissions</h1>
          <p className="text-rippl-gray text-base font-medium">Track your submitted content and earnings</p>
        </div>
        <div className="flex items-center gap-2 py-12 text-rippl-gray">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading submissions...</span>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col flex-1 space-y-8">
        <div className="border-b border-rippl-black-3 pb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2">My Submissions</h1>
          <p className="text-rippl-gray text-base font-medium">Track your submitted content and earnings</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-rippl-black-2/50 border border-rippl-black-3 max-w-md p-8 text-center shadow-lg rounded-[32px]">
            <CardContent className="p-0">
              <div className="w-16 h-16 rounded-2xl bg-rippl-black-3/50 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-rippl-gray" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-3">No submissions yet</h2>
              <p className="text-sm font-medium text-rippl-gray">
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
      <div className="border-b border-rippl-black-3 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">My Submissions</h1>
        <p className="text-rippl-gray font-medium text-base">Track your submitted content and earnings</p>
      </div>

      {/* Submissions Table */}
      <div className="bg-rippl-black-2/50 border border-rippl-black-3 rounded-[32px] overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-rippl-black-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-10 w-[150px] text-sm font-bold bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-rippl-black-3 border-rippl-black-3 text-white rounded-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray" />
              <Input
                placeholder="Search by campaign or link"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm font-medium bg-rippl-black-3/50 border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl"
              />
            </div>
          </div>
        </div>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-5 bg-rippl-black-3/30 border-b border-rippl-black-3 text-xs font-extrabold text-rippl-gray uppercase tracking-wide">
          <div className="col-span-4">Content</div>
          <div className="col-span-2">Campaign</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Views</div>
          <div className="col-span-2 text-center">Earnings</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-rippl-black-3">
          {paginated.length === 0 ? (
            <div className="px-6 py-12 text-center font-medium text-rippl-gray text-sm">
              No submissions match your filters.
            </div>
          ) : (
          paginated.map((s) => (
            <div key={s.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-rippl-black-3/20 transition-colors">
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
                    className="w-14 h-14 rounded-xl overflow-hidden bg-rippl-black-3 flex-shrink-0 relative group cursor-pointer hover:ring-2 hover:ring-rippl-violet transition-all"
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
                  <div className="w-14 h-14 rounded-xl bg-rippl-black-3/50 border border-rippl-black-3 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-rippl-gray" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={s.content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-rippl-violet hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>View content</span>
                  </a>
                  <div className="flex flex-col gap-0.5 mt-1 text-xs font-medium text-rippl-gray">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3 h-3" />
                      <span>{s.platform}</span>
                    </div>
                    <span>Submitted {formatDateTime(s.submitted_at)}</span>
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
                <p className="text-sm font-extrabold text-white truncate">{s.campaign?.title ?? "Campaign"}</p>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                {getStatusBadge(s.status)}
              </div>

              {/* Views */}
              <div className="col-span-2 text-center">
                {s.status === "approved" ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-rippl-gray">
                      <span>Base: {s.baseline_views?.toLocaleString() ?? 0}</span>
                      <span>Now: {s.latest_views?.toLocaleString() ?? 0}</span>
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      +{s.view_count.toLocaleString()} gained
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-rippl-gray font-bold">—</span>
                )}
              </div>

              {/* Earnings */}
              <div className="col-span-2 text-center">
                {s.status === "approved" ? (
                  <p className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <span className="text-sm text-rippl-gray font-bold">—</span>
                )}
              </div>
            </div>
          ))
          )}
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-rippl-black-3 text-sm font-bold text-rippl-gray">
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
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
        <DialogContent className="sm:max-w-4xl bg-rippl-black-2 border border-rippl-black-3 rounded-[32px] p-0 overflow-hidden">
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
