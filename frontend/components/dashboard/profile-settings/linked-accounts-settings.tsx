import { Link } from "lucide-react"

export function LinkedAccountsSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-heading-text flex items-center gap-2">
        <Link className="w-6 h-6 text-muted-label" />
        Linked Accounts
      </h2>
      <p className="text-muted-label">Connect and manage your linked social media and payment accounts.</p>
      <div className="p-4 bg-section-bg rounded-lg border border-border text-body-text">
        <p>Linked accounts settings will be displayed here.</p>
      </div>
    </div>
  )
}
