'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserButton } from '@clerk/nextjs'
import { TrendingUp } from 'lucide-react'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  const handleRecordingComplete = async (audioBlob: Blob) => {
    console.log('Recording complete:', audioBlob)
    toast.success('Processing your expense...')
    
    // TODO: Send to API endpoint (Phase 3)
    // For now, just log the blob
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
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

          {/* Voice Recorder */}
          <div className="glass rounded-2xl p-12">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>

          {/* Expense List Placeholder */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Recent Expenses</h2>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-zinc-400">
                No expenses yet. Start recording to add your first expense!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
