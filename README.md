# Kosma

A 3D physics playground built on **Three.js + ECS + AI**. Describe what you want in plain language and the AI writes real TypeScript system code, injecting it live into the scene — no reload, no compilation step.

The core idea: the LLM doesn't just describe behavior, it *is* the behavior layer. Every object is an ECS entity; every interaction is a system. The AI generates those systems on demand and they run immediately.

**Try it here → [https://habib.one/kosma/](https://habib.one/kosma/)**

*Bring Your Own API Key*: Anthropic API key required, entered in the app and saved to browser local storage. Never sent anywhere except directly to Anthropic.

## How it works

1. You describe something — *"a cube that orbits the origin and leaves a trail"*
2. Claude processes the request:
   - Queries the current world state (existing entities, components, systems)
   - Spawns an entity and attaches the appropriate components
   - Writes a system to drive its behavior if needed, injected live via `eval`
3. You see the result instantly in the Three.js scene

The AI reuses existing systems where possible and only creates new ones when needed. There are no safety constraints — it's a playground.

## Stack

- **Three.js** — 3D rendering
- **bitecs** — Entity Component System (ECS) for deterministic, data-driven simulation
- **React** — UI shell
- **Claude** — interprets your prompt and generates ECS systems: spawning entities, defining components, writing per-frame logic (physics, animation, interaction). It sees the current scene state and can modify, extend, or remove anything in it

## What is ECS?

Entity Component System is an architectural pattern common in game engines. Instead of objects with methods, you have:

- **Entities** — plain numeric IDs, nothing more
- **Components** — raw data attached to entities (position, velocity, mass)
- **Systems** — functions that query for entities with certain components and update them each frame

This separation makes simulation logic composable and fast. It's also a natural fit for AI generation — a system is just a self-contained function, easy to write, easy to inject, and easy to reason about.

**Core Philosophy** - ECS is a natural fit for AI generation: all state lives in components (fully readable), and behavior is isolated systems (fully injectable). The AI has a complete, structured view of the world and can extend it without touching anything that already exists.

## Safety

Kosma has minimal guardrails. The AI can generate code that modifies any entity, any component, or the scene itself — and that code runs immediately via `eval`. There is no sandboxing, no output filtering, and no restrictions on what systems can do.

This is intentional. It's a playground, not a product. Use at your own risk.

## Run locally

```bash
pnpm install
pnpm dev
```