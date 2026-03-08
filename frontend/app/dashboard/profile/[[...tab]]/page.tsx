"use client"

import React from "react"
import { ProfilePage } from "@/components/dashboard/profile-page"

const VALID_TABS = ["general", "connected-accounts", "payment-methods", "balance"]

export default function ProfileTabPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>
}) {
  const resolvedParams = React.use(params)
  const segment = resolvedParams.tab?.[0]
  const activeTab = segment && VALID_TABS.includes(segment) ? segment : "general"
  return <ProfilePage initialTab={activeTab} />
}
