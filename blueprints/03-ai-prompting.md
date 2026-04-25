# AI Prompting Strategy

## Goal
Frame the LLM with enough context that it can:
1. Understand the available components and systems
2. Generate valid TS/JS system code
3. Know when to reuse existing systems vs. create new ones
4. Think in terms of ECS (entities, components, systems)

## Prompt Structure

**System context:**
- Full component schema (Position, Rotation, Velocity, RigidBody, etc.)
- List of existing systems in the world
- Example system code (buoyancy, drag, bounce)
- bitecs API surface

**User request:**
- "Create a bathtub with balloons attached"
- Or: "Make the bathtub fly"

**Expected output:**
- GenerateResponse with Things + optional systemCode
- If creating new behavior, generate the system
- If reusing existing behavior, reference systemNames only

## Example Prompt Fragment

```
You are generating entities for a 3D physics sandbox (Kosma).

Available components:
- Position: [x, y, z]
- Velocity: [vx, vy, vz]
- RigidBody: { mass, friction, restitution, useGravity }
- Mesh: { geometry, material }
- ... (full list)

Existing systems in the world:
- gravity: applies 9.81 m/s² downward to entities with useGravity=true
- drag: reduces velocity proportionally to speed
- collision: handled by Rapier physics engine

You can either reference existing systems by name, or generate new ones.
If you generate a new system, it must be valid TypeScript/JavaScript.

User request: "Add balloons that pull things upward"

Respond in JSON...
```

## Questions

- How deep into bitecs should the prompt go?
- Should we include type definitions for components?
- How do we prevent the AI from generating systems that require unavailable components?
- Should there be a "system library" that's part of the prompt (approved, tested systems)?
