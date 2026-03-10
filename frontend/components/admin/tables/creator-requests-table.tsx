"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CreatorRequest {
  id: string
  title: string
  description: string | null
  rate_per_1k: number
  total_budget: number
  category: string | null
  type: string
  status: "pending_review" | "rejected" | "awaiting_payment"
  created_at: string
  creator: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
}

export function CreatorRequestsTable() {
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    void fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(
          `
          id,
          title,
          description,
          rate_per_1k,
          total_budget,
          category,
          type,
          status,
          created_at,
          users!campaigns_created_by_fkey (
            first_name,
            last_name,
            email
          )
        `,
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: false })

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading creator requests:", error.message)
        toast.error("Could not load creator requests.")
        setRequests([])
        return
      }

      const mapped: CreatorRequest[] =
        data?.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          rate_per_1k: Number(row.rate_per_1k ?? 0),
          total_budget: Number(row.total_budget ?? 0),
          category: row.category,
          type: row.type,
          status: row.status as CreatorRequest["status"],
          created_at: row.created_at,
          creator: {
            first_name: row.users?.first_name ?? null,
            last_name: row.users?.last_name ?? null,
            email: row.users?.email ?? null,
          },
        })) ?? []

      setRequests(mapped)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, status: "awaiting_payment" | "rejected") => {
    setActionLoading(requestId)
    try {
      let adminNote: string | null = null
      if (status === "rejected") {
        // Simple prompt for now; can be replaced with a proper modal later
        // eslint-disable-next-line no-alert
        const reason = window.prompt("Enter rejection reason (optional):") ?? ""
        adminNote = reason.trim() || null
      }

      const updates: Record<string, unknown> = {
        status,
      }
      if (status === "awaiting_payment") {
        updates.admin_approved_at = new Date().toISOString()
        updates.admin_rejected_reason = null
      }
      if (status === "rejected") {
        updates.admin_rejected_reason = adminNote
      }

      const { error } = await supabase.from("campaigns").update(updates).eq("id", requestId)
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(status === "awaiting_payment" ? "Campaign approved. Waiting for creator payment." : "Campaign rejected.")
      await fetchRequests()
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: CreatorRequest["status"]) => {
    const variants: Record<CreatorRequest["status"], { className: string; label: string }> = {
      pending_review: { className: "bg-yellow-100 text-yellow-700", label: "Under review" },
      awaiting_payment: { className: "bg-blue-100 text-blue-700", label: "Awaiting payment" },
      rejected: { className: "bg-red-100 text-red-700", label: "Rejected" },
    }
    const v = variants[status]
    return (
      <Badge className={`${v.className} rounded-md`}>
        {v.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="shadow-sm border border-border rounded-xl">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-xl font-semibold text-foreground">Creator Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Creator Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">Creator Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Email</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Campaign Title</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Budget</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Date Submitted</TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No creator requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-foreground px-6 py-3">
                      {request.creator.first_name} {request.creator.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {request.creator.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {request.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      ₹{request.total_budget.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3">
                      {request.status === "pending_review" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleStatusUpdate(request.id, "awaiting_payment")}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-500" />
                            )}
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleStatusUpdate(request.id, "rejected")}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                            <span className="sr-only">Reject</span>
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
