import { useRef, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useEngine } from './features/engine'
import { AgentFeature } from './features/agent'
import { MenuFeature } from './features/menu'
import { AppProvider } from './context/app-context'
import { Toolbox } from './features/agent/toolbox'
import './index.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useEngine(canvasRef)
  const toolbox = useMemo(() => engine ? new Toolbox(engine) : null, [engine])

  return (
    <AppProvider>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <MenuFeature />
      <AgentFeature toolbox={toolbox} />
    </AppProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
