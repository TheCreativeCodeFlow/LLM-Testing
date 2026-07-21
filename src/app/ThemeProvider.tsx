import { useEffect } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useWorkspaceStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      
      // Update color-scheme meta property
      const meta = document.querySelector('meta[name="color-scheme"]')
      if (meta) {
        meta.setAttribute('content', systemTheme)
      }
      return
    }

    root.classList.add(theme)
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
      meta.setAttribute('content', theme)
    }
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      
      const meta = document.querySelector('meta[name="color-scheme"]')
      if (meta) {
        meta.setAttribute('content', systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return <>{children}</>
}
export default ThemeProvider
