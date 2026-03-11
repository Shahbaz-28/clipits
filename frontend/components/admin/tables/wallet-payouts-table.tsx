import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Check, X, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<AdminPayoutRow | null>(null)
  const [transactionRefInput, setTransactionRefInput] = useState("")
  const [adminNoteInput, setAdminNoteInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | AdminPayoutRow["status"]>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

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

  const handleMarkPaid = async () => {
    if (!selectedRow) return
    setActionId(selectedRow.id)
    try {
      const res = await fetch("/api/admin/payout-requests/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRow.id,
          transactionRef: transactionRefInput.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not mark payout as paid.")
        return
      }
      toast.success("Payout marked as paid.")
      setPayModalOpen(false)
      await load()
    } catch (err) {
      console.error(err)
      toast.error("Could not mark payout as paid.")
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRow) return
    setActionId(selectedRow.id)
    try {
      const res = await fetch("/api/admin/payout-requests/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRow.id,
          adminNote: adminNoteInput.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not reject payout.")
        return
      }
      toast.success("Payout request rejected.")
      setRejectModalOpen(false)
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

  const filtered = rows.filter((row) => {
    const matchesStatus = statusFilter === "all" ? true : row.status === statusFilter
    const term = searchTerm.trim().toLowerCase()
    if (!term) return matchesStatus
    const fullName = row.user
      ? [row.user.first_name, row.user.last_name].filter(Boolean).join(" ").toLowerCase()
      : ""
    const email = (row.user?.email ?? "").toLowerCase()
    const upi = (row.payout_detail?.upi_id ?? "").toLowerCase()
    return matchesStatus && (fullName.includes(term) || email.includes(term) || upi.includes(term))
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchTerm])

  return (
    <>
      <Card className="shadow-sm border border-border rounded-xl">
        <CardHeader className="px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">Wallet & Payout Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                >
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search user or UPI"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-7 pr-2 text-xs w-[220px]"
                />
              </div>
            </div>
          </div>
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
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No payout requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row) => {
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
                                onClick={() => {
                                  setSelectedRow(row)
                                  setTransactionRefInput(row.transaction_ref ?? "")
                                  setPayModalOpen(true)
                                }}
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
                                onClick={() => {
                                  setSelectedRow(row)
                                  setAdminNoteInput(row.admin_note ?? "")
                                  setRejectModalOpen(true)
                                }}
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
        {filtered.length > 0 && !loading && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-muted-foreground">
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-3 text-xs"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-3 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      <Dialog
        open={payModalOpen}
        onOpenChange={(open) => {
          setPayModalOpen(open)
          if (!open) setSelectedRow(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-white text-heading-text border border-gray-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Mark payout as paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-label">
              Add the transaction reference (UTR / ID). Optional, but recommended.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="transactionRef">Transaction reference</Label>
              <Input
                id="transactionRef"
                placeholder="e.g. UTR123456789"
                value={transactionRefInput}
                onChange={(e) => setTransactionRefInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-200"
                onClick={() => setPayModalOpen(false)}
                disabled={!!actionId}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => void handleMarkPaid()}
                disabled={!!actionId}
              >
                {actionId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Mark as paid"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          setRejectModalOpen(open)
          if (!open) setSelectedRow(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-white text-heading-text border border-gray-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Reject payout request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-label">
              Add a short reason so the clipper understands why it was rejected.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="adminNote">Reason</Label>
              <Input
                id="adminNote"
                placeholder="e.g. UPI ID invalid"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-200"
                onClick={() => setRejectModalOpen(false)}
                disabled={!!actionId}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={() => void handleReject()}
                disabled={!!actionId}
              >
                {actionId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

