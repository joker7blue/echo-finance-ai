'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserButton } from '@clerk/nextjs'
import { TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-violet-500" />
            <span className="text-xl font-bold">Echo Finance</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              {user?.email}
            </div>
            <UserButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name || 'there'}!
            </h1>
            <p className="text-zinc-400 mt-2">
              Ready to track your expenses with voice?
            </p>
          </div>

          {/* Placeholder for voice recorder and expense list */}
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              Voice recorder and expense dashboard coming in Phase 2 & 5
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
