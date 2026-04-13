"use client"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap, ArrowRight, Sparkles, Megaphone, Video } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import Image from "next/image"
import { joinWaitlist, WAITLIST_HONEYPOT_FIELD } from "@/lib/waitlist-api"

function fireConfetti() {
  const duration = 3 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) {
      return clearInterval(interval)
    }
    const particleCount = 50 * (timeLeft / duration)
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 250)
}

const selectClass =
  "flex h-11 w-full rounded-xl border border-rippl-black-3 bg-rippl-black-2/50 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rippl-violet focus-visible:border-rippl-violet"

export default function WaitlistPage() {
  const waitlistFormId = useId()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"clipper" | "creator">("clipper")
  const [creatorMonthlySpend, setCreatorMonthlySpend] = useState("")
  const [creatorContentType, setCreatorContentType] = useState("")
  const [clipperClippedBefore, setClipperClippedBefore] = useState<"" | "yes" | "no">("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    const survey =
      role === "creator"
        ? {
            creatorMonthlySpend: creatorMonthlySpend.trim(),
            creatorContentType: creatorContentType.trim(),
          }
        : { clipperClippedBefore: clipperClippedBefore as "yes" | "no" }
    const result = await joinWaitlist(email, role, honeypot, survey)
    setLoading(false)
    if (!result.ok) {
      setError(
        result.duplicate
          ? result.error || "This email is already on the waitlist."
          : result.error,
      )
      return
    }
    setSubmitted(true)
    fireConfetti()
  }

  return (
    <div className="min-h-screen bg-rippl-black text-white selection:bg-rippl-violet selection:text-white overflow-hidden relative font-roboto">
      {/* Dynamic Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-rippl-violet/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Header / Logo */}
      <nav className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 flex justify-center relative z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-rippl-violet rounded-xl flex items-center justify-center shadow-lg shadow-rippl-violet/30 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Rippl<span className="text-rippl-violet">.</span></span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 pt-4 sm:pt-12 pb-24 relative z-10 text-center">
        {!submitted ? (
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rippl-violet/10 border border-rippl-violet/20 text-rippl-violet-soft text-sm font-bold mb-8 animate-bounce-slow">
              <Sparkles className="w-4 h-4" />
              <span>Early Access Waitlist</span>
            </div>

            {/* Hero Heading */}
            <div className="max-w-4xl mx-auto px-1 sm:px-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
                The Future of <span className="text-rippl-violet-soft">Content Rewards</span> is Almost Here.
              </h1>
            </div>

            <p className="text-rippl-gray text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed px-1 sm:px-4">
              Clip, Post, and Earn. Secure early access to monetize your viral content with India&apos;s biggest brands—no minimum followers required.
            </p>

            {/* Waitlist Form Section */}
            <div className="w-full max-w-md mx-auto relative z-20">
              {/* Premium Role Selector */}
              <div className="flex sm:inline-flex p-1 bg-rippl-black-2 border border-rippl-black-3 rounded-2xl mb-8 shadow-2xl relative z-30 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setRole("clipper"); }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${role === "clipper" ? 'bg-rippl-violet text-white shadow-xl shadow-rippl-violet/20' : 'text-rippl-gray hover:text-white hover:bg-white/5'}`}
                >
                  <Video className={`w-4 h-4 ${role === "clipper" ? 'text-white' : 'text-rippl-violet'}`} />
                  Clipper
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setRole("creator"); }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${role === "creator" ? 'bg-rippl-violet text-white shadow-xl shadow-rippl-violet/20' : 'text-rippl-gray hover:text-white hover:bg-white/5'}`}
                >
                  <Megaphone className={`w-4 h-4 ${role === "creator" ? 'text-white' : 'text-rippl-violet'}`} />
                  Creator
                </button>
              </div>

              <div className="w-full space-y-4 mb-6 text-left">
                {role === "creator" ? (
                  <>
                    <div>
                      <label htmlFor="wp-creator-spend" className="block text-sm font-medium text-rippl-gray mb-2">
                        How much would you be willing to spend monthly on clipping campaigns?
                      </label>
                      <Input
                        id="wp-creator-spend"
                        form={waitlistFormId}
                        value={creatorMonthlySpend}
                        onChange={(e) => setCreatorMonthlySpend(e.target.value)}
                        required
                        className="bg-rippl-black-2/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="wp-creator-type" className="block text-sm font-medium text-rippl-gray mb-2">
                        What type of content do you create?
                      </label>
                      <Input
                        id="wp-creator-type"
                        form={waitlistFormId}
                        value={creatorContentType}
                        onChange={(e) => setCreatorContentType(e.target.value)}
                        required
                        className="bg-rippl-black-2/50"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="wp-clipper-before" className="block text-sm font-medium text-rippl-gray mb-2">
                      Have you clipped content before?
                    </label>
                    <select
                      id="wp-clipper-before"
                      form={waitlistFormId}
                      value={clipperClippedBefore}
                      onChange={(e) => setClipperClippedBefore(e.target.value as "" | "yes" | "no")}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Form Input Group */}
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-rippl-violet to-rippl-violet-dim rounded-[30px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <form
                  id={waitlistFormId}
                  onSubmit={handleSubmit}
                  className="relative flex flex-col sm:flex-row gap-2 p-2 bg-rippl-black-2 border border-rippl-black-3 rounded-[30px] shadow-2xl backdrop-blur-xl"
                >
                  <label className="sr-only" htmlFor={WAITLIST_HONEYPOT_FIELD}>
                    Leave blank
                  </label>
                  <input
                    id={WAITLIST_HONEYPOT_FIELD}
                    name={WAITLIST_HONEYPOT_FIELD}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
                    aria-hidden="true"
                  />
                  <Input
                    type="email"
                    placeholder="name@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 px-6 text-lg rounded-full text-center sm:text-left"
                  />
                  <Button
                    disabled={loading}
                    size="lg"
                    className="bg-rippl-violet hover:bg-rippl-violet/90 text-white font-bold h-14 px-10 rounded-2xl shadow-lg shadow-rippl-violet/20 group transition-all shrink-0 w-full sm:w-auto"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center">
                        Join Waitlist
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </div>
              {error && !submitted && (
                <p className="mt-4 text-center text-sm text-red-400 px-2">{error}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-24 text-center animate-in fade-in zoom-in duration-700 relative z-10">
            {/* Elegant Success Icon */}
            <div className="relative w-32 h-32 mx-auto mb-10">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Image
                src="/success.png"
                alt="Success"
                width={128}
                height={128}
                className="relative z-10 w-full h-full object-contain"
              />
            </div>

            <h2 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight px-2 sm:px-4">
              You&apos;re on the Waitlist<span className="text-emerald-400">!</span>
            </h2>

            <p className="text-base md:text-xl text-rippl-gray mb-12 max-w-lg mx-auto leading-relaxed px-3 sm:px-6">
              We&apos;ve reserved your priority spot. Watch your inbox—exclusive perks are heading your way soon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-3 sm:px-6">
              <Button
                className="bg-rippl-violet text-white h-14 px-8 sm:px-12 rounded-[20px] font-black shadow-xl shadow-rippl-violet/25 hover:shadow-rippl-violet/40 transition-all hover:scale-105 uppercase tracking-widest text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Rippl Waitlist',
                      text: 'I just joined the waitlist for Rippl! The future of content rewards is here. Join me!',
                      url: window.location.origin,
                    }).catch(console.error);
                  } else {
                    // Fallback to clipboard
                    navigator.clipboard.writeText(`Join the Rippl waitlist! ${window.location.origin}`);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                Share Rippl with Friends 🚀
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto w-full px-3 sm:px-6 py-12 text-center border-t border-rippl-black-3 opacity-50 text-sm sm:text-base font-bold tracking-wide sm:tracking-widest text-rippl-gray uppercase">
        © 2026 Rippl. Designed for the Next Generation of Creators.
      </footer>
    </div>
  )
}
