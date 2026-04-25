# Data Contracts

## What does the AI return?

**GenerateResponse:** array of `Thing` descriptors

```typescript
type Thing = {
  name: string;                    // "balloon", "bathtub", "rocket"
  mesh: MeshDescriptor;           // geometry + material
  position: [x, y, z];
  rotation?: [x, y, z];
  scale?: [x, y, z];
  physics: PhysicsDescriptor;     // shape, mass, restitution, etc.
  systemNames?: string[];         // e.g., ["buoyancy", "drag", "bounce"]
  systemCode?: Record<string, string>;  // NEW: actual system implementations
}
```

**PhysicsDescriptor:**
```typescript
type PhysicsDescriptor = {
  shape: "box" | "sphere" | "capsule";
  mass: number;
  friction: number;
  restitution: number;
  useGravity?: boolean;
}
```

## System Code

AI can optionally generate custom system code. If provided, the code is:

1. **Valid TS/JS** that implements the bitecs system pattern
2. **Registered at runtime** with a given name
3. **Applied to entities** that reference the system

Example generated system:
```typescript
// System name: "buoyancy"
export const buoyancySystem = (world) => {
  return (eid) => {
    const pos = Position.y[eid];
    const vel = Velocity.y[eid];
    const mass = RigidBody.mass[eid];
    // Apply upward force if underwater
    if (pos < WATER_LEVEL) {
      Velocity.y[eid] = vel + (9.81 * 0.5 / mass);
    }
  };
};
```

## Key Questions

- How does AI know what components are available? (Prompt injection of schema?)
- Should systemCode be per-thing or global?
- How do we name/deduplicate systems if multiple things request similar logic?
- What happens if system code references undefined components?
