"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Megaphone, LogOut, User } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.replace("/")
  }

  const navItems = [
    {
      title: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
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
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-destructive border-destructive/40 hover:bg-destructive/5"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
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
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive border-destructive/40 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
