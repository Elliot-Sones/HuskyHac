# Fastest-Wow Strategy: 3D Language-Learning World

Date: 2026-05-02

## Goal

Build a browser app where a player chooses where they want to land, arrives in a place like France, and practices the target language through a short playable sequence:

1. Country picker / globe.
2. Arrival cinematic.
3. Airport NPC conversation.
4. Taxi or bus NPC conversation.
5. Cafe NPC conversation.
6. Storyboard recap of what happened, what the player said, and what to practice next.

The product should feel like a small explorable world, not a flat chatbot. It should ship fast enough for a hackathon-style build.

## Executive Recommendation

Build a web-native 3D "language travel diorama":

- Frontend: SvelteKit + Threlte + Three.js, because the reference site is Svelte + Three.js and Threlte is the natural Svelte wrapper.
- World style: low-poly / cozy travel diorama with panoramic 360 scenes for speed, not fully modeled airports.
- Interaction model: limited free-roam in a hub or scene, then proximity-triggered NPC conversations.
- Conversation brain: OpenAI Realtime WebRTC for live speech-to-speech if we want maximum wow; text + push-to-talk STT/TTS fallback if Realtime is too much for the first sprint.
- Story engine: a deterministic scenario graph, not pure freeform LLM. The LLM plays each NPC inside the graph.
- Assessment: structured JSON feedback after each scene: task completion, grammar notes, phrase suggestions, and next scene.

The fastest impressive version is not a full MMORPG. It is three beautiful "rooms" with motion, voice, NPCs, and a strong quest loop.

## What The Reference Site Appears To Use

Direct bundle inspection of `https://messenger.abeto.co/` shows:

- Vite-style module entrypoint with `window.__webgl.start()`.
- Svelte runtime in the bundle.
- Three.js bundled in the main 3D chunk, including `REVISION="180"`.
- Full-screen `#app` / `#webgl` canvas styling.
- WebGL2 unsupported fallback copy.

So the reference is a web-native Svelte + Three.js/WebGL app. It is not proof that it uses Threlte specifically, but Threlte is the closest idiomatic way to build the same kind of app in Svelte.

## The Core Insight

Existing products split into two camps:

- Immersive but scripted: Mondly VR, Noun Town, ImmerseMe. They have 3D or 360 immersion, but conversations are canned.
- Smart but flat: Speak, Duolingo Max, Talkpal, Quazel/Univerbal, Praktika. They have LLM conversation, objectives, memory, and voice, but mostly live in chat or 2D avatar UIs.

The gap is obvious: a browser-native 3D space with live LLM NPCs and language-learning objectives. That is the "wow."

## Fastest Build Shape

### Vertical slice

Pick one country and one language for v1. France/French is the obvious story match:

- Arrival: passport / airport sign / baggage.
- Taxi: ask for destination, ask price, confirm payment.
- Cafe: order coffee and food, ask for recommendation, pay.

### Player-facing loop

1. Choose destination: France.
2. Watch a 10-20 second arrival transition.
3. Run around a small scene.
4. Approach highlighted NPC.
5. Speak or type in French.
6. NPC responds in French at the player's CEFR level.
7. Hidden objective checklist advances.
8. Scene completes when 3 objectives are done.
9. Storyboard recap appears after each scene.

### "Wow" moments

- The plane / globe arrival transition.
- NPC speaks back with audio.
- NPC captions highlight your successful phrase.
- World changes after success: color returns, lights turn on, cafe sign animates, passport stamp appears.
- End storyboard looks like a comic strip of your trip, using the actual transcript.

## Recommended Architecture

```text
SvelteKit app
+-- 3D world shell
|   +-- Threlte / Three.js canvas
|   +-- scene registry: airport, taxi, cafe
|   +-- player controller
|   +-- NPC trigger zones
|   +-- cinematic camera paths
+-- scenario graph
|   +-- country config
|   +-- scene config
|   +-- NPC persona
|   +-- CEFR target
|   +-- required objectives
|   +-- allowed tool calls
+-- conversation runtime
|   +-- text chat fallback
|   +-- push-to-talk fallback
|   +-- Realtime WebRTC live voice mode
+-- feedback runtime
|   +-- structured grammar/tutor JSON
|   +-- objective completion state
|   +-- storyboard summary state
+-- persistence
    +-- localStorage for hackathon
    +-- database later for accounts/progress
```

## Scene Rendering Options

### Option A: 360 panorama + 3D NPCs

Best for speed.

Use equirectangular HDRIs or Skybox-style 360 images as the scene background, then place 3D NPCs and a few foreground props in front. The player can rotate / move slightly, but the art workload stays tiny.

Pros:

- Highest wow per hour.
- Five scenes can be assembled fast.
- Real-world imagery gives instant cultural context.
- Works perfectly for dialogue-driven scenes.

Cons:

- Not true open-world free-roam.
- Movement is more like "small stage" than full level.

Use this for the first build.

### Option B: low-poly asset-pack scenes

Use Kenney, Quaternius, KayKit, Poly Pizza, or Synty-style packs to build small walkable scenes.

Pros:

- Real run-around gameplay.
- Consistent cozy style.
- Easier to make a tiny planet / diorama.

Cons:

- More scene-composition time.
- Airports and cafes need many props.
- Mixed packs can clash visually.

Use this for the hub and any one hero scene if time allows.

### Option C: AI-generated 3D props

Use AI 3D tools only for missing props or hero objects, not full scenes.

Pros:

- Can generate specific things like "Paris cafe sign" or "airport kiosk."

Cons:

- Mesh cleanup and file size can eat the schedule.
- Visual consistency is unreliable.

Use sparingly.

### Option D: 2.5D parallax illustrations

Generate or draw stylized background art, slice into depth layers, and move the camera for parallax.

Pros:

- High art ceiling.
- Faster than full 3D if someone has visual taste.

Cons:

- Less "run around."
- Needs manual art direction.

Good backup for storyboard panels, not the main world.

## Similar Projects And How To Use Them

### 3D web engine references

- Threlte: `https://github.com/threlte/threlte`
  - Use as dependency and pattern source for Svelte + Three.js.
- Threlter: `https://github.com/grischaerbe/threlter`
  - Study for full Threlte + Rapier game wiring.
- pmndrs/racing-game: `https://github.com/pmndrs/racing-game`
  - Study for full web-game architecture and state patterns.
- pmndrs/ecctrl: `https://github.com/pmndrs/ecctrl`
  - Study character-controller logic if using React Three Fiber or porting to Threlte.
- SahilK-027/threejs-gamedev-template: `https://github.com/SahilK-027/threejs-gamedev-template`
  - Use as a plain Three.js fallback skeleton.

Do not spend the project trying to fork a full clone of the reference. Use the libraries and copy the architecture patterns.

### Narrative and dialogue references

- Ink: `https://github.com/inkle/ink`
- inkjs: `https://github.com/y-lohse/inkjs`
- Yarn Spinner: `https://github.com/YarnSpinnerTool/YarnSpinner`
- Narrat: `https://github.com/liana-p/narrat-engine`

Recommendation: for v1, do not add a full narrative scripting language unless the team has a writer. A typed JSON scenario graph is faster. Add Ink later if branching authoring becomes important.

### AI NPC references

- AI Town: `https://github.com/a16z-infra/ai-town`
  - Study memory, NPC personas, scheduling, and agent loop patterns. Too much backend for a first prototype.
- Inworld examples: useful as prompt/scene inspiration if available, but avoid vendor lock-in for v1.
- SillyTavern: `https://github.com/SillyTavern/SillyTavern`
  - Study character-card ideas only. AGPL is not a good commercial fork base.

### Voice / talking NPC references

- OpenAI Realtime Console: `https://github.com/openai/openai-realtime-console`
  - Best reference for WebRTC Realtime wiring.
- OpenAI Realtime WebRTC docs: `https://developers.openai.com/api/docs/guides/realtime-webrtc`
  - Confirms browser WebRTC flow, server-minted ephemeral credentials, and data-channel events.
- OpenAI Voice Agents docs: `https://developers.openai.com/api/docs/guides/voice-agents`
  - Confirms speech-to-speech agent flow with ephemeral client secret and WebRTC.
- TalkingHead: `https://github.com/met4citizen/TalkingHead`
  - Study audio-driven talking-avatar/lipsync patterns.
- wawa-lipsync: `https://github.com/wass08/wawa-lipsync`
  - Use if mapping generated speech audio to simple mouth movement.
- r3f-virtual-girlfriend frontend/backend:
  - `https://github.com/wass08/r3f-virtual-girlfriend-frontend`
  - `https://github.com/wass08/r3f-virtual-girlfriend-backend`
  - Study end-to-end 3D character + LLM + STT/TTS wiring.

### Language-learning references

- BabelDuck: `https://github.com/Orenoid/BabelDuck`
  - Closest scenario-based AI conversation tutor reference, but check license before reuse.
- dialekt: `https://github.com/ccarvalho-eng/dialekt`
  - Study CEFR/register/transliteration prompting.
- LibreLingo: `https://github.com/kantord/LibreLingo`
  - Study course/vocab schema, but AGPL means do not mix code into a closed engine.
- sanidhyy/duolingo-clone: `https://github.com/sanidhyy/duolingo-clone`
  - Study progression, XP/hearts/lesson UX.

## What To Copy From Commercial Products

- Mondly VR: airport arrival cinematic, scenario card menu.
- Noun Town: world-state progression tied to learning, relationship meters.
- Speak: three task objectives per scenario.
- Duolingo Max: per-turn prompt routing, graceful conversation wrap-up, recurring character memory.
- Quazel / Univerbal: fill-in-the-blank scene builder: "Talk to [role] about [topic] in [setting]."
- ELSA: color-coded pronunciation / transcript feedback.
- ImmerseMe: real-location cultural authenticity.

## Conversation Design

Each scene should have hidden rails:

```json
{
  "id": "france_airport_arrival",
  "targetLanguage": "French",
  "learnerLevel": "A1",
  "npc": {
    "name": "Camille",
    "role": "airport information agent",
    "voice": "calm, clear, patient"
  },
  "objectives": [
    "greet the agent",
    "ask where the taxi stand is",
    "thank the agent"
  ],
  "allowedTools": [
    "mark_objective_complete",
    "request_hint",
    "complete_scene"
  ],
  "styleRules": [
    "reply in French",
    "use A1 vocabulary",
    "keep responses under two short sentences",
    "correct gently in character"
  ]
}
```

The LLM should not own story progression by prose. It should call scene tools or return structured state.

## Storyboard Generation

Storyboard should be generated after each scene and at the end of the trip.

Inputs:

- Scene ID.
- NPC name and role.
- Objectives completed.
- Transcript snippets.
- Mistakes and corrections.
- Location metadata.

Output:

```json
{
  "panels": [
    {
      "title": "Arriving in Paris",
      "caption": "You asked Camille where the taxi stand was.",
      "targetPhrase": "Ou est la station de taxis ?",
      "correction": "Say: Ou est la station de taxis ?"
    }
  ],
  "nextPractice": [
    "asking for directions",
    "saying thank you politely"
  ]
}
```

Use OpenAI Structured Outputs or equivalent schema enforcement so the UI can render panels reliably.

## MVP Build Plan

### Day 1: playable spine

1. Scaffold SvelteKit + Threlte app.
2. Full-screen canvas with one scene.
3. Player movement or click-to-move in a small area.
4. One NPC with idle animation.
5. Proximity opens conversation panel.
6. Text-only NPC conversation with scenario prompt.
7. Objective checklist updates from structured tool calls.

### Day 2: wow layer

1. Add arrival cinematic.
2. Add voice input/output.
3. Add three scenes: airport, taxi, cafe.
4. Add storyboard recap.
5. Add transcript feedback card.
6. Add visual progression after scene completion.

### Day 3 / polish

1. Add country picker globe.
2. Add more destination configs.
3. Add NPC mouth movement.
4. Add ambient audio and foreground props.
5. Add save/progress.

## Recommended First Prototype

Use France/French only:

- Scene 1: airport help desk.
- Scene 2: taxi stand.
- Scene 3: cafe counter.

Build these as config-driven scenes:

```text
/src/lib/scenarios/france.ts
/src/lib/world/scenes/AirportScene.svelte
/src/lib/world/scenes/TaxiScene.svelte
/src/lib/world/scenes/CafeScene.svelte
/src/lib/conversation/realtime.ts
/src/lib/conversation/scoring.ts
/src/lib/storyboard/generateStoryboard.ts
```

Keep the country system generic, but only ship one country fully.

## Key Technical Decisions

### Use SvelteKit + Threlte unless there is a strong React reason

The reference app is Svelte + Three.js. Threlte keeps the code close to that ecosystem and avoids bringing React just for R3F.

### Use a small scenario graph, not pure LLM planning

Pure LLM worlds drift. A scenario graph gives reliable progress, objectives, and storyboards.

### Start text-first, then add Realtime voice

Text-only proves story and NPC behavior. Realtime voice creates the demo wow. Keeping text fallback protects the build.

### Use 360 scenes first, then low-poly hub later

The user's phrase "run around" matters, but full 3D scene production can consume the schedule. The compromise is:

- run around a small stylized airport/hub,
- enter panorama-backed dialogue scenes for high visual fidelity.

If the team has enough time, convert the airport hub into a true low-poly walkable scene.

### Use structured outputs for scoring and storyboard

Feedback and recap must be predictable JSON, not prose parsing.

## Risks

- Voice latency can wreck perceived quality. Keep text fallback.
- Browser mic permissions can fail during demos. Add type-to-speak mode.
- Full free-roam pathfinding is a trap. Use simple trigger zones.
- AI-generated 3D assets can become cleanup work. Use asset packs and panoramas first.
- Too many languages dilute polish. One language, three scenes, then expand.

## Fastest "Perfect Idea" Pitch

The app is a browser game called something like "Landing." You choose a destination on a globe. The camera dives through clouds and lands in Paris. You can move around a small airport diorama. A glowing objective says: "Find your way to the taxi stand." You walk to Camille, the airport agent, and speak French. She replies out loud, in character. If you say it wrong, she gently rephrases without breaking role. When you succeed, your passport gets stamped and the next scene unlocks. After airport -> taxi -> cafe, the app generates a comic-strip storyboard of your trip using your real transcript, with the exact French phrases to practice again.

This is the fastest route to a demo that feels like a world, teaches language, and has a clear technical path.

## Source Links

- Reference app: https://messenger.abeto.co/
- Threlte: https://github.com/threlte/threlte
- Three.js: https://threejs.org/
- OpenAI Realtime WebRTC: https://developers.openai.com/api/docs/guides/realtime-webrtc
- OpenAI Voice Agents: https://developers.openai.com/api/docs/guides/voice-agents
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI Realtime Console: https://github.com/openai/openai-realtime-console
- AI Town: https://github.com/a16z-infra/ai-town
- Ink: https://github.com/inkle/ink
- inkjs: https://github.com/y-lohse/inkjs
- TalkingHead: https://github.com/met4citizen/TalkingHead
- wawa-lipsync: https://github.com/wass08/wawa-lipsync
- BabelDuck: https://github.com/Orenoid/BabelDuck
- LibreLingo: https://github.com/kantord/LibreLingo
- Mondly VR: https://www.mondly.com/vr
- Noun Town: https://noun.town/
- Speak OpenAI case study: https://openai.com/index/speak-connor-zwick/
- Duolingo Max: https://blog.duolingo.com/duolingo-max/
- Quaternius: https://quaternius.com/
- Kenney 3D assets: https://kenney.nl/assets/category:3D
- Poly Haven HDRIs: https://polyhaven.com/hdris
