# Hidden Starters & Templates — Exhaustive Hunt

Research date: 2026-05-02. Stars / commits as of this date.

## TL;DR — top 5 finds we should evaluate

1. **`openai/openai-realtime-agents`** (6.8k★, MIT, Next.js + TS) — OpenAI's *official* multi-agent Realtime starter. The patterns it ships (chat-supervisor, sequential handoffs over WebRTC, agent graph, tool-call guardrails) are exactly what HuskyHac's tutor + NPC layer should be modelled on. We were looking at `openai-realtime-console`; this is its bigger, agentic sibling and clearly the better base for the *agent* layer.
2. **`livekit-examples/agent-starter-react`** (861★, MIT, Next.js + LiveKit) — production-grade voice frontend with first-class **Tavus / Beyond Presence / Simli / Hedra avatar adapters** baked in. No 3D/R3F, but it solves transports, push-to-talk, transcripts, audio viz, and avatar streaming for free. Probably the cleanest "voice plumbing" base in the ecosystem if we ever drop OpenAI-direct.
3. **`Conv-AI/ThreeJs-World-Tutorial` + `Conv-AI/Convai-Web-SDK` + `Conv-AI/RPM-Lipsync`** (Convai's official org) — the only **R3F + multi-NPC + Convai** reference world that exists. Tutorial repo is archived (Aug 2024) but the Web SDK is alive and ships 60fps blendshape streaming, ARKit/MetaHuman support, and a working Ready-Player-Me lipsync example. Worth pillaging for NPC-as-a-component patterns.
4. **`pixiv/local-chat-vrm`** (Google I/O 2025 demo, MIT, archived) — fully *in-browser* VRM chat using Chrome Built-in AI + Kokoro TTS + `@pixiv/three-vrm`. Validates a $0-infra fallback path (no OpenAI key required for prototyping/free tier). Pair with `zoan37/ChatVRM` and `hoangvu12/ChatVRM` forks for active variants.
5. **`cloudflare/agents` + `examples/elevenlabs-starter` + `examples/voice-agent`** (MIT, Cloudflare official) — 35+ agent examples including a `withVoice` mixin, Deepgram STT, ElevenLabs realtime, and WebSocket persistence on Workers. Cheapest possible deploy path; great if HuskyHac wants edge-first multiplayer-friendly architecture.

---

## High-value finds

### 1. openai/openai-realtime-agents — `openai/openai-realtime-agents`
- 6.8k★ / Next.js + TS / MIT / actively maintained
- WebRTC multi-agent on the Realtime API; chat-supervisor + sequential-handoff agent graph; tool calls + guardrails
- **Effort 2/5** — port to Vite/R3F shell, swap UI surface for our scene; agent logic transplants cleanly. **Forkability 5/5**.

### 2. livekit-examples/agent-starter-react — `livekit-examples/agent-starter-react`
- 861★ / Next.js / MIT
- Voice + transcripts + virtual-avatar streaming integrations (Tavus/Beyond Presence/Simli/Hedra) via LiveKit Agents
- **Effort 3/5** — adds LiveKit dependency, but huge jump in production polish. **Forkability 4/5**.

### 3. livekit-examples/agent-starter-embed — `livekit-examples/agent-starter-embed`
- MIT / embeddable voice-button widget
- Not a full app, but the embedding pattern is what HuskyHac's "drop avatar in landing page" demo needs. **Effort 1/5 / Forkability 4/5**.

### 4. Conv-AI/Convai-Web-SDK — `Conv-AI/Convai-Web-SDK`
- Official Convai SDK; works with three.js / Babylon / Unity WebGL / R3F
- Real-time blendshape streaming at 60fps, ARKit + MetaHuman; multi-language voices/emotions
- **Effort 2/5** for adopt; **Forkability 2/5** (closed-vendor cloud, MIT SDK)

### 5. Conv-AI/ThreeJs-World-Tutorial — `Conv-AI/ThreeJs-World-Tutorial`
- 17★ / archived 2024 / R3F + Convai NPCs in a 3D world
- Only public R3F-multi-NPC reference. Demo: interactive.convai.com
- **Forkability 4/5 (study)** — copy the NPC-as-component pattern; don't depend on archived code.

### 6. Conv-AI/RPM-Lipsync — `Conv-AI/RPM-Lipsync`
- Real-time R3F lipsync on Ready Player Me avatars via Convai
- Fills the exact gap between RPM avatars and viseme streams
- **Effort 2/5 / Forkability 3/5**

### 7. cameronking4/openai-realtime-blocks — `cameronking4/openai-realtime-blocks`
- 113★ / MIT / Next.js + Tailwind + Framer Motion
- 9 pre-built voice-reactive UI components (Siri orb, Dynamic Island, etc.) wired to OpenAI Realtime + WebRTC
- **Effort 1/5 / Forkability 5/5** — drop the orb/connection-state UIs straight into our HUD.

### 8. cameronking4/VapiBlocks — `cameronking4/VapiBlocks`
- MIT / similar to openai-realtime-blocks but for Vapi
- Useful if we ever need a Vapi/Twilio fallback path

### 9. simliai/simli-openai-realtime — `simliai/simli-openai-realtime`
- MIT / Next.js / Simli avatar + OpenAI Realtime mic→video avatar pipeline
- Closest "drop-in talking head over Realtime" template that exists; cloud avatar though, not 3D-in-browser

### 10. simliai/create-simli-app-openai / -elevenlabs / create-simli-agent
- MIT scaffolds for `npx create-simli-app-*`. Useful as reference for ephemeral-key minting and audio-track wiring.

### 11. mascotbot/elevenlabs-avatar — `mascotbot/elevenlabs-avatar`
- MIT / animated avatar + ElevenLabs Conversational AI with **viseme injection over the WS stream** (no Rhubarb step)
- Worth studying their proxy-injection pattern — same trick we'd want with OpenAI Realtime + wawa-lipsync.

### 12. HeyGen-Official/InteractiveAvatarNextJSDemo + StreamingAvatarTSDemo
- Official HeyGen Next.js demos for `@heygen/streaming-avatar` SDK over LiveKit voice transport
- Effort 1/5 to ship a video-avatar variant; closed-vendor.

### 13. Tavus-Engineering/tavus-examples — `Tavus-Engineering/tavus-examples`
- React + TS examples for Tavus CVI (sub-1s utterance latency); includes `cvi-quickstart-react`, `cvi-ui-conversation`, `cvi-ui-haircheck-and-conversation`, `tavus-pipecat-quickstart`, Santa demo
- **Effort 1/5 (clone & ship video avatar) / Forkability 5/5 for patterns**

### 14. aws-samples/sample-voice-ai-tavus-avatar-demo
- AWS official sample: Tavus avatar + tool calls that overlay diagrams during conversation. Good "tool-call surfaces visual" pattern for HuskyHac's pop-up vocab cards.

### 15. anam-org/javascript-sdk + python-sdk + 25 sibling repos
- Anam's official SDKs for photoreal AI personas with sub-second latency. MIT; React-friendly. Cloud-hosted persona.

### 16. inworld-ai/web-threejs (npm `@inworld/web-threejs`) + Inworld Innequin / RPM React examples
- Official Three.js + React module from Inworld. Loads Innequin or Ready Player Me, full personality/memory backend in the cloud.
- **Effort 2/5 / Forkability 2/5** if we don't want the Inworld backend lock-in.

### 17. cloudflare/agents (examples/voice-agent, examples/voice-input, examples/elevenlabs-starter)
- 35+ examples; `withVoice` mixin auto-wires STT/TTS/persistence; runs on Workers + DO + SQLite. MIT.
- Edge-first deploy story we should evaluate vs Vercel.

### 18. cloudflare/agents-starter — `cloudflare/agents-starter`
- MIT / `npm create cloudflare@latest -- --template cloudflare/agents-starter`
- Chat agent with Workers AI, scheduling, MCP, vision; no avatar but trivial to add.

### 19. langchain-ai/react-voice-agent — `langchain-ai/react-voice-agent`
- ReAct-style agent over OpenAI Realtime API with LangChain tool list
- If we ever want LangChain tools (RAG over textbook content, dictionary, conjugation) inside a Realtime session, this is the cleanest template.

### 20. pipecat-ai/pipecat-quickstart-client-server — `pipecat-ai/pipecat-quickstart-client-server`
- React + Pipecat Voice UI Kit / WebSocket / push-to-talk
- The most active OSS framework competing with LiveKit for voice plumbing.

### 21. pipecat-ai/voice-ui-kit — `pipecat-ai/voice-ui-kit`
- Headless React components/hooks for voice apps (transcripts, viz, mic state)
- **Effort 1/5 / Forkability 5/5** — drop hooks into any 3D shell.

### 22. pixiv/local-chat-vrm — `pixiv/local-chat-vrm`
- 21★ / MIT / archived Jun 2025 / browser-only VRM + Chrome Built-in AI + Kokoro TTS + `@pixiv/three-vrm`
- Demoed at Google I/O 2025. Establishes a $0-API fallback story.

### 23. zoan37/ChatVRM + hoangvu12/ChatVRM (Pixiv ChatVRM forks)
- Active VRM + LLM + voice in browser. Three-vrm + ElevenLabs/OpenAI. MIT.

### 24. moeru-ai/airi
- 38.9k★ / Vue / MIT / multi-provider VRM+Live2D AI companion w/ memory, personality, screen capture
- Different stack but the architecture catalogue is gold.

### 25. theringsofsaturn/3D-ai-school-threejs
- R3F + Three.js + OpenAI API, "immersive 3D AI classroom"
- MIT / hobby scale (low stars). Closest framing to HuskyHac's "AI tutor in a 3D scene". Worth a 30-minute read.

### 26. kiranbaby14/TalkMateAI
- Real-time voice → 3D avatar with TalkingHead lipsync, emotion-driven animation, WebSocket
- **Effort 3/5** — confirms TalkingHead-as-component pattern.

### 27. OpenReplicant/ProtoReplicant
- Browser VAD→STT→LLM→TTS→VRM PoC; documents the latency budget for the full chain.

### 28. Open-LLM-VTuber/Open-LLM-VTuber
- Hands-free voice + voice interruption + Live2D, fully local. Reference for offline mode if we ever want it.

### 29. mrjonathanm/PuPu
- React 19 / TS / MIT / 7-provider voice showcase (ElevenLabs, OpenAI, xAI, Ultravox, Vapi, Retell, Gemini Live)
- The fastest way to A/B providers without writing 7 adapters ourselves.

### 30. wawasensei/wawa-lipsync + wass08/r3f-lipsync-tutorial
- Already in our tracker but worth re-flagging: the *current* recommended R3F lipsync stack and the canonical tutorial repo by the same author.

---

## Vendor-official starters

| Vendor | Repo / template | Notes |
|---|---|---|
| OpenAI | `openai/openai-realtime-agents` (6.8k★), `openai/openai-realtime-console` (already known), `openai/openai-agents-js`, `openai/openai-realtime-api-beta` | Realtime + Agents SDK; full WebRTC reference |
| LiveKit | `livekit-examples/agent-starter-react` (861★), `livekit-examples/agent-starter-embed`, `livekit-examples/agent-starter-react-native`, `livekit/agents`, `livekit/components-js` | Voice + avatar adapters (Tavus/BeyondPresence/Simli/Hedra) |
| Tavus | `Tavus-Engineering/tavus-examples` | CVI ≤1s utterance latency; React/Pipecat quickstarts |
| HeyGen | `HeyGen-Official/InteractiveAvatarNextJSDemo`, `StreamingAvatarTSDemo`, `StreamingAvatarSDK` | Streaming video avatar over LiveKit |
| Convai | `Conv-AI/Convai-Web-SDK`, `Conv-AI/ThreeJs-World-Tutorial`, `Conv-AI/RPM-Lipsync` | Only vendor with real R3F+NPC+lipsync demo |
| Inworld | `@inworld/web-threejs` (npm), Innequin/RPM React examples | Three.js module — the official R3F-friendliest character SDK |
| Simli | `simliai/create-simli-app-openai`, `-elevenlabs`, `create-simli-agent`, `simli-openai-realtime` | Drop-in cloud avatars with ephemeral key minting |
| Anam | `anam-org/javascript-sdk`, `anam-org/python-sdk` (+23 more) | Photoreal personas, sub-1s |
| ElevenLabs | `elevenlabs/elevenlabs-examples`, `elevenlabs/packages` (Agents SDK TS) | Realtime voice + Agents Platform |
| Pipecat | `pipecat-ai/pipecat-examples`, `pipecat-quickstart-client-server`, `voice-ui-kit` | Open-source LiveKit competitor |
| Cloudflare | `cloudflare/agents`, `cloudflare/agents-starter`, `examples/voice-agent`, `examples/elevenlabs-starter` | Edge-first agent runtime |
| Vercel | `vercel/templates` → Hume EVI, Swift (Groq+Cartesia), Next.js Live Transcription, AI Chatbot | None ship 3D avatars |
| Anthropic | `anthropics/claude-quickstarts/agents`, `anthropics/skills` | No realtime voice yet (May 2026); Claude Code voice mode is local |
| HuggingFace | `huggingface/speech-to-speech`, `aigc3d/LAM` (Spaces interactive avatar SDK), Linly-Talker | Mostly research-grade, not React |
| Ready Player Me | `readyplayerme/visage`, `readyplayerme/rpm-react-sdk` | Avatar loaders — already on our radar |
| Mascotbot | `mascotbot/elevenlabs-avatar` | Best ElevenLabs+lipsync proxy pattern |

---

## Hackathon winners (with public repos) on this stack

Honest finding: **2025–2026 hackathons did not surface a clear winner that combines all three (3D + voice + LLM) with public source.** Cal Hacks 11/12, HackBerkeley AI 3.0, HackMIT, Hacktech 2025 all featured voice-agent tracks (Cal Hacks 11.0 had explicit Voice Agent prizes), but winners cluster around (a) phone-based voice agents (Vapi/Retell), (b) 2D web chatbots (LangChain/Cloudflare), or (c) Unity demos with closed source. **`alanchelmickjr/Cal-Hacks--Hack-for-Impact--2025`** (LeRobot voice assistant) is the only winning repo we surfaced, and it is robotics, not 3D web. The Hacktech / HackBerkeley pages link Devpost galleries but most submissions don't include 3D rendering. Net: HuskyHac is novel in the *intersection*, not in any single ingredient.

---

## Quality assessment

Brutal honesty:

- **80% of "AI avatar" repos are demo-grade** — single GLB, hardcoded prompts, no license, last commit 2024, 5–50 stars. Useful only as code references.
- **The serious tier is small and vendor-led**: OpenAI's `openai-realtime-agents`, LiveKit's `agent-starter-react`, Tavus's `tavus-examples`, Convai's `Convai-Web-SDK`, Pipecat's `voice-ui-kit`, Cloudflare's `agents`. These are all maintained, MIT, ≥hundreds of stars, and have actual production users.
- **Nothing in the ecosystem ships "3D world + voice tutor + game loop" as one starter.** We confirmed this in the prior `10-prior-art` doc and re-confirmed it across 25+ search surfaces. The closest thing is `Conv-AI/ThreeJs-World-Tutorial` (R3F + multi-NPC) and that's archived and 17★.
- **VRM ecosystem is healthier than R3F-character ecosystem** for "talking 3D character in browser" — `pixiv/local-chat-vrm`, ChatVRM forks, AIRI, Open-LLM-VTuber are all more mature than the R3F-equivalents. If you'd accept VRM over GLB, the starter pickings double.
- **2025–2026 trend: vendor avatars are eating 3D-in-browser avatars.** Tavus/HeyGen/Simli/Anam/Beyond Presence give you a photoreal video stream over LiveKit/WebRTC and skip the rigging+lipsync problem entirely. For *language learning* we don't need photoreal — a stylized R3F character is on-brand — so we should stay GLB, but be aware most of the ecosystem energy is moving the other way.

---

## REVISED foundation recommendation

Given everything found, the picture has *not* fundamentally changed but it has gained nuance:

**Tier-1 base (recommend): viber3d shell + `openai/openai-realtime-agents` patterns + `wawa-lipsync`.**
- viber3d still wins on "actual 3D game scaffold with ECS" — nothing else combines R3F + game ECS + Vite at that maturity.
- For the voice/agent layer we should stop pointing at `openai-realtime-console` (debugger) and **switch our reference to `openai/openai-realtime-agents`** (6.8k★, agent graph, handoffs, guardrails, supervisor pattern). It is strictly the better starting point for HuskyHac's tutor + NPC architecture; the console only shows raw API plumbing.
- Lipsync stays `wawa-lipsync` (browser-only, AnalyserNode → visemes); fall back to TalkingHead phoneme tables for non-English accuracy.

**Tier-2 alternative (consider seriously): `livekit-examples/agent-starter-react` + viber3d view layer.**
- If we want avatar-vendor optionality (Tavus/Simli/Hedra/Beyond Presence) and production-grade voice plumbing (push-to-talk, audio viz, transcripts) **out of the box**, this is the cleaner path. Cost: extra LiveKit dep + needing to graft a `<Canvas>` into a Next.js app. Benefit: we ship the voice surface in days, not weeks.

**Tier-3 fallback: `cloudflare/agents` + R3F frontend.**
- Edge-first, $0-tier-friendly, multiplayer-ready. Worth a 1-week spike if WebSocket-on-edge feels strategic.

**Do NOT fork:** `agentic-avatars` (too small/new), `r3f-virtual-girlfriend` (no license, dead), `Conv-AI/ThreeJs-World-Tutorial` (archived). Read them, copy patterns, move on.

**Concrete next step we missed before:** clone `openai/openai-realtime-agents` and `livekit-examples/agent-starter-react` side-by-side, port the agent-graph + handoff JSON shape from the former into a viber3d scene, and decide on Day 1 whether we adopt LiveKit transports or stay direct-WebRTC. That's the highest-leverage decision still open.
