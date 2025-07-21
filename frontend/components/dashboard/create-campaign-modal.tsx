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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Upload,
  CreditCard,
  DollarSign,
  Target,
  Tag,
  TrendingUp,
  Wallet,
  Star,
  Instagram,
  Youtube,
  TwitterIcon as TikTok,
  Plus,
  Grid3X3,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [budget, setBudget] = useState<number>(0) // State for budget
  const [rewardRate, setRewardRate] = useState<number>(0)
  const [minPayout, setMinPayout] = useState<number>(0)
  const [maxPayout, setMaxPayout] = useState<number>(0)
  const [flatBonus, setFlatBonus] = useState<number>(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Campaign created!")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-[95%] bg-main-bg text-body-text border-border p-6 sm:p-8 flex flex-col max-h-[90vh] rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-heading-text text-2xl font-bold flex items-center gap-2">
            <Plus className="w-6 h-6 text-vibrant-red-orange" />
            Create New Campaign
          </DialogTitle>
          <DialogDescription className="text-muted-label text-base">
            Set up your campaign to start engaging with creators
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4 overflow-y-auto pr-2"
        >
          {/* Left Column */}
          <div className="space-y-6">
            {/* Campaign Title */}
            <div>
              <Label htmlFor="title" className="text-body-text flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-label" />
                Campaign Title
              </Label>
              <Input
                id="title"
                placeholder="Enter an engaging campaign title"
                className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
              />
            </div>
            {/* Campaign Type */}
            <div>
              <Label htmlFor="type" className="text-body-text flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-muted-label" />
                Campaign Type
              </Label>
              <Select>
                <SelectTrigger className="w-full bg-section-bg border-border text-body-text rounded-md">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent className="bg-main-bg border-border text-body-text rounded-md">
                  <SelectItem value="ugc">UGC</SelectItem>
                  <SelectItem value="clipping">Clipping</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-body-text flex items-center gap-2 mb-2">
                <Grid3X3 className="w-4 h-4 text-muted-label" />
                Category
              </Label>
              <Select>
                <SelectTrigger className="w-full bg-section-bg border-border text-body-text rounded-md">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-main-bg border-border text-body-text rounded-md">
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Target Platforms */}
            <div>
              <Label htmlFor="platforms" className="text-body-text flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-label" />
                Target Platforms
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "instagram", icon: Instagram, label: "Instagram" },
                ].map((platform) => (
                  <Button
                    key={platform.id}
                    type="button"
                    variant="outline"
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 h-auto border-border text-body-text hover:bg-section-bg rounded-lg shadow-sm",
                      selectedPlatforms.includes(platform.id) &&
                        "bg-vibrant-red-orange/10 text-vibrant-red-orange border-vibrant-red-orange shadow-md shadow-vibrant-red-orange/10",
                    )}
                  >
                    <platform.icon className="w-6 h-6 mb-2" />
                    <span className="text-sm">{platform.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            {/* Campaign Thumbnail */}
            <div>
              <Label htmlFor="thumbnail" className="text-body-text flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-muted-label" />
                Campaign Thumbnail
              </Label>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-section-bg text-center cursor-pointer hover:border-vibrant-red-orange transition-colors min-h-[150px] shadow-sm">
                <Upload className="w-8 h-8 text-muted-label mb-2" />
                <p className="text-body-text mb-1 text-sm">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-label">PNG, JPG up to 10MB</p>
                <Input id="thumbnail" type="file" className="sr-only" accept=".png,.jpg,.jpeg" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Total Budget */}
            <div>
              <Label htmlFor="totalBudget" className="text-body-text flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-muted-label" />
                Total Budget (₹)
              </Label>
              <Input
                id="totalBudget"
                type="number"
                placeholder="50000"
                value={budget === 0 ? "" : budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
              />
            </div>
            {/* Reward Rate per 1,000 views */}
            <div>
              <Label htmlFor="rewardRate" className="text-body-text flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-label" />
                Reward Rate per 1,000 views (₹)
              </Label>
              <Input
                id="rewardRate"
                type="number"
                placeholder="3.0"
                step="0.1"
                value={rewardRate === 0 ? "" : rewardRate}
                onChange={(e) => setRewardRate(Number(e.target.value))}
                className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
              />
            </div>
            {/* Min Payout & Max Payout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPayout" className="text-body-text flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-label" />
                  Min Payout (₹)
                </Label>
                <Input
                  id="minPayout"
                  type="number"
                  placeholder="50"
                  value={minPayout === 0 ? "" : minPayout}
                  onChange={(e) => setMinPayout(Number(e.target.value))}
                  className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="maxPayout" className="text-body-text flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-label" />
                  Max Payout (₹)
                </Label>
                <Input
                  id="maxPayout"
                  type="number"
                  placeholder="500"
                  value={maxPayout === 0 ? "" : maxPayout}
                  onChange={(e) => setMaxPayout(Number(e.target.value))}
                  className="w-full bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
                />
              </div>
            </div>
   
            {/* Start Date & End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-body-text flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-muted-label" />
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-section-bg border-border text-body-text rounded-md",
                        !startDate && "text-muted-label",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-main-bg border-border shadow-lg rounded-lg">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="endDate" className="text-body-text flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-muted-label" />
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-section-bg border-border text-body-text rounded-md",
                        !endDate && "text-muted-label",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-main-bg border-border shadow-lg rounded-lg">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Auto-approve checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="autoApprove"
                className="border-border data-[state=checked]:bg-turquoise-accent data-[state=checked]:text-white rounded-sm"
              />
              <Label htmlFor="autoApprove" className="text-body-text">
                Auto-approve submissions after 48 hours
              </Label>
            </div>
          </div>

          {/* Payment Summary - Full width below two columns */}
          <div className="col-span-full mt-6">
            <h3 className="text-lg font-bold text-heading-text mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-label" />
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-main-bg border-border shadow-md rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-label mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-heading-text">₹{budget.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-main-bg border-border shadow-md rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-label mb-1">Reward Rate</p>
                  <p className="text-xl font-bold text-heading-text">₹{rewardRate.toFixed(1)}/1K</p>
                </CardContent>
              </Card>
              <Card className="bg-main-bg border-border shadow-md rounded-lg">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-label mb-1">Est. Reach</p>
                  <p className="text-xl font-bold text-heading-text">50K+</p>
                </CardContent>
              </Card>
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
            className="w-full sm:w-auto bg-gradient-to-r from-vibrant-red-orange to-[#FF4B4B] text-white hover:from-[#FF4B4B] hover:to-vibrant-red-orange shadow-lg shadow-vibrant-red-orange/30 transition-all duration-200 rounded-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with Razorpay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
