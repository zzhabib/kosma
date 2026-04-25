# Hierarchy & Relations via ECS

## Problem
Object hierarchies (parent-child relationships) could be:
1. Embedded in descriptors (nested objects)
2. Represented as ECS components (relations)

Option 2 is better. Hierarchies are first-class ECS data, queryable and mutable.

## Design

### ObjectDescriptor (flat)

No nesting. Descriptors reference parents by name:

```typescript
type ObjectDescriptor = {
  id: string; // "root", "mesh_1", "light_1" — unique per world
  className: string; // "Mesh", "Light", "Group", etc.
  constructorArgs?: any[];
  properties?: Record<string, any>;
  position: [x, y, z];
  rotation: [x, y, z];
  scale: [x, y, z];
  parentId?: string; // references another ObjectDescriptor.id, optional
}
```

Example:
```typescript
[
  { id: "root", className: "Group", position: [0,0,0] },
  { id: "mesh_1", className: "Mesh", position: [1,0,0], parentId: "root" },
  { id: "light_1", className: "Light", position: [0,1,0], parentId: "mesh_1" }
]
```

### Parent Component (ECS relation)

```typescript
type Parent = {
  value: eid; // entity ID of parent
}
```

Optional: track all children with a Children component for convenience:
```typescript
type Children = {
  value: eid[]; // entity IDs of children
}
```

## Spawning Flow

**Phase 1: Instantiate all entities**
```typescript
const idMap = new Map<string, eid>();

descriptors.forEach(desc => {
  const eid = spawnEntity(world, desc);
  idMap.set(desc.id, eid);
});
```

**Phase 2: Wire relationships**
```typescript
descriptors.forEach(desc => {
  if (desc.parentId) {
    const childEid = idMap.get(desc.id);
    const parentEid = idMap.get(desc.parentId);
    
    addComponent(world, Parent, childEid);
    Parent.value[childEid] = parentEid;
    
    // Optional: also track children for queries
    if (!hasComponent(world, Children, parentEid)) {
      addComponent(world, Children, parentEid);
      Children.value[parentEid] = [];
    }
    Children.value[parentEid].push(childEid);
  }
});
```

**Phase 3: Hydration**
The `objectHydrationSystem` reads Parent components and calls `parent.add(child)`:
```typescript
export function objectHydrationSystem(world) {
  return (eid) => {
    // If this entity is an Object and has a parent
    if (hasComponent(world, Object3D, eid) && hasComponent(world, Parent, eid)) {
      const parentEid = Parent.value[eid];
      if (hasComponent(world, Object3D, parentEid)) {
        const obj = Object3D.value[eid];
        const parentObj = Object3D.value[parentEid];
        parentObj.add(obj); // Establish hierarchy
      }
    }
  };
}
```

## Benefits

- **Composable**: Add/remove parent-child relationships at runtime by modifying Parent component
- **Queryable**: Systems can easily find all children of an entity, traverse hierarchy
- **Serializable**: flat list + entity references (IDs) are easy to save/load
- **Flexible**: Can add properties like sibling order, attach points, constraints as separate components
- **ECS-aligned**: Relationships are data, not structure

## Future Extensions

- **Children component**: Track children for efficient traversal
- **Sibling order**: add an `SiblingIndex` component for ordering within parent
- **Attachment points**: named sockets on parent for precise child placement
- **Constraints**: relative positioning/rotation enforced by a system

## Serialization

On save: just serialize the flat descriptor list (including parentId).
On load: spawn all, wire relationships via Parent components.

No recursive traversal needed. Simple, flat, queryable.
