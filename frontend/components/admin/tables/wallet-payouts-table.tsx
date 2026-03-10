import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

interface AdminPayoutRow {
  id: string
  amount: number
  status: "pending" | "processing" | "paid" | "rejected"
  requested_at: string
  processed_at: string | null
  transaction_ref: string | null
  admin_note: string | null
  user: {
    first_name: string | null
    last_name: string | null
    email: string | null
    role: string | null
  } | null
  payout_detail: {
    upi_id: string | null
  } | null
}

export function WalletPayoutsTable() {
  const [rows, setRows] = useState<AdminPayoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/payout-requests")
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not load payout requests.")
        setRows([])
        return
      }
      const mapped: AdminPayoutRow[] =
        (data.requests || []).map((r: any) => ({
          id: r.id,
          amount: Number(r.amount ?? 0),
          status: r.status,
          requested_at: r.requested_at,
          processed_at: r.processed_at,
          transaction_ref: r.transaction_ref,
          admin_note: r.admin_note,
          user: r.users ?? null,
          payout_detail: r.payout_details ?? null,
        })) ?? []
      setRows(mapped)
    } catch (err) {
      console.error(err)
      toast.error("Could not load payout requests.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleMarkPaid = async (row: AdminPayoutRow) => {
    // eslint-disable-next-line no-alert
    const ref = window.prompt("Enter transaction reference / UTR (optional):", row.transaction_ref ?? "") ?? ""
    setActionId(row.id)
    try {
      const res = await fetch("/api/admin/payout-requests/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: row.id, transactionRef: ref.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not mark payout as paid.")
        return
      }
      toast.success("Payout marked as paid.")
      await load()
    } catch (err) {
      console.error(err)
      toast.error("Could not mark payout as paid.")
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (row: AdminPayoutRow) => {
    // eslint-disable-next-line no-alert
    const note = window.prompt("Enter rejection reason (optional):", row.admin_note ?? "") ?? ""
    setActionId(row.id)
    try {
      const res = await fetch("/api/admin/payout-requests/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: row.id, adminNote: note.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not reject payout.")
        return
      }
      toast.success("Payout request rejected.")
      await load()
    } catch (err) {
      console.error(err)
      toast.error("Could not reject payout.")
    } finally {
      setActionId(null)
    }
  }

  const renderStatusBadge = (status: AdminPayoutRow["status"]) => {
    if (status === "paid") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold">
          Paid
        </Badge>
      )
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold">
          Rejected
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-semibold">
        {status === "processing" ? "Processing" : "Pending"}
      </Badge>
    )
  }

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Wallet & Payout Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading payout requests…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground px-6 py-3">User</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">UPI ID</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Amount</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Requested / Processed</TableHead>
                  <TableHead className="text-right text-muted-foreground px-6 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No payout requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const fullName = row.user
                      ? [row.user.first_name, row.user.last_name].filter(Boolean).join(" ") ||
                        row.user.email ||
                        "Unknown user"
                      : "Unknown user"
                    const upi = row.payout_detail?.upi_id ?? "—"
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium text-foreground px-6 py-3">
                          <div className="flex flex-col">
                            <span>{fullName}</span>
                            {row.user?.email && (
                              <span className="text-xs text-muted-foreground">{row.user.email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">{upi}</TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">
                          ₹{row.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="px-6 py-3">{renderStatusBadge(row.status)}</TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">
                          <div className="text-xs">
                            <div>
                              Requested:{" "}
                              {new Date(row.requested_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </div>
                            {row.processed_at && (
                              <div>
                                Processed:{" "}
                                {new Date(row.processed_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                              </div>
                            )}
                            {row.transaction_ref && <div>Ref: {row.transaction_ref}</div>}
                            {row.admin_note && <div>Note: {row.admin_note}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-3">
                          {row.status === "pending" || row.status === "processing" ? (
                            <div className="inline-flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                disabled={actionId === row.id}
                                onClick={() => void handleMarkPaid(row)}
                              >
                                {actionId === row.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                ) : (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                )}
                                <span className="sr-only">Mark as paid</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                disabled={actionId === row.id}
                                onClick={() => void handleReject(row)}
                              >
                                {actionId === row.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                ) : (
                                  <X className="h-4 w-4 text-destructive" />
                                )}
                                <span className="sr-only">Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
