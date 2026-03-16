"use client"

import { ProfileSidebar } from "./profile-sidebar"
import { GeneralSettings } from "./profile-settings/general-settings"
import { PaymentMethodsSettings } from "./profile-settings/payment-methods-settings"
import { BalanceSettings } from "./profile-settings/balance-settings"
import { ConnectedAccountsSettings } from "./profile-settings/connected-accounts-settings"
import { Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const VALID_TABS = ["general", "connected-accounts", "payment-methods", "balance"] as const

export function ProfilePage({ initialTab = "general" }: { initialTab?: string }) {
  const { profile } = useAuth()
  const isCreator = profile?.role === "creator"
  const allowedTabs = (isCreator ? ["general"] : VALID_TABS) as typeof VALID_TABS
  const activeTab = allowedTabs.includes(initialTab as (typeof VALID_TABS)[number]) ? initialTab : "general"

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />
      case "connected-accounts":
        return <ConnectedAccountsSettings />
      case "payment-methods":
        return <PaymentMethodsSettings />
      case "balance":
        return <BalanceSettings />
      default:
        return <GeneralSettings />
    }
  }

  const getTitle = () => {
    switch (activeTab) {
      case "general":
        return "Account Settings"
      case "connected-accounts":
        return "Connected Accounts"
      case "payment-methods":
        return "Payment Methods"
      case "balance":
        return "Balance & Earnings"
      default:
        return "Account Settings"
    }
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 gap-8">
      <ProfileSidebar activeTab={activeTab} />
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6">
          <h1 className="text-2xl font-bold text-heading-text flex items-center gap-3">
            <Settings className="w-6 h-6 text-muted-label" />
            {getTitle()}
          </h1>
        </div>
        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
