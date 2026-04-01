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
    <div className="flex h-screen bg-rippl-black">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-rippl-black-2 border-l border-rippl-black-3">
        <div className="p-4 border-b border-rippl-black-3 bg-rippl-black-2/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-rippl-gray hover:text-rippl-violet lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="hidden lg:block" />
            <span className="inline-flex items-center rounded-full border border-rippl-violet/30 bg-rippl-violet/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rippl-violet-soft">
              Beta
            </span>
          </div>
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
