"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Shield, CreditCard, Wallet, LogOut, Link, UserIcon, Receipt, Users } from "lucide-react" // Added Receipt and Users icons
import { cn } from "@/lib/utils"

interface ProfileSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
  const navItems = [
    { id: "general", icon: Settings, label: "General" },
    { id: "connected-accounts", icon: Link, label: "Connected accounts" }, // Renamed
    { id: "security-privacy", icon: Shield, label: "Security & Privacy" },
    { id: "payment-methods", icon: CreditCard, label: "Payment methods" },
    { id: "balance", icon: Wallet, label: "Balance" },
    { id: "billing-history", icon: Receipt, label: "Billing history" }, // New
    { id: "memberships", icon: Users, label: "Memberships" }, // New
  ]

  return (
    <div className="w-full lg:w-64 bg-main-bg rounded-lg border border-border shadow-sm p-6 lg:p-8 flex flex-col items-center lg:items-start">
      {/* Profile Info */}
      <div className="flex flex-col items-center lg:items-start mb-8 w-full">
        <Avatar className="w-24 h-24 mb-4 border-2 border-turquoise-accent">
          <AvatarFallback className="text-4xl font-bold text-heading-text bg-section-bg">SK</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-heading-text mb-1">Shahbaz khan</h2>
        <p className="text-muted-label text-sm mb-4 flex items-center gap-1">
          <UserIcon className="w-3 h-3" />
          @shahbazkhans
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="w-full space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full justify-start space-x-3 h-12 text-body-text hover:text-vibrant-red-orange", // Removed hover background
              activeTab === item.id && "text-vibrant-red-orange font-semibold", // Removed active background/shadow
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-left">{item.label}</span>
          </Button>
        ))}
        <div className="pt-4 border-t border-border mt-4">
          {" "}
          {/* Separator for Logout */}
          <Button
            variant="ghost"
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
