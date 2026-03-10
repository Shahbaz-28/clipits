"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

export default function AdminProfilePage() {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return null
  }

  const email = user.email ?? ""
  const username = profile.username ?? (email ? email.split("@")[0] : "")
  const role = profile.role ?? "admin"

  const displayName =
    profile.first_name ||
    user.user_metadata?.first_name ||
    username ||
    email?.split("@")[0] ||
    "Admin"

  const initials = (displayName || "A")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold text-heading-text mb-2">Admin Profile</h1>
        <p className="text-muted-label">
          Basic information for this admin account. These details are read-only and come from your login/profile.
        </p>
      </div>

      <Card className="border border-border shadow-sm rounded-xl">
        <CardHeader className="px-6 pt-6 pb-3 flex flex-row items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={displayName}
            />
            <AvatarFallback className="bg-vibrant-red-orange text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold text-heading-text">Account Details</CardTitle>
            <p className="text-xs text-muted-label mt-1">
              {displayName} &middot; {role}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} disabled readOnly />
          </div>

          <div className="space-y-1">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} disabled readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

