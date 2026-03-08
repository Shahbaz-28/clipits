"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, CreditCard, Wallet, LogOut, Link as LinkIcon, UserIcon } from "lucide-react"
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
  const displayName =
    profile?.first_name || profile?.last_name
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim()
      : user?.user_metadata?.first_name && user?.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user?.email ?? "Profile"
  const displayHandle = profile?.username
    ? `@${profile.username.replace(/^@/, "")}`
    : user?.email
      ? `@${user.email.split("@")[0]}`
      : "@user"

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }
  const navItems = [
    { id: "general", icon: Settings, label: "General" },
    { id: "connected-accounts", icon: LinkIcon, label: "Connected accounts" },
    { id: "payment-methods", icon: CreditCard, label: "Payment methods" },
    { id: "balance", icon: Wallet, label: "Balance" },
  ]

  return (
    <div className="w-full lg:w-64 bg-main-bg rounded-lg border border-border shadow-sm p-6 lg:p-8 flex flex-col items-center lg:items-start">
      {/* Profile Info */}
      <div className="flex flex-col items-center lg:items-start mb-8 w-full">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.first_name || user?.email || "Profile"}
          />
          <AvatarFallback className="text-4xl font-bold text-heading-text bg-section-bg">
            {user
              ? getInitials(
                  user.user_metadata?.first_name,
                  user.user_metadata?.last_name,
                  user.email
                )
              : "?"}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-heading-text mb-1">
          {user?.user_metadata?.first_name && user?.user_metadata?.last_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
            : user?.email ?? "Profile"}
        </h2>
        <p className="text-muted-label text-sm mb-4 flex items-center gap-1">
          <UserIcon className="w-3 h-3" />
          {user?.email ? `@${user.email.split("@")[0]}` : "@user"}
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="w-full space-y-2">
        {navItems.map((item) => {
          const href = item.id === "general" ? "/dashboard/profile" : `/dashboard/profile/${item.id}`
          const isActive = activeTab === item.id
          return (
            <Link key={item.id} href={href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-3 h-12 text-body-text hover:bg-vibrant-red-orange/10 hover:text-vibrant-red-orange",
                  isActive && "bg-vibrant-red-orange/10 text-vibrant-red-orange font-semibold",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            </Link>
          )
        })}
        <div className="pt-4 border-t border-border mt-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start space-x-3 h-12 text-vibrant-red-orange hover:bg-vibrant-red-orange/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Logout</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
