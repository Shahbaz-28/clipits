"use client"

import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const submissions = [
  {
    clipperName: "CreatorX",
    videoThumbnail: "/placeholder.svg?height=60&width=100",
    videoLink: "#",
    submittedDate: "2024-07-15",
    views: "1.2K",
    status: "Pending",
  },
  {
    clipperName: "VideoGenius",
    videoThumbnail: "/placeholder.svg?height=60&width=100",
    videoLink: "#",
    submittedDate: "2024-07-14",
    views: "3.5K",
    status: "Approved",
  },
  {
    clipperName: "ClipMaster",
    videoThumbnail: "/placeholder.svg?height=60&width=100",
    videoLink: "#",
    submittedDate: "2024-07-13",
    views: "800",
    status: "Rejected",
  },
  {
    clipperName: "ContentFlow",
    videoThumbnail: "/placeholder.svg?height=60&width=100",
    videoLink: "#",
    submittedDate: "2024-07-12",
    views: "2.1K",
    status: "Pending",
  },
]

export function AnalyticsClipperSubmissionsTable() {
  return (
    <div className="rounded-md border border-border bg-main-bg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-section-bg hover:bg-section-bg">
            {" "}
            {/* Ensured consistent background */}
            <TableHead className="text-muted-label">Clipper Name</TableHead>
            <TableHead className="text-muted-label">Submitted Video</TableHead>
            <TableHead className="text-muted-label">Submitted Date</TableHead>
            <TableHead className="text-muted-label">Views</TableHead>
            <TableHead className="text-muted-label">Status</TableHead>
            <TableHead className="text-muted-label text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission, index) => (
            <TableRow key={index} className="hover:bg-section-bg/50">
              <TableCell className="font-medium text-body-text">{submission.clipperName}</TableCell>
              <TableCell>
                <a
                  href={submission.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group"
                >
                  <div className="relative w-24 h-14 rounded-md overflow-hidden border border-border flex-shrink-0">
                    <Image
                      src={submission.videoThumbnail || "/placeholder.svg"}
                      alt="Video Thumbnail"
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-sm text-body-text group-hover:text-vibrant-red-orange hidden sm:block">
                    View Video
                  </span>
                </a>
              </TableCell>
              <TableCell className="text-body-text">{submission.submittedDate}</TableCell>
              <TableCell className="text-body-text">{submission.views}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    submission.status === "Pending" && "bg-sunny-yellow/10 text-sunny-yellow",
                    submission.status === "Approved" && "bg-turquoise-accent/10 text-turquoise-accent",
                    submission.status === "Rejected" && "bg-vibrant-red-orange/10 text-vibrant-red-orange",
                  )}
                >
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {submission.status === "Pending" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-turquoise-accent text-turquoise-accent hover:bg-turquoise-accent/10 bg-transparent"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-vibrant-red-orange text-vibrant-red-orange hover:bg-vibrant-red-orange/10 bg-transparent"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="text-muted-label border-border bg-transparent"
                  >
                    Done
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
