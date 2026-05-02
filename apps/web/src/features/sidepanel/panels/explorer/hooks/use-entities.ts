import { useState, useEffect } from 'react'
import { query, hasComponent } from 'bitecs'
import { registry, ThreeDesc } from '@engine/components'
import type { Engine } from '@engine/engine'

export interface EntityInfo {
  id: number
  components: string[]
  threeType?: string
}

export function useEntities(engine: Engine | null): EntityInfo[] {
  const [snapshot, setSnapshot] = useState<EntityInfo[]>([])

  useEffect(() => {
    if (!engine) return

    const id = setInterval(() => {
      const { world } = engine.dataModel
      const seen = new Set<number>()
      const entries = [...registry.entries()]

      for (const [, comp] of entries) {
        for (const eid of query(world, [comp as any])) seen.add(eid)
      }

      const next: EntityInfo[] = [...seen].sort((a, b) => a - b).map(eid => ({
        id: eid,
        components: entries
          .filter(([, comp]) => hasComponent(world, eid, comp as any))
          .map(([name]) => name),
        threeType: hasComponent(world, eid, ThreeDesc as any) ? (ThreeDesc[eid] as any)?.type : undefined,
      }))

      setSnapshot(prev =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      )
    }, 100)

    return () => clearInterval(id)
  }, [engine])

  return snapshot
}
