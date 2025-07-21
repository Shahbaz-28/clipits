"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("explore")
  const [activeCampaignData, setActiveCampaignData] = useState<any>(null) // State to hold data for joined campaign

  const handleNavigate = (path: string, campaignData: any = null) => {
    setCurrentPage(path)
    setActiveCampaignData(campaignData) // Set campaign data if navigating to a joined campaign
  }

  return (
    <div className="flex h-screen bg-section-bg">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      {/* Pass handleNavigate to MainContent so it can pass it to CampaignDetailsModal */}
      <MainContent
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        onNavigate={handleNavigate} // Pass onNavigate down
        activeCampaignData={activeCampaignData} // Pass active campaign data
      />
    </div>
  )
}
