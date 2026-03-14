import { useEffect } from 'react'
import { Engine } from '@engine/engine'

export function useEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const engine = new Engine(canvasRef.current!)

    engine.start()

    return () => {
      engine.stop()
    }
  }, [])
}
