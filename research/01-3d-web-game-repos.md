# 3D Web Game Repos — Three.js + Svelte / Vite for tiny-planet delivery game

## Research Question
Open-source repos to fork or learn from for building a Three.js + Svelte browser game in the style of messenger.abeto.co (tiny-planet, low-poly, delivery/courier).

## Key Findings

### Threlte — threlte/threlte
- **URL:** https://github.com/threlte/threlte
- **Stars:** 3,241 | **Last commit:** 2026-05-01 | **License:** MIT
- **Stack:** Svelte 5 + SvelteKit + Three.js + Rapier (optional) + extras (XR, postprocessing, flex)
- **What it is:** The official Svelte wrapper for Three.js — declarative `<T.Mesh>` components, official `@threlte/rapier` physics package, Theatre.js animation studio, and a deep example gallery. This is the framework messenger.abeto.co almost certainly uses.
- **Forkability: 1/5** — Don't fork; depend on it. Read its `apps/` examples for canonical patterns.

### Threlter (race-in-your-browser) — grischaerbe/threlter
- **URL:** https://github.com/grischaerbe/threlter
- **Stars:** 103 | **Last commit:** 2024-02-02 | **License:** none specified
- **Stack:** Threlte + SvelteKit + Rapier physics + GLTF assets
- **What it is:** A full Threlte+Rapier racing game by one of Threlte's core maintainers. The most complete public reference for building an actual game (not a demo) on the exact stack. Covers asset pipeline, vehicle physics, scene graph, UI overlay, audio.
- **Forkability: 2/5** — Closest real-world Threlte game on GitHub; clone it for the project layout and physics wiring even if you rip out the racing.

### Threlte ball-game — flo-bit/ball-game
- **URL:** https://github.com/flo-bit/ball-game
- **Stars:** 13 | **Last commit:** 2024-01-31 | **License:** none specified
- **Stack:** Threlte + SvelteKit + Rapier
- **What it is:** WIP marble game with low-poly aesthetic — the closest mechanic match to a player rolling/walking on a small curved world. Small enough to read end-to-end in an hour.
- **Forkability: 2/5** — Niche but mechanically adjacent; great for studying ball-on-surface physics and stylized lighting. Note: no license, so study only — don't ship from it.

### pmndrs/racing-game — pmndrs/racing-game
- **URL:** https://github.com/pmndrs/racing-game
- **Stars:** 2,200 | **Last commit:** 2023-02-23 | **License:** MIT
- **Stack:** React + R3F + drei + use-cannon + Zustand + Vite
- **What it is:** The reference open-source R3F game. Complete architecture: input system, HUD, audio bus, settings store, asset loading patterns, Leva debug panel. Stale-ish but the patterns are still canonical.
- **Forkability: 2/5** — If you switch to R3F, this is the architecture to copy. Even on Threlte, the state-management and asset patterns translate directly to Svelte stores.

### Ecctrl — pmndrs/ecctrl
- **URL:** https://github.com/pmndrs/ecctrl
- **Stars:** 703 | **Last commit:** 2025-07-13 | **License:** MIT
- **Stack:** R3F + react-three-rapier (floating-capsule controller)
- **What it is:** A drop-in third-person character controller using a floating rigid-body capsule on top of Rapier — handles slopes, jumping, animations. The algorithm is portable to Threlte; for spherical gravity you swap the constant-down gravity for `normalize(player - planetCenter) * -g`.
- **Forkability: 2/5** — Best single algorithmic reference for "character on a planet." Port the controller logic, not the React.

### R3F + Rapier 3rd-person sample — icurtis1/character-controller-sample-project
- **URL:** https://github.com/icurtis1/character-controller-sample-project
- **Stars:** 35 | **Last commit:** 2025-05-14 | **License:** none specified
- **Stack:** R3F + Rapier + Vite, recent
- **What it is:** Smaller, more readable third-person controller sample than ecctrl — easier to lift the movement logic out of.
- **Forkability: 3/5** — Use as a study companion to ecctrl when you need a simpler reading.

### Three.js gamedev template — SahilK-027/threejs-gamedev-template
- **URL:** https://github.com/SahilK-027/threejs-gamedev-template
- **Stars:** 43 | **Last commit:** 2026-04-12 | **License:** Apache-2.0
- **Stack:** Three.js + Vite, vanilla TS, structured (asset manager, time, sizes, debug, world/camera split)
- **What it is:** A "game architecture" template that handles the boilerplate every Three.js game needs (loader queue, resize, render loop, debug GUI). Actively maintained. Use as the skeleton if you ever drop Svelte and stay plain Vite.
- **Forkability: 2/5** — Cleanest active plain-Vite Three.js base; pair with a thin Svelte UI layer.

### Three.js Vite starter — kekkorider/threejs-starter
- **URL:** https://github.com/kekkorider/threejs-starter
- **Stars:** 195 | **Last commit:** 2024-08-21 | **License:** MIT
- **Stack:** Three.js + Vite + GLSL + Tweakpane
- **What it is:** Minimal, popular Three.js + Vite boilerplate with shader pipeline and tweak panel. Smaller than the template above; better for prototypes.
- **Forkability: 3/5** — Solid baseline if you want a clean slate without game-engine architecture opinions.

### React Three Next starter — pmndrs/react-three-next
- **URL:** https://github.com/pmndrs/react-three-next
- **Stars:** 2,829 | **Last commit:** 2024-06-21 | **License:** MIT
- **Stack:** R3F + Next.js + drei + Tailwind
- **What it is:** The most-starred R3F starter; production-ready scaffolding for an R3F app with HTML/3D split and routing.
- **Forkability: 3/5** — Only relevant if the team pivots from Svelte to React. Strong reference for the dual-canvas (3D scene + 2D UI overlay) pattern, which is what messenger.abeto.co does.

### Low-poly floating island — nextgtrgod/threejs-floating-island
- **URL:** https://github.com/nextgtrgod/threejs-floating-island
- **Stars:** 25 | **Last commit:** 2022-08-12 | **License:** none specified
- **Stack:** Three.js + Vite, GLTF assets
- **What it is:** Aesthetic-only reference for a tiny stylized world — palette, lighting, fog, single-island composition. Closest visual match to the messenger.abeto.co art direction in plain Three.js.
- **Forkability: 4/5** — Don't fork (no license, dated). Study the look: materials, sun light, fog distance, model scale.

## Synthesis

The team's stack (Three.js + Svelte + Vite) maps directly onto **Threlte**, the official Svelte+Three.js wrapper with 3.2k stars and active 2026 commits. Everything else orbits that decision. For an actual game (not a portfolio scene), the only complete public Threlte+Rapier reference is **grischaerbe/threlter** — clone it for project layout, asset loading, scene graph, and physics wiring, then strip the racing logic. Pair it with **flo-bit/ball-game** to see a small stylized rolling-on-surface prototype, since the courier mechanic is essentially "a character glued to a sphere by gravity."

Spherical gravity itself is not a starter you fork — it's a five-line tweak on top of any Rapier character controller. The cleanest source to lift that controller from is **pmndrs/ecctrl** (replace the constant gravity vector with `normalize(playerPos - planetCenter) * -g`), or its smaller sibling **icurtis1/character-controller-sample-project** if you want a more readable starting point.

For architecture inspiration that doesn't depend on Svelte, **pmndrs/racing-game** is still the canonical full-stack open-source R3F game, and **SahilK-027/threejs-gamedev-template** is the most actively-maintained vanilla Three.js+Vite "real game" boilerplate. Visual direction can be cribbed from **nextgtrgod/threejs-floating-island**.

Gap: there is no public open-source "tiny-planet courier" game on GitHub. The team will be combining patterns rather than forking a near-clone.

## Top Picks (TL;DR)
1. **grischaerbe/threlter** — fork for the Threlte+Rapier+SvelteKit project skeleton; closest real game on the exact stack.
2. **pmndrs/ecctrl** — port the floating-capsule controller and swap in spherical gravity for the courier character.
3. **threlte/threlte** (study, don't fork) — depend on the framework and read its `apps/docs` examples; pair with **pmndrs/racing-game** for architecture and **flo-bit/ball-game** for the closest mechanic match.
