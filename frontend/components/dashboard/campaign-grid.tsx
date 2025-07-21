"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Youtube, TwitterIcon as TikTok, Eye } from "lucide-react"
import { CampaignDetailsModal } from "./campaign-details-modal" // Import the new modal

interface CampaignGridProps {
  onNavigate: (path: string, campaignData?: any) => void // Add onNavigate prop
}

const campaigns = [
  {
    id: "summer-fashion-haul",
    title: "Summer Fashion Haul",
    description: "Create engaging content showcasing the latest summer fashion trends.",
    earnings: "$1,250",
    total: "$5,000",
    percentage: "25%",
    rate: "$2.00 / 1K",
    type: "UGC",
    platforms: [Instagram],
    views: "2.3M",
    color: "bg-vibrant-red-orange",
    progressPaidOut: 278.54,
    totalBudgetDetail: 10000,
    progressPercentage: 3,
    daysLeft: 20,
    minPayout: 50,
    maxPayout: 2000,
    category: "E-commerce",
    requirements: [
      "Must be high-quality edits",
      "No reusing our previously edited content",
      "Must be clipped content not already edited videos",
      "Content must be lifestyle, ecom, motivational, or podcast-related",
      "Must have comments on",
      "Tag Ac Hampton profile (on that platform) + follow",
      "English only",
      "Direct to Ac's Youtube",
    ],
    assets: [
      { name: "drive.google.com", link: "https://drive.google.com/drive/folders/16s7655_WGoiC9AaF3_M8ixmzc9bi7s" },
    ],
    disclaimer:
      "Creators may reject submissions that don't meet requirements. By submitting, you grant full usage rights and agree to our terms and conditions.",
  },
  {
    id: "gaming-highlights-reel",
    title: "Gaming Highlights Reel",
    description: "Showcase your best gaming moments and epic plays.",
    earnings: "$800",
    total: "$2,000",
    percentage: "40%",
    rate: "$1.50 / 1K",
    type: "Clipping",
    platforms: [Instagram],
    views: "1.8M",
    color: "bg-vibrant-red-orange",
    progressPaidOut: 0,
    totalBudgetDetail: 2000,
    progressPercentage: 0,
    daysLeft: 15,
    minPayout: 30,
    maxPayout: 1000,
    category: "Gaming",
    requirements: [
      "Must be 1080p resolution",
      "Include game audio",
      "No copyrighted music",
      "Minimum 30 seconds duration",
    ],
    assets: [],
    disclaimer: "All submissions are subject to review.",
  },
  {
    id: "tech-review-challenge",
    title: "Tech Review Challenge",
    description: "Review the latest tech gadgets and share your honest opinions.",
    earnings: "$2,100",
    total: "$8,000",
    percentage: "26%",
    rate: "$3.00 / 1K",
    type: "UGC",
    platforms: [Instagram],
    views: "4.1M",
    color: "bg-vibrant-red-orange",
    progressPaidOut: 0,
    totalBudgetDetail: 8000,
    progressPercentage: 0,
    daysLeft: 25,
    minPayout: 100,
    maxPayout: 3000,
    category: "Technology",
    requirements: ["Clear audio and video", "Demonstrate product features", "Include call to action"],
    assets: [],
    disclaimer: "Reviews must be unbiased.",
  },
  {
    id: "food-recipe-series",
    title: "Food Recipe Series",
    description: "Create delicious and easy-to-follow recipe videos.",
    earnings: "$950",
    total: "$3,500",
    percentage: "27%",
    rate: "$1.80 / 1K",
    type: "UGC",
    platforms: [Instagram],
    views: "1.2M",
    color: "bg-vibrant-red-orange",
    progressPaidOut: 0,
    totalBudgetDetail: 3500,
    progressPercentage: 0,
    daysLeft: 10,
    minPayout: 40,
    maxPayout: 1500,
    category: "Food & Cooking",
    requirements: ["High-quality food shots", "Step-by-step instructions", "Engaging presentation"],
    assets: [],
    disclaimer: "Recipes must be original or properly attributed.",
  },
]

export function CampaignGrid({ onNavigate }: CampaignGridProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<(typeof campaigns)[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const handleCardClick = (campaign: (typeof campaigns)[0]) => {
    setSelectedCampaign(campaign)
    setIsDetailsModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {campaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-main-bg border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-xl"
            onClick={() => handleCardClick(campaign)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-heading-text mb-1 group-hover:text-vibrant-red-orange transition-colors">
                    {campaign.title}
                  </h3>
                  <Badge
                    className={`${campaign.color} text-white hover:${campaign.color}/90 text-xs shadow-sm rounded-md`}
                  >
                    {campaign.rate}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-body-text mb-4">{campaign.description.substring(0, 50)}...</p>

              {/* Earnings */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-turquoise-accent">{campaign.earnings}</span>
                  <span className="text-sm text-muted-label">of {campaign.total} paid out</span>
                  <span className="text-sm font-semibold text-body-text">{campaign.percentage}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-turquoise-accent h-2 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: campaign.percentage }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-muted-label mb-1">Type</p>
                  <p className="font-semibold text-body-text">{campaign.type}</p>
                </div>
                <div>
                  <p className="text-muted-label mb-1">Platforms</p>
                  <div className="flex space-x-1">
                    {campaign.platforms.map((Platform, idx) => (
                      <Platform key={idx} className="w-4 h-4 text-muted-label" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-label mb-1">Views</p>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-muted-label" />
                    <span className="font-semibold text-body-text">{campaign.views}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCampaign && (
        <CampaignDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          campaign={selectedCampaign}
          onJoin={() => onNavigate("joined-campaign", selectedCampaign)} // Pass onJoin handler
        />
      )}
    </>
  )
}
