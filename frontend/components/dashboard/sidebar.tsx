"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, FileText, Bell, DollarSign, User, X, Zap, BarChart } from "lucide-react" // Import BarChart
import { cn } from "@/lib/utils"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onNavigate: (path: string) => void // Add onNavigate prop
  currentPage: string // Add currentPage prop
}

export function Sidebar({ sidebarOpen, setSidebarOpen, onNavigate, currentPage }: SidebarProps) {
  const menuItems = [
    { icon: Search, label: "Explore Campaigns", active: true, path: "explore", badge: null },
    { icon: Grid3X3, label: "My Campaigns", active: false, path: "my-campaigns", badge: null },
    { icon: FileText, label: "Submissions", active: false, path: "submissions", badge: 3 },
    { icon: Bell, label: "Notifications", active: false, path: "notifications", badge: 2 },
    { icon: DollarSign, label: "Earnings", active: false, path: "earnings", badge: null },
    { icon: BarChart, label: "Analytics", active: false, path: "analytics", badge: null },
    { icon: User, label: "Profile", active: false, path: "profile", badge: null },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-main-bg border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-vibrant-red-orange rounded-lg flex items-center justify-center shadow-md shadow-vibrant-red-orange/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-heading-text">ContentRewards</h1>
                <p className="text-sm text-muted-label">Creator Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-label"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => {
                  onNavigate(item.path) // Use onNavigate
                  setSidebarOpen(false) // Close sidebar on navigation for mobile
                }}
                className={cn(
                  "w-full justify-start space-x-3 h-12 text-body-text hover:bg-vibrant-red-orange/10 hover:text-vibrant-red-orange",
                  item.path === currentPage && // Check against currentPage
                    "bg-vibrant-red-orange/10 text-vibrant-red-orange font-semibold shadow-sm shadow-vibrant-red-orange/10",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
