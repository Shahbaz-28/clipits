import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, Play } from "lucide-react"

export function ClipperSubmissionsTable() {
  const submissions = [
    {
      id: "s1",
      campaignName: "Summer Fashion Collab",
      clipperName: "Emily White",
      reelsUrl: "https://example.com/reel1",
      submissionDate: "2024-07-15",
      viewCount: "15K",
      payout: "$150",
    },
    {
      id: "s2",
      campaignName: "Tech Gadget Review",
      clipperName: "David Green",
      reelsUrl: "https://example.com/reel2",
      submissionDate: "2024-07-14",
      viewCount: "8K",
      payout: "$80",
    },
    {
      id: "s3",
      campaignName: "Healthy Snacks Promo",
      clipperName: "Sophia Lee",
      reelsUrl: "https://example.com/reel3",
      submissionDate: "2024-07-13",
      viewCount: "20K",
      payout: "$200",
    },
  ]

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      {" "}
      {/* Added rounded-xl */}
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Clipper Submissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">Campaign Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Clipper Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Reels URL</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Submission Date</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">View Count</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Payout</TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium text-foreground px-6 py-3">{submission.campaignName}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{submission.clipperName}</TableCell>
                  <TableCell className="px-6 py-3">
                    <a
                      href={submission.reelsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Reel
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{submission.submissionDate}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{submission.viewCount}</TableCell>
                  <TableCell className="text-muted-foreground px-6 py-3">{submission.payout}</TableCell>
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
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Preview</span>
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
