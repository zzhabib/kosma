import { useRef, useMemo, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Menu, Layers } from 'lucide-react'
import { useEngine } from './features/engine'
import { useMenuPanel } from './features/menu'
import { useExplorerPanel } from './features/explorer'
import { AgentFeature } from './features/agent'
import { AppProvider, useAppContext } from './context/app-context'
import { Toolbox } from './features/agent/toolbox'
import { Dock, DockButton, SidePanel } from './components'
import './index.css'

type PanelId = 'menu' | 'explorer'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useEngine(canvasRef)
  const toolbox = useMemo(() => engine ? new Toolbox(engine) : null, [engine])
  const { apiKey } = useAppContext()

  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const openPanel = useCallback((id: PanelId) => setActivePanel(id), [])
  const closePanel = useCallback(() => setActivePanel(null), [])

  const menuPanel = useMenuPanel({
    open: activePanel === 'menu',
    onOpen: useCallback(() => openPanel('menu'), [openPanel]),
    onClose: closePanel,
  })
  const explorerPanel = useExplorerPanel({
    open: activePanel === 'explorer',
    onOpen: useCallback(() => openPanel('explorer'), [openPanel]),
    onClose: closePanel,
    engine,
  })

  const panel = activePanel === 'menu' ? menuPanel
              : activePanel === 'explorer' ? explorerPanel
              : null

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

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

      <AgentFeature toolbox={toolbox} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
)
