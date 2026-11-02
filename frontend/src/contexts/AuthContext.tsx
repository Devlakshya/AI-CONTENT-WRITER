import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authService from '../services/authService'
import { UserCreate, UserDB } from '../types'
import { TOKEN_KEY } from '../utils/constants'

export type AuthContextValue = {
  user: UserDB | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: UserCreate) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => readToken())

  const query = useQuery<UserDB, Error>({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (query.isError) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
      }
      setToken(null)
    }
  }, [query.isError])

  const signInMutation = useMutation({
    mutationFn: (payload: { username: string; password: string }) => authService.login(payload),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, data.access_token)
      }
      setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const signUpMutation = useMutation({
    mutationFn: (payload: UserCreate) => authService.register(payload),
  })

  const signIn = useCallback(
    async (email: string, password: string) => {
      await signInMutation.mutateAsync({ username: email, password })
    },
    [signInMutation],
  )

  const signUp = useCallback(
    async (payload: UserCreate) => {
      await signUpMutation.mutateAsync(payload)
      await signIn(payload.email, payload.password)
    },
    [signIn, signUpMutation],
  )

  const signOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  const user = query.data ?? null
  const value = useMemo(
    () => ({
      user,
      isLoading: Boolean(token) && query.isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, token, query.isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
