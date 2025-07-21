"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Link, LayoutGrid, CheckCircle, ImageIcon, Video } from "lucide-react" // Added ImageIcon, Video icons

interface SubmitContentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubmitContentModal({ isOpen, onClose }: SubmitContentModalProps) {
  const [postLink, setPostLink] = useState("")
  const [platform, setPlatform] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Content submitted:", { postLink, platform, selectedFile })
    // Add actual submission logic here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95%] bg-main-bg text-body-text border-border p-6 sm:p-8 flex flex-col max-h-[90vh] rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-heading-text text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-turquoise-accent" />
            Submit Your Content
          </DialogTitle>
          <DialogDescription className="text-muted-label text-base">
            Upload your content for review and approval
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 pr-2 space-y-6">
          {/* Post Link */}
          <div>
            <Label htmlFor="postLink" className="text-body-text flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-muted-label" />
              Post Link
            </Label>
            <Input
              id="postLink"
              placeholder="Paste your post link here"
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label focus:border-vibrant-red-orange focus:ring-vibrant-red-orange rounded-md"
            />
          </div>

          {/* Platform */}
          <div>
            <Label htmlFor="platform" className="text-body-text flex items-center gap-2 mb-2">
              <LayoutGrid className="w-4 h-4 text-muted-label" />
              Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full bg-section-bg border-border text-body-text focus:border-vibrant-red-orange focus:ring-vibrant-red-orange rounded-md">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-main-bg border-border text-body-text rounded-md">
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Upload */}
          <div>
            <Label htmlFor="mediaUpload" className="text-body-text flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-muted-label" />
              Media Upload
            </Label>
            <div
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-section-bg text-center cursor-pointer hover:border-vibrant-red-orange transition-colors min-h-[150px] shadow-sm"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("mediaUploadInput")?.click()}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  {selectedFile.type.startsWith("image/") ? (
                    <ImageIcon className="w-8 h-8 text-turquoise-accent mb-2" />
                  ) : (
                    <Video className="w-8 h-8 text-turquoise-accent mb-2" />
                  )}
                  <p className="text-body-text mb-1 text-sm font-medium truncate w-full max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-label">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-label mb-2" />
                  <p className="text-body-text mb-1 text-sm">Drop your screenshot or video here</p>
                  <p className="text-xs text-muted-label">or click to browse files</p>
                </>
              )}
              <Input
                id="mediaUploadInput"
                type="file"
                className="sr-only"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </form>
        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-border text-body-text hover:bg-section-bg bg-transparent rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-turquoise-accent to-[#20A070] text-white hover:from-[#20A070] hover:to-turquoise-accent shadow-lg shadow-turquoise-accent/30 transition-all duration-200 rounded-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
