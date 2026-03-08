"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Link, Info, ImageIcon, Video } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface SubmitContentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  onSuccess?: () => void
}

export function SubmitContentModal({ isOpen, onClose, campaignId, onSuccess }: SubmitContentModalProps) {
  const { user } = useAuth()
  const [postLink, setPostLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPostLink("")
      setSelectedFile(null)
      setError(null)
    }
  }, [isOpen])

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

  const normalizeAndValidateUrl = (s: string): { ok: boolean; url: string } => {
    const trimmed = s.trim()
    if (!trimmed) return { ok: false, url: "" }
    let url = trimmed
    if (!/^https?:\/\//i.test(trimmed)) {
      url = `https://${trimmed}`
    }
    try {
      new URL(url)
      return { ok: true, url }
    } catch {
      return { ok: false, url: trimmed }
    }
  }

  const BUCKET = "submission-media"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const rawLink = postLink.trim()
    if (!rawLink) {
      setError("Provide link is required.")
      return
    }
    const { ok, url: link } = normalizeAndValidateUrl(rawLink)
    if (!ok) {
      setError("Please enter a valid link (e.g. https://www.instagram.com/reel/...).")
      return
    }
    if (!selectedFile) {
      setError("Media is required. Upload the original file you posted.")
      return
    }
    if (!user?.id) {
      setError("You must be signed in to submit.")
      toast.error("You must be signed in to submit.")
      return
    }
    if (!campaignId) {
      setError("Campaign is missing. Please open this from a joined campaign.")
      toast.error("Campaign is missing.")
      return
    }

    setIsSubmitting(true)
    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const storagePath = `private/${campaignId}/${user.id}/${Date.now()}_${safeName}`

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        const msg =
          uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("bucket")
            ? "Media upload failed: Storage bucket not set up. Ask the admin to create a public bucket named 'submission-media' in Supabase."
            : uploadError.message
        setError(msg)
        toast.error(msg)
        return
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      const mediaUrl = urlData.publicUrl

      const { error: insertError } = await supabase.from("submissions").insert({
        campaign_id: campaignId,
        user_id: user.id,
        content_link: link,
        platform: "instagram",
        status: "pending",
        media_url: mediaUrl,
      })
      if (insertError) {
        const msg =
          insertError.message?.includes("row-level security") || insertError.message?.includes("policy")
            ? "You can only submit after joining this campaign. Make sure you joined from Explore first."
            : insertError.message
        setError(msg)
        toast.error(msg)
        return
      }
      toast.success("Content submitted for review. The creator will review it soon.")
      onSuccess?.()
      onClose()
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong."
      const isNetwork =
        raw.includes("fetch") ||
        raw.includes("Network") ||
        raw.includes("timeout") ||
        raw.includes("Failed to load")
      const msg = isNetwork
        ? "Could not reach the server. Check your internet, and that your Supabase project is active (not paused) in the Supabase dashboard."
        : raw
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] w-[95%] bg-white text-heading-text border border-gray-100 p-0 flex flex-col max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-heading-text">
            Create Submission
          </DialogTitle>
        </DialogHeader>

        {/* Info banner */}
        <div className="mx-6 mt-4 flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            Only views after you submit count towards payout. Submit as soon as you post to get paid for all views.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form id="submit-content-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Provide link */}
          <div className="space-y-1.5">
            <Label htmlFor="postLink" className="text-sm font-medium text-heading-text flex items-center gap-2">
              <Link className="w-3.5 h-3.5 text-muted-label" />
              Post Link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postLink"
              type="text"
              inputMode="url"
              placeholder="https://www.instagram.com/reel/..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              className={cn(
                "h-10 w-full bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-1 focus:ring-vibrant-red-orange",
                error && !postLink.trim() && "border-red-400"
              )}
            />
          </div>

          {/* Media upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-heading-text flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-muted-label" />
              Media File <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-label">
              Upload the original image or video (no screenshots)
            </p>
            <div
              className="flex flex-col items-center justify-center py-5 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-vibrant-red-orange hover:bg-gray-100 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("mediaUploadInput")?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  {selectedFile.type.startsWith("image/") ? (
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-heading-text truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-label">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5 text-muted-label" />
                  </div>
                  <p className="text-sm font-medium text-heading-text">Click to upload</p>
                  <p className="text-xs text-muted-label mt-0.5">or drag and drop</p>
                </div>
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

        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-10 border border-gray-200 text-heading-text hover:bg-gray-50 bg-white rounded-lg font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-content-form"
            disabled={isSubmitting}
            className="flex-1 h-10 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-semibold shadow-lg shadow-vibrant-red-orange/25"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
