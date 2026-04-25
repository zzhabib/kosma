# Agent Tools

Agent runs in the browser and can interact with the ECS world via tools. Tools provide CRUD access to entities, components, and systems.

## Query & Inspection

### queryWorld()
Returns basic world stats and archetype info.

```typescript
type QueryWorldResult = {
  totalEntities: number;
  componentCounts: Record<string, number>; // e.g., { "Position": 11, "Mesh": 8 }
  archetypes: Array<{
    components: string[]; // component names in this archetype
    count: number;
  }>;
}
```

Useful for agent to understand "what exists in the world" before making decisions.

### readEntity(id: eid)
Returns all component data for an entity.

```typescript
type EntityData = {
  id: eid;
  components: Record<string, any>; // { "Position": [x, y, z], "Mesh": {...}, ... }
}
```

Agent can inspect a specific entity's state.

## Entity CRUD

### spawnEntity(descriptor: ObjectDescriptor)
Create a new entity from descriptor. Returns entity ID.

```typescript
// Input
{ 
  id: "mesh_1", 
  className: "Mesh", 
  position: [0, 0, 0], 
  parentId?: "root"
}

// Returns
{ id: eid, name: "mesh_1" }
```

### destroyEntity(id: eid)
Delete an entity and all its children.

### modifyEntity(id: eid, changes: Partial<ObjectDescriptor>)
Update entity properties (position, rotation, scale, properties, etc.).

```typescript
modifyEntity(eid, {
  position: [1, 2, 3],
  rotation: [0, Math.PI / 2, 0],
  properties: { intensity: 2 }
})
```

## Component CRUD

### upsertComponent(entityId: eid, componentName: string, data: any)
Add a component if it doesn't exist, or update it if it does.

```typescript
upsertComponent(eid, "Physics", {
  shape: "box",
  mass: 10,
  friction: 0.5
})
```

### removeComponent(entityId: eid, componentName: string)
Remove a component from an entity.

### getComponent(entityId: eid, componentName: string)
Read a specific component from an entity.

## System CRUD

### injectSystem(code: string, name?: string)
Inject a new ECS system into the running world. Returns system name.

```typescript
injectSystem(
  `export const mySystem = (world) => {
    return (eid) => {
      // system logic
    };
  }`,
  "mySystem"
)

// Returns
{ name: "mySystem", status: "active" }
```

### removeSystem(name: string)
Stop and remove a system from the world.

### listSystems()
List all active systems.

```typescript
[
  { name: "gravity", active: true },
  { name: "drag", active: true },
  { name: "collision", active: true }
]
```

### getSystemCode(name: string)
Read the source code of an active system.

## Future Ideas

- **Top archetypes visualization** — augment `queryWorld()` to show most common archetype patterns (useful for agent decision-making)
- **Batch operations** — spawnMultiple, destroyMultiple for efficiency
- **Constraints** — setConstraint (parent-child relative positioning)
- **Physics queries** — raycast, overlap for agent-driven interactions
