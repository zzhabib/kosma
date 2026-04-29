import { useReducer, useCallback, useEffect, useRef } from 'react'
import { Agent, type AgentEvent } from '../agent'
import type { ChatMessage, AppContentBlock, AppToolUseBlock } from '../types'
import type { Toolbox } from '../toolbox'

type ChatState = {
  messages: ChatMessage[]
  status: 'idle' | 'streaming' | 'error'
  error: string | null
}

function chatReducer(state: ChatState, action: AgentEvent): ChatState {
  switch (action.type) {
    case 'user_message':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.id, role: 'user', content: [{ type: 'text', text: action.text } as AppContentBlock], streaming: false },
        ],
      }

    case 'assistant_start':
      return {
        ...state,
        messages: [...state.messages, { id: action.id, role: 'assistant', content: [], streaming: true }],
        status: 'streaming',
        error: null,
      }

    case 'text_delta': {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (!last || !last.streaming) return state
      const prev = last.content[0]?.type === 'text' ? last.content[0].text : ''
      messages[messages.length - 1] = {
        ...last,
        content: [{ type: 'text', text: prev + action.text } as AppContentBlock],
      }
      return { ...state, messages }
    }

    case 'assistant_done': {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (!last || last.role !== 'assistant') return state
      messages[messages.length - 1] = { ...last, content: action.content as AppContentBlock[], streaming: false }
      return { ...state, messages, status: 'idle' }
    }

    // tool_call is a no-op: assistant_done already captures tool_use blocks from response.content
    case 'tool_call':
      return state

    case 'tool_result': {
      const messages = [...state.messages]
      let msgIdx = -1
      let blockIdx = -1
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i]
        if (m.role !== 'assistant') continue
        const bi = m.content.findIndex(b => b.type === 'tool_use' && (b as AppToolUseBlock).id === action.toolUseId)
        if (bi !== -1) { msgIdx = i; blockIdx = bi; break }
      }
      if (msgIdx === -1) return state
      const msg = messages[msgIdx]
      const content = [...msg.content]
      content[blockIdx] = { ...content[blockIdx] as AppToolUseBlock, result: action.result }
      messages[msgIdx] = { ...msg, content }
      return { ...state, messages }
    }

    case 'error':
      return { ...state, status: 'error', error: action.message }

    default:
      return state
  }
}

const initialState: ChatState = { messages: [], status: 'idle', error: null }

export function useChat(apiKey: string | null, toolbox: Toolbox | null) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const agent = useRef<Agent | null>(null)

  useEffect(() => {
    agent.current = apiKey ? new Agent(apiKey, toolbox) : null
  }, [apiKey, toolbox])

  const sendMessage = useCallback(async (text: string) => {
    if (!agent.current || !text.trim()) return
    for await (const event of agent.current.send(text)) {
      dispatch(event)
    }
  }, [])

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    sendMessage,
  }
}
