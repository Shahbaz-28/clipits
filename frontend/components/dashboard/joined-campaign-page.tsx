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
          className="w-fit text-white hover:text-rippl-violet hover:bg-rippl-black-3 font-bold rounded-xl -ml-2 transition-all px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Joined campaigns
        </Button>
      )}

      {/* Header Section */}
      <div className="bg-rippl-black-2/50 border border-rippl-black-3 rounded-[32px] shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-rippl-black-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">{campaign.title}</h1>
            <p className="text-rippl-gray font-medium">{campaign.description}</p>
          </div>
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="h-11 px-6 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all text-base"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Content
          </Button>
        </div>

        {/* Progress Section */}
        <div className="p-8 bg-rippl-black-3/30 border-b border-rippl-black-3">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-rippl-violet">₹{campaign.progressPaidOut.toLocaleString()}</span>
                  <span className="text-xs font-bold text-white">of ₹{campaign.totalBudgetDetail.toLocaleString()} paid out</span>
                </div>
                <span className="text-sm font-extrabold text-white">{campaign.progressPercentage}%</span>
              </div>
              <div className="w-full bg-rippl-black-3 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rippl-violet h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  style={{ width: `${campaign.progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex gap-6 md:gap-8 bg-rippl-black-2/50 p-4 rounded-xl border border-rippl-black-3 min-w-[120px] justify-center items-center">
              <div className="text-center">
                <p className="text-xs font-bold text-white mb-1">Days Left</p>
                <p className="text-2xl font-extrabold text-white">{campaign.daysLeft}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl text-center">
              <DollarSign className="w-5 h-5 text-rippl-violet mx-auto mb-2" />
              <p className="text-xs font-bold text-rippl-gray mb-1">Reward Rate</p>
              <p className="text-base font-extrabold text-white">{campaign.rate}</p>
            </div>
            <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl text-center">
              <Tag className="w-5 h-5 text-rippl-violet mx-auto mb-2" />
              <p className="text-xs font-bold text-rippl-gray mb-1">Type</p>
              <p className="text-base font-extrabold text-white capitalize">{campaign.type}</p>
            </div>
            <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl text-center">
              <TrendingUp className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-rippl-gray mb-1">Min Payout</p>
              <p className="text-base font-extrabold text-white">₹{campaign.minPayout.toLocaleString()}</p>
            </div>
            <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-rippl-gray mb-1">Max Payout</p>
              <p className="text-base font-extrabold text-white">₹{campaign.maxPayout.toLocaleString()}</p>
            </div>
            <div className="p-5 bg-rippl-black-3/50 border border-rippl-black-3 rounded-2xl text-center sm:col-span-full lg:col-span-1">
              <LayoutGrid className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-rippl-gray mb-1">Category</p>
              <p className="text-base font-extrabold text-white capitalize">{campaign.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platforms */}
        <div className="bg-rippl-black-2/50 border border-rippl-black-3 rounded-[32px] shadow-sm p-8">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-rippl-gray" />
            Target Platforms
          </h3>
          <div className="flex flex-wrap gap-3">
            {campaign.platforms.map((PlatformIcon, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 text-white border border-rippl-black-3 bg-rippl-black-3/50 rounded-xl"
              >
                <PlatformIcon className="w-4 h-4 opacity-80" />
                <span className="font-bold">
                  {PlatformIcon === Instagram && "Instagram"}
                  {PlatformIcon === Youtube && "YouTube"}
                  {PlatformIcon === TikTok && "TikTok"}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-rippl-black-2/50 border border-rippl-black-3 rounded-[32px] shadow-sm p-8">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-rippl-gray" />
            Requirements
          </h3>
          <ul className="space-y-3">
            {campaign.requirements.map((req, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 p-4 bg-rippl-black-3/50 border border-rippl-black-3 rounded-xl"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-sm font-medium text-white">{req}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Assets & Resources */}
      {campaign.assets.length > 0 && (
        <div className="bg-rippl-black-2/50 border border-rippl-black-3 rounded-[32px] shadow-sm p-8">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <Link className="w-5 h-5 text-rippl-gray" />
            Assets & Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaign.assets.map((asset, idx) => (
              <a
                key={idx}
                href={asset.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-rippl-black-3 rounded-xl bg-rippl-black-3/50 hover:bg-rippl-black-3 transition-all text-white font-bold group"
              >
                <PlayCircle className="w-5 h-5 text-rippl-violet group-hover:scale-110 transition-transform" />
                <span className="truncate">{asset.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {campaign.disclaimer && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-500 mb-1">Disclaimer</p>
              <p className="text-sm font-medium text-amber-400">{campaign.disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      <SubmitContentModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        campaignId={campaign.id}
        onSuccess={() => { }}
      />
    </div>
  )
}
