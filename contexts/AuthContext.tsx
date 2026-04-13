'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserStore, type User } from '@/stores/user'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
  const { user, isLoading, setUser, setLoading } = useUserStore()

  useEffect(() => {
    if (!isClerkLoaded) return

    if (!clerkUser) {
      setUser(null)
      return
    }

    // If we already have the user in store, skip fetching
    if (user && user.id === clerkUser.id) return

    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/user')

        if (res.ok) {
          const data = await res.json()
          setUser({
            id: data.id,
            email: data.email,
            name: data.full_name,
            imageUrl: data.avatar_url,
            plan: data.plan ?? 'free',
            credits: data.credits_balance ?? 0,
            creditsResetAt: data.credits_reset_at ?? null,
          })
        } else {
          // User not yet in Supabase (webhook may be delayed), use Clerk data as fallback
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.fullName,
            imageUrl: clerkUser.imageUrl,
            plan: 'free',
            credits: 0,
            creditsResetAt: null,
          })
        }
      } catch {
        setUser(null)
      }
    }

    fetchUser()
  }, [clerkUser, isClerkLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
