import { useState, useEffect } from 'react'
import { Engine } from '@engine/engine'

export function useEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>): Engine | null {
  const [engine, setEngine] = useState<Engine | null>(null)

  useEffect(() => {
    const eng = new Engine(canvasRef.current!)
    eng.start().then(() => setEngine(eng))
    return () => eng.stop()
  }, [])

  return engine
}
