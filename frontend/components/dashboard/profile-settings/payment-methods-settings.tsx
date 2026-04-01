"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

export function PaymentMethodsSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white/90">Payment methods</h2>
      <Card className="bg-rippl-black-2/50 rounded-xl border border-rippl-black-3 shadow-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rippl-black-3 flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-rippl-gray" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Coming soon</h3>
          <p className="text-sm font-medium text-rippl-gray max-w-sm">
            Add a payout method (e.g. UPI, bank account, or email) to receive your earnings. This feature is in development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
