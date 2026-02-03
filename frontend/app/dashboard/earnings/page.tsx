"use client"

import { DollarSign } from "lucide-react"

function PlaceholderPage({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-section-bg mb-4">
        <Icon className="w-12 h-12 text-muted-label" />
      </div>
      <h2 className="text-xl font-semibold text-heading-text mb-2">{title}</h2>
      <p className="text-muted-label max-w-sm">{description}</p>
    </div>
  )
}

export default function EarningsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-heading-text mb-4">Earnings</h1>
      <p className="text-muted-label mt-1 mb-6">Balance and payout history</p>
      <PlaceholderPage
        icon={DollarSign}
        title="No earnings yet"
        description="Earn from approved submissions. Request payout when you have a balance."
      />
    </>
  )
}
