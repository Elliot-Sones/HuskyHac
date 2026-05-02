# Prior Art — 3D + Voice + LLM in the browser

Research date: 2026-05-02. All stars/dates are from this date.

## TL;DR

- **The exact stack you want (R3F + OpenAI Realtime API + 3D character with lipsync) has been built — but only as small, incomplete demos.** The closest prior art is `NavodPeiris/agentic-avatars` (14★, MIT, R3F + Realtime + wawa-lipsync) and `met4citizen/TalkingHead` (1.2k★, MIT, vanilla three.js + Realtime). Together they cover ~90% of HuskyHac's plumbing. **Nobody has built a real game on this stack** — every prior art project is a single talking head on a static background, not a 3D world with a character living in it.
- **Lipsync has commoditized in 2025-2026.** `wawa-lipsync` (browser-only, Web Audio AnalyserNode → visemes, no server) is the new default for R3F projects and is what HuskyHac should use. Rhubarb (the older `wass08/r3f-virtual-girlfriend` approach) is dead — it requires a pre-baked TTS pipeline incompatible with realtime audio streaming.
- **The white space is the *game* layer.** Everyone built chat UIs with a floating head; nobody built movement, environments, NPCs-as-characters, language-learning structure, or anything that uses viber3d's ECS. HuskyHac's contribution isn't the voice avatar — that's a solved component to assemble. It's putting that avatar inside a navigable 3D world with a learning loop.

## Closest matches (rank ordered)

### 1. NavodPeiris/agentic-avatars — https://github.com/NavodPeiris/agentic-avatars
- 14★ / last commit Apr 16 2026 / MIT / **TypeScript R3F**
- Stack: R3F ≥9, three.js ≥0.160, drei ≥10, **OpenAI Realtime API over WebRTC**, Deepgram, ElevenLabs, Vapi, LiveKit (multi-provider adapter), **wawa-lipsync** for visemes
- Demo: none published
- Done well: clean adapter hook pattern (`useOpenAIAdapter`, `useDeepgramAdapter`) abstracts provider; ephemeral session-key minting on backend; ships 3 prebuilt avatars (Jane/Fiona/Sam) with face rigs via jsDelivr; embeddable as a single component
- Missing/wrong: tiny user base (14★, no battle-testing), only 3 avatars, hard-coded 600s session timeout, no body/locomotion, no environment, no game logic, no live demo to verify
- Forkability: **2/5** — fork the adapter hooks and OpenAI Realtime + wawa-lipsync wiring; don't adopt as a dependency (too new, too small a maintainer base). Copy the patterns.
- Lessons for HuskyHac: this is the cleanest reference for the exact integration you need. Read `useOpenAIAdapter` first.

### 2. met4citizen/TalkingHead — https://github.com/met4citizen/TalkingHead
- 1.2k★ / v1.7.0 Dec 2025 / MIT / **vanilla three.js (no R3F)**
- Stack: three.js, Oculus 15-viseme blendshapes, language modules (EN/DE/FR/FI/LT) for word→viseme, **explicit OpenAI Realtime over WebRTC support** plus Azure/Google/ElevenLabs/local llama.cpp/whisper.cpp
- Demo: `/examples` includes `minimal.html`, Azure blendshapes, Azure audio streaming, and a Realtime API example
- Done well: most mature lipsync engine on the web; multi-language phoneme dictionaries (this matters for a language tutor); audio-driven viseme detection (HeadAudio module) when no transcript exists; production-quality Oculus blendshapes
- Missing/wrong: vanilla three.js, no R3F bindings — wrapping it inside an R3F component is non-trivial (uses imperative scene API); UI assumes single floating avatar
- Forkability: **3/5** — wrap the avatar class inside an R3F `<primitive>` or port the viseme/phoneme tables. The phoneme dictionaries alone are worth lifting for non-English support.
- Lessons for HuskyHac: if you need phoneme-accurate lipsync for languages other than English, copy met4citizen's word→viseme tables. wawa-lipsync only does audio amplitude analysis; TalkingHead does linguistically-aware visemes.

### 3. wass08/r3f-virtual-girlfriend (frontend + backend) — https://github.com/wass08/r3f-virtual-girlfriend-frontend
- 152★ / no license / ~18 months stale / **R3F**
- Stack: R3F + Vite + Tailwind, GPT chat completions + Whisper STT, ElevenLabs TTS, **Rhubarb Lip Sync (offline binary)**, expressions and animation states (Idle/TalkingOne/Sad/Angry/Surprised…)
- Demo: https://r3f-virtual-girlfriend.wawasensei.dev/
- Done well: clean React structure; expression+animation enum returned in JSON from the LLM is a reusable pattern
- Missing/wrong: **no license = legally untouchable for HuskyHac**; Rhubarb requires offline TTS audio file → phoneme-JSON pipeline (incompatible with streaming realtime); pre-realtime-API era; same author later replaced this approach with wawa-lipsync
- Forkability: **5/5 (study only)** — copy the LLM-returns-structured-JSON-with-expression+animation idea, nothing else
- Lessons for HuskyHac: the structured-output pattern (LLM returns `{text, facialExpression, animation}`) survives even though Rhubarb doesn't. Realtime API can do the same via tool calls or response schema.

### 4. asanchezyali/talking-avatar-with-ai — https://github.com/asanchezyali/talking-avatar-with-ai
- 431★ / last commit Jan 16 2026 / license unspecified / **R3F**
- Stack: R3F, GPT-3 davinci (outdated), Whisper STT, ElevenLabs TTS, Rhubarb lipsync; same expression+animation enum pattern as wass08
- Done well: most-starred R3F talking-avatar repo; clean two-flow architecture (text or audio input); structured response with 6 expressions + 9 animations
- Missing/wrong: pre-realtime; Rhubarb pipeline introduces ~3-5s latency; license missing
- Forkability: **3/5** — replace TTS+Rhubarb with Realtime+wawa-lipsync; keep the animation/expression state machine
- Lessons for HuskyHac: validates the "LLM returns structured response with animation tags" pattern at scale. Steal the animation list.

### 5. moeru-ai/airi — https://github.com/moeru-ai/airi
- 38.9k★ / v0.9.0 Apr 10 2026 / MIT / **Vue + three.js + WebGPU** (NOT R3F)
- Stack: VRM + Live2D, ElevenLabs TTS, client-side speech recognition, xsAI multi-provider (OpenAI/Claude/Ollama/Gemini + 20 more), WebGPU/WebAudio/WebWorkers/WASM/WebSocket — fully web-native
- Demo: https://airi.moeru.ai
- Done well: shows the full architecture of a serious AI companion at scale; cross-platform PWA + desktop; plays Minecraft/Factorio via screen capture (interesting precedent for "AI in a 3D world")
- Missing/wrong: Vue, not React; not R3F; primarily VTuber/companion framing, not language learning or game
- Forkability: **1/5** — too different a stack to fork directly
- Lessons for HuskyHac: study how AIRI structures memory/personality config and how it does multi-provider abstraction. The "AI as game-playing companion" framing legitimizes putting an AI character inside a game world rather than next to it.

### 6. danieloquelis/chat-avatar-ai — https://github.com/danieloquelis/chat-avatar-ai
- 9★ / MIT / **R3F**
- Stack: Next.js 15 + R3F + drei, OpenAI chat, ElevenLabs TTS, Rhubarb lipsync, gltfjsx for GLB→JSX conversion
- Demo: https://chat-avatar-ai.vercel.app
- Lessons for HuskyHac: validates Next.js 15 + R3F + drei as a production stack. Avoid Rhubarb.
- Forkability: 2/5

### 7. kiranbaby14/TalkMateAI — https://github.com/kiranbaby14/TalkMateAI
- 73★ / MIT / **Next.js + TalkingHead (vanilla three.js)**
- Stack: FastAPI WebSocket backend, OpenAI Whisper-tiny, SmolVLM2 (vision), Kokoro TTS, TalkingHead
- Done well: Kokoro provides word-level timing → "perfect lipsync" without phoneme baking; multimodal (camera input → vision LM)
- Missing/wrong: Windows-only, requires RTX 3070+, not browser-native (heavy local model deps)
- Forkability: **2/5** — copy the Kokoro word-timing → TalkingHead viseme bridge if you go non-Realtime
- Lessons for HuskyHac: word-level timestamps from TTS = better lipsync than energy analysis. OpenAI Realtime gives you audio but not word timings — you'll lipsync via wawa (energy-based) instead. Acceptable tradeoff.

### 8. OpenReplicant/ProtoReplicant — https://github.com/OpenReplicant/ProtoReplicant
- 74★ / **vanilla three.js + VRM**
- Stack: VAD → Faster-Whisper → Kobold/AI Horde LLM → Coqui TTS → VRM avatar; drag-and-drop VRM file swap
- Lessons for HuskyHac: the drag-drop-VRM pattern is great UX for letting users pick a tutor avatar.
- Forkability: 2/5

### 9. theringsofsaturn/3d-ai-school-threejs — https://github.com/theringsofsaturn/3d-ai-school-threejs
- 21★ / MIT / **R3F + Express proxy**
- Stack: three.js + R3F + Blender classroom + Mixamo animations + OpenAI API + Express proxy
- Done well: **the only prior art that puts the AI character in an actual environment** (a classroom scene), not a floating head against a background. Closest in *spirit* to HuskyHac.
- Missing/wrong: no realtime API, no lipsync (just chat), small repo, low polish
- Forkability: **3/5** — fork the scene structure (environment + character + UI overlay layout), replace the AI plumbing with Realtime+wawa
- Lessons for HuskyHac: this is the visual template. Look at how it composes the classroom + teacher + chat overlay.

### 10. mascotbot-templates/openai-realtime-avatar — https://github.com/mascotbot-templates/openai-realtime-avatar
- 0★ / MIT / **Next.js + Rive (2D, not 3D)**
- Stack: `@openai/agents-realtime` SDK, custom WebSocket factory routing through `api.mascot.bot` proxy that **injects viseme data into the OpenAI audio stream server-side**
- Lessons for HuskyHac: clever architecture — proxy intercepts Realtime audio and emits visemes alongside it. If wawa client-side analysis isn't accurate enough, this is the alternative pattern (server-side audio analysis injected into the WebSocket).
- Forkability: 2/5 (Rive is 2D)

## Adjacent (voice agents WITHOUT 3D, or 3D characters WITHOUT voice/LLM)

- **openai/openai-realtime-agents** (6.8k★, MIT) — Next.js, agentic patterns (chat-supervisor, sequential handoffs), audio + text only, no avatar. Reference architecture for multi-agent realtime, but no visual layer. https://github.com/openai/openai-realtime-agents
- **openai/openai-realtime-console** — official debug/inspector React app for the Realtime API. Use as boilerplate for the audio plumbing. https://github.com/openai/openai-realtime-console
- **livekit-examples/agent-starter-react** — production frontend for LiveKit agents; supports Tavus avatars (rendered video, not 3D mesh) via plugin. Stack mismatch for HuskyHac but well-built reference for voice agent UI. https://github.com/livekit-examples/agent-starter-react
- **Open-LLM-VTuber** (Live2D, not 3D) — FastAPI + React + Vite + ChakraUI; modular ASR/TTS/LLM swap; the transform pipeline (`@sentence_divider`, `@actions_extractor`, `@display_processor`, `@tts_filter`) is a great reference for streaming-LLM-to-character. https://github.com/Open-LLM-VTuber/Open-LLM-VTuber
- **wass08/wawa-lipsync** — the lipsync library you should use. Browser-only, no server, MIT. Web Audio AnalyserNode → visemes. https://github.com/wass08/wawa-lipsync
- **khaledalam/avatoon** (9★, MIT) — minimal R3F lipsync component using phoneme-viseme JSON timing. Useful as a tiny reference implementation if you ever pre-bake audio.
- **wass08/r3f-vite-starter** — clean R3F+Vite boilerplate from the same author as the virtual girlfriend repo.
- **AgoraIO-Community/RPM-agora-agent** — Ready Player Me avatars + Agora ConvoAI + lipsync; hosted on Agora's stack, not directly forkable but documents an RPM+voice-agent pipeline.
- **Praktika** (closed source, mobile only) — the actual product HuskyHac would compete with for mindshare in 3D-avatar language tutoring. GPT-5.2-driven, multi-agent, 9 languages. Confirms there's a real market; nobody has shipped a browser/web version.

## Patterns observed across all prior art

**Recurring choices that work:**
1. **Provider-adapter abstraction** — every serious project (agentic-avatars, AIRI, Open-LLM-VTuber) abstracts STT/LLM/TTS behind interfaces. Don't hardcode OpenAI.
2. **Ephemeral session keys minted server-side** — universal pattern for Realtime API. Required.
3. **LLM returns structured JSON with `{text, expression, animation}`** — appears in wass08, asanchezyali, and several derivatives. Survives the move to Realtime via response schemas / tool calls.
4. **R3F + drei + Vite/Next.js + TypeScript + Tailwind** — the consensus stack for new projects. Viber3d already matches this.
5. **Idle / Talking / Listening / Thinking animation states** — every project ships a small enum of these. You'll need the same.
6. **Drag-and-drop GLB or VRM avatar swap** (ProtoReplicant) — nice UX for letting users pick a tutor.

**Recurring failures:**
1. **Rhubarb pipeline** — nearly every pre-2025 project uses it; it's incompatible with streaming. Dead pattern.
2. **Floating-head-on-flat-background** — almost every project. Visually boring and doesn't use 3D for anything 3D is good at.
3. **No license** (wass08, asanchezyali) — kills forkability. Set yours upfront.
4. **One avatar, one scene, no game loop** — every project is a tech demo, not a product.
5. **No memory / no progress tracking** — no project tracks user state across sessions. For language learning this is mandatory and unsolved.
6. **Latency from chained TTS+lipsync-bake** — only Realtime+wawa or Kokoro-with-word-timings sidesteps this. Use Realtime.

## What's still unsolved (the white space)

Nobody in the prior art has built any of these — these are HuskyHac's defensible contributions:

1. **A 3D *world*, not a 3D head.** Every prior art is a bust shot of a character against a background. HuskyHac inside viber3d means a navigable environment where the tutor exists somewhere — a cafe, a classroom, a market — and you walk up to them. That alone is a category leap.
2. **Multiple characters in one scene.** Convai/Inworld do this in Unity/Unreal. Nobody does it browser-native. NPCs-as-language-partners with different voices, accents, personalities, in the same scene.
3. **Movement + voice as a learning mechanic.** Walking to the bakery NPC to order bread *in target language*. The 3D world becomes a comprehension scaffold. No prior art uses navigation as language pedagogy.
4. **Persistent learning state across sessions.** No prior art tracks SRS / vocabulary / progress. Praktika does, but closed-source/mobile.
5. **Realtime API + viber3d ECS integration.** Nobody has wired Realtime audio events into a Koota ECS. The pattern (audio stream → component on entity → behavior tree) doesn't exist yet.
6. **Phoneme-correct lipsync for non-English in R3F.** met4citizen/TalkingHead does it for vanilla three.js. wawa does energy-only for R3F. Bridging TalkingHead's phoneme tables into an R3F component is genuinely new work and useful for the language-learning angle.
7. **Open-source, MIT, web-native language tutor.** Praktika is the best closed product; nothing open-source competes. This is a real wedge.

## Specific code/patterns to steal

1. **From `NavodPeiris/agentic-avatars`**: copy the `useOpenAIAdapter` hook structure and the ephemeral-key backend route. This is the cleanest R3F + Realtime API + wawa-lipsync wiring in existence.
2. **From `met4citizen/TalkingHead`**: lift the word-to-viseme tables for non-English languages (EN/DE/FR/FI/LT shipped). Wrap the avatar class in an R3F `<primitive>` if you need linguistic visemes; otherwise stick with wawa.
3. **From `wass08/r3f-virtual-girlfriend` and `asanchezyali/talking-avatar-with-ai`**: copy the structured-LLM-response shape `{text, facialExpression, animation}` and the animation enum (Idle / TalkingOne / TalkingThree / Thinking / Listening / Surprised / etc). Implement as a Realtime tool call or JSON-schema response.
4. **From `theringsofsaturn/3d-ai-school-threejs`**: copy the *scene composition* — environment + animated character + chat overlay layout. Closest visual template for what HuskyHac will look like.
5. **From `mascotbot-templates/openai-realtime-avatar`**: keep the proxy-injects-visemes pattern in your back pocket. If wawa-lipsync's energy-analysis quality isn't good enough, server-side audio analysis injected into the WebSocket is the documented escape hatch.
6. **From `Open-LLM-VTuber`**: study the four-stage transform pipeline (`sentence_divider → actions_extractor → display_processor → tts_filter`). For Realtime, you can implement the same idea as Realtime event handlers that emit ECS components.
7. **From `OpenReplicant/ProtoReplicant`**: drag-and-drop VRM/GLB to swap avatar. Cheap, useful, fun.
8. **AVOID Rhubarb Lip Sync.** Pre-streaming-era pattern. Every project still using it is dated. Use `wawa-lipsync` (R3F-friendly, MIT, browser-only, by the same author who deprecated his own Rhubarb project).
9. **AVOID building yet another floating-head demo.** That's table stakes; the world doesn't need another. The 3D *environment* is the differentiator — that's what viber3d gives you and what nobody else has.
10. **AVOID Vue/Live2D paths** even when popular (AIRI, Open-LLM-VTuber). React + R3F + 3D-mesh-with-blendshapes is your lane and the prior-art evidence supports it.
