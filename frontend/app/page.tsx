"use client"

import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, TrendingUp, Wallet, Users, CheckCircle, ArrowRight, Play, IndianRupee, Eye, Clock } from "lucide-react"
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF4B4B]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#FF4B4B] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4B4B]/30">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-heading-text">Clixyo</h1>
              <p className="text-[10px] md:text-xs text-muted-label hidden sm:block">Creator Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" className="text-heading-text hover:text-[#FF4B4B] hover:bg-gray-50 text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-[#FF4B4B] hover:bg-[#FF4B4B]/90 text-white rounded-lg px-4 md:px-6 py-2 md:py-2 text-sm md:text-base shadow-lg shadow-[#FF4B4B]/25">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 text-center">
        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#FF4B4B]/10 text-[#FF4B4B] text-xs md:text-sm font-medium mb-4">
          <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" />
          India's #1 Creator Rewards Platform
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-heading-text mb-3 md:mb-4 leading-tight px-2">
          Turn Their Content Into
          <span className="text-[#FF4B4B]"> Your Income</span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-muted-label mb-6 md:mb-6 max-w-2xl mx-auto leading-relaxed px-4">
          India's first content rewards platform where clippers get paid for every view they generate.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          <Link href="/sign-up" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#FF4B4B] hover:bg-[#FF4B4B]/90 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-xl shadow-xl shadow-[#FF4B4B]/25 group">
              Start Earning Today
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-200 text-heading-text hover:bg-gray-50 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg rounded-xl">
              View Campaigns
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-heading-text mb-2">How It Works</h2>
          <p className="text-muted-label max-w-xl mx-auto text-xs md:text-sm">Start earning in just 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FF4B4B] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#FF4B4B]/20">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold text-heading-text">1</div>
            <h3 className="text-base md:text-lg font-semibold text-heading-text mb-1">Join Campaigns</h3>
            <p className="text-muted-label text-xs md:text-sm">Browse active campaigns from top brands and join ones that match your style.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold text-heading-text">2</div>
            <h3 className="text-base md:text-lg font-semibold text-heading-text mb-1">Create & Submit</h3>
            <p className="text-muted-label text-xs md:text-sm">Create engaging Reels, submit your content, and share it with your audience.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
              <Wallet className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold text-heading-text">3</div>
            <h3 className="text-base md:text-lg font-semibold text-heading-text mb-1">Get Paid</h3>
            <p className="text-muted-label text-xs md:text-sm">Earn money for every view your content generates. Withdraw anytime.</p>
          </div>
        </div>
      </section>

      {/* Why Clixyo Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full bg-[#FF4B4B]/10 text-[#FF4B4B] text-[10px] md:text-xs font-semibold mb-3 uppercase tracking-wide">
              Platform Benefits
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-heading-text mb-2">Why Creators Use Clixyo</h2>
            <p className="text-muted-label max-w-lg mx-auto text-xs md:text-sm">
              Built around real per‑view payouts, clear tracking, and safe Instagram verification.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <IndianRupee className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-heading-text mb-1.5 md:mb-2">Earn per real view</h3>
              <p className="text-xs md:text-sm text-muted-label leading-relaxed">
                Get paid for approved content based on verified view counts, not guesses.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <Eye className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-heading-text mb-1.5 md:mb-2">Automatic view tracking</h3>
              <p className="text-xs md:text-sm text-muted-label leading-relaxed">
                We regularly fetch Instagram views for approved submissions and update your earnings for you.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-heading-text mb-1.5 md:mb-2">Clear payouts</h3>
              <p className="text-xs md:text-sm text-muted-label leading-relaxed">
                Request payouts to your UPI and track pending vs paid amounts with transparent history.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-heading-text mb-1.5 md:mb-2">
                Campaign performance at a glance
              </h3>
              <p className="text-xs md:text-sm text-muted-label leading-relaxed">
                Creators see spend and views per campaign; clippers see views and earnings per submission.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-heading-text mb-1.5 md:mb-2">
                Built for creators & clippers
              </h3>
              <p className="text-xs md:text-sm text-muted-label leading-relaxed">
                Separate dashboards for running campaigns and joining them, with role‑based access and controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 text-center">
        <div className="bg-gradient-to-br from-[#FF4B4B] to-[#FF6B6B] rounded-2xl p-6 md:p-8 lg:p-10 max-w-4xl mx-auto shadow-2xl shadow-[#FF4B4B]/20">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
            Ready to Start Earning?
          </h2>
          <p className="text-white/80 mb-5 md:mb-6 text-sm md:text-base max-w-xl mx-auto">
            Join thousands of clippers already making money from their content.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-[#FF4B4B] hover:bg-gray-50 px-6 md:px-8 py-4 md:py-5 text-sm md:text-base rounded-xl font-semibold shadow-xl">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#FF4B4B] rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <span className="font-semibold text-heading-text text-sm md:text-base">Clixyo</span>
            </div>
            <p className="text-xs md:text-sm text-muted-label">
              © 2026 Clixyo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
