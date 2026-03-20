"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface AnalyticsCampaignRow {
  id: string
  name: string
  startDate: string
  endDate: string
  budget: number
  totalViews: number
  status: string
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function AnalyticsCampaignTable({ campaigns }: { campaigns: AnalyticsCampaignRow[] }) {

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
            campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="hover:bg-section-bg/50">
              <TableCell className="font-medium text-body-text">{campaign.name}</TableCell>
              <TableCell className="text-body-text">{campaign.startDate}</TableCell>
              <TableCell className="text-body-text">{campaign.endDate}</TableCell>
              <TableCell className="text-body-text">₹{Math.round(campaign.budget).toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-body-text">{campaign.totalViews.toLocaleString("en-IN")}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    campaign.status === "live" && "bg-turquoise-accent/10 text-turquoise-accent",
                    campaign.status === "completed" && "bg-muted-label/10 text-muted-label",
                    campaign.status === "paused" && "bg-muted-label/10 text-muted-label",
                    campaign.status === "draft" && "bg-sunny-yellow/10 text-sunny-yellow",
                  )}
                >
                  {formatStatus(campaign.status)}
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
