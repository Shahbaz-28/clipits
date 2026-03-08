"use client"

import { ProfileSidebar } from "./profile-sidebar"
import { GeneralSettings } from "./profile-settings/general-settings"
import { PaymentMethodsSettings } from "./profile-settings/payment-methods-settings"
import { BalanceSettings } from "./profile-settings/balance-settings"
import { ConnectedAccountsSettings } from "./profile-settings/connected-accounts-settings"
import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

const VALID_TABS = ["general", "connected-accounts", "payment-methods", "balance"] as const

export function ProfilePage({ initialTab = "general" }: { initialTab?: string }) {
  const activeTab = VALID_TABS.includes(initialTab as (typeof VALID_TABS)[number]) ? initialTab : "general"

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

  return (
    <div className="flex flex-col lg:flex-row flex-1 gap-6">
      <ProfileSidebar activeTab={activeTab} />
      <Card className="flex-1 bg-main-bg rounded-xl border border-border shadow-sm p-6 lg:p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-heading-text mb-6 flex items-center gap-3">
          <Settings className="w-8 h-8 text-muted-label" />
          Account settings
        </h1>
        {renderContent()}
      </Card>
    </div>
  )
}
