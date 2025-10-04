"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface CreatorRequest {
  id: string
  title: string
  description: string
  rate_per_1k: number
  total_budget: number
  category: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  creator: {
    first_name: string
    last_name: string
    email: string
  }
}

export function CreatorRequestsTable() {
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.creatorRequests.getAll()
      setRequests(response.requests || [])
    } catch (error) {
      console.error('Error fetching creator requests:', error)
      toast.error('Failed to fetch creator requests')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    setActionLoading(requestId)
    try {
      await api.creatorRequests.updateStatus(requestId, status)
      toast.success(`Request ${status} successfully`)
      fetchRequests() // Refresh the list
    } catch (error) {
      console.error(`Error ${status} request:`, error)
      toast.error(`Failed to ${status} request`)
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    return (
      <Badge className={`${variants[status as keyof typeof variants]} rounded-md`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
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
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
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
