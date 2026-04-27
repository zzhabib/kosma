import { useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useEngine } from './features/engine'
import { AgentFeature } from './features/agent'
import { MenuFeature } from './features/menu'
import { AppProvider } from './context/app-context'
import './index.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEngine(canvasRef)
  return (
    <AppProvider>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <MenuFeature />
      <AgentFeature />
    </AppProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
