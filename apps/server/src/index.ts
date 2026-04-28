import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

const app = new Hono()

app.use(cors({ origin: ['http://localhost:5173'] }))

app.all('*', async (c) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': c.req.header('x-api-key') ?? '',
    'anthropic-version': c.req.header('anthropic-version') ?? '2023-06-01',
  }

  const beta = c.req.header('anthropic-beta')
  if (beta) headers['anthropic-beta'] = beta

  const response = await fetch(`https://api.anthropic.com${c.req.path}`, {
    method: c.req.method,
    headers,
    body: c.req.method !== 'GET' ? await c.req.arrayBuffer() : undefined,
  })

  return new Response(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
})

serve({ fetch: app.fetch, port: 3001 })
console.log('Server running at http://localhost:3001')
