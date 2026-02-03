"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-section-bg">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPath={pathname}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-background rounded-xl shadow-sm">
        <div className="p-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-label"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
