"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  Tag,
  TrendingUp,
  Link,
  CheckCircle,
  Instagram,
  Youtube,
  TwitterIcon as TikTok,
  PlayCircle,
} from "lucide-react"
// Removed direct import of JoinedCampaignPage as it's now handled by onJoin prop

interface CampaignDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: {
    id: string
    title: string
    description: string
    earnings: string
    total: string
    percentage: string
    rate: string
    type: string
    platforms: any[]
    views: string
    color: string
    progressPaidOut: number
    totalBudgetDetail: number
    progressPercentage: number
    daysLeft: number
    minPayout: number
    maxPayout: number
    category: string
    requirements: string[]
    assets: { name: string; link: string }[]
    disclaimer: string
  }
  onJoin: (campaignData: any) => void // New prop to handle navigation to joined page
}

export function CampaignDetailsModal({ isOpen, onClose, campaign, onJoin }: CampaignDetailsModalProps) {
  const handleJoinCampaign = () => {
    onJoin(campaign) // Call the onJoin prop to trigger navigation
    onClose() // Close the modal
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] w-[95%] bg-main-bg text-body-text border-border p-6 sm:p-8 flex flex-col max-h-[90vh] rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-heading-text text-2xl font-bold">{campaign.title}</DialogTitle>
          <DialogDescription className="text-muted-label text-base">{campaign.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-label mb-2">
              <span>
                <span className="font-semibold text-heading-text">₹{campaign.progressPaidOut.toLocaleString()}</span> of{" "}
                ₹{campaign.totalBudgetDetail.toLocaleString()} paid out
              </span>
              <span>
                {campaign.progressPercentage}% {campaign.daysLeft} days left
              </span>
            </div>
            <Progress
              value={campaign.progressPercentage}
              className="h-2 bg-border"
              indicatorClassName="bg-turquoise-accent"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <Badge
              variant="outline"
              className="flex items-center justify-center gap-1 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
            >
              <DollarSign className="w-4 h-4 text-muted-label" />
              <span className="font-semibold text-turquoise-accent">{campaign.rate}</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center justify-center gap-1 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
            >
              <Tag className="w-4 h-4 text-muted-label" />
              {campaign.type}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center justify-center gap-1 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-muted-label" />
              Min ₹{campaign.minPayout.toLocaleString()}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center justify-center gap-1 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-muted-label" />
              Max ₹{campaign.maxPayout.toLocaleString()}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center justify-center gap-1 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
            >
              <Tag className="w-4 h-4 text-muted-label" />
              {campaign.category}
            </Badge>
          </div>

          {/* Platforms */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-heading-text mb-3">Platforms</h3>
            <div className="flex flex-wrap gap-3">
              {campaign.platforms.map((PlatformIcon, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="flex items-center gap-2 p-2 text-body-text border-border bg-section-bg rounded-lg shadow-sm"
                >
                  <PlatformIcon className="w-5 h-5 text-muted-label" />
                  {PlatformIcon === Instagram && "Instagram"}
                  {PlatformIcon === Youtube && "YouTube"}
                  {PlatformIcon === TikTok && "TikTok"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-heading-text mb-3">Requirements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.requirements.map((req, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="flex items-center gap-2 p-3 text-body-text border-border bg-section-bg text-left h-auto rounded-lg shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-turquoise-accent flex-shrink-0" />
                  <span className="flex-1">{req}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Assets & Resources */}
          {campaign.assets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-heading-text mb-3">Assets & Resources</h3>
              <div className="space-y-3">
                {campaign.assets.map((asset, idx) => (
                  <a
                    key={idx}
                    href={asset.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-section-bg hover:bg-section-bg/70 transition-colors text-body-text shadow-sm"
                  >
                    <Link className="w-5 h-5 text-muted-label flex-shrink-0" />
                    <span className="flex-1 truncate">{asset.name}</span>
                    <PlayCircle className="w-5 h-5 text-muted-label flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {campaign.disclaimer && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-heading-text mb-3">Disclaimer</h3>
              <p className="text-sm text-muted-label bg-section-bg p-4 rounded-lg border border-border shadow-sm">
                {campaign.disclaimer}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-border text-body-text hover:bg-section-bg bg-transparent rounded-md"
          >
            Close
          </Button>
          <Button
            onClick={handleJoinCampaign}
            className="w-full sm:w-auto bg-gradient-to-r from-vibrant-red-orange to-[#FF4B4B] text-white hover:from-[#FF4B4B] hover:to-vibrant-red-orange shadow-lg shadow-vibrant-red-orange/30 transition-all duration-200 rounded-md"
          >
            Join Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
