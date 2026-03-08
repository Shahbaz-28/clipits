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
import {
  DollarSign,
  Tag,
  TrendingUp,
  CheckCircle,
  Instagram,
  Youtube,
  TwitterIcon as TikTok,
  PlayCircle,
} from "lucide-react"

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
    createdAt: string
  }
  onJoin?: (campaignData: any) => void
  isJoining?: boolean
  alreadyJoined?: boolean
  /** When true, show Edit instead of Join (only when canEdit is true) and call onEdit when Edit is clicked */
  isCreatorView?: boolean
  /** When true (and isCreatorView), show Edit button. Pass false for active/ended campaigns. */
  canEdit?: boolean
  onEdit?: () => void
}

export function CampaignDetailsModal({ isOpen, onClose, campaign, onJoin, isJoining, alreadyJoined, isCreatorView, canEdit = false, onEdit }: CampaignDetailsModalProps) {
  const handleJoinCampaign = () => {
    if (!onJoin) return
    if (alreadyJoined) {
      onJoin(campaign)
      onClose()
      return
    }
    onJoin(campaign)
  }

  const handleEdit = () => {
    onEdit?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95%] bg-white text-heading-text border border-gray-100 p-0 flex flex-col max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-heading-text">{campaign.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-label mt-1">{campaign.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Progress Bar */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-turquoise-accent">₹{campaign.progressPaidOut.toLocaleString()}</span>
                <span className="text-xs text-muted-label">of ₹{campaign.totalBudgetDetail.toLocaleString()}</span>
              </div>
              <span className="text-sm font-semibold text-heading-text">
                {campaign.progressPercentage}% · {campaign.daysLeft} days
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-turquoise-accent to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${campaign.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <DollarSign className="w-4 h-4 text-turquoise-accent mx-auto mb-1" />
              <p className="text-xs text-muted-label">Rate</p>
              <p className="text-sm font-bold text-heading-text">{campaign.rate}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Tag className="w-4 h-4 text-vibrant-red-orange mx-auto mb-1" />
              <p className="text-xs text-muted-label">Type</p>
              <p className="text-sm font-bold text-heading-text">{campaign.type}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <TrendingUp className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-label">Min</p>
              <p className="text-sm font-bold text-heading-text">₹{campaign.minPayout}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-muted-label">Max</p>
              <p className="text-sm font-bold text-heading-text">₹{campaign.maxPayout}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center col-span-3 sm:col-span-1">
              <Tag className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-label">Category</p>
              <p className="text-sm font-bold text-heading-text">{campaign.category}</p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-bold text-heading-text mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.platforms.map((PlatformIcon, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-heading-text border border-gray-200 bg-gray-50 rounded-lg"
                >
                  <PlatformIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {PlatformIcon === Instagram && "Instagram"}
                    {PlatformIcon === Youtube && "YouTube"}
                    {PlatformIcon === TikTok && "TikTok"}
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-bold text-heading-text mb-2">Requirements</h3>
            <div className="space-y-2">
              {campaign.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-heading-text">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assets & Resources */}
          {campaign.assets.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-heading-text mb-2">Assets & Resources</h3>
              <div className="space-y-2">
                {campaign.assets.map((asset, idx) => (
                  <a
                    key={idx}
                    href={asset.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-heading-text"
                  >
                    <PlayCircle className="w-4 h-4 text-muted-label flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">{asset.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {campaign.disclaimer && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <span className="text-xs font-medium text-amber-700">Note:</span>
                <p className="text-xs text-amber-600">{campaign.disclaimer}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 border border-gray-200 text-heading-text hover:bg-gray-50 bg-white rounded-lg font-medium"
          >
            Close
          </Button>
          {isCreatorView && canEdit ? (
            <Button
              onClick={handleEdit}
              className="flex-1 h-10 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-semibold shadow-lg shadow-vibrant-red-orange/25"
            >
              Edit Campaign
            </Button>
          ) : !isCreatorView ? (
            <Button
              onClick={handleJoinCampaign}
              disabled={isJoining}
              className="flex-1 h-10 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-semibold shadow-lg shadow-vibrant-red-orange/25"
            >
              {isJoining ? "Joining..." : alreadyJoined ? "View Campaign" : "Join Campaign"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
