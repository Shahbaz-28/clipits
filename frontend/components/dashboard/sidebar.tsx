"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Compass,
  FolderOpen,
  FileText,
  BarChart3,
  User,
  X,
  Megaphone,
  DollarSign,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/auth-context"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentPath: string
}

const CLIPPER_MENU = [
  { id: "explore", label: "Explore Campaigns", icon: Compass },
  { id: "joined", label: "Joined", icon: FolderOpen },
  { id: "my-submissions", label: "My Submissions", icon: FileText },
  { id: "earnings", label: "Wallet & Earnings", icon: DollarSign },
  { id: "profile", label: "Profile", icon: User },
]

const CREATOR_MENU = [
  { id: "my-campaigns", label: "My Campaigns", icon: Megaphone },
  { id: "create-campaign", label: "Create Campaign", icon: FolderOpen },
  { id: "submissions", label: "Submissions", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
]

export function Sidebar({ sidebarOpen, setSidebarOpen, currentPath }: SidebarProps) {
  const { user, profile } = useAuth()

  const role: UserRole = profile?.role ?? "clipper"
  const menuItems = role === "creator" ? CREATOR_MENU : CLIPPER_MENU

  const isActive = (itemId: string) => {
    if (itemId === "joined") return currentPath === "/dashboard/joined" || currentPath.startsWith("/dashboard/joined/")
    if (itemId === "profile") return currentPath === "/dashboard/profile" || currentPath.startsWith("/dashboard/profile/")
    return currentPath === `/dashboard/${itemId}`
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed top-0 left-0 h-full bg-main-bg border-r border-border z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-vibrant-red-orange rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-heading-text">ClipIt</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {role === "creator" && (
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-muted-label uppercase tracking-wide">
                Creator
              </span>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const href = item.id === "profile" ? "/dashboard/profile" : `/dashboard/${item.id}`
              const active = isActive(item.id)
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      active
                        ? "bg-vibrant-red-orange text-white"
                        : "text-body-text hover:bg-section-bg hover:text-heading-text"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            {user && (
              <div className="flex items-center space-x-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={profile?.first_name || user.user_metadata?.first_name || user.email}
                  />
                  <AvatarFallback className="bg-vibrant-red-orange text-white text-sm">
                    {getInitials(
                      profile?.first_name || user.user_metadata?.first_name,
                      profile?.last_name || user.user_metadata?.last_name,
                      user.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading-text truncate">
                    {profile?.first_name
                      ? profile.first_name
                      : user.user_metadata?.first_name
                        ? user.user_metadata.first_name
                        : user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-label mt-0.5">
                    {role === "creator" ? "Creator account" : "Clipper account"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
