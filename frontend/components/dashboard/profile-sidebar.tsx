"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, CreditCard, Wallet, LogOut, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  if (email) return email[0].toUpperCase()
  return "?"
}

interface ProfileSidebarProps {
  activeTab: string
}

export function ProfileSidebar({ activeTab }: ProfileSidebarProps) {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }
  const isCreator = profile?.role === "creator"

  const baseNavItems = [
    { id: "general", icon: User, label: "General" },
    { id: "connected-accounts", icon: LinkIcon, label: "Connected accounts" },
    { id: "payment-methods", icon: CreditCard, label: "Payment methods" },
    { id: "balance", icon: Wallet, label: "Balance" },
  ]

  const navItems = isCreator ? baseNavItems.filter((item) => item.id === "general") : baseNavItems

  return (
    <div className="w-full lg:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
      {/* Profile Info */}
      <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-100">
        <Avatar className="w-20 h-20 mb-3 ring-2 ring-gray-100">
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt={profile?.first_name || user?.user_metadata?.first_name || user?.email || "Profile"}
          />
          <AvatarFallback className="text-2xl font-bold text-heading-text bg-gray-100">
            {user
              ? getInitials(
                  profile?.first_name || user.user_metadata?.first_name,
                  profile?.last_name || user.user_metadata?.last_name,
                  user.email
                )
              : "?"}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold text-heading-text">
          {profile?.first_name
            ? profile.first_name
            : user?.user_metadata?.first_name
              ? user.user_metadata.first_name
              : user?.email?.split("@")[0] ?? "Profile"}
        </h2>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const href = item.id === "general" ? "/dashboard/profile" : `/dashboard/profile/${item.id}`
          const isActive = activeTab === item.id
          return (
            <Link key={item.id} href={href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 text-sm font-medium rounded-xl transition-all",
                  isActive
                    ? "bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90"
                    : "text-heading-text hover:bg-gray-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-gray-100 mt-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 h-11 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">Logout</span>
        </Button>
      </div>
    </div>
  )
}
