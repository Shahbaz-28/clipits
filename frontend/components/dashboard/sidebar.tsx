"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  Search, 
  FolderOpen, 
  Upload, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  LogOut,
  User
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onNavigate: (page: string) => void
  currentPage: string
}

export function Sidebar({ sidebarOpen, setSidebarOpen, onNavigate, currentPage }: SidebarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const menuItems = [
    { id: "explore", label: "Explore Campaigns", icon: Search },
    { id: "my-campaigns", label: "My Campaigns", icon: FolderOpen },
    { id: "submissions", label: "Submissions", icon: Upload },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: Settings },
  ]

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-main-bg border-r border-border z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-vibrant-red-orange text-white' 
                      : 'text-body-text hover:bg-section-bg hover:text-heading-text'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-border">
            {user && (
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url} 
                    alt={user.user_metadata?.first_name || user.email} 
                  />
                  <AvatarFallback className="bg-vibrant-red-orange text-white">
                    {getInitials(
                      user.user_metadata?.first_name,
                      user.user_metadata?.last_name,
                      user.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading-text truncate">
                    {user.user_metadata?.first_name && user.user_metadata?.last_name
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-muted-label truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full border-border text-body-text hover:bg-section-bg"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
