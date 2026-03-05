import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { startEngine } from './engine'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let stop: (() => void) | undefined
    startEngine(canvasRef.current!).then(fn => { stop = fn })
    return () => stop?.()
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 13,
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 14px',
          borderRadius: 8,
          borderLeft: '3px solid #3498db',
        }}
      >
        <div style={{ fontWeight: 'bold', letterSpacing: 2, marginBottom: 6 }}>KOSMA</div>
        <div style={{ opacity: 0.7, marginBottom: 2 }}>WorldSpec → ECS → Three.js</div>
        <div style={{ opacity: 0.4, fontSize: 11 }}>3 entities · bitecs · deterministic</div>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
