import { useAppContext } from '@/context/app-context'
import { Button, type PanelConfig } from '@/components'
import { useMenu } from './hooks/use-menu'
import { ApiKeySection } from './components/sections/api-key-section'

interface UseMenuPanelProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export function useMenuPanel({ open, onOpen, onClose }: UseMenuPanelProps): PanelConfig {
  const { apiKey, setApiKey } = useAppContext()
  useMenu({ apiKey, open, onOpen, onClose })

  return {
    title: 'Kosma',
    dismissible: !!apiKey,
    sections: [
      {
        id: 'api-key',
        content: (
          <ApiKeySection
            apiKey={apiKey}
            onSetKey={(key) => { setApiKey(key); onClose() }}
            onClearKey={() => setApiKey(null)}
          />
        ),
      },
    ],
    footer: apiKey ? <Button onClick={onClose} className="w-full">Continue</Button> : undefined,
  }
}
