export type TextBlock = {
  type: 'text'
  text: string
}

export type ThinkingBlock = {
  type: 'thinking'
  thinking: string
}

export type ToolUseBlock = {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
  _rawInput: string
  status: 'streaming' | 'done'
}

export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  blocks: ContentBlock[]
  status: 'done' | 'streaming' | 'error'
}
