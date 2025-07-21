import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react" // Changed from Edit to Pencil
import { Button } from "@/components/ui/button" // Added Button import

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      {" "}
      {/* Adjusted spacing */}
      {/* Name */}
      <div>
        <Label htmlFor="fullName" className="text-body-text mb-2">
          Name
        </Label>
        <Input
          id="fullName"
          defaultValue="Shahbaz khan"
          className="bg-main-bg border-border text-body-text placeholder:text-muted-label" // Changed bg-section-bg to bg-main-bg
        />
      </div>
      {/* Bio */}
      <div>
        <Label htmlFor="bio" className="text-body-text mb-2">
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="No bio" // Changed placeholder
          className="bg-main-bg border-border text-body-text placeholder:text-muted-label min-h-[100px]" // Changed bg-section-bg to bg-main-bg
        />
      </div>
      {/* Username */}
      <div>
        <Label htmlFor="username" className="text-body-text mb-2">
          Username
        </Label>
        <Input
          id="username"
          defaultValue="shahbazkhans"
          className="bg-main-bg border-border text-body-text placeholder:text-muted-label" // Changed bg-section-bg to bg-main-bg
        />
      </div>
      {/* Email Address */}
      <div>
        <Label htmlFor="email" className="text-body-text mb-2">
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            defaultValue="shahbaz.khans976@gmail.com"
            className="bg-main-bg border-border text-body-text pr-10" // Changed bg-section-bg to bg-main-bg
          />
          <Pencil className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-label cursor-pointer" />
        </div>
      </div>
      {/* Phone Number */}
      <div>
        <Label htmlFor="phone" className="text-body-text mb-2">
          Phone number
        </Label>
        <Input
          id="phone"
          defaultValue="+1 (555) 123-4567"
          className="bg-main-bg border-border text-body-text placeholder:text-muted-label" // Changed bg-section-bg to bg-main-bg
        />
      </div>
      {/* Save Button */}
      <div className="pt-4">
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-md">
          Save
        </Button>
      </div>
    </div>
  )
}
