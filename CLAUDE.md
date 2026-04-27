# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- No "if needed" exports or wishy-washy escape hatches.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Be decisive with module APIs:**
- Each module exports ONE clear public interface. Not multiple "options."
- If something might be needed later, it's not needed now. Don't export it "just in case."
- The export surface should tell you exactly how to use it. No ambiguity, no alternatives.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Blueprints

See `/blueprints/` for full design spec. Covers: vision, data contracts, runtime injection, AI prompting, infrastructure, persistence, hierarchies, agent tools, interaction, and UI flow.

This defines most of the technical design expectations for the project.


## Key Design Decisions

- **AI generates system code.** LLM emits raw TypeScript/JavaScript system implementations, injected at runtime via eval.
- **Systems reuse encouraged.** AI reuses existing systems; only creates new ones when necessary.
- **No safety model.** Playground. AI can modify any entity, any component.
- **Live injection.** System code runs immediately; effects visible in real-time.
- **Deterministic engine.** bitecs + Three.js own runtime. LLM's code plugs into that system.
- **Descriptor + Runtime components.** Descriptors (SoA, serializable) vs. Runtime bindings (ephemeral). Only descriptors persisted.
- **Frontend-heavy.** Server is a CORS proxy only. User supplies API key. Zero token cost to host.

## UI Design Principles

### Visual Design

**Glassmorphism aesthetic:**
- Frosted glass panels (`GlassPanel`) with `bg-white/5 backdrop-blur-3xl border border-white/12`
- Transparency over opacity — text at `text-white/70`, `text-white/50`, etc. rather than solid colors
- Dark theme with minimal, intentional UI — let the 3D world shine through
- Subtle depth with inset shadows: `shadow-[0_24px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]`

**Immersive over modal:**
- Side panels slide in from the edge (e.g., menu from left) instead of centered overlays
- Subtle background fade (`from-black/40 via-black/20 to-transparent`) to maintain world visibility
- Full-height panels feel integrated, not intrusive
- Transitions are smooth (`transition-all duration-300`) for natural feel

**Spacing & Typography:**
- Use semantic components: `Heading`, `Text`, `TextSmall`, `TextMuted` (not inline `className`)
- Consistent padding/margins: buttons `py-2.5`, panels `p-8`, sections `space-y-6`
- Tracking/letter-spacing on headings (`tracking-tight`) for polish

### Component Architecture

**Design system approach:**
- All reusable UI lives in `apps/web/src/components/`
- Button variants: `primary` (default), `secondary`, `danger`, `ghost`
- Button sizes: `sm`, `md`, `lg`
- Input, Card, typography components — no duplicated styles

**Pattern: Router/Registry for extensibility:**
- When rendering a list of variants (e.g., message blocks), use a registry: `const blockRenderers: Record<Type, Component> = {...}`
- Adding a new variant is one line: register it in the map
- Easier than if-else chains, more maintainable than factory functions

**Composition over nesting:**
- Pass sections/content as props (e.g., Menu takes `sections` array)
- Easy to add new sections without modifying the component
- Clean separation: Menu doesn't know about API keys, it just renders sections

### Feature Architecture

**Pattern: Feature Encapsulation via Container Components**

Each feature exports a "container" component that manages its own logic and state:
- Feature container (e.g., `MenuFeature`, `AgentFeature`) owns internal state and side effects
- Container receives minimal props: just what it needs to function
- Container is opaque — App doesn't need to know HOW it works, only THAT it works
- Internal logic (keyboard shortcuts, state transitions) stays in feature hooks

Example:
```tsx
// ❌ Don't do this (leaks feature logic to App)
<Menu open={menuOpen} onClose={...} />
<MenuToggle onToggle={...} />

// ✅ Do this (feature self-contained)
<MenuFeature apiKey={apiKey} onApiKeySet={...} chatOpen={chatOpen} />
```

**Clean feature hierarchy:**
- Each feature is a module: `features/agent/`, `features/menu/`, `features/engine/`
- Features don't cross-import unless explicitly orchestrated
- State orchestration happens at the top level (`App` in `main.tsx`)
- Render tree reflects code organization (no feature mixing in component trees)
- App reads like a declarative blueprint: "here's what we're building"
- Feature files read like an implementation: "here's how it works"

**State management:**
- Top-level state in App → features receive state as props
- Features own their internal state hooks (e.g., `useChat`, `useApiKey`)
- Unidirectional data flow: App → Features (no upward callbacks except `onAction`)
- No global state libraries unless needed — props > context > store

### Interaction & UX

**Keyboard-first navigation:**
- `/` — open chat
- `m` — open menu (when API key is set)
- `Esc` — close overlay
- `Enter` — submit in forms
- Clear, documented shortcuts in button titles

**State transitions:**
- Clear visual feedback for each state (e.g., API key has 3 states: not-set → editing → set)
- Users always know next action (buttons guide them)
- No ambiguous states

**Accessibility considerations:**
- All buttons have `title` attributes explaining keyboard shortcuts
- Focus visible on interactive elements
- Text contrast maintained (white/85 on transparent = readable)
- Disabled states clear with reduced opacity + cursor-not-allowed


## Plan Mode

- Make plans extremely concise. Sacrifice grammar for concision.
- End with unresolved questions to answer.

## Folder Structure

**Inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react).**

```
apps/web/src/
├── components/           # Shared, reusable UI components
│   ├── button.tsx        # Button with variants (primary, secondary, danger, ghost)
│   ├── input.tsx         # Text input
│   ├── card.tsx          # Container component
│   ├── typography.tsx    # Text hierarchy (Heading, Text, TextSmall, etc.)
│   ├── glass-panel.tsx   # Glassmorphism panel
│   └── index.ts          # Clean exports
│
├── features/             # Feature modules (self-contained)
│   ├── agent/            # Chat agent feature
│   │   ├── components/   # Feature-specific UI (ChatPanel, ChatInput, etc.)
│   │   ├── hooks/        # Feature-specific hooks (useChat, useAgentChat)
│   │   ├── types.ts      # Feature-specific types
│   │   └── index.tsx     # Container: AgentFeature (public API)
│   │
│   ├── menu/             # Menu/settings feature
│   │   ├── components/   # Feature UI (Menu, MenuToggle, ApiKeySection)
│   │   ├── hooks/        # Feature hooks (useMenu)
│   │   └── index.tsx     # Container: MenuFeature (public API)
│   │
│   └── engine/           # 3D physics engine
│       └── ...
│
├── hooks/                # Shared/global hooks
│   └── use-ui-state.ts   # Manages menu + chat state coordination
│
├── lib/                  # Utilities & helpers
│   └── utils.ts          # cn() for class composition
│
├── main.tsx              # App entry point (orchestration layer)
└── index.css             # Global styles
```

**Principles:**
- **Shared** (`components/`, `hooks/`, `lib/`) — reusable across features
- **Features** (`features/`) — self-contained modules with their own components, hooks, types
- **No cross-feature imports** — features are independent. Orchestration happens at App level.
- **Feature exports** — each feature exports ONE container component (e.g., `MenuFeature`, `AgentFeature`)
- **Public vs Internal** — importing from `features/menu/index.tsx` (public API) vs. `features/menu/components/` (internal)

## Commands

Never run pnpm commands. User starts dev servers themselves.

```bash
pnpm dev                          # all apps
pnpm --filter @kosma/web dev      # frontend only
pnpm --filter @kosma/server dev   # backend only
pnpm typecheck                    # type check
pnpm build                        # build
```

Backend: `node --watch --experimental-strip-types` (no transpile needed).
