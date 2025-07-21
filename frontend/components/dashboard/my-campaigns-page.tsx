"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Grid3X3 } from "lucide-react"
import { CreateCampaignModal } from "./create-campaign-modal"

export function MyCampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col">
      {" "}
      {/* Removed padding here, MainContent provides it */}
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
      {/* No Campaigns Yet Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        {" "}
        {/* Keep internal padding for this card */}
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
      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
