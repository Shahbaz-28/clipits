"use client"

import { Button } from "@/components/ui/button"
import { Zap, ArrowRight, IndianRupee, Play, Users, Wallet, Eye, Clock } from "lucide-react"
import Link from "next/link"
import NextImage from "next/image"

export function LandingHero() {
  return (
    <div className="min-h-screen bg-rippl-black">
      {/* Background Glow Effect */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-rippl-violet/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-rippl-black-3 bg-rippl-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10 md:w-11 md:h-11 group-hover:scale-110 transition-transform duration-300">
              <NextImage 
                src="/logo.png" 
                alt="Rippl Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Rippl<span className="text-rippl-violet">.</span></h1>
              <span className="inline-flex items-center rounded-full border border-rippl-violet/30 bg-rippl-violet/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-rippl-violet-soft">
                Beta
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/sign-up">
              <Button className="bg-rippl-violet hover:bg-rippl-violet/90 text-white rounded-full px-4 md:px-6 py-2 md:py-2 text-sm md:text-base shadow-lg shadow-rippl-violet/25">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-10 md:pt-24 md:pb-16 lg:pt-32 lg:pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-rippl-violet/10 border border-rippl-violet/20 text-rippl-violet-soft text-xs md:text-sm font-semibold mb-6">
          <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4 text-rippl-violet" />
          India&apos;s #1 Creator Rewards Platform
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight px-2 tracking-tighter">
          Turn Their Content Into
          <span className="text-rippl-violet"> Your Income</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-rippl-gray mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          India&apos;s first content rewards platform where clippers get paid for every view they generate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Link href="/sign-up" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-rippl-violet hover:bg-rippl-violet/90 text-white px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-full shadow-2xl shadow-rippl-violet/30 group font-bold">
              Start Earning Today
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-rippl-violet-dim text-rippl-violet-soft hover:bg-rippl-black-3 px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-full font-bold">
              View Campaigns
            </Button>
          </Link>
        </div>
      </section>

      {/* Visual Workspace Section */}
      <section className="container mx-auto px-4 pt-10 pb-16 md:pt-14 md:pb-24 relative z-10 border-t border-rippl-black-3">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tighter">
            How Rippl Works<span className="text-rippl-violet">.</span>
          </h2>
          <p className="text-rippl-gray max-w-xl mx-auto text-base md:text-lg">
            The easiest way to get paid for your content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1: Link Account */}
          <div className="flex flex-col group">
            <div className="relative aspect-[4/3] rounded-[32px] bg-gradient-to-br from-rippl-violet/20 to-purple-500/10 border border-rippl-violet/20 flex flex-col items-center justify-center overflow-hidden mb-6 group-hover:border-rippl-violet/40 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-rippl-violet/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-3 w-3/4">
                <div className="bg-rippl-black-2 border border-rippl-black-3 rounded-xl p-2 flex items-center space-x-3 translate-x-4 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center overflow-hidden">
                    <NextImage src="https://img.icons8.com/ios-filled/50/000000/tiktok.png" alt="Tiktok" width={14} height={14} className="opacity-80" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-widest">best_clp_acc</span>
                </div>
                <div className="bg-rippl-violet border border-rippl-violet/50 rounded-xl p-2.5 flex items-center space-x-3 -translate-x-4 shadow-xl scale-110">
                  <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center overflow-hidden">
                    <NextImage src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" alt="IG" width={16} height={16} />
                  </div>
                  <span className="text-[10px] font-black text-white tracking-widest">rippl_creator</span>
                </div>
                <div className="bg-rippl-black-2 border border-rippl-black-3 rounded-xl p-2 flex items-center space-x-3 translate-x-6 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center overflow-hidden">
                    <NextImage src="https://img.icons8.com/ios-filled/50/000000/camera.png" alt="Media" width={14} height={14} className="opacity-80" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-widest">viral_vids_24</span>
                </div>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mb-2 ml-1">Link account</h3>
            <p className="text-sm md:text-base text-rippl-gray font-medium ml-1 leading-relaxed">
              Connect your social profiles to Rippl to verify ownership.
            </p>
          </div>

          {/* Step 2: Submit Content */}
          <div className="flex flex-col group">
            <div className="relative aspect-[4/3] rounded-[32px] bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex flex-col items-center justify-center overflow-hidden mb-6 group-hover:border-emerald-500/40 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-1/2 aspect-[9/16] bg-rippl-black border-2 border-rippl-black-3 rounded-2xl overflow-hidden shadow-2xl scale-110 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-[url('/insta.webp')] bg-cover bg-center opacity-70" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-rippl-black-2/90 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-between px-3">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    <NextImage src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="IG" width={10} height={10} />
                    <span className="text-[6px] text-white/50 truncate">/p/C_rP_H...</span>
                  </div>
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mb-2 ml-1">Submit content</h3>
            <p className="text-sm md:text-base text-rippl-gray font-medium ml-1 leading-relaxed">
              Create and post content, then submit your link to start tracking views.
            </p>
          </div>

          {/* Step 3: Get Paid */}
          <div className="flex flex-col group">
            <div className="relative aspect-[4/3] rounded-[32px] bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex flex-col items-center justify-center overflow-hidden mb-6 group-hover:border-amber-500/40 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-[70%] bg-rippl-black-2 border border-white/10 rounded-2xl p-4 shadow-2xl -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <p className="text-[8px] font-bold text-rippl-gray uppercase tracking-widest mb-1 text-center">My Balance</p>
                <p className="text-xl font-black text-white text-center mb-3">₹1,24,530.00</p>
                <div className="w-full h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/20 mb-4">
                  Withdraw Earnings
                </div>
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center opacity-50">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white">R</div>
                    <span className="text-[8px] text-white font-bold ml-2 flex-1">Campaign #221</span>
                    <span className="text-[8px] text-emerald-400 font-black">+₹4,530</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-5 h-5 rounded-full bg-rippl-violet flex items-center justify-center text-[8px] text-white font-black">R</div>
                    <span className="text-[8px] text-white font-bold ml-2 flex-1">Viral Bonus</span>
                    <span className="text-[8px] text-emerald-400 font-black">+₹15,000</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mb-2 ml-1">Get paid</h3>
            <p className="text-sm md:text-base text-rippl-gray font-medium ml-1 leading-relaxed">
              Earn automatically for every verified view your content generates.
            </p>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-rippl-violet hover:bg-rippl-violet/90 text-white px-10 py-7 text-lg rounded-full font-bold shadow-2xl shadow-rippl-violet/25 group transition-all hover:scale-105 active:scale-95">
              Start earning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-24 text-center relative z-10">
        <div className="p-10 md:p-16 lg:p-20 rounded-[48px] bg-gradient-to-br from-rippl-violet to-rippl-violet-dim relative overflow-hidden text-center shadow-2xl shadow-rippl-violet/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tighter">
              Ready to Start Earning?
            </h2>
            <p className="text-white/80 mb-6 text-lg md:text-xl max-w-xl mx-auto font-medium">
              Join thousands of clippers already making money from their content.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rippl-black-3 bg-rippl-black/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2 grayscale opacity-40">
              <div className="relative w-8 h-8">
                <NextImage 
                  src="/logo.png" 
                  alt="Rippl Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">Rippl<span className="text-rippl-violet">.</span></span>
            </div>
            <p className="text-sm text-rippl-gray font-medium">
              © 2026 Rippl. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
