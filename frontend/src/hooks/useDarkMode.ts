import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    setDarkMode(storedTheme === 'dark' || (!storedTheme && prefersDark))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem(STORAGE_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  return {
    darkMode,
    toggleDarkMode: () => setDarkMode((current) => !current),
  }
}
