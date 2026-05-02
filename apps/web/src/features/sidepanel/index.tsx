import { useState, useCallback } from 'react'
import { Menu, Layers } from 'lucide-react'
import { useAppContext } from '@/context/app-context'
import { Dock, DockButton, SidePanel } from '@/components'
import { useMenuPanel } from './panels/menu'
import { useExplorerPanel } from './panels/explorer'
import type { Engine } from '@engine/engine'

type PanelId = 'menu' | 'explorer'

export function SidePanelFeature({ engine }: { engine: Engine | null }) {
  const { apiKey } = useAppContext()
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const openPanel = useCallback((id: PanelId) => setActivePanel(id), [])
  const closePanel = useCallback(() => setActivePanel(null), [])

  const menuPanel = useMenuPanel({
    open: activePanel === 'menu',
    onOpen: () => openPanel('menu'),
    onClose: closePanel,
  })
  const explorerPanel = useExplorerPanel({
    open: activePanel === 'explorer',
    onOpen: () => openPanel('explorer'),
    onClose: closePanel,
    engine,
  })

  const panel = activePanel === 'menu' ? menuPanel
              : activePanel === 'explorer' ? explorerPanel
              : null

  return (
    <>
      <SidePanel
        open={panel !== null}
        title={panel?.title ?? ''}
        sections={panel?.sections ?? []}
        footer={panel?.footer}
        dismissible={panel?.dismissible ?? true}
        onClose={closePanel}
      />

      {apiKey && (
        <Dock>
          <DockButton
            icon={<Menu size={14} />}
            label="Menu"
            onClick={() => activePanel === 'menu' ? closePanel() : openPanel('menu')}
            active={activePanel === 'menu'}
            title="Open menu (m)"
          />
          <DockButton
            icon={<Layers size={14} />}
            label="Explorer"
            onClick={() => activePanel === 'explorer' ? closePanel() : openPanel('explorer')}
            active={activePanel === 'explorer'}
            title="Open explorer (e)"
          />
        </Dock>
      )}
    </>
  )
}
