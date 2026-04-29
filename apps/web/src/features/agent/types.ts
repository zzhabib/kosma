import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'

export type { ContentBlock }
export type TextBlock = Extract<ContentBlock, { type: 'text' }>
export type ThinkingBlock = Extract<ContentBlock, { type: 'thinking' }>

export type AppToolUseBlock = {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
  result?: unknown
}

export type AppContentBlock = Exclude<ContentBlock, { type: 'tool_use' }> | AppToolUseBlock

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: AppContentBlock[]
  streaming: boolean
}
