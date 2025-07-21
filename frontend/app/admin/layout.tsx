import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true} className="min-h-svh">
      <AdminSidebar />
      <SidebarInset className="bg-background flex flex-col">
        {" "}
        {/* bg-background makes this white */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main> {/* Padding for content inside the rounded page */}
      </SidebarInset>
    </SidebarProvider>
  )
}
