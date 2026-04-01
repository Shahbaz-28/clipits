"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Upload,
  Plus,
  Trash2,
  Instagram,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export interface EditingCampaign {
  id: string
  title: string
  description: string | null
  thumbnail_url?: string | null
  type: string
  category: string | null
  total_budget: number
  rate_per_1k: number
  min_payout: number
  max_payout: number
  requirements: string[]
  assets: { name: string; link: string }[]
  platforms: string[]
  end_date: string | null
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editingCampaign?: EditingCampaign | null
}

interface FormErrors {
  title?: string
  type?: string
  total_budget?: string
  rate_per_1k?: string
  min_payout?: string
  max_payout?: string
  platforms?: string
  assets?: string
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess, editingCampaign }: CreateCampaignModalProps) {
  const { user, profile } = useAuth()
  const justSubmittedRef = useRef(false)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [budget, setBudget] = useState<number>(0)
  const [rewardRate, setRewardRate] = useState<number>(0)
  const [minPayout, setMinPayout] = useState<number>(0)
  const [maxPayout, setMaxPayout] = useState<number>(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"])
  const [requirementsList, setRequirementsList] = useState<string[]>([])
  const [requirementInput, setRequirementInput] = useState("")
  const [assetsList, setAssetsList] = useState<{ name: string; link: string }[]>([])
  const [assetLinkInput, setAssetLinkInput] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    category: "",
  })

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null)
      justSubmittedRef.current = false
    }
  }, [isOpen])

  // Load form when editing; reset when opening for create
  useEffect(() => {
    if (!isOpen) return
    if (editingCampaign) {
      setFormData({
        title: editingCampaign.title,
        type: editingCampaign.type,
        category: editingCampaign.category ?? "",
      })
      setBudget(Number(editingCampaign.total_budget))
      setRewardRate(Number(editingCampaign.rate_per_1k))
      setMinPayout(Number(editingCampaign.min_payout))
      setMaxPayout(Number(editingCampaign.max_payout))
      setSelectedPlatforms(
        Array.isArray(editingCampaign.platforms) && editingCampaign.platforms.length > 0
          ? editingCampaign.platforms
          : ["instagram"]
      )
      setRequirementsList(Array.isArray(editingCampaign.requirements) ? editingCampaign.requirements : [])
      setRequirementInput("")
      setAssetsList(Array.isArray(editingCampaign.assets) ? editingCampaign.assets : [])
      setAssetLinkInput("")
      setEndDate(editingCampaign.end_date ? new Date(editingCampaign.end_date) : undefined)
      setThumbnailFile(null)
      setThumbnailPreview(editingCampaign.thumbnail_url ?? null)
    } else {
      setFormData({ title: "", type: "", category: "" })
      setBudget(0)
      setRewardRate(0)
      setMinPayout(0)
      setMaxPayout(0)
      setSelectedPlatforms(["instagram"])
      setRequirementsList([])
      setRequirementInput("")
      setAssetsList([])
      setAssetLinkInput("")
      setEndDate(undefined)
      setThumbnailFile(null)
      setThumbnailPreview(null)
    }
  }, [isOpen, editingCampaign])

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Thumbnail must be an image file.")
      return
    }
    const maxSizeMb = 10
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Thumbnail must be smaller than ${maxSizeMb}MB.`)
      return
    }
    setThumbnailFile(file)
    const objectUrl = URL.createObjectURL(file)
    setThumbnailPreview(objectUrl)
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
    if (errors.platforms) setErrors((e) => ({ ...e, platforms: undefined }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const hasContentForDraft = (): boolean => {
    return formData.title.trim() !== ""
  }

  const buildPayload = () => {
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ["instagram"]
    return {
      title: formData.title.trim() || "Untitled",
      description: editingCampaign?.description ?? null,
      type: (formData.type || "ugc") as "ugc" | "clipping",
      category: formData.category || null,
      total_budget: budget || 0,
      rate_per_1k: rewardRate || 0,
      min_payout: minPayout >= 0 ? minPayout : 0,
      max_payout: maxPayout >= 0 ? maxPayout : 1,
      flat_fee_bonus: 0,
      platforms,
      requirements: requirementsList,
      assets: assetsList,
      disclaimer: null,
      end_date: endDate ? endDate.toISOString() : null,
      thumbnail_url: editingCampaign?.thumbnail_url ?? null,
    }
  }

  const saveDraft = async (): Promise<void> => {
    if (!user?.id) return
    const payload = buildPayload()
    const { error } = await supabase.from("campaigns").insert({
      ...payload,
      status: "draft",
      created_by: user.id,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Draft saved. You can edit it from My Campaigns.")
  }

  const handleClose = () => {
    ; (async () => {
      if (
        !justSubmittedRef.current &&
        !editingCampaign &&
        hasContentForDraft()
      ) {
        await saveDraft()
        onSuccess?.()
      }
      onClose()
    })()
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!formData.title?.trim()) e.title = "Title is required"
    if (!formData.type) e.type = "Campaign type is required"
    if (budget <= 0) e.total_budget = "Budget must be greater than 0"
    if (rewardRate <= 0) e.rate_per_1k = "Reward rate must be greater than 0"
    if (minPayout < 0) e.min_payout = "Min payout cannot be negative"
    if (maxPayout < 0) e.max_payout = "Max payout cannot be negative"
    if (maxPayout > 0 && minPayout > maxPayout)
      e.max_payout = "Max payout must be greater than or equal to min payout"
    if (selectedPlatforms.length === 0) e.platforms = "Select at least one platform"
    if (assetsList.length === 0) e.assets = "Add at least one asset link"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault()
    if (!validate()) return
    if (!user?.id) {
      toast.error("You must be signed in to create a campaign.")
      return
    }
    setIsSubmitting(true)
    setErrors({})
    setSubmitError(null)

    try {
      const payload = buildPayload()

      // Upload thumbnail if provided
      if (thumbnailFile && user?.id) {
        const BUCKET = "campaign-thumbnails"
        const safeName = thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const storagePath = `thumbnails/${user.id}/${Date.now()}_${safeName}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, thumbnailFile, { cacheControl: "3600", upsert: false })

        if (uploadError) {
          const message =
            uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("bucket")
              ? "Thumbnail upload failed: Storage bucket not set up. Create a public bucket named 'campaign-thumbnails' in Supabase Storage."
              : uploadError.message
          setSubmitError(message)
          toast.error(message)
          setIsSubmitting(false)
          return
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        payload.thumbnail_url = urlData.publicUrl
      }

      if (editingCampaign) {
        // Update existing campaign
        const updatePayload: Record<string, unknown> = {
          ...payload,
          updated_at: new Date().toISOString(),
        }
        if (publish) updatePayload.status = "pending_review"

        const updatePromise = supabase
          .from("campaigns")
          .update(updatePayload)
          .eq("id", editingCampaign.id)
          .eq("created_by", user.id)
          .select("id")

        const timeoutMs = 15000
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Check your network and Supabase connection.")), timeoutMs)
        )

        const result = await Promise.race([updatePromise, timeoutPromise]).catch((err) => ({
          data: null,
          error: { message: err instanceof Error ? err.message : "Request failed." },
        }))

        const { data, error } = result as { data: { id: string }[] | null; error: { message: string } | null }

        if (error) {
          setSubmitError(error.message)
          toast.error(error.message)
          return
        }
        if (!data || data.length === 0) {
          const msg = "Update failed. No rows updated—check that you own this campaign and have permission to publish."
          setSubmitError(msg)
          toast.error(msg)
          return
        }
        justSubmittedRef.current = true
        toast.success(publish ? "Campaign submitted for admin review." : "Draft saved.")
        onSuccess?.()
        onClose()
        return
      }

      // Create new campaign (go to admin review)
      const insertPayload = { ...payload, status: "pending_review", created_by: user.id }

      const insertPromise = supabase.from("campaigns").insert(insertPayload)
      const timeoutMs = 15000
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Check your network and Supabase connection.")), timeoutMs)
      )

      const { error } = await Promise.race([insertPromise, timeoutPromise]).catch((err) => ({
        error: { message: err instanceof Error ? err.message : "Request failed." },
      }))

      if (error) {
        setSubmitError(error.message)
        toast.error(error.message)
        return
      }

      justSubmittedRef.current = true
      toast.success("Campaign created and submitted for admin review.")
      onSuccess?.()
      onClose()
      setFormData({ title: "", type: "", category: "" })
      setBudget(0)
      setRewardRate(0)
      setMinPayout(0)
      setMaxPayout(0)
      setSelectedPlatforms([])
      setRequirementsList([])
      setAssetsList([])
      setEndDate(undefined)
    } catch (err) {
      console.error("Error creating campaign:", err)
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[720px] w-[95%] bg-rippl-black-2 text-white border border-rippl-black-3 p-0 flex flex-col max-h-[90vh] rounded-[32px] shadow-2xl shadow-rippl-violet/10 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-rippl-black-3">
          <DialogTitle className="text-2xl font-extrabold text-white">
            {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-rippl-gray mt-1">
            {editingCampaign
              ? "Update your draft. Publish to submit for admin review."
              : "Create a campaign it will go to admin review first. Close without submitting to save as draft."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            <p className="font-medium">Could not create campaign</p>
            <p className="text-xs mt-1">{submitError}</p>
          </div>
        )}

        <form
          id="create-campaign-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Campaign Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-bold text-white/90">
                  Campaign Title <span className="text-rippl-violet">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter an engaging campaign title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={cn("h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.title && "border-red-400 focus:border-red-400 focus:ring-red-400")}
                />
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>

              {/* Campaign Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-sm font-bold text-white/90">
                    Type <span className="text-rippl-violet">*</span>
                  </Label>
                  <Select
                    value={formData.type || undefined}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger className={cn("h-11 bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.type && "border-red-400 focus:border-red-400 focus:ring-red-400")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-rippl-black-3 border border-rippl-black-3 text-white rounded-xl">
                      <SelectItem value="ugc" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">UGC</SelectItem>
                      <SelectItem value="clipping" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Clipping</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-bold text-white/90">Category</Label>
                  <Select
                    value={formData.category || undefined}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger className="h-11 bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-rippl-black-3 border border-rippl-black-3 text-white rounded-xl">
                      <SelectItem value="creator" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Creator</SelectItem>
                      <SelectItem value="e-commerce" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">E-commerce</SelectItem>
                      <SelectItem value="logo" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Logo</SelectItem>
                      <SelectItem value="music" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Music</SelectItem>
                      <SelectItem value="other" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Other</SelectItem>
                      <SelectItem value="podcast" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Podcast</SelectItem>
                      <SelectItem value="software" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Software</SelectItem>
                      <SelectItem value="stream" className="focus:bg-rippl-black-2 cursor-pointer rounded-lg">Stream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Platforms */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-white/90">Target Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {[{ id: "instagram", icon: Instagram, label: "Instagram" }].map((platform) => (
                    <Button
                      key={platform.id}
                      type="button"
                      variant="outline"
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={cn(
                        "h-10 px-4 border rounded-xl text-sm font-bold transition-colors",
                        selectedPlatforms.includes(platform.id)
                          ? "bg-rippl-violet text-white border-rippl-violet hover:bg-rippl-violet/90 hover:text-white"
                          : "bg-rippl-black-2 border-rippl-black-3 text-rippl-gray hover:bg-rippl-black-3 hover:text-white"
                      )}
                    >
                      <platform.icon className="w-4 h-4 mr-2" />
                      {platform.label}
                    </Button>
                  ))}
                </div>
                {errors.platforms && <p className="text-red-500 text-xs">{errors.platforms}</p>}
              </div>

              {/* Campaign Thumbnail */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-white/90">Campaign Thumbnail</Label>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center py-4 px-3 border border-dashed border-rippl-black-3 rounded-xl bg-rippl-black-2/50 text-center cursor-pointer hover:border-rippl-violet hover:bg-rippl-black-3 transition-all relative overflow-hidden"
                  onClick={() => document.getElementById("campaignThumbnailInput")?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailPreview}
                        alt="Campaign thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-rippl-violet mb-2 opacity-80" />
                      <p className="text-sm font-bold text-white">Click to upload</p>
                      <p className="text-xs font-medium text-rippl-gray mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <Input
                    id="campaignThumbnailInput"
                    type="file"
                    className="sr-only"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleThumbnailChange}
                  />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Total Budget & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="totalBudget" className="text-sm font-bold text-white/90">
                    Total Budget (₹) <span className="text-rippl-violet">*</span>
                  </Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    min={1}
                    placeholder="50,000"
                    value={!Number.isFinite(budget) || budget === 0 ? "" : budget}
                    onChange={(e) => {
                      setBudget(Number(e.target.value))
                      if (errors.total_budget) setErrors((prev) => ({ ...prev, total_budget: undefined }))
                    }}
                    className={cn("h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.total_budget && "border-red-400 focus:border-red-400 focus:ring-red-400")}
                  />
                  {errors.total_budget && <p className="text-red-500 text-xs">{errors.total_budget}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-sm font-bold text-white/90">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex h-11 w-full justify-start text-left font-medium rounded-xl border border-rippl-black-3 bg-rippl-black-2/50 hover:bg-rippl-black-3 hover:text-white transition-all px-4",
                          !endDate ? "text-rippl-gray/50" : "text-white"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-rippl-black-2 border border-rippl-black-3 shadow-2xl rounded-xl text-white" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Reward Rate */}
              <div className="space-y-1.5">
                <Label htmlFor="rewardRate" className="text-sm font-bold text-white/90">
                  Reward Rate per 1,000 views (₹)
                </Label>
                <Input
                  id="rewardRate"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="1,000"
                  value={rewardRate === 0 ? "" : rewardRate}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) {
                      setRewardRate(0)
                    } else {
                      const parsed = Math.floor(Number(val))
                      setRewardRate(Number.isNaN(parsed) ? 0 : parsed)
                    }
                    if (errors.rate_per_1k) setErrors((prev) => ({ ...prev, rate_per_1k: undefined }))
                  }}
                  className={cn("h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.rate_per_1k && "border-red-400 focus:border-red-400 focus:ring-red-400")}
                />
                {errors.rate_per_1k && <p className="text-red-500 text-xs">{errors.rate_per_1k}</p>}
              </div>

              {/* Min & Max Payout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="minPayout" className="text-sm font-bold text-white/90">Min Payout (₹)</Label>
                  <Input
                    id="minPayout"
                    type="number"
                    min={0}
                    placeholder="50"
                    value={!Number.isFinite(minPayout) || minPayout === 0 ? "" : minPayout}
                    onChange={(e) => {
                      setMinPayout(Number(e.target.value))
                      if (errors.min_payout) setErrors((prev) => ({ ...prev, min_payout: undefined }))
                    }}
                    className={cn("h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.min_payout && "border-red-400 focus:border-red-400 focus:ring-red-400")}
                  />
                  {errors.min_payout && <p className="text-red-500 text-xs">{errors.min_payout}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxPayout" className="text-sm font-bold text-white/90">Max Payout (₹)</Label>
                  <Input
                    id="maxPayout"
                    type="number"
                    min={0}
                    placeholder="10,000"
                    value={!Number.isFinite(maxPayout) || maxPayout === 0 ? "" : maxPayout}
                    onChange={(e) => {
                      setMaxPayout(Number(e.target.value))
                      if (errors.max_payout) setErrors((prev) => ({ ...prev, max_payout: undefined }))
                    }}
                    className={cn("h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet", errors.max_payout && "border-red-400 focus:border-red-400 focus:ring-red-400")}
                  />
                  {errors.max_payout && <p className="text-red-500 text-xs">{errors.max_payout}</p>}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-white/90">Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Video must be longer than 15 seconds"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const v = requirementInput.trim()
                        if (v) {
                          setRequirementsList((prev) => [...prev, v])
                          setRequirementInput("")
                        }
                      }
                    }}
                    className="h-11 flex-1 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0 h-11 w-11 border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3 rounded-xl transition-colors"

                    onClick={() => {
                      const v = requirementInput.trim()
                      if (v) {
                        setRequirementsList((prev) => [...prev, v])
                        setRequirementInput("")
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {requirementsList.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {requirementsList.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 py-2 px-3 bg-rippl-black-2 border border-rippl-black-3 rounded-xl text-sm text-white"
                      >
                        <span className="truncate">{req}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="shrink-0 h-8 w-8 text-rippl-gray hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                          onClick={() => setRequirementsList((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Asset Links */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-white/90">
                  Asset Links <span className="text-rippl-violet">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={assetLinkInput}
                    onChange={(e) => setAssetLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const v = assetLinkInput.trim()
                        if (v) {
                          setAssetsList((prev) => [...prev, { name: "Link", link: v }])
                          setAssetLinkInput("")
                        }
                      }
                    }}
                    className="h-11 flex-1 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0 h-11 w-11 border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3 rounded-xl transition-colors"

                    onClick={() => {
                      const v = assetLinkInput.trim()
                      if (v) {
                        setAssetsList((prev) => [...prev, { name: "Link", link: v }])
                        setAssetLinkInput("")
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {assetsList.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {assetsList.map((asset, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 py-2 px-3 bg-rippl-black-2 border border-rippl-black-3 rounded-xl text-sm"
                      >
                        <a
                          href={asset.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rippl-violet hover:text-white hover:underline truncate flex-1 min-w-0 transition-colors"
                        >
                          {asset.link}
                        </a>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="shrink-0 h-8 w-8 text-rippl-gray hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                          onClick={() => setAssetsList((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.assets && <p className="text-red-500 text-xs">{errors.assets}</p>}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-rippl-black-3 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl font-bold transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {editingCampaign ? (
            <>
              <Button
                type="submit"
                form="create-campaign-form"
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 h-11 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl font-bold transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-transparent rounded-full animate-spin inline-block" />
                    Saving...
                  </>
                ) : "Save changes"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e as unknown as React.FormEvent, true)
                }}
                className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Publishing...
                  </>
                ) : "Publish"}
              </Button>
            </>
          ) : (
            <Button
              type="submit"
              form="create-campaign-form"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all w-full"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Creating...
                </>
              ) : "Create Campaign"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
