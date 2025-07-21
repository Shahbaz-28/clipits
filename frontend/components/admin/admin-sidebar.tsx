"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Megaphone, FileText, Wallet, Settings, UserCog } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

  const navItems = [
    {
      title: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Creator Requests",
      href: "/admin?tab=creator-requests",
      icon: Users,
    },
    {
      title: "Campaigns",
      href: "/admin?tab=campaigns",
      icon: Megaphone,
    },
    {
      title: "Clipper Submissions",
      href: "/admin?tab=clipper-submissions",
      icon: FileText,
    },
    {
      title: "Wallet & Payouts",
      href: "/admin?tab=wallet-payouts",
      icon: Wallet,
    },
    {
      title: "User Management",
      href: "/admin?tab=user-management",
      icon: UserCog,
    },
    {
      title: "Settings",
      href: "/admin?tab=settings",
      icon: Settings,
    },
  ]

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[18rem] bg-card p-0 text-card-foreground [&>button]:hidden"
          side="left"
        >
          {/* Removed the extra div wrapper here */}
          <SidebarHeader className="p-4 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2 font-semibold text-xl text-foreground">
              <Megaphone className="h-6 w-6 text-primary" />
              <span className="group-data-[state=collapsed]:hidden">Admin Panel</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold uppercase text-muted-foreground group-data-[state=collapsed]:hidden">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === item.href ||
                          (pathname === "/admin" && item.href === "/admin" && !window.location.search) ||
                          (item.href.includes("tab=") && window.location.search.includes(item.href.split("tab=")[1]))
                        }
                        className="py-2 px-4 rounded-md hover:bg-muted/70 transition-colors duration-200"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span className="group-data-[state=collapsed]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-border bg-card text-card-foreground">
      {/* Removed the extra div wrapper here */}
      <SidebarHeader className="p-4 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-xl text-foreground">
          <Megaphone className="h-6 w-6 text-primary" />
          <span className="group-data-[state=collapsed]:hidden">Admin Panel</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold uppercase text-muted-foreground group-data-[state=collapsed]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (pathname === "/admin" && item.href === "/admin" && !window.location.search) ||
                      (item.href.includes("tab=") && window.location.search.includes(item.href.split("tab=")[1]))
                    }
                    className="py-2 px-4 rounded-md hover:bg-muted/70 transition-colors duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[state=collapsed]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
