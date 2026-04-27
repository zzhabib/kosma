import { api } from '@/lib/api-client'
import { type ChatMessage, type ContentBlock } from './types'

// --- State & actions ---

export type ChatState = {
  messages: ChatMessage[]
  status: 'idle' | 'streaming' | 'error'
  error: string | null
}

export type ChatAction =
  | { type: 'USER_SEND'; id: string; text: string }
  | { type: 'ASSISTANT_START'; id: string }
  | { type: 'BLOCK_START'; index: number; block: ContentBlock }
  | { type: 'BLOCK_DELTA'; index: number; delta: Record<string, unknown> }
  | { type: 'BLOCK_STOP'; index: number }
  | { type: 'STREAM_DONE' }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEAR' }

// --- Reducer helpers ---

function updateLastAssistantMessage(
  messages: ChatMessage[],
  updater: (msg: ChatMessage) => ChatMessage,
): ChatMessage[] {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'assistant') return messages
  const updated = [...messages]
  updated[updated.length - 1] = updater(last)
  return updated
}

function applyBlockDelta(block: ContentBlock, delta: Record<string, unknown>): ContentBlock | null {
  if (block.type === 'text' && 'text' in delta) {
    return { ...block, text: block.text + (delta.text as string) }
  }
  if (block.type === 'thinking' && 'thinking' in delta) {
    return { ...block, thinking: block.thinking + (delta.thinking as string) }
  }
  if (block.type === 'tool_use' && 'partial_json' in delta) {
    return { ...block, _rawInput: block._rawInput + (delta.partial_json as string) }
  }
  return null
}

function finalizeBlock(block: ContentBlock): ContentBlock {
  if (block.type !== 'tool_use') return block
  try {
    return { ...block, input: JSON.parse(block._rawInput), status: 'done' }
  } catch {
    return { ...block, status: 'done' }
  }
}

// --- Reducer ---

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'USER_SEND':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.id, role: 'user', blocks: [{ type: 'text', text: action.text }], status: 'done' },
        ],
      }

    case 'ASSISTANT_START':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.id, role: 'assistant', blocks: [], status: 'streaming' },
        ],
        status: 'streaming',
        error: null,
      }

    case 'BLOCK_START':
      return {
        ...state,
        messages: updateLastAssistantMessage(state.messages, (msg) => ({
          ...msg,
          blocks: [...msg.blocks, action.block],
        })),
      }

    case 'BLOCK_DELTA':
      return {
        ...state,
        messages: updateLastAssistantMessage(state.messages, (msg) => {
          const block = msg.blocks[action.index]
          if (!block) return msg
          const patched = applyBlockDelta(block, action.delta)
          if (!patched) return msg
          const blocks = [...msg.blocks]
          blocks[action.index] = patched
          return { ...msg, blocks }
        }),
      }

    case 'BLOCK_STOP':
      return {
        ...state,
        messages: updateLastAssistantMessage(state.messages, (msg) => {
          const block = msg.blocks[action.index]
          if (!block) return msg
          const blocks = [...msg.blocks]
          blocks[action.index] = finalizeBlock(block)
          return { ...msg, blocks }
        }),
      }

    case 'STREAM_DONE':
      return {
        ...state,
        messages: updateLastAssistantMessage(state.messages, (msg) => ({ ...msg, status: 'done' })),
        status: 'idle',
      }

    case 'ERROR':
      return { ...state, status: 'error', error: action.message }

    case 'CLEAR':
      return { messages: [], status: 'idle', error: null }

    default:
      return state
  }
}

// --- Streaming ---

function mapRawBlock(raw: Record<string, unknown>): ContentBlock {
  switch (raw.type) {
    case 'thinking':
      return { type: 'thinking', thinking: '' }
    case 'tool_use':
      return { type: 'tool_use', id: raw.id as string, name: raw.name as string, input: {}, _rawInput: '', status: 'streaming' }
    default:
      return { type: 'text', text: '' }
  }
}

function routeStreamEvent(event: Record<string, unknown>, dispatch: (a: ChatAction) => void): void {
  switch (event.type) {
    case 'content_block_start':
      dispatch({ type: 'BLOCK_START', index: event.index as number, block: mapRawBlock(event.content_block as Record<string, unknown>) })
      break
    case 'content_block_delta':
      dispatch({ type: 'BLOCK_DELTA', index: event.index as number, delta: event.delta as Record<string, unknown> })
      break
    case 'content_block_stop':
      dispatch({ type: 'BLOCK_STOP', index: event.index as number })
      break
    case 'message_stop':
      dispatch({ type: 'STREAM_DONE' })
      break
  }
}

async function consumeStream(reader: ReadableStreamDefaultReader<Uint8Array>, dispatch: (a: ChatAction) => void): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      dispatch({ type: 'STREAM_DONE' })
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const chunk of chunks) {
      if (!chunk.startsWith('data: ')) continue
      try {
        routeStreamEvent(JSON.parse(chunk.slice(6)), dispatch)
      } catch {
        // malformed SSE chunk — skip
      }
    }
  }
}

// --- Serialization ---

function serializeBlockContent(block: ContentBlock): string {
  switch (block.type) {
    case 'text': return block.text
    case 'thinking': return `<thinking>${block.thinking}</thinking>`
    case 'tool_use': return `<tool_use name="${block.name}" id="${block.id}">${JSON.stringify(block.input)}</tool_use>`
  }
}

function serializeHistory(history: ChatMessage[], newText: string) {
  const messages = history.map((msg) => ({
    role: msg.role,
    content:
      msg.role === 'user'
        ? (msg.blocks[0]?.type === 'text' ? msg.blocks[0].text : '')
        : msg.blocks.map(serializeBlockContent).join('\n'),
  }))

  return [...messages, { role: 'user' as const, content: newText }]
}

// --- Public API ---

export async function sendChatMessage(
  text: string,
  history: ChatMessage[],
  apiKey: string,
  dispatch: (action: ChatAction) => void,
): Promise<void> {
  dispatch({ type: 'USER_SEND', id: `user-${Date.now()}`, text })
  dispatch({ type: 'ASSISTANT_START', id: `assistant-${Date.now()}` })

  try {
    const response = await api.stream('/chat/stream', {
      apiKey,
      messages: serializeHistory(history, text),
      thinking: true,
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    await consumeStream(reader, dispatch)
  } catch (error) {
    dispatch({ type: 'ERROR', message: error instanceof Error ? error.message : String(error) })
  }
}
