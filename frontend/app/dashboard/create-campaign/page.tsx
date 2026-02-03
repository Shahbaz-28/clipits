"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateCampaignModal } from "@/components/dashboard/create-campaign-modal"

export default function CreateCampaignRoutePage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  return (
    <>
      <h1 className="text-2xl font-bold text-heading-text mb-4">Create Campaign</h1>
      <p className="text-muted-label mt-1 mb-6">
        Submit a campaign request for admin approval
      </p>
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="bg-vibrant-red-orange hover:bg-vibrant-red-orange/90 text-white"
      >
        New campaign request
      </Button>
      <CreateCampaignModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  )
}
