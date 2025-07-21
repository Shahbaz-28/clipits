import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function WalletPayoutsTable() {
  const payouts = [
    {
      id: "p1",
      user: "Alice Smith",
      role: "Creator",
      amount: "$1,000",
      status: "Completed",
      date: "2024-07-10",
    },
    {
      id: "p2",
      user: "Bob Johnson",
      role: "Creator",
      amount: "$500",
      status: "Pending",
      date: "2024-07-15",
    },
    {
      id: "p3",
      user: "Emily White",
      role: "Clipper",
      amount: "$150",
      status: "Completed",
      date: "2024-07-12",
    },
    {
      id: "p4",
      user: "David Green",
      role: "Clipper",
      amount: "$80",
      status: "Pending",
      date: "2024-07-16",
    },
  ]

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      {" "}
      {/* Added rounded-xl */}
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Wallet & Payout History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">User</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Role</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Amount</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium text-foreground px-6 py-3">{payout.user}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{payout.role}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{payout.amount}</TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge
                      variant={payout.status === "Completed" ? "secondary" : "outline"}
                      className={
                        payout.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700 rounded-md" // Added rounded-md
                          : "bg-yellow-100 text-yellow-700 rounded-md" // Added rounded-md
                      }
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{payout.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
