# Persistence: Export/Import

## Strategy

File-based export/import. No server, no localStorage. Users download worlds as JSON files, re-import them later.

## What Gets Saved

**Descriptor components only.** The entity data that defines the world:
- Position, Rotation, Scale
- Mesh descriptors (geometry, material)
- Physics descriptors (mass, friction, restitution)
- System references (which systems apply to this entity)

**NOT saved:**
- Runtime bindings (ThreeMesh, ThreeCamera, etc.)
- System instances (reconstructed from entity data on load)
- Transient state

World file is lightweight JSON, easily portable.

## Export Flow

1. Iterate all entities in ECS
2. For each entity, extract descriptor component values
3. Serialize to plain JS object
4. Stringify to JSON
5. User downloads as `.world.json` file

```typescript
function exportWorld() {
  const worldData = entities.map(eid => ({
    name: getName(eid),
    position: [Position.x[eid], Position.y[eid], Position.z[eid]],
    rotation: [Rotation.x[eid], Rotation.y[eid], Rotation.z[eid]],
    scale: [Scale.x[eid], Scale.y[eid], Scale.z[eid]],
    mesh: getMeshDescriptor(eid),
    physics: getPhysicsDescriptor(eid),
    systemNames: getSystemReferences(eid),
    // ... other descriptors
  }));

  const json = JSON.stringify(worldData, null, 2);
  downloadFile(json, 'world.json');
}
```

## Import Flow

1. User selects JSON file
2. Parse JSON
3. Iterate entities
4. Call `spawnEntity()` for each to populate ECS
5. Hydration systems reconstruct runtime bindings (Three.js, physics, etc.)

```typescript
function importWorld(file) {
  const json = await file.text();
  const worldData = JSON.parse(json);

  worldData.forEach(entityData => {
    spawnEntity(world, entityData);
  });
}
```

## UX Details

- Export button: "Download World"
- Import: drag-and-drop file onto canvas, or "Load from File" button
- File extension: `.world.json` for clarity

## Future

- Could add URL-based sharing later (encode world in URL hash)
- Could add cloud saves if/when we add auth
- For now, files are the persistence layer
