import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"

export function CreatorRequestsTable() {
  const requests = [
    {
      id: "1",
      creatorName: "Alice Smith",
      email: "alice@example.com",
      campaignTitle: "Summer Fashion Collab",
      dateSubmitted: "2024-07-10",
    },
    {
      id: "2",
      creatorName: "Bob Johnson",
      email: "bob@example.com",
      campaignTitle: "Tech Gadget Review",
      dateSubmitted: "2024-07-09",
    },
    {
      id: "3",
      creatorName: "Charlie Brown",
      email: "charlie@example.com",
      campaignTitle: "Healthy Snacks Promo",
      dateSubmitted: "2024-07-08",
    },
  ]

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      {" "}
      {/* Added rounded-xl */}
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Creator Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">Creator Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Email</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Campaign Title</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Date Submitted</TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-foreground px-6 py-3">{request.creatorName}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{request.email}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{request.campaignTitle}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{request.dateSubmitted}</TableCell>
                  <TableCell className="text-right px-6 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="sr-only">Approve</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <X className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Reject</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
