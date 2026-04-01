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
    <div className="w-full lg:w-72 bg-rippl-black-2 rounded-[32px] border border-rippl-black-3 shadow-2xl p-6 flex flex-col">
      {/* Profile Info */}
      <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-rippl-black-3">
        <Avatar className="w-20 h-20 mb-3 ring-2 ring-rippl-black-3">
          <AvatarImage
            src={user?.user_metadata?.avatar_url}
            alt={profile?.first_name || user?.user_metadata?.first_name || user?.email || "Profile"}
          />
          <AvatarFallback className="text-2xl font-extrabold text-white bg-rippl-black-3">
            {user
              ? getInitials(
                  profile?.first_name || user.user_metadata?.first_name,
                  profile?.last_name || user.user_metadata?.last_name,
                  user.email
                )
              : "?"}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-extrabold text-white">
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
                  "w-full justify-start gap-4 h-11 text-sm font-bold rounded-xl transition-all",
                  isActive
                    ? "bg-rippl-violet text-white hover:bg-rippl-violet/90"
                    : "text-rippl-gray hover:bg-rippl-black-3 hover:text-white"
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
      <div className="pt-4 border-t border-rippl-black-3 mt-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-4 h-11 text-sm font-bold rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">Logout</span>
        </Button>
      </div>
    </div>
  )
}
