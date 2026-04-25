# Blueprints

Design documents for Kosma's direction and architecture.

- **00-vision.md** — High-level vision. GMod-like playground, AI generates things + systems.
- **01-data-contracts.md** — Data structures: What does the AI return? Thing descriptors, system code format.
- **02-runtime-injection.md** — How systems get loaded and run at runtime. eval strategy for now.
- **03-ai-prompting.md** — How to frame the LLM prompt so it generates valid systems.
- **04-infrastructure.md** — Hosting, API key handling, CORS proxy strategy, localStorage persistence.
- **05-persistence.md** — File-based export/import. Save worlds as JSON, load them later.
- **06-hierarchy-and-relations.md** — Parent-child relationships via ECS components, not nested descriptors. Flat, queryable, mutable.
- **07-agent-tools.md** — Tools agent has access to: queryWorld, readEntity, entity/component/system CRUD.
- **08-first-person-interaction.md** — First-person camera, grabbing mechanics, raycasting, physics while grabbed, Interactible component (undecided).
- **09-ui-flow.md** — Landing page (API key), game world HUD, chat interface (/ to open), mouse lock/unlock mechanics.
