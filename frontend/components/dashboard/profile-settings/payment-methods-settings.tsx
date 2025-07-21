import { Card, CardContent } from "@/components/ui/card" // Import Card and CardContent

export function PaymentMethodsSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-heading-text">Payment methods</h2> {/* Simplified title */}
      <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
        <CardContent className="p-4 text-body-text">
          <p>Payment methods will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
