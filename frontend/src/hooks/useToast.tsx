import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type ToastMessage = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  messages: ToastMessage[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const timers = useRef<Record<string, number>>({})

  const removeToast = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id))
    const timer = timers.current[id]
    if (timer) {
      window.clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = makeId()
      setMessages((current) => [...current.slice(-3), { id, message, variant }])
      timers.current[id] = window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id))
        delete timers.current[id]
      }, 4500)
    },
    [],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      Object.values(activeTimers).forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const value = useMemo(
    () => ({ messages, addToast, removeToast }),
    [messages, addToast, removeToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
