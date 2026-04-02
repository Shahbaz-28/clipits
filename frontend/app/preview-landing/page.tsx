"use client"

import { LandingHero } from "@/components/landing-hero"

export default function PreviewLandingPage() {
  return (
    <div suppressHydrationWarning>
      <LandingHero />
    </div>
  )
}
