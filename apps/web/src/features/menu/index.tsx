import { useAppContext } from '@/context/app-context'
import { useMenu } from './hooks/use-menu'
import { Menu } from './components'
import { MenuToggle } from './components/menu-toggle'
import { ApiKeySection } from './components/sections/api-key-section'

export function MenuFeature() {
  const { apiKey, setApiKey } = useAppContext()
  const { open, setOpen } = useMenu({ apiKey })

  return (
    <>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        dismissible={!!apiKey}
        sections={[
          {
            id: 'api-key',
            content: (
              <ApiKeySection
                apiKey={apiKey}
                onSetKey={(key) => { setApiKey(key); setOpen(false) }}
                onClearKey={() => setApiKey(null)}
              />
            ),
          },
        ]}
      />
      {!open && apiKey && <MenuToggle onToggle={() => setOpen(true)} />}
    </>
  )
}
