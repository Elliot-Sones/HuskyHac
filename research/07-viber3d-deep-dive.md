# viber3d Codebase Deep-Dive

## TL;DR

- viber3d is a **monorepo** whose actual user-facing artifact is the directory `templates/starter/` — only ~750 lines of source. The "spacewars" content is the entire demo; almost nothing is "framework" beyond the dir layout, vite config, and tailwind setup. There is no engine package — the CLI just downloads `templates/starter` via `giget`.
- **Koota ECS is permeating, not ignorable.** The frame loop, input pipeline, camera, player rendering, and React entry point all flow through Koota. `<WorldProvider>` wraps the app, `useWorld()`/`useQueryFirst()` drive what gets rendered, and `useFrame()` calls ECS systems. You can rip it out, but you'll be deleting roughly half the starter — at which point the value-add over a fresh `npm create vite` + R3F install is small.
- The `.cursor/rules` are R3F-generic on the surface but **prescriptive about ECS** ("Use Koota ECS for all game logic"; "Do not place game logic in React hooks"). They actively conflict with our dialogue-driven, audio-event-driven, voice-WebRTC architecture. Combined with the trivial scaffolding value, the right move is to copy the parts we want (vite config, tailwind setup, GLB-loading pattern) into a clean R3F project rather than fork.

## Project structure

```
viber3d/
├── packages/
│   ├── viber3d/              # The npm CLI (`viber3d init`)
│   │   ├── src/index.ts      # citty + giget downloader (~425 LOC)
│   │   └── template/         # README.md.mustache only — NOT the starter
│   └── core/                 # Stub: index.ts (5 LOC), unused
├── templates/
│   ├── starter/              # ★ what `npx viber3d init` ships
│   └── starter-next/         # Experimental, near-identical
├── docs/viber3d-docs/        # Nuxt content site (not part of starter)
├── scripts/release.ts
├── public/images/            # Repo banner only
└── package.json              # pnpm workspace root

templates/starter/
├── src/
│   ├── main.tsx              # ReactDOM root + <WorldProvider>
│   ├── app.tsx               # <Canvas> + lights + Renderers + GameLoop
│   ├── world.ts              # createWorld(Time, SpatialHashMap)
│   ├── startup.tsx           # spawnPlayer/spawnCamera on mount
│   ├── frameloop.ts          # useFrame -> Koota systems
│   ├── actions.ts            # createActions (spawn helpers)
│   ├── styles.css
│   ├── components/           # camera-renderer, player-renderer, postprocessing
│   ├── systems/              # 10 systems (input, movement, camera, etc.)
│   ├── traits/               # 10 traits (Transform, Movement, IsPlayer, etc.)
│   ├── utils/                # between, sort-by-distance, spatial-hash
│   └── assets/ships/         # fighter.glb, enemy.glb
├── public/                   # favicon only
├── docs/                     # tasklist.yaml + 18 spacewars story .md files
├── .cursor/rules/            # 8 .mdc rule files
├── package.json, vite.config.ts, tsconfig.json, eslint.config.js
└── index.html
```

## Koota ECS — verdict: PERMEATING

The render loop, input layer, and scene composition all depend on Koota. Evidence:

`src/main.tsx:6-12` — the root mounts a Koota world provider before anything renders:
```tsx
import { WorldProvider } from 'koota/react';
import { world } from './world';
ReactDOM.createRoot(...).render(<WorldProvider world={world}><App /></WorldProvider>);
```

`src/frameloop.ts:1-19` — the entire R3F frame callback is "call ECS systems":
```tsx
const world = useWorld();
useFrame(() => { updateTime(world); updatePlayerRotation(world); syncView(world); });
```

`src/components/player-renderer.tsx:42-44` — what's rendered is gated by an ECS query:
```tsx
const player = useQueryFirst(IsPlayer, Transform);
return player ? <PlayerView entity={player} /> : null;
```

`src/components/camera-renderer.tsx:19-23` — the camera is the same: queried from the world, registered back via `entity.add(Ref(camera))`. Transform changes propagate through `syncView()` (`src/systems/sync-view.ts:5-9`), which reads `Transform` and writes to a stored Three.js `Object3D` ref.

`src/systems/poll-input.ts:43-119` — keyboard, mouse-delta, and pointer-lock are all pushed into a Koota `Input` trait via `world.query(IsPlayer, Input).updateEach(...)`.

So: the player mesh, camera, transform sync, and input handling are all ECS-driven. To ignore Koota you'd delete `world.ts`, `frameloop.ts`, every file in `systems/`, every file in `traits/`, the `WorldProvider` wrap, and rewrite `player-renderer.tsx` + `camera-renderer.tsx` without `useQueryFirst`. That's most of the starter.

The flip side: nothing in the framework *itself* (vite config, tailwind plugin, tsconfig, GLB asset pipeline) requires Koota. The Koota dependency is purely in user-space `src/`.

## Spacewars demo — keep/delete list

The demo IS the starter. Every gameplay file is space-shooter-coded.

**DELETE (spacewars-specific or unused for our use-case):**
- `src/assets/ships/fighter.glb`, `src/assets/ships/enemy.glb`
- `src/systems/poll-input.ts` (WASD + pointer-lock + mouse-yaw — flight controls)
- `src/systems/apply-input.ts` (boost/brake/roll → velocity)
- `src/systems/apply-force.ts`, `limit-speed.ts`, `move-entities.ts` (velocity integration)
- `src/systems/camera-follow-player.ts` (chase cam)
- `src/systems/update-player-rotation.ts` (autospin demo)
- `src/systems/update-spatial-hashing.ts`, `src/utils/spatial-hash.ts`, `src/utils/sort-entities-by-distance.ts`, `src/traits/spatial-hash-map.ts`, `src/traits/maxSpeed.ts`, `src/traits/movement.ts`, `src/traits/input.ts` (collision broad-phase for projectiles/enemies)
- `src/components/postprocessing.tsx` (defined but **not imported** in `app.tsx` — already dead code)
- `src/components/player-renderer.tsx`, `src/components/camera-renderer.tsx` (load fighter.glb, autorotate)
- `src/actions.ts` (spawnPlayer/spawnCamera)
- `src/startup.tsx` (calls those spawn actions)
- `src/frameloop.ts` (calls the spacewars systems)
- `src/world.ts` (creates the Koota world)
- `docs/stories/*` (18 .md files — laser firing, missile system, boss battles, etc.)
- `docs/tasklist.yaml`

**KEEP (genuine framework / scaffold):**
- `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`
- `package.json` (with the dependency strip below)
- `src/main.tsx` (after stripping `<WorldProvider>`)
- `src/app.tsx` (after stripping system Renderers — keep the `<Canvas>` + lights pattern as reference)
- `src/styles.css`, `src/vite-env.d.ts`
- `public/favicon.{ico,png}`
- `.cursor/rules/002-components.mdc` and `007-tailwind.mdc` (only ones not ECS-coupled)

That's roughly **15 files KEEP, 25+ files DELETE**. The kept files are mostly config — i.e. you can recreate them in 10 minutes from `npm create vite@latest` + a tailwind install.

## .cursor/rules — what they enforce

Eight rule files in `templates/starter/.cursor/rules/`:

- **001-base.mdc** (alwaysApply: true) — "Use Koota ECS for all game logic. Keep React components purely presentational. Do not mix ECS logic and React rendering." Lays out the directory structure as canonical. **This rule is generic R3F+ECS, not space-shooter-specific, but it presupposes the ECS architecture we want to skip.**
- **002-components.mdc** — R3F component conventions; recommends `useTraitEffect(entity, Trait, cb)` for visual updates. ECS-coupled.
- **003-systems.mdc** — System purity, `world.query(...).updateEach(...)`, delta-time discipline. ECS-only.
- **004-actions.mdc** — `createActions((world) => ({ spawnEnemy: ..., damageEntity: ... }))`. ECS-only, but `spawnEnemy`/`damageEntity` examples leak the genre.
- **005-traits.mdc** — Trait schema patterns, SoA vs AoS, relations. ECS-only.
- **006-utils.mdc** — Reuse Vector3, spatial partitioning, math utilities. Mostly generic Three.js perf tips.
- **007-tailwind.mdc** — Generic Tailwind v4 utility-class style guidance. **Reusable for us.**
- **900-game-agent.mdc** — "Levin AI Agent" persona; tells Cursor to walk through `docs/tasklist.yaml` and implement spacewars stories one by one. **Hard-wired to the demo's task list — delete.**

Verdict: **mostly generic R3F+Koota rules with no space-shooter wording in 001/002/003/005/006/007**, but the whole rule set assumes ECS-first development, which our voice-driven dialogue scenes don't need. Rule 900 is overtly demo-specific. Net: keep 002 and 007, delete the rest, write our own rules for dialogue/voice/scene-config patterns.

## Dependencies — strip candidates

From `templates/starter/package.json`:

| Dep | Verdict | Reason |
|---|---|---|
| `@react-three/fiber` ^8.17 | **KEEP** | Core renderer. Note: v8 (not v9). |
| `@react-three/drei` ^9.120 | **KEEP** | We need `Environment` (HDRI), `useGLTF`, `useAnimations`, `Html`. |
| `three` ^0.173, `@types/three` | **KEEP** | Required. |
| `react` ^18.3, `react-dom` ^18.3 | **KEEP** | (README claims React 19, package.json shows 18 — README lies.) |
| `tailwindcss` + `@tailwindcss/vite` ^4.0.9 | **KEEP** | Tutor card UI. |
| `vite` ^6.2, `@vitejs/plugin-react-swc` | **KEEP** | Build. |
| `koota` ^0.1.12 | **DROP** | We don't want ECS. |
| `@react-three/rapier` ^1.5 | **DROP** | Listed but **never imported anywhere in src/**. Dead dep. |
| `@react-three/postprocessing` ^2.16 | **DROP** | Imported only in `components/postprocessing.tsx`, which `app.tsx` never references. Dead. |
| `leva` ^0.10 | **DROP** | Debug GUI. Not in src/. Dead. |
| `react-animated-counter` ^1.7 | **DROP** | Score-counter UI for the demo. Not in src/. Dead. |
| `typescript-eslint` (in deps AND devDeps) | **FIX** | Belongs only in devDeps; duplicate listing. |

Stripping the four dead deps + Koota cuts the install size meaningfully and removes any ECS lock-in. Net runtime: R3F + drei + three + tailwind. We'll add `openai` (or `@openai/realtime-api-beta`) and a TalkingHead-equivalent later.

## CLI vs fork — recommendation

What `npx viber3d@latest init` actually does (`packages/viber3d/src/index.ts:31, 207-213`):

```ts
const DEFAULT_TEMPLATE = 'gh:instructa/viber3d/templates/starter';
await downloadTemplate(templateSource, { dir: root, force: shouldForce });
```

It calls `giget`'s `downloadTemplate` against the GitHub path `gh:instructa/viber3d/templates/starter`. So the CLI is just `giget`-fetches-the-templates-dir + a README mustache substitution + `npm install` + `git init`. The published CLI is **0.0.6**, last released a year ago, depends on giget v2 — non-load-bearing.

**You get the same files either way.** Differences:

- `npx viber3d init` gives you only `templates/starter/` contents (no monorepo, no docs, no CLI source) and runs `npm install` for you.
- `git clone` gives you the whole monorepo (CLI source + docs + both starters). You'd then `cp -R templates/starter ~/HuskyHac && rm -rf .git && git init`.

**Recommendation: do neither — copy by hand.** The starter is ~750 lines. After the deletions above, you'd keep maybe 4-5 files (config + main.tsx skeleton + tailwind + vite). Faster path:

```bash
npm create vite@latest huskyhac -- --template react-ts
cd huskyhac && npm i three @react-three/fiber @react-three/drei tailwindcss @tailwindcss/vite
```

Then crib `vite.config.ts` (2 lines: react + tailwind plugins) and the `<Canvas>` skeleton from `app.tsx` as reference. You won't owe Koota, the CLI maintainer, or a year-old npm package anything. **If you must pick CLI vs fork, fork** — you want to read the docs/cursor-rules/CLI source to crib patterns, and the CLI doesn't give you those.

## Integration surface for HuskyHac

| Need | Where it goes | Files to touch |
|---|---|---|
| HDRI background | Inside `<Canvas>` in `app.tsx`. drei's `<Environment files="/hdri/x.hdr" background />` — already available since drei is included. | `src/app.tsx`; drop HDR file in `public/hdri/`. |
| GLB character + idle anim | New `src/components/npc.tsx` modeled on `player-renderer.tsx` pattern (uses `useGLTF`). For animation: drei's `useAnimations(scene.animations, group)` then `actions.Idle?.play()` in a `useEffect`. | New `src/components/npc.tsx`; assets in `src/assets/characters/` or `public/characters/`. |
| OpenAI Realtime voice loop | A standalone hook `src/hooks/useRealtimeVoice.ts` — pure React, no R3F dependency. WebRTC's `RTCPeerConnection` + ephemeral token from a serverless endpoint. Mount a single `<VoiceSession />` provider near `<App />` in `main.tsx` so audio context lives outside `<Canvas>`. | New `src/hooks/useRealtimeVoice.ts`, `src/voice/VoiceSession.tsx`, `api/realtime-token.ts` (Vercel/Cloudflare edge fn). |
| Per-scene configs | New `src/scenes/<scene-id>/scene.json` (or `.ts`) declaring `{ hdri, npcGlb, npcAnim, language, prompt, completionTool }`. A `<SceneLoader sceneId>` component reads it and renders accordingly. | New `src/scenes/`, new `src/components/SceneLoader.tsx`. |
| Tutor-card overlay | A normal Tailwind div SIBLING of `<Canvas>` in `main.tsx` (not inside it). Position absolute, pointer-events-auto on the card only. | `src/main.tsx` wrapper + new `src/components/TutorCard.tsx`. |

Note: `src/assets/` works via Vite's `?url` import (see `player-renderer.tsx:7` — `import src from '../assets/ships/fighter.glb?url'`). Either keep that pattern or move large GLBs to `public/` and reference by URL string — `public/` skips bundler hashing, which is friendlier when swapping assets at runtime per scene.

## Gotchas

1. **R3F is v8, not v9.** `@react-three/fiber: ^8.17.12` in `package.json`. The newer drei v9, postprocessing v2, and rapier v1 all peer to R3F v8. TalkingHead (1.2k★) is a vanilla-Three lib, not R3F-specific, so it'll work, but you must mount it on a Three.js `Object3D` you own — adapt drei's `<primitive object={th.scene} />` style. No version conflicts expected, but pin three to ~0.173 because TalkingHead's morph-target paths are version-sensitive.
2. **`PostProcessing.tsx` is imported by nothing.** Don't be misled — it's dead code in the starter, despite having `@react-three/postprocessing` listed. Confirms the dep is droppable.
3. **`@react-three/rapier` is in `package.json` but never imported.** Same pattern. The README oversells features.
4. **README claims React 19; package.json pins React 18.3.** Believe the package.json. Don't get tripped up trying to use React 19 features.
5. **Pointer-lock side-effects on import.** `src/systems/poll-input.ts:38-40` registers `pointerlockchange` listeners at module load time. If you keep any system files, kill this one first — it'll capture the cursor on first keypress, terrible for a voice-chat UI.
6. **TypeScript strict mode + `noUnusedLocals` + `noUnusedParameters`.** `tsconfig.json` is strict. Vendored libs (TalkingHead is vanilla JS, no types) will need a `declare module 'talkinghead'` shim in `vite-env.d.ts`. Cursor rule 001 explicitly says "If we have linter/typescript errors try to not be that restrictive with types" — i.e. they expect this friction.
7. **Audio-driven UI updates and ECS thrash — moot here.** If you keep Koota: each Realtime audio frame triggering `world.set(Trait, ...)` would invalidate queries 60-100×/sec. But since we're dropping Koota, this is a non-issue. Worth noting if you ever reconsider: Koota's `useQueryFirst` re-renders the React component on entity-set changes, which would re-mount the NPC every audio chunk — pathological. Use a `useRef` + `useFrame` for audio→viseme streaming instead.
8. **Static hosting works fine.** `vite build` produces a pure SPA. The OpenAI Realtime token endpoint is the *only* server requirement, and it's a 30-line edge function. No Koota/Three.js piece needs SSR.
9. **CLI is stale (v0.0.6, ~1 year old).** Last published before the templates moved around in the repo. If `gh:instructa/viber3d/templates/starter` ever moves, the CLI breaks silently. Forking or hand-copying is more durable.
10. **`docs/stories/*` is 18 markdown files of demo backlog (laser firing, boss battles, missile system).** If you `cp -R templates/starter`, delete `docs/` immediately or your AI assistants will start "implementing the next story."

## Verdict

**NO — don't fork viber3d as the foundation. Cherry-pick instead.**

The starter is ~750 lines of code, half of which is a Koota ECS layer designed for a fast-action space shooter that conflicts with our dialogue-driven, audio-event-driven, low-entity-count game. The "framework value" — vite config, tailwind plugin, GLB-via-`useGLTF` pattern, R3F `<Canvas>` skeleton — is reproducible in 10 minutes from `npm create vite` + `npm i @react-three/fiber @react-three/drei`. The CLI is a giget-fetcher around the same starter directory; using it locks you to a stale npm package with no extra value over `git clone`.

Concretely: spend 30 minutes scaffolding a clean R3F+Vite+TS+Tailwind project, copy `.cursor/rules/007-tailwind.mdc` and the `useGLTF` import pattern from `templates/starter/src/components/player-renderer.tsx`, and you've extracted everything viber3d offers without inheriting the ECS architecture, the dead deps (`rapier`, `postprocessing`, `leva`, `react-animated-counter`), the spacewars story backlog, or the cursor rules that tell the AI to write systems-and-traits code we don't want.

If forking saves you mental overhead, fork — but plan to delete `src/world.ts`, `src/frameloop.ts`, `src/startup.tsx`, `src/actions.ts`, the entire `src/systems/` and `src/traits/` directories, both renderers in `src/components/`, all assets, all docs, and 6 of 8 cursor rules on day one. At that point you've kept config files only.
