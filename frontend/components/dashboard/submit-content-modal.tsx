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
      <DialogContent className="sm:max-w-[500px] w-[95%] bg-main-bg text-body-text border-border p-6 sm:p-8 flex flex-col max-h-[90vh] rounded-xl shadow-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-heading-text text-center text-2xl font-bold">
            Create submission
          </DialogTitle>
        </DialogHeader>

        {/* Info banner – theme colors */}
        <div className="flex gap-3 p-3 rounded-lg bg-section-bg border border-border text-body-text text-sm">
          <Info className="w-5 h-5 shrink-0 text-turquoise-accent mt-0.5" />
          <p>
            Only views after you submit count towards payout. Submit as soon as you post to get paid for all of your views.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form id="submit-content-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-4 pr-2 space-y-5 modal-form-scroll">
          <div>
            <h3 className="text-lg font-semibold text-heading-text mb-1">Submit your social media post</h3>
            <p className="text-sm text-muted-label mb-4">
              Share your post&apos;s link and the original image or video below. Once approved, you&apos;ll start earning rewards based on the views your content generates.
            </p>
          </div>

          {/* Provide link */}
          <div className="space-y-2">
            <Label htmlFor="postLink" className="text-body-text flex items-center gap-2 font-medium">
              <Link className="w-4 h-4 text-muted-label" />
              Provide link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postLink"
              type="text"
              inputMode="url"
              placeholder="https://www.instagram.com/reel/1234567890"
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              className={cn(
                "w-full bg-section-bg border-border text-body-text placeholder:text-muted-label focus-visible:border-vibrant-red-orange focus-visible:ring-0 rounded-md",
                error && !postLink.trim() && "border-red-500"
              )}
            />
          </div>

          {/* Media - required */}
          <div className="space-y-2">
            <Label className="text-body-text flex items-center gap-2 font-medium">
              Media <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-label">
            Upload the original media file (no screenshots). For videos, upload the video. If multiple files exist, upload the first one.            </p>
            <div
              className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-border rounded-lg bg-section-bg text-center cursor-pointer hover:border-vibrant-red-orange transition-colors min-h-[100px]"
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
                  <p className="text-body-text text-sm font-medium truncate max-w-[220px]">{selectedFile.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-label mb-2" />
                  <p className="text-body-text text-sm">Upload media</p>
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
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto border-border text-body-text hover:bg-section-bg bg-transparent rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-content-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-turquoise-accent to-[#20A070] text-white hover:from-[#20A070] hover:to-turquoise-accent shadow-lg shadow-turquoise-accent/30 transition-all duration-200 rounded-md"
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
