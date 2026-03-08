"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Upload,
  User,
  CalendarDays,
  Info,
  LayoutGrid,
  ArrowLeft,
  IndianRupee,
} from "lucide-react"
import { SubmitContentModal } from "./submit-content-modal"

interface JoinedCampaignPageProps {
  onBackToList?: () => void
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
}

export function JoinedCampaignPage({ campaign, onBackToList }: JoinedCampaignPageProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1 space-y-6">
      {onBackToList && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToList}
          className="w-fit text-muted-label hover:text-heading-text hover:bg-gray-50 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Joined campaigns
        </Button>
      )}

      {/* Header Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heading-text mb-1">{campaign.title}</h1>
            <p className="text-muted-label">{campaign.description}</p>
          </div>
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="h-10 px-5 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-semibold shadow-lg shadow-vibrant-red-orange/25"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Content
          </Button>
        </div>

        {/* Progress Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-turquoise-accent">₹{campaign.progressPaidOut.toLocaleString()}</span>
                  <span className="text-sm text-muted-label">of ₹{campaign.totalBudgetDetail.toLocaleString()} paid out</span>
                </div>
                <span className="text-sm font-bold text-heading-text">{campaign.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-turquoise-accent to-secondary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${campaign.progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-label mb-1">Days Left</p>
                <p className="text-xl font-bold text-heading-text">{campaign.daysLeft}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <DollarSign className="w-5 h-5 text-turquoise-accent mx-auto mb-2" />
              <p className="text-xs text-muted-label mb-1">Reward Rate</p>
              <p className="text-sm font-bold text-heading-text">{campaign.rate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <Tag className="w-5 h-5 text-vibrant-red-orange mx-auto mb-2" />
              <p className="text-xs text-muted-label mb-1">Type</p>
              <p className="text-sm font-bold text-heading-text">{campaign.type}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-muted-label mb-1">Min Payout</p>
              <p className="text-sm font-bold text-heading-text">₹{campaign.minPayout.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-muted-label mb-1">Max Payout</p>
              <p className="text-sm font-bold text-heading-text">₹{campaign.maxPayout.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <LayoutGrid className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-muted-label mb-1">Category</p>
              <p className="text-sm font-bold text-heading-text">{campaign.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platforms */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-bold text-heading-text mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-muted-label" />
            Target Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {campaign.platforms.map((PlatformIcon, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 text-heading-text border border-gray-200 bg-gray-50 rounded-lg"
              >
                <PlatformIcon className="w-4 h-4" />
                <span className="font-medium">
                  {PlatformIcon === Instagram && "Instagram"}
                  {PlatformIcon === Youtube && "YouTube"}
                  {PlatformIcon === TikTok && "TikTok"}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-bold text-heading-text mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-muted-label" />
            Requirements
          </h3>
          <ul className="space-y-2">
            {campaign.requirements.map((req, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-heading-text">{req}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Assets & Resources */}
      {campaign.assets.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-bold text-heading-text mb-4 flex items-center gap-2">
            <Link className="w-4 h-4 text-muted-label" />
            Assets & Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaign.assets.map((asset, idx) => (
              <a
                key={idx}
                href={asset.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-heading-text group"
              >
                <PlayCircle className="w-5 h-5 text-muted-label group-hover:text-vibrant-red-orange transition-colors" />
                <span className="font-medium text-sm truncate">{asset.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {campaign.disclaimer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Disclaimer</p>
              <p className="text-sm text-amber-600">{campaign.disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      <SubmitContentModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        campaignId={campaign.id}
        onSuccess={() => {}}
      />
    </div>
  )
}
