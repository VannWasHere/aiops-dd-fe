import { create } from 'zustand'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

// Automatically authenticated session for MVP
const DUMMY_USER: AuthUser = {
  accountNo: 'C3OPS-001',
  email: 'ops-admin@cable3.io',
  role: ['admin'],
  exp: 2600000000, // Year 2052
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      user: DUMMY_USER,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: 'cable3-ops-mvp-session-token',
      setAccessToken: (accessToken) =>
        set((state) => ({ ...state, auth: { ...state.auth, accessToken } })),
      resetAccessToken: () =>
        set((state) => ({ ...state, auth: { ...state.auth, accessToken: '' } })),
      reset: () =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, user: DUMMY_USER, accessToken: 'cable3-ops-mvp-session-token' },
        })),
    },
  }
})
