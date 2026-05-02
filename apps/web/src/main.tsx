import { useRef, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useEngine } from './features/engine'
import { AgentFeature } from './features/agent'
import { SidePanelFeature } from './features/sidepanel'
import { AppProvider } from './context/app-context'
import { Toolbox } from './features/agent/toolbox'
import './index.css'

// App is the composition root — wires features together, owns no logic of its own.
function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useEngine(canvasRef)
  const toolbox = useMemo(() => engine ? new Toolbox(engine) : null, [engine])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <SidePanelFeature engine={engine} />
      <AgentFeature toolbox={toolbox} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
)
