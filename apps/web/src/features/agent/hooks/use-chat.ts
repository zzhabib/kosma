import { useReducer, useCallback } from 'react'
import { chatReducer, sendChatMessage, type ChatState } from '../agent'

const initialState: ChatState = { messages: [], status: 'idle', error: null }

export function useChat(apiKey: string | null) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const sendMessage = useCallback(
    (text: string) => {
      if (!apiKey || !text.trim()) return
      sendChatMessage(text, state.messages, apiKey, dispatch)
    },
    [apiKey, state.messages],
  )

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    sendMessage,
    clearMessages: () => dispatch({ type: 'CLEAR' }),
  }
}
