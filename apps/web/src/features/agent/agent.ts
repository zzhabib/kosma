import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export type AgentEvent =
  | { type: 'user_message'; id: string; text: string }
  | { type: 'assistant_start'; id: string }
  | { type: 'text_delta'; text: string }
  | { type: 'assistant_done'; content: ContentBlock[] }
  | { type: 'error'; message: string }

export class Agent {
  private history: Anthropic.MessageParam[] = []
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  }

  async *send(text: string): AsyncGenerator<AgentEvent> {
    this.history.push({ role: 'user', content: text })
    yield { type: 'user_message', id: `user-${Date.now()}`, text }
    yield { type: 'assistant_start', id: `assistant-${Date.now()}` }

    try {
      const stream = this.client.messages.stream({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        messages: this.history,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { type: 'text_delta', text: event.delta.text }
        }
      }

      const response = await stream.finalMessage()
      this.history.push({ role: 'assistant', content: response.content as Anthropic.MessageParam['content'] })
      yield { type: 'assistant_done', content: response.content as ContentBlock[] }
    } catch (error) {
      yield { type: 'error', message: error instanceof Error ? error.message : String(error) }
    }
  }

  clear() {
    this.history = []
  }
}
