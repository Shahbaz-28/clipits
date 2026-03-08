"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function AnalyticsCampaignTable() {
  const campaigns: {
    name: string
    startDate: string
    endDate: string
    budget: string
    totalViews: string
    status: string
  }[] = []

  return (
    <div className="rounded-md border border-border bg-main-bg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-section-bg hover:bg-section-bg">
            <TableHead className="text-muted-label">Campaign Name</TableHead>
            <TableHead className="text-muted-label">Start Date</TableHead>
            <TableHead className="text-muted-label">End Date</TableHead>
            <TableHead className="text-muted-label">Budget</TableHead>
            <TableHead className="text-muted-label">Total Views</TableHead>
            <TableHead className="text-muted-label">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                No campaigns yet.
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign, index) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
