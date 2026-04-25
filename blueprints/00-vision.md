# Kosma Vision

## Core Idea
A GMod-like 3D playground where AI generates "things" (entities with behaviors). You spawn components, stack them, watch physics and AI-generated systems interact in funny/unexpected ways.

Examples: balloons attached to bathtub = flying bathtub. Rockets on a car. A stack of ragdolls with weird physics.

## Design Pillars

**Playgrounds over simulation.** Not a coherent world generator. A sandbox for stupid fun.

**ECS-based.** Bitecs for determinism and performance.

**AI generates systems.** LLM doesn't just produce data—it writes actual TS/JS system code that gets injected at runtime. This is *the* differentiation from v0. Systems are where the magic happens.

**Live injection.** When you ask AI to add a system, you see it work immediately. No restart, no reload.

**Shared systems encouraged.** The AI should reuse behaviors. A "gravity" system applies to all things that need gravity, not baked into individual entity logic.

## Key Decisions

1. **No safety model.** This is a playground. AI can modify anything.

2. **Raw TS/JS code.** No DSL, no transpilation stage. Generated code is valid system implementations.

3. **Runtime instantiation.** Systems get injected into the running ECS. Implementation TBD but goal is live feedback.

4. **Smaller generation scope.** AI spawns "things" (a prop with optional behaviors), not full worlds. Scene composition is either user-driven or light guidance.

## Next Steps

- [ ] Define what a "thing" descriptor looks like (props + optional system name)
- [ ] Define system signature/contract (what does generated code look like?)
- [ ] Plan runtime system injection mechanism
- [ ] Prototype AI prompt that generates valid system code
