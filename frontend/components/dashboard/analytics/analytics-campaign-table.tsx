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
    <div className="rounded-xl border border-rippl-black-3 bg-rippl-black-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-rippl-black-3/50 border-b border-rippl-black-3">
            <TableHead className="text-rippl-gray font-bold">Campaign Name</TableHead>
            <TableHead className="text-rippl-gray font-bold">Start Date</TableHead>
            <TableHead className="text-rippl-gray font-bold">End Date</TableHead>
            <TableHead className="text-rippl-gray font-bold">Budget</TableHead>
            <TableHead className="text-rippl-gray font-bold">Total Views</TableHead>
            <TableHead className="text-rippl-gray font-bold">Status</TableHead>
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
            <TableRow key={campaign.id} className="hover:bg-rippl-black-3 border-b border-rippl-black-3">
              <TableCell className="font-bold text-white py-4">{campaign.name}</TableCell>
              <TableCell className="text-rippl-gray">{campaign.startDate}</TableCell>
              <TableCell className="text-rippl-gray">{campaign.endDate}</TableCell>
              <TableCell className="text-white font-semibold">₹{Math.round(campaign.budget).toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-rippl-gray">{campaign.totalViews.toLocaleString("en-IN")}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    campaign.status === "live" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    campaign.status === "completed" && "bg-rippl-gray/10 text-rippl-gray border border-rippl-gray/20",
                    campaign.status === "paused" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                    campaign.status === "draft" && "bg-rippl-violet/10 text-rippl-violet-soft border border-rippl-violet/20",
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
