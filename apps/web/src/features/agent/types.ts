import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'

export type { ContentBlock }
export type TextBlock = Extract<ContentBlock, { type: 'text' }>
export type ThinkingBlock = Extract<ContentBlock, { type: 'thinking' }>
export type ToolUseBlock = Extract<ContentBlock, { type: 'tool_use' }>

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: ContentBlock[]
  streaming: boolean
}
