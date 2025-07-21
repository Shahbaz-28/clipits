"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { StatsCards } from "./stats-cards"
import { CampaignGrid } from "./campaign-grid"
import { MyCampaignsPage } from "./my-campaigns-page"
import { ProfilePage } from "./profile-page"
import { AnalyticsPage } from "./analytics-page"
import { JoinedCampaignPage } from "./joined-campaign-page"

interface MainContentProps {
  setSidebarOpen: (open: boolean) => void
  currentPage: string
  onNavigate: (path: string, campaignData?: any) => void // Updated prop
  activeCampaignData: any // New prop
}

export function MainContent({ setSidebarOpen, currentPage, onNavigate, activeCampaignData }: MainContentProps) {
  // The header is now removed from MainContent. Page titles will be in individual page components.

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background rounded-xl shadow-sm">
      {" "}
      {/* Main content area as a rounded, floating card */}
      {/* Sidebar Trigger for mobile, placed at the top-left of the main content area */}
      <div className="p-4 lg:hidden">
        <Button variant="ghost" size="icon" className="text-muted-label" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-6">
        {" "}
        {/* Consistent padding for all pages */}
        {currentPage === "explore" && (
          <>
            <h1 className="text-2xl font-bold text-heading-text mb-4">Explore Campaigns</h1>
            <p className="text-muted-label mt-1 mb-6">Discover new opportunities to earn rewards</p>
            {/* <StatsCards /> */}
            <CampaignGrid onNavigate={onNavigate} />
          </>
        )}
        {currentPage === "my-campaigns" && <MyCampaignsPage />}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "analytics" && <AnalyticsPage />}
        {currentPage === "joined-campaign" && activeCampaignData && (
          <JoinedCampaignPage campaign={activeCampaignData} />
        )}
      </main>
    </div>
  )
}
