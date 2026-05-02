import { Box, Lightbulb, Camera, Layers, Circle } from 'lucide-react'
import { TextMuted } from '@/components'
import type { EntityInfo } from '../hooks/use-entities'

function formatThreeType(raw: string): string {
  return raw.replace(/([A-Z])/g, ' $1').trim()
}

function entityMeta(entity: EntityInfo): { label: string; icon: React.ReactNode } {
  if (entity.threeType) {
    const label = formatThreeType(entity.threeType)
    if (entity.threeType.includes('Light')) return { label, icon: <Lightbulb size={12} /> }
    if (entity.threeType === 'Mesh')        return { label, icon: <Box size={12} /> }
    if (entity.threeType === 'Camera')      return { label, icon: <Camera size={12} /> }
    return { label, icon: <Layers size={12} /> }
  }
  if (entity.components.includes('OrbitCamera')) return { label: 'Camera', icon: <Camera size={12} /> }
  return { label: 'Entity', icon: <Circle size={12} /> }
}

export function EntityList({ entities }: { entities: EntityInfo[] }) {
  if (entities.length === 0) {
    return <TextMuted>No entities</TextMuted>
  }

  return (
    <div className="space-y-1.5">
      {entities.map((entity) => {
        const { label, icon } = entityMeta(entity)
        return (
          <div
            key={entity.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/4 border border-white/8 hover:bg-white/7 hover:border-white/12 transition-colors cursor-pointer"
          >
            <span className="text-white/30 shrink-0">{icon}</span>
            <span className="text-sm text-white/70 flex-1">{label}</span>
            <span className="text-xs text-white/25">#{entity.id}</span>
            <span className="text-xs text-white/20 tabular-nums">{entity.components.length}</span>
          </div>
        )
      })}
    </div>
  )
}
