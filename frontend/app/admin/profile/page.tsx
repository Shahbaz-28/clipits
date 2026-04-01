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
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Admin Profile</h1>
        <p className="text-base font-medium text-rippl-gray italic">
          Basic information for this admin account. These details are read-only and come from your login/profile.
        </p>
      </div>

      <Card className="bg-rippl-black-2 border border-rippl-black-3 shadow-2xl rounded-[32px] overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center gap-6">
          <Avatar className="w-16 h-16 border-2 border-rippl-black-3 shadow-xl">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={displayName}
            />
            <AvatarFallback className="bg-rippl-violet text-white font-black text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl font-black text-white tracking-tight">Account Details</CardTitle>
            <p className="text-xs font-bold text-rippl-violet uppercase tracking-widest mt-1 bg-rippl-violet/10 px-3 py-1 rounded-full border border-rippl-violet/20 inline-block">
              {role}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-rippl-gray ml-1">Email Address</Label>
            <Input id="email" value={email} disabled readOnly className="h-12 bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl font-medium cursor-not-allowed opacity-80" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-bold text-rippl-gray ml-1">Username</Label>
            <Input id="username" value={username} disabled readOnly className="h-12 bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl font-medium cursor-not-allowed opacity-80" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-bold text-rippl-gray ml-1">Account Role</Label>
            <Input id="role" value={role} disabled readOnly className="h-12 bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl font-medium cursor-not-allowed opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

