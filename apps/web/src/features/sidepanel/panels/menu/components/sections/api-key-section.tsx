import { useState } from 'react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Text, TextSmall, TextMuted } from '@/components/typography'

interface ApiKeySectionProps {
  apiKey: string | null
  onSetKey: (key: string) => void
  onClearKey?: () => void
}

type ApiKeyState = 'not-set' | 'set' | 'editing'

export function ApiKeySection({ apiKey, onSetKey, onClearKey }: ApiKeySectionProps) {
  const [keyInput, setKeyInput] = useState('')
  const [state, setState] = useState<ApiKeyState>(apiKey ? 'set' : 'not-set')

  const handleSetKey = () => {
    if (keyInput.trim()) {
      onSetKey(keyInput)
      setKeyInput('')
      setState('set')
    }
  }

  const handleCancel = () => {
    setKeyInput('')
    setState(apiKey ? 'set' : 'not-set')
  }

  if (state === 'editing') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Text>Enter an Anthropic API key to leverage AI creation.</Text>
          <TextMuted>Your key is never stored on our servers.</TextMuted>
        </div>
        <Input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSetKey()
            }
            if (e.key === 'Escape') {
              handleCancel()
            }
          }}
          placeholder="sk-ant-..."
          autoFocus
        />
        <div className="flex gap-2">
          <Button onClick={handleSetKey} disabled={!keyInput.trim()} className="flex-1">
            Save
          </Button>
          <Button onClick={handleCancel} variant="secondary" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'set') {
    return (
      <div className="space-y-4">
        <Button onClick={() => setState('editing')} className="w-full justify-start">
          Edit Anthropic API Key
        </Button>
        {onClearKey && (
          <Button
            onClick={() => {
              onClearKey()
              setState('not-set')
            }}
            variant="danger"
            size="sm"
            className="w-full"
          >
            Clear Key
          </Button>
        )}
      </div>
    )
  }

  return (
    <Button onClick={() => setState('editing')} className="w-full justify-start">
      Setup Anthropic API Key
    </Button>
  )
}
