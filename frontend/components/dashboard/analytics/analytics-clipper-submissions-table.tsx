"use client"

import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function AnalyticsClipperSubmissionsTable() {
  const submissions: {
    clipperName: string
    videoThumbnail: string
    videoLink: string
    submittedDate: string
    views: string
    status: string
  }[] = []

  return (
    <div className="rounded-[32px] border border-rippl-black-3 bg-rippl-black-2 overflow-hidden shadow-2xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-rippl-black-3/50 hover:bg-rippl-black-3 border-b border-rippl-black-3">
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6">Clipper Name</TableHead>
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6">Submitted Video</TableHead>
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6">Submitted Date</TableHead>
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6">Views</TableHead>
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6">Status</TableHead>
            <TableHead className="text-xs font-bold text-rippl-gray uppercase tracking-widest py-5 px-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-rippl-gray py-20 font-medium">
                No clipper submissions yet.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission, index) => (
            <TableRow key={index} className="hover:bg-rippl-violet/[0.02] border-b border-rippl-black-3 transition-colors">
              <TableCell className="font-bold text-white py-4 px-6">{submission.clipperName}</TableCell>
              <TableCell className="py-4 px-6">
                <a
                  href={submission.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-rippl-black-3 flex-shrink-0 shadow-lg shadow-black/20">
                    <Image
                      src={submission.videoThumbnail || "/placeholder.svg"}
                      alt="Video Thumbnail"
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-rippl-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-rippl-violet transition-colors hidden sm:block">
                    View Video
                  </span>
                </a>
              </TableCell>
              <TableCell className="text-sm font-medium text-rippl-gray py-4 px-6">{submission.submittedDate}</TableCell>
              <TableCell className="text-sm font-bold text-white py-4 px-6">{submission.views}</TableCell>
              <TableCell className="py-4 px-6">
                <Badge
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-transparent shadow-sm",
                    submission.status === "Pending" && "bg-sunny-yellow/10 text-sunny-yellow border-sunny-yellow/20",
                    submission.status === "Approved" && "bg-turquoise-accent/10 text-turquoise-accent border-turquoise-accent/20",
                    submission.status === "Rejected" && "bg-red-500/10 text-red-500 border-red-500/20",
                  )}
                >
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right py-4 px-6">
                {submission.status === "Pending" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 border-turquoise-accent/30 text-turquoise-accent hover:bg-turquoise-accent hover:text-white bg-transparent rounded-lg transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 border-rippl-violet/30 text-rippl-violet hover:bg-rippl-violet hover:text-white bg-transparent rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled
                    className="text-rippl-gray font-bold text-[10px] uppercase tracking-widest"
                  >
                    Completed
                  </Button>
                )}
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
