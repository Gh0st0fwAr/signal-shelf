import { useState, StrictMode, createContext } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

type Density = 'comfortable' | 'compact'
type Accent = 'warm' | 'cool'

type UiPrefsValue = {
  density: Density,
  accent: Accent,
  setDensity: (density: Density) => void,
  setAccent: (accent: Accent) => void,
}

export const UiPrefsContext = createContext<UiPrefsValue | null>(null);

function UiPrefsProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = useState<Density>('comfortable');
  const [accent, setAccent] = useState<Accent>('warm');

  const value: UiPrefsValue = {
    density,
    accent,
    setDensity,
    setAccent,
  }

  return (
    <UiPrefsContext.Provider value={value}>
      {children}
    </UiPrefsContext.Provider>
  )
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {},
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UiPrefsProvider>
        <App />
      </UiPrefsProvider>
    </QueryClientProvider>
  </StrictMode>
)
