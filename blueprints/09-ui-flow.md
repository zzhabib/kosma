# UI Flow

## Landing Page (First Load)

User sees:
- **Title/branding** — "Kosma" + brief tagline
- **API Key input** — text field for Anthropic API key
- **Checkbox** — "Remember my API key on this device" (uses localStorage)
- **"Enter World" button** — starts game

Simple, clean, no clutter. Maybe a brief description or screenshot to set expectations.

## Game World (Main)

Full-screen 3D viewport with minimal HUD:

**HUD Elements:**
- **Crosshair** — center of screen (small, clean)
- **Object name** — what's under cursor (top-right corner)
- **Grab status** — "Holding: [name]" when grabbing (top-left)
- **Mouse lock indicator** — "🔒 Locked" or "🔓 Unlocked" (top-right, small)
- **FPS counter** — optional, debugging (top-right corner)

## Chat Interface (Triggered by "/")

Appears as **overlay modal** or **sidebar** (undecided):

### Option A: Full-screen modal
```
┌─────────────────────────────────────┐
│  Chat with AI                    [X]│
├─────────────────────────────────────┤
│ You: "add balloons to the bathtub" │
│ AI: Spawning 5 balloon objects...   │
│ AI: Injecting buoyancy system...    │
│ AI: Done!                           │
│                                     │
│ You: "make it fly higher"           │
│ AI: Adjusting...                    │
│                                     │
│ [input: type prompt, Enter to send] │
├─────────────────────────────────────┤
│ (Escape to close)                   │
└─────────────────────────────────────┘
```

### Option B: Side panel
Similar but slides in from right, doesn't block as much viewport.

**My take:** Option A (modal) is cleaner. Feels like a chat, clear entry/exit.

## Mouse Lock / Input Mode

**Three states:**

1. **Locked (default in game)** 🔒
   - Pointer lock active
   - Mouse moves camera
   - Click grabs objects
   - "/" opens chat interface
   - Visual indicator: small lock icon (top-right)

2. **Unlocked (chat active)** 🔓
   - Pointer lock disabled
   - Mouse is visible, can click UI
   - Typing in chat input
   - Camera doesn't move
   - Escape to close chat → back to Locked

3. **Tab toggle** (optional)
   - Press Tab to manually toggle lock/unlock
   - Useful if player wants to use browser devtools without closing chat
   - Visual indicator updates

**Best UX:**
- Click on canvas → lock (if unlocked)
- Escape → unlock
- "/" → open chat (unlocks automatically)
- Chat open → locked interactions disabled
- Close chat (Escape) → re-lock

**Visual feedback:**
- Small indicator in corner showing current state
- Maybe brief tooltip on hover: "Click to lock mouse" or "Press Escape to unlock"

## Key Bindings

```
Esc         — unlock mouse / close chat
/           — open chat interface
Tab         — toggle mouse lock (manual override)
W/A/S/D     — move (locked only)
Mouse       — look (locked only)
Space       — jump (locked only)
Left Click  — grab object (locked only)
Scroll      — grab distance / speed
```

## Menu Panel (Future)

Press **Tab** to open a menu with:
- **Save world** — download as `.world.json`
- **Load world** — open file picker, load `.world.json`
- **World stats** — entity count, archetypes, current systems
- **Settings** — volume, graphics, etc.

Not essential for v1, but good to plan. Keeps save/load accessible without cluttering HUD.

## State Transitions

```
Landing → Enter API → Game World (Locked) 
            ↓
         "/" key pressed
            ↓
         Chat Modal Opens (Unlocked, mouse visible)
            ↓
         User types prompt, sends
            ↓
         AI processes, world updates
            ↓
         User presses Escape
            ↓
         Chat closes (Re-locked)
            ↓
         Back to Game World
```
