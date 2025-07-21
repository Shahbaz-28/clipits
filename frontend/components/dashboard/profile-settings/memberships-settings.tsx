import { Card, CardContent } from "@/components/ui/card"

export function MembershipsSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-heading-text">Memberships</h2>
      <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
        <CardContent className="p-4 text-body-text">
          <p>Memberships details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
