import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Engine } from './engine/engine'

function useEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const engine = new Engine(canvasRef.current!)

    engine.start()

    return () => {
      engine.stop()
    }
  }, [])
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEngine(canvasRef)

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
