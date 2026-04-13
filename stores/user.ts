import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
  plan: 'free' | 'creator' | 'studio'
  credits: number
  creditsResetAt: string | null
}

interface UserState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  decrementCredits: (amount: number) => void
  setCredits: (credits: number) => void
  reset: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  decrementCredits: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, credits: Math.max(0, state.user.credits - amount) }
        : null,
    })),
  setCredits: (credits) =>
    set((state) => ({
      user: state.user ? { ...state.user, credits } : null,
    })),
  reset: () => set({ user: null, isLoading: false }),
}))
