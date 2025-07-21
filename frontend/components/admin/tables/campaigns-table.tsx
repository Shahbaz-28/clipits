import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function CampaignsTable() {
  const campaigns = [
    {
      id: "c1",
      campaignName: "Summer Fashion Collab",
      creator: "Alice Smith",
      status: "Live",
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      totalViews: "500K",
      budget: "$5,000",
    },
    {
      id: "c2",
      campaignName: "Tech Gadget Review",
      creator: "Bob Johnson",
      status: "Pending",
      startDate: "2024-08-01",
      endDate: "2024-08-15",
      totalViews: "0",
      budget: "$3,000",
    },
    {
      id: "c3",
      campaignName: "Healthy Snacks Promo",
      creator: "Charlie Brown",
      status: "Ended",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      totalViews: "250K",
      budget: "$2,500",
    },
  ]

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      {" "}
      {/* Added rounded-xl */}
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">Campaign Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Creator</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground px-6 py-3">Start & End Date</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Total Views</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Budget</TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium text-foreground px-6 py-3">{campaign.campaignName}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{campaign.creator}</TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge
                      variant={
                        campaign.status === "Live" ? "secondary" : campaign.status === "Pending" ? "outline" : "default"
                      }
                      className={
                        campaign.status === "Live"
                          ? "bg-emerald-100 text-emerald-700 rounded-md" // Added rounded-md
                          : campaign.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700 rounded-md" // Added rounded-md
                            : "bg-gray-100 text-gray-700 rounded-md" // Added rounded-md
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{`${campaign.startDate} - ${campaign.endDate}`}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{campaign.totalViews}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{campaign.budget}</TableCell>
                  <TableCell className="text-right px-6 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <Edit className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      {" "}
                      {/* Added rounded-md */}
                      <Trash className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
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
