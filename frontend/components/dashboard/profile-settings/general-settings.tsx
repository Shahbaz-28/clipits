"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less")
    .transform((s) => s.trim()),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less")
    .transform((s) => s.trim()),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .transform((s) => (s?.trim() || undefined)),
  username: z
    .string()
    .max(30, "Username must be 30 characters or less")
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^[a-zA-Z0-9_]+$/.test(val.trim()),
      "Username can only contain letters, numbers, and underscores"
    )
    .refine(
      (val) => !val || val.length === 0 || val.trim().length >= 3,
      "Username must be at least 3 characters"
    )
    .transform((s) => (s?.trim() || undefined)),
  phone: z
    .string()
    .max(25, "Phone number is too long")
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^[\d\s+.\-()]+$/.test(val),
      "Use only digits and separators (spaces, +, -, parentheses)"
    )
    .refine(
      (val) => {
        if (!val || !val.trim()) return true
        const digits = val.replace(/\D/g, "")
        return digits.length >= 10 && digits.length <= 15
      },
      "Phone must have 10–15 digits (e.g. Indian: 10 digits, with country code: up to 15)"
    )
    .transform((s) => (s?.trim() || undefined)),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function GeneralSettings() {
  const { user, refreshProfile } = useAuth()
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      username: "",
      phone: "",
    },
  })

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, bio, username, phone")
        .eq("id", user.id)
        .single()
      if (!error && data) {
        form.reset({
          firstName: ((data.first_name as string) ?? "") || (user.user_metadata?.first_name ?? ""),
          lastName: ((data.last_name as string) ?? "") || (user.user_metadata?.last_name ?? ""),
          bio: (data.bio as string) ?? "",
          username: (data.username as string) ?? "",
          phone: (data.phone as string) ?? "",
        })
      } else {
        form.reset({
          firstName: user.user_metadata?.first_name ?? "",
          lastName: user.user_metadata?.last_name ?? "",
          bio: "",
          username: "",
          phone: "",
        })
      }
      setInitialLoadDone(true)
    }
    load()
  }, [user?.id, user?.user_metadata?.first_name, user?.user_metadata?.last_name, form])

  if (!initialLoadDone) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return
    const { error } = await supabase
      .from("users")
      .update({
        first_name: values.firstName || null,
        last_name: values.lastName || null,
        bio: values.bio || null,
        username: values.username || null,
        phone: values.phone || null,
      })
      .eq("id", user.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Profile saved successfully!")
    await refreshProfile()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-heading-text">First name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-10 bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-vibrant-red-orange"
                    placeholder="First name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-heading-text">Last name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-10 bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-vibrant-red-orange"
                    placeholder="Last name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-heading-text">Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Tell us a bit about yourself"
                  className="bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label min-h-[80px] rounded-lg focus:border-vibrant-red-orange focus:ring-vibrant-red-orange"
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-label text-right">
                {((field.value ?? "").length || 0)}/500
              </p>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-heading-text">Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="h-10 bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-vibrant-red-orange"
                    placeholder="username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-heading-text">Phone number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="h-10 bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-vibrant-red-orange"
                    placeholder="e.g. +91 98765 43210"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-sm font-medium text-heading-text">Email</FormLabel>
          <Input
            value={user?.email ?? ""}
            readOnly
            className="h-10 mt-1.5 bg-gray-100 border border-gray-200 text-muted-label cursor-not-allowed rounded-lg"
          />
          <p className="text-xs text-muted-label mt-1">
            Email is managed by your account sign-in.
          </p>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-10 px-6 bg-vibrant-red-orange hover:bg-vibrant-red-orange/90 text-white font-semibold rounded-lg shadow-lg shadow-vibrant-red-orange/25"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
