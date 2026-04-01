"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateCampaignModal } from "@/components/dashboard/create-campaign-modal"

export default function CreateCampaignRoutePage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  return (
    <>
      <h1 className="text-3xl font-extrabold text-white mb-4">Create Campaign</h1>
      <p className="text-rippl-gray font-medium text-base mt-1 mb-6">
        Submit a campaign request for admin approval
      </p>
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 h-11 px-6"
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
