# Infrastructure & Deployment

## Hosting

**Frontend:** GitHub Pages (static, free)

**Backend proxy:** Cloudflare Workers or similar serverless (free tier)

## API Key Handling

### Problem
Anthropic API only accepts server-to-server requests (CORS blocks browser calls). But we don't want to pay for users' token usage.

### Solution: User-Provided API Key + Passthrough Proxy

1. User provides their Anthropic API key in the frontend UI
2. Frontend sends requests to our proxy (Cloudflare Worker)
3. Proxy receives request + API key, forwards to Anthropic API
4. Response returned to frontend

**Cost:** $0 to us (user pays for their tokens)

### Storage: Optional Checkbox

User sees checkbox: "Remember API key on this device"

- **Unchecked (default):** Key stored in memory only. Cleared when tab closes. User pastes key each session.
- **Checked:** Key persisted to `localStorage`. Survives browser restart. User pastes key once.

Gives users control over convenience vs. security trade-off.

## Security Model

**Explicit trade-offs users make:**
- Pasting API key into a web app (vs. using CLI locally)
- Storing key in browser localStorage (convenience over ephemeral session)
- Trusting our proxy doesn't log/steal keys

**Mitigations:**
- Don't log the API key in proxy
- HTTPS only (Cloudflare Workers enforces)
- Open-source code so users can audit
- Recommend users create a separate low-spend-limit API key just for this app
- Clear docs: "Your key is stored in your browser. You can clear it anytime."
- Add "Clear stored key" button in UI

## Proxy Implementation (Cloudflare Workers sketch)

```typescript
export default {
  async fetch(request) {
    // Expect request body: { apiKey: "sk-...", message: {...} }
    const body = await request.json();
    const apiKey = body.apiKey;
    const message = body.message;

    // Forward to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    return response;
  },
};
```

**Important:** Don't log `apiKey` or include it in error responses.

## Future Considerations

- If we ever want to offer "free tier" generation, we could:
  - Pay for a shared API key with rate limits
  - Users can still provide their own key to bypass limits
  - Hybrid approach: user key for unlimited, shared key for casual play
