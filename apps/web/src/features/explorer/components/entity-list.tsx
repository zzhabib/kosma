import { TextMuted } from '@/components'
import type { EntityInfo } from '../hooks/use-entities'

export function EntityList({ entities }: { entities: EntityInfo[] }) {
  if (entities.length === 0) {
    return <TextMuted>No entities</TextMuted>
  }

  return (
    <div className="space-y-3">
      {entities.map((entity) => (
        <div key={entity.id}>
          <p className="text-sm text-white/70 mb-1">Entity #{entity.id}</p>
          <div className="flex flex-wrap gap-1">
            {entity.components.map((name) => (
              <span
                key={name}
                className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-white/50 border border-white/10"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
