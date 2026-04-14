'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserButton } from '@clerk/nextjs'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { toast } from '@/components/ui/sonner'
import { AILoadingIcon } from '@/components/icons/AILoadingIcon'
import Link from 'next/link'
import { ExpenseTable } from '@/components/shared/ExpenseTable'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ExpenseSummary } from '@/components/shared/ExpenseSummary'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      toast.info('Processing your expense...')

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let message = 'Failed to process recording'
        try {
          const error = await response.json()
          message = error.error || message
        } catch {
          // Server returned non-JSON (HTML error page) — use default message
        }
        throw new Error(message)
      }

      const { expenseId } = await response.json()
      toast.success('Expense submitted! Processing with AI...')
      console.log('Expense created:', expenseId)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('Error submitting recording:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit recording'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AILoadingIcon className="w-24 h-24 animate-ping" />
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <TrendingUp className="w-6 h-6 text-emerald-500" /> */}
            <AILoadingIcon className="w-6 h-6 animate-pulse text-emerald-500" />
            <span className="text-xl font-bold">Echo Finance AI</span>
          </Link>

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

          {/* Analytics Summary */}
          {user?.id && (
            <ErrorBoundary>
              <ExpenseSummary userId={user.id} />
            </ErrorBoundary>
          )}

          {/* Expense Table */}
          {user?.id && (
            <ErrorBoundary>
              <ExpenseTable userId={user.id} refreshKey={refreshKey} />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  )
}
