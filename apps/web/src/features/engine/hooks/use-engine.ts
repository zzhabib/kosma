import { useState, useEffect } from 'react'
import { Engine, type DataModel } from '@engine/engine'

export function useEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>): DataModel | null {
  const [dataModel, setDataModel] = useState<DataModel | null>(null)

  useEffect(() => {
    const engine = new Engine(canvasRef.current!)
    engine.start().then(() => setDataModel(engine.dataModel))
    return () => engine.stop()
  }, [])

  return dataModel
}
