"use client"

import { useState } from "react"
import { ProfileSidebar } from "./profile-sidebar"
import { GeneralSettings } from "./profile-settings/general-settings"
import { SecurityPrivacySettings } from "./profile-settings/security-privacy-settings"
import { PaymentMethodsSettings } from "./profile-settings/payment-methods-settings"
import { BalanceSettings } from "./profile-settings/balance-settings"
import { ConnectedAccountsSettings } from "./profile-settings/connected-accounts-settings" // Renamed import
import { BillingHistorySettings } from "./profile-settings/billing-history-settings" // New import
import { MembershipsSettings } from "./profile-settings/memberships-settings" // New import
import { Card } from "@/components/ui/card" // Import Card
import { Settings } from "lucide-react" // Icon for Account settings title

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState("general")

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />
      case "connected-accounts": // Renamed case
        return <ConnectedAccountsSettings />
      case "security-privacy":
        return <SecurityPrivacySettings />
      case "payment-methods":
        return <PaymentMethodsSettings />
      case "balance":
        return <BalanceSettings />
      case "billing-history": // New case
        return <BillingHistorySettings />
      case "memberships": // New case
        return <MembershipsSettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 gap-6">
      <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
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
