import { useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useEngine } from './features/engine'
import { AgentChat } from './features/agent'
import './index.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEngine(canvasRef)

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <AgentChat />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
