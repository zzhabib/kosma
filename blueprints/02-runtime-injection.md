# Runtime System Injection

## Goal
When a new thing is spawned with custom system code, that code gets injected into the running ECS immediately. No bundler, no restart.

## Implementation Options

### Option A: eval() + Function constructor
Simplest but scary.
```typescript
const systemCode = `export const mySystem = (world) => { ... }`;
const systemFn = new Function(`return ${systemCode}`)();
world.registerSystem(systemFn.mySystem);
```
- **Pros:** dead simple, instant execution
- **Cons:** security nightmare (not a concern per design), hard to debug, no type checking

### Option B: Worker thread evaluation
Execute generated code in an isolated JS runtime.
- **Pros:** safer, cleaner separation
- **Cons:** overkill for a playground, adds latency

### Option C: Pre-validated, transpile-free
AI generates code that's syntactically validated server-side before sending. Client runs it as-is.
- **Pros:** balance of safety and simplicity
- **Cons:** still need validation logic

## Proposed Approach
**Option A for now.** eval is fine for a sandbox. Generate code, validate it matches expected patterns, inject it.

## Flow

1. Frontend sends prompt to server
2. Server calls LLM, gets GenerateResponse with systemCode fields
3. Server validates systemCode is valid JS (basic AST check or runtime try-catch)
4. Server returns validated response to frontend
5. Frontend spawns things, registers systems in the running ECS via eval
6. Systems run immediately

## Questions

- Should systems be stateful? (e.g., persistent memory across frames?)
- How do systems communicate? (query other entities, write to shared state?)
- Should there be a "system manifest" that tracks all loaded systems?
- How do we handle system conflicts or overwrites?
