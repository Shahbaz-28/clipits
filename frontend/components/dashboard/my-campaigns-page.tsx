"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Grid3X3, CreditCard, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { CreateCampaignModal } from "./create-campaign-modal"
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
  admin_notes?: string
}

export function MyCampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    try {
      const response = await api.creatorRequests.getMyRequests()
      setRequests(response.requests || [])
    } catch (error) {
      console.error('Error fetching my requests:', error)
      toast.error('Failed to fetch your requests')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (requestId: string) => {
    // TODO: Implement payment flow
    toast.info('Payment integration coming soon!')
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
      pending: { className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { className: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { className: 'bg-red-100 text-red-700', icon: XCircle }
    }
    const variant = variants[status as keyof typeof variants]
    const Icon = variant.icon
    return (
      <Badge className={`${variant.className} rounded-md flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heading-text flex items-center gap-2">
              <Grid3X3 className="w-6 h-6 text-muted-label" />
              My Campaigns
            </h1>
            <p className="text-muted-label mt-1 text-sm sm:text-base">Manage your created campaigns</p>
          </div>
          <Button
            className="w-full sm:w-auto bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 shadow-md shadow-vibrant-red-orange/20 rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading your campaigns...</span>
          </div>
        </div>
        <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading-text flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-muted-label" />
            My Campaigns
          </h1>
          <p className="text-muted-label mt-1 text-sm sm:text-base">Manage your created campaigns</p>
        </div>
        <Button
          className="w-full sm:w-auto bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 shadow-md shadow-vibrant-red-orange/20 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Requests */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-heading-text">Campaign Requests</h2>
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-main-bg border-border shadow-lg rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-heading-text">{request.title}</CardTitle>
                      <p className="text-muted-label text-sm mt-1">{request.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-label">Budget</p>
                      <p className="text-sm font-medium text-heading-text">₹{request.total_budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-label">Rate per 1K</p>
                      <p className="text-sm font-medium text-heading-text">₹{request.rate_per_1k}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-label">Category</p>
                      <p className="text-sm font-medium text-heading-text capitalize">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-label">Type</p>
                      <p className="text-sm font-medium text-heading-text uppercase">{request.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <p className="text-xs text-muted-label">
                      Submitted on {formatDate(request.created_at)}
                    </p>
                    
                    {request.status === 'approved' && (
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-green-600 font-medium">
                          You are eligible now pay the money pool
                        </p>
                        <Button
                          onClick={() => handlePay(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay
                        </Button>
                      </div>
                    )}
                    
                    {request.status === 'rejected' && request.admin_notes && (
                      <p className="text-sm text-red-600">
                        Rejection reason: {request.admin_notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* No Campaigns Yet Card */
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-main-bg border-border w-full max-w-md p-6 sm:p-8 text-center shadow-lg rounded-xl">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-section-bg rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-label" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-heading-text mb-2">No campaigns yet</h2>
              <p className="text-sm sm:text-base text-body-text mb-6">
                Create your first campaign to start earning and engaging with creators
              </p>
              <Button
                className="w-full sm:w-auto bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 shadow-md shadow-vibrant-red-orange/20 rounded-md"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
