'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Mic, TrendingUp, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layouts/home/navbar'
import { Footer } from '@/components/layouts/home/footer'

export default function HomePage() {
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Voice Expense Tracking</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="gradient-text">Talk</span> Your Way to
            <br />
            Better Finances
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Just speak your expenses naturally. Our AI transcribes, categorizes, and tracks everything automatically. No more manual entry.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            {isSignedIn ? (
              <Button
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="gradient-button text-lg px-8 py-6"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="gradient-button text-lg px-8 py-6"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Mic className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold">Voice-First</h3>
            <p className="text-zinc-400">
              Record expenses naturally by speaking. Our AI understands context and extracts all details automatically.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold">Smart Categorization</h3>
            <p className="text-zinc-400">
              AI automatically categorizes expenses, identifies merchants, and structures data for easy tracking.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Updates</h3>
            <p className="text-zinc-400">
              Watch your expenses appear instantly as they&apos;re processed. No refresh needed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}

