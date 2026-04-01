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
    thumbnailUrl: string | null
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
      <DialogContent className="sm:max-w-[600px] w-[95%] bg-rippl-black-2 text-white border border-rippl-black-3 p-0 flex flex-col max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden">
        {campaign.thumbnailUrl && (
          <div className="w-full h-40 bg-rippl-black-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.thumbnailUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-rippl-black-3">
          <DialogTitle className="text-2xl font-extrabold text-white">{campaign.title}</DialogTitle>
          <DialogDescription className="text-sm font-medium text-rippl-gray mt-2">{campaign.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Progress Bar */}
          <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-rippl-violet">₹{campaign.progressPaidOut.toLocaleString()}</span>
                <span className="text-xs font-bold text-rippl-gray">of ₹{campaign.totalBudgetDetail.toLocaleString()}</span>
              </div>
              <span className="text-sm font-extrabold text-white">
                {campaign.progressPercentage}% · {campaign.daysLeft} days
              </span>
            </div>
            <div className="w-full bg-rippl-black-3 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rippl-violet h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                style={{ width: `${campaign.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl text-center">
              <DollarSign className="w-4 h-4 text-rippl-violet mx-auto mb-1" />
              <p className="text-xs font-bold text-rippl-gray">Rate</p>
              <p className="text-sm font-extrabold text-white">{campaign.rate}</p>
            </div>
            <div className="p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl text-center">
              <Tag className="w-4 h-4 text-rippl-violet mx-auto mb-1" />
              <p className="text-xs font-bold text-rippl-gray">Type</p>
              <p className="text-sm font-extrabold text-white capitalize">{campaign.type}</p>
            </div>
            <div className="p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl text-center">
              <TrendingUp className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-rippl-gray">Min</p>
              <p className="text-sm font-extrabold text-white">₹{campaign.minPayout}</p>
            </div>
            <div className="p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-rippl-gray">Max</p>
              <p className="text-sm font-extrabold text-white">₹{campaign.maxPayout}</p>
            </div>
            <div className="p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl text-center col-span-3 sm:col-span-1">
              <Tag className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-rippl-gray">Category</p>
              <p className="text-sm font-extrabold text-white capitalize">{campaign.category || "—"}</p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-extrabold text-white mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.platforms.map((PlatformIcon, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white border border-rippl-black-3 bg-rippl-black-3/50 rounded-lg"
                >
                  <PlatformIcon className="w-4 h-4 opacity-80" />
                  <span className="text-sm font-bold">
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
            <h3 className="text-sm font-extrabold text-white mb-2">Requirements</h3>
            <div className="space-y-2">
              {campaign.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assets & Resources */}
          {campaign.assets.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-white mb-2">Assets & Resources</h3>
              <div className="space-y-2">
                {campaign.assets.map((asset, idx) => (
                  <a
                    key={idx}
                    href={asset.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-rippl-black-3 rounded-xl bg-rippl-black-3/50 hover:bg-rippl-black-3 transition-colors text-white"
                  >
                    <PlayCircle className="w-4 h-4 text-rippl-violet flex-shrink-0" />
                    <span className="text-sm font-bold truncate flex-1">{asset.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {campaign.disclaimer && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex gap-2">
                <span className="text-xs font-bold text-amber-500">Note:</span>
                <p className="text-xs font-medium text-amber-400">{campaign.disclaimer}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-rippl-black-3 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl font-bold transition-all"
          >
            Close
          </Button>
          {isCreatorView && canEdit ? (
            <Button
              onClick={handleEdit}
              className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all"
            >
              Edit Campaign
            </Button>
          ) : !isCreatorView ? (
            <Button
              onClick={handleJoinCampaign}
              disabled={isJoining}
              className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all"
            >
              {isJoining ? "Joining..." : alreadyJoined ? "View Campaign" : "Join Campaign"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
