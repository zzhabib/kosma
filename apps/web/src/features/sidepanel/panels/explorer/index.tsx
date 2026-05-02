import { useEffect, useRef } from 'react'
import { type PanelConfig } from '@/components'
import { useEntities } from './hooks/use-entities'
import { EntityList } from './components/entity-list'
import type { Engine } from '@engine/engine'

interface UseExplorerPanelProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
  engine: Engine | null
}

export function useExplorerPanel({ open, onOpen, onClose, engine }: UseExplorerPanelProps): PanelConfig {
  const entities = useEntities(engine)
  const openRef = useRef(open)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)

  useEffect(() => { openRef.current = open }, [open])
  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape' && openRef.current) onCloseRef.current()
      if (e.key === 'e' && !isTyping) {
        e.preventDefault()
        openRef.current ? onCloseRef.current() : onOpenRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    title: 'Explorer',
    sections: [{ id: 'entities', content: <EntityList entities={entities} /> }],
  }
}
