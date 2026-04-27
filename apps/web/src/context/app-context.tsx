import { createContext, useContext } from 'react'
import { useApiKey } from '@/hooks/use-api-key'

interface AppContextValue {
  apiKey: string | null
  setApiKey: (key: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { apiKey, setApiKey } = useApiKey()
  return <AppContext.Provider value={{ apiKey, setApiKey }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be inside AppProvider')
  return ctx
}
