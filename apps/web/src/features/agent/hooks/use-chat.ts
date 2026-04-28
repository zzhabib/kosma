import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'
import { Agent, type AgentEvent } from '../agent'
import type { ChatMessage } from '../types'

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
          { id: action.id, role: 'user', content: [{ type: 'text', text: action.text } as ContentBlock], streaming: false },
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
        content: [{ type: 'text', text: prev + action.text } as ContentBlock],
      }
      return { ...state, messages }
    }

    case 'assistant_done': {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (!last || last.role !== 'assistant') return state
      messages[messages.length - 1] = { ...last, content: action.content, streaming: false }
      return { ...state, messages, status: 'idle' }
    }

    case 'error':
      return { ...state, status: 'error', error: action.message }

    default:
      return state
  }
}

const initialState: ChatState = { messages: [], status: 'idle', error: null }

export function useChat(apiKey: string | null) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const agent = useRef<Agent | null>(null)

  useEffect(() => {
    agent.current = apiKey ? new Agent(apiKey) : null
  }, [apiKey])

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
