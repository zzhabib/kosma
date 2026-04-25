# First-Person Interaction Model

## Overview

First-person camera (GMod-style). Player can move, look around, and grab/interact with objects in the world. Physics interactions are core to the fun.

## Camera & Movement

### Controls
- **WASD** — move forward/backward/strafe
- **Mouse** — look around (pitch/yaw)
- **Space** — jump (or fly toggle if no gravity)

### Implementation
- Pointer lock for mouse look (click canvas to enable)
- First-person perspective (camera position slightly above ground)
- Maybe free-flying mode for easier scene exploration (toggle with key)

## Object Grabbing

### Raycasting
On each frame (or when player clicks):
- Cast ray from camera through center of screen
- Check for intersection with objects
- If hit, highlight it (visual feedback)

### Grabbing
- Click/hold mouse button to grab nearest interactible object
- Object position follows camera + offset (e.g., 2 units forward)
- Player can move camera/head to rotate/move the grabbed object in 3D

### Physics While Grabbed
**Option A: Kinematic**
- Grabbed object becomes kinematic (ignore external forces)
- Moves exactly where player wants
- Pro: precise control; Con: breaks physics interactions (balloons don't lift it)

**Option B: Dynamic (with constraint)**
- Object stays dynamic, but add a constraint that pulls it toward grab point
- Balloons can still lift it, gravity still works
- Pro: physics still happen; Con: feels less precise

**Undecided:** Which feels better for playground? Probably B (dynamic constraints).

## Interactible Component

### Option 1: Explicit component
```typescript
type Interactible = {
  grabable: boolean;    // can player grab it?
  deletable: boolean;   // can player delete it?
  highlightColor: [r, g, b];
}
```

Pros: explicit, queryable, systems can check
Cons: more boilerplate, need to set on every spawned object

### Option 2: Everything interactible by default
No component needed. All objects can be grabbed unless marked otherwise.

Pros: simpler, less data
Cons: less explicit, harder for systems to understand intent

**Decision pending:** How much control do we need? For now, lean toward Option 2 (everything interactible) unless there's a reason to constrain.

## Visual Feedback

### Hovering
- Object under crosshair is slightly highlighted (glow, outline, or color shift)
- Helps player see what's interactible
- Could show object name/type in HUD

### Grabbing
- Grabbed object gets distinct highlight (e.g., bright glow)
- Maybe show a line from camera to grabbed object
- HUD shows "holding: [object name]"

### System-added interactivity
- Systems could add visual hints (e.g., "floaty" objects shimmer)
- AI could describe interaction hints in spawning message

## Interaction Modes (Future)

**Single mode for now:** grab/move only

**Future modes:**
- **Grab** — pick up and move
- **Delete** — remove objects
- **Spawn** — spawn new objects at cursor
- **Constrain** — add ropes/motors between objects
- **Inspect** — detailed view of object properties

Switch modes via hotkeys or UI menu.

## HUD / UI

### Essential
- Crosshair (center of screen)
- Object name under crosshair
- "Holding: [name]" when grabbing
- FPS counter (optional, for debugging)

### Nice-to-have
- Grab distance indicator
- Interaction hints from systems
- Object mass/properties (inspect mode)

## Input Mapping

```
W/A/S/D     — move
Mouse       — look
Space       — jump / fly toggle
Left Click  — grab
Right Click — (reserved for future, delete?)
Scroll      — grab distance / speed
C           — crouch (future)
I           — inspect (future)
```

## Physics Considerations

### Grabbed objects
- Should they collide with other objects? (yes, realism)
- Should they interact with systems? (yes, balloons lift, drag slows)
- What if player grabs something mid-air? (constraint pulls it toward grab point)

### Throwing
Not implemented for v1, but could add:
- Release with velocity based on player movement
- Fun for flinging things across the scene
