# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

Kosma is a prototype AI-native world-generation system. The core thesis: current AI world models conflate generation and simulation — they own the full pipeline from prompt to pixels, making the runtime opaque and non-deterministic.

Kosma splits that pipeline in two. An LLM is responsible only for world *authoring* — it interprets a user prompt and emits a structured `GenerateResponse` (an array of entity descriptors). From that point on, a deterministic engine takes over: an ECS (bitecs) instantiates the world from the response and Three.js renders it. The LLM never produces executable code; it produces *data*. The engine is always in control.


## Development Ideologies
KISS - Keep It Simple Stupid
- In general the most simple solutions will almost always be preferred.

SOLID - Always try to stick to SOLID principles within reason.
- **S**ingle Responsibility: one reason to change per class/module
- **O**pen/Closed: open for extension, closed for modification
- **L**iskov Substitution: subtypes must be substitutable for their base types
- **I**nterface Segregation: prefer small, focused interfaces over large ones
- **D**ependency Inversion: depend on abstractions, not concretions

YAGNI - You Aren't Gonna Need It
- Refrain from implementing speculative features. It is highly preferred to only implement features that deliver practical value.
- However, if there is a speculative feature that may be worth considering, feel free to mention it.

Direct Communication:
- Skip the pleasantries when giving technical opinions — be frank about what works and what doesn't.

## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Commands

Never run pnpm commands to build or start the dev server. Instead, the user will do it for themselves.

```bash
# Run all apps in parallel
pnpm dev

# Run a single app
pnpm --filter @kosma/web dev
pnpm --filter @kosma/server dev

# Typecheck all packages
pnpm typecheck

# Typecheck a single package
pnpm --filter @kosma/core typecheck

# Build all
pnpm build
```

The server uses `node --watch --experimental-strip-types` — no transpile step needed during dev.

## Architecture

Kosma is an AI-powered world-generation system. The core idea: **LLM generates structured data, never executable code. The engine is deterministic.**

### Data flow

```
User prompt
  → POST /generate (apps/server)
  → Anthropic SDK call
  → LLM response parsed into GenerateResponse (array of EntityDesc)
  → Zod validation (packages/core schemas)
  → JSON response to frontend
  → spawnEntity() populates ECS data + descriptor components
  → meshHydrationSystem creates Three.js objects from descriptors
  → Three.js renders entities
```

### Package responsibilities

- **`packages/core`** — shared API contract. Zod schemas and TypeScript types for `GenerateRequest`, `GenerateResponse`, and `EntityDesc`. Both apps import from `@kosma/core`. ECS component definitions are web-only concerns and live in `apps/web`.

- **`apps/server`** — Hono HTTP server. Receives a prompt, calls the Anthropic API, validates the response against `GenerateResponseSchema` (from core), and returns the validated JSON. No arbitrary code is ever returned.

- **`apps/web`** — Vite + React shell. Sends the prompt to the server, receives a `GenerateResponse`, calls `spawnEntity()` per entity to populate ECS data and descriptor components, then the hydration system creates Three.js objects from those descriptors. React is present for UI but the render loop is owned by Three.js.

### ECS component layers

ECS components in `apps/web` are split into two categories:

**Descriptor components** — SoA numeric arrays, fully serializable. These are the only components the LLM produces or reads, and the only ones persisted to storage. Examples: `Position`, `Rotation`, `Scale`, `MeshDesc`. The component registry (`registry` map in `components.ts`) tracks all descriptor components by name, enabling generic `spawnEntity` (JSON → ECS) and `readEntity` (ECS → JSON) without hardcoded dispatch.

**Runtime binding components** — AoS, ephemeral. Hold live engine objects that cannot be serialized. Created by hydration systems from descriptor data; discarded on save. Examples: `ThreeMesh`, `ThreeCamera`. These are never included in the registry and never sent over the wire.

The hydration systems (`meshHydrationSystem`, etc.) are the one-way bridge: they query for entities that have a descriptor but no runtime binding, construct the engine object, and attach it.

### Key constraints to preserve

- The LLM must only return data conforming to `GenerateResponse` — never scripts, functions, or eval-able strings.
- `packages/core` schemas are the single source of truth for the API boundary; server validates before responding, frontend trusts the already-validated payload.
- Only descriptor components are persisted or sent over the wire. Runtime bindings are always reconstructed by hydration systems on load.
- Systems are pre-written and parameterized by data, never generated.
