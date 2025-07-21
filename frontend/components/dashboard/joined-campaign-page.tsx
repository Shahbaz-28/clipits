"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import { SubmitContentModal } from "./submit-content-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface JoinedCampaignPageProps {
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

export function JoinedCampaignPage({ campaign }: JoinedCampaignPageProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1 p-2 gap-6">
      {/* Campaign Overview Section */}
      <Card className="bg-main-bg border-border shadow-lg p-6 lg:p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-heading-text mb-2">{campaign.title}</h1>
            <p className="text-muted-label text-lg">{campaign.description}</p>
          </div>
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-turquoise-accent to-[#20A070] text-white hover:from-[#20A070] hover:to-turquoise-accent shadow-lg shadow-turquoise-accent/30 transition-all duration-200 px-6 py-3 text-base rounded-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Submit Content
          </Button>
        </div>

        {/* Progress Bar & Key Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-section-bg border-border shadow-md p-4 rounded-lg">
            <CardContent className="p-0">
              <p className="text-sm text-muted-label mb-1">Progress</p>
              <div className="flex justify-between text-sm text-body-text mb-2">
                <span>
                  <span className="font-semibold text-heading-text">₹{campaign.progressPaidOut.toLocaleString()}</span>{" "}
                  paid out
                </span>
                <span>{campaign.progressPercentage}%</span>
              </div>
              <Progress
                value={campaign.progressPercentage}
                className="h-2 bg-border"
                indicatorClassName="bg-turquoise-accent"
              />
            </CardContent>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 rounded-lg">
            <CardContent className="p-0">
              <p className="text-sm text-muted-label mb-1">Total Budget</p>
              <p className="text-xl font-bold text-heading-text">₹{campaign.totalBudgetDetail.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 rounded-lg">
            <CardContent className="p-0">
              <p className="text-sm text-muted-label mb-1">Days Left</p>
              <p className="text-xl font-bold text-heading-text">{campaign.daysLeft}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-section-bg border-border shadow-md p-4 flex flex-col items-center text-center rounded-lg">
            <DollarSign className="w-6 h-6 text-turquoise-accent mb-2" />
            <p className="text-sm text-muted-label">Reward Rate</p>
            <p className="text-lg font-bold text-heading-text">{campaign.rate}</p>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 flex flex-col items-center text-center rounded-lg">
            <Tag className="w-6 h-6 text-vibrant-red-orange mb-2" />
            <p className="text-sm text-muted-label">Type</p>
            <p className="text-lg font-bold text-heading-text">{campaign.type}</p>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 flex flex-col items-center text-center rounded-lg">
            <TrendingUp className="w-6 h-6 text-sunny-yellow mb-2" />
            <p className="text-sm text-muted-label">Min Payout</p>
            <p className="text-lg font-bold text-heading-text">₹{campaign.minPayout.toLocaleString()}</p>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 flex flex-col items-center text-center rounded-lg">
            <TrendingUp className="w-6 h-6 text-sunny-yellow mb-2" />
            <p className="text-sm text-muted-label">Max Payout</p>
            <p className="text-lg font-bold text-heading-text">₹{campaign.maxPayout.toLocaleString()}</p>
          </Card>
          <Card className="bg-section-bg border-border shadow-md p-4 flex flex-col items-center text-center rounded-lg">
            <LayoutGrid className="w-6 h-6 text-turquoise-accent mb-2" />
            <p className="text-sm text-muted-label">Category</p>
            <p className="text-lg font-bold text-heading-text">{campaign.category}</p>
          </Card>
        </div>

        {/* Platforms */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-muted-label" />
            Target Platforms
          </h3>
          <div className="flex flex-wrap gap-3">
            {campaign.platforms.map((PlatformIcon, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="flex items-center gap-2 p-3 text-body-text border-border bg-section-bg text-base rounded-lg shadow-sm"
              >
                <PlatformIcon className="w-6 h-6 text-muted-label" />
                {PlatformIcon === Instagram && "Instagram"}
                {PlatformIcon === Youtube && "YouTube"}
                {PlatformIcon === TikTok && "TikTok"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-muted-label" />
            Requirements
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
            {campaign.requirements.map((req, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-4 bg-section-bg rounded-lg border border-border shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-turquoise-accent flex-shrink-0 mt-1" />
                <p className="text-body-text flex-1">{req}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Assets & Resources */}
        {campaign.assets.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-muted-label" />
              Assets & Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaign.assets.map((asset, idx) => (
                <a
                  key={idx}
                  href={asset.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-section-bg hover:bg-section-bg/70 transition-colors text-body-text text-center group shadow-sm"
                >
                  <PlayCircle className="w-8 h-8 text-muted-label mb-3 group-hover:text-vibrant-red-orange transition-colors" />
                  <span className="font-semibold mb-1 truncate w-full">{asset.name}</span>
                  <span className="text-sm text-muted-label">Click to view</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {campaign.disclaimer && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-muted-label" />
              Disclaimer
            </h3>
            <div className="bg-section-bg p-6 rounded-lg border border-border text-sm text-muted-label shadow-sm">
              <p>{campaign.disclaimer}</p>
            </div>
          </div>
        )}
      </Card>

      <SubmitContentModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} />
    </div>
  )
}
