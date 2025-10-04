"use client"

import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Users, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export default function HomePage() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && session) {
      redirect("/dashboard")
    }
  }, [session, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-red-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-red-orange/5 to-turquoise-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-main-bg/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-vibrant-red-orange rounded-lg flex items-center justify-center shadow-md shadow-vibrant-red-orange/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-heading-text">ClipIt</h1>
              <p className="text-sm text-muted-label">Creator Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-body-text hover:text-vibrant-red-orange">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-vibrant-red-orange hover:bg-vibrant-red-orange/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-heading-text mb-6">
          Earn Money Creating
          <span className="text-vibrant-red-orange"> Content</span>
        </h1>
        <p className="text-xl text-muted-label mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are earning rewards for their content. 
          Connect with brands, create engaging content, and get paid for your creativity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-vibrant-red-orange hover:bg-vibrant-red-orange/90 text-white px-8 py-3 text-lg">
              Start Earning Today
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="border-border text-body-text hover:bg-section-bg px-8 py-3 text-lg">
              View Campaigns
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-vibrant-red-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-vibrant-red-orange" />
            </div>
            <h3 className="text-xl font-semibold text-heading-text mb-2">Join Campaigns</h3>
            <p className="text-muted-label">Browse and join exciting content creation campaigns from top brands.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-turquoise-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-turquoise-accent" />
            </div>
            <h3 className="text-xl font-semibold text-heading-text mb-2">Create Content</h3>
            <p className="text-muted-label">Submit your best content and watch your earnings grow with every view.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-vibrant-red-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-vibrant-red-orange" />
            </div>
            <h3 className="text-xl font-semibold text-heading-text mb-2">Get Paid</h3>
            <p className="text-muted-label">Earn up to $3.00 per 1K views with our competitive payment rates.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-main-bg border border-border rounded-2xl p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-heading-text mb-4">
            Ready to Start Your Creator Journey?
          </h2>
          <p className="text-muted-label mb-8 text-lg">
            Join thousands of creators who are already earning with ClipIt
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-vibrant-red-orange hover:bg-vibrant-red-orange/90 text-white px-8 py-3 text-lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
