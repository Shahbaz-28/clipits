"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export function PaymentMethodsSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-heading-text">Payment methods</h2>
      <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-xl bg-section-bg flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-muted-label" />
          </div>
          <h3 className="text-lg font-semibold text-heading-text mb-2">Coming soon</h3>
          <p className="text-sm text-muted-label max-w-sm">
            Add a payout method (e.g. UPI, bank account, or email) to receive your earnings. This feature is in development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
