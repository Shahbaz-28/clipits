"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const campaigns = [
  {
    name: "Summer Fashion Haul",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    budget: "₹5,000",
    totalViews: "2.3M",
    status: "Completed",
  },
  {
    name: "Gaming Highlights Reel",
    startDate: "2024-07-01",
    endDate: "2024-07-15",
    budget: "₹2,000",
    totalViews: "1.8M",
    status: "Active",
  },
  {
    name: "Tech Review Challenge",
    startDate: "2024-07-10",
    endDate: "2024-08-10",
    budget: "₹8,000",
    totalViews: "4.1M",
    status: "Active",
  },
  {
    name: "Food Recipe Series",
    startDate: "2024-05-20",
    endDate: "2024-06-20",
    budget: "₹3,500",
    totalViews: "1.2M",
    status: "Completed",
  },
  {
    name: "Travel Vlog Series",
    startDate: "2024-08-01",
    endDate: "2024-08-31",
    budget: "₹6,000",
    totalViews: "0M",
    status: "Active",
  },
]

export function AnalyticsCampaignTable() {
  return (
    <div className="rounded-md border border-border bg-main-bg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-section-bg hover:bg-section-bg">
            {" "}
            {/* Ensured consistent background */}
            <TableHead className="text-muted-label">Campaign Name</TableHead>
            <TableHead className="text-muted-label">Start Date</TableHead>
            <TableHead className="text-muted-label">End Date</TableHead>
            <TableHead className="text-muted-label">Budget</TableHead>
            <TableHead className="text-muted-label">Total Views</TableHead>
            <TableHead className="text-muted-label">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign, index) => (
            <TableRow key={index} className="hover:bg-section-bg/50">
              <TableCell className="font-medium text-body-text">{campaign.name}</TableCell>
              <TableCell className="text-body-text">{campaign.startDate}</TableCell>
              <TableCell className="text-body-text">{campaign.endDate}</TableCell>
              <TableCell className="text-body-text">{campaign.budget}</TableCell>
              <TableCell className="text-body-text">{campaign.totalViews}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    campaign.status === "Active" && "bg-turquoise-accent/10 text-turquoise-accent",
                    campaign.status === "Completed" && "bg-muted-label/10 text-muted-label",
                  )}
                >
                  {campaign.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
