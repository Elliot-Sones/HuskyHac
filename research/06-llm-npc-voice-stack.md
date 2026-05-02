# LLM-NPC + Voice Stack — Recommendations for HuskyHac

## Research Question
What's the fastest, highest-quality stack for in-character LLM NPCs that converse with the player by voice in a target language, in a browser, on a hackathon timeline?

## TL;DR — top picks

- **Brain**: OpenAI **Realtime API (gpt-realtime, WebRTC)** for the live convo loop. One API replaces STT+LLM+TTS, latency ~500–800 ms voice-to-voice, multilingual out of the box.
- **Backup brain (typed-only / cheaper)**: **Claude Sonnet 4.6** — best at staying in persona, gentle correction, CEFR calibration.
- **Pipeline (server-side)**: optional **Pipecat** wrapper if we want tool-calls, scene state, and STT/LLM/TTS swapability — otherwise the Realtime API direct from browser.
- **3D layer**: Three.js + R3F + a **TalkingHead/HeadTTS**-style lip-sync component on the NPC mesh. Pipe Realtime audio frames to viseme detection.
- **Pronunciation feedback**: skip GOP for hackathon — ask the LLM "rate grammar 0-100, list 2 mistakes, suggest one fix" using the user transcript the Realtime API already gives you.

Total live-conversation cost: **~$1.80 for a 5-minute scene** with gpt-realtime, **~$0.05** if we use Web Speech + Claude Sonnet + ElevenLabs Flash. Pick stack per demo budget.

---

## Component recommendations

### LLM (dialogue brain)
**Primary recommendation: OpenAI gpt-realtime via Realtime API.**
- One model handles speech-in → reasoning → speech-out, eliminating glue code.
- $32 / 1M audio input tokens (~$0.06/min listening), $64 / 1M audio output tokens (~$0.24/min speaking). Cached input drops to $0.40 / 1M.
- Excellent multilingual TTS in dozens of languages with persistent character voice.
- WebRTC direct from browser via ephemeral tokens (POST `/v1/realtime/client_secrets` server-side, browser uses `ek_...` token).

**Backup / cheaper path: Claude Sonnet 4.6** ($3 in / $15 out per 1M tokens). Best-in-class at:
- holding character (airport agent vs barista)
- adjusting register to CEFR A1/A2/B1/etc.
- gentle correction without breaking immersion ("Did you mean *un café au lait*? Sure thing!")
- prompt caching saves 90% on cached system prompt → critical for repeated NPC scenes.

**Prompt pattern (works for both):**
```
You are <PERSONA>. You are talking to a <CEFR LEVEL> learner of <TARGET LANG>.
Rules:
1. Stay in role at all times. Never break character.
2. Reply ONLY in <TARGET LANG>, at <CEFR LEVEL> register.
3. If learner makes a mistake, gently rephrase the correct version IN ROLE
   (don't lecture).
4. Drive toward the goal: <e.g. ordering a coffee>. When goal achieved, say
   the secret token "[SCENE_COMPLETE]" at the end.
5. Keep responses < 2 sentences unless asked.
```

### STT (speech-to-text)
| Tool | Per min | Latency | Languages | Notes |
|---|---|---|---|---|
| **Web Speech API** | $0 | <300ms | ~40 (Chrome) | Free, browser-only, Chrome/Edge only. Decent for major langs. |
| **OpenAI Realtime (built-in)** | included | ~200ms | 50+ | Best if using Realtime brain — no separate STT. |
| **Deepgram Nova-3** | $0.0077 | ~150ms | 30+ | Fastest standalone, $200 free credit. |
| **OpenAI gpt-4o-transcribe** | $0.006 | ~500ms | 100+ | Best accuracy/$, batch only. |
| **Whisper.cpp (WASM)** | $0 | ~1s | 100+ | Privacy + free, but heavy CPU + slow first load. |

**Recommendation**: if using Realtime API → done. Otherwise Web Speech API for hackathon (free, instant, good enough), Deepgram Nova-3 streaming for production polish.

### TTS (text-to-speech)
| Tool | Quality | Latency | Per 1k chars | Multilingual | Voices |
|---|---|---|---|---|---|
| **OpenAI Realtime (built-in)** | High | ~300ms TTFA | included | Yes | 8 baked voices, distinguishable |
| **ElevenLabs Flash v2.5** | High | ~75ms TTFA | $0.15 (Pro) | 32 langs | Huge voice library, character-distinctive |
| **Cartesia Sonic Turbo** | High | **40ms TTFA** | ~$0.03/min | 15 langs | Lowest latency available |
| **OpenAI TTS (gpt-4o-mini-tts)** | Medium | ~500ms | $0.015 | Yes | 8 voices (alloy, echo, etc.) |
| **Web Speech SpeechSynthesis** | Low | ~100ms | $0 | OS-dependent | Robotic, but free |

**Recommendation**: use Realtime built-in for primary path. For typed-only / Claude path, **ElevenLabs Flash** for character voices (taxi driver = deep gravelly, barista = warm, agent = crisp). **Cartesia Sonic Turbo** is the latency king if every ms matters.

### Pronunciation/grammar feedback
**Recommendation: LLM-as-judge approach.**
- After each user turn, send the transcript + target-lang context to Claude Sonnet 4.6 (cheap, async): *"Score grammar 0-100. List up to 2 mistakes with corrections. Reply JSON."*
- Display non-blocking "feedback card" beside the NPC. Doesn't interrupt convo flow.
- For pronunciation specifically — Realtime API doesn't expose phoneme timings, so the cheapest signal is the STT confidence + Whisper's transcript-vs-expected diff.
- **Skip GOP/Kaldi/MFA for hackathon**. Real GOP requires per-language acoustic models, training pipelines, hours of setup.
- If you want a paid drop-in: **SpeechSuper API** does phoneme scoring for 8 languages.

### Real-time pipeline
**Recommended: OpenAI Realtime API direct from browser via WebRTC.**

```
[Mic] → getUserMedia → RTCPeerConnection → OpenAI Realtime
                                        ← audio track + data channel events
[Speaker] ← audio track ← RTCPeerConnection
[3D NPC] ← viseme stream from audio track → mouth animation
```

- One round trip. ~500–800 ms total voice-to-voice.
- Backend just mints ephemeral tokens (`POST /v1/realtime/client_secrets`) — no audio touches your server.
- Data channel carries text transcript events for UI captions + scene-state tool calls (e.g. `confirm_order(item, size)`).

**Alternative if you want vendor flexibility**: Pipecat (BSD-2, 11.7k stars) on a small Python/Modal/Fly server, browser connects via Daily/LiveKit. Lets you swap STT/LLM/TTS per scene. Adds ~150 ms overhead vs direct Realtime.

---

## Forkable open-source repos

### TalkingHead — met4citizen/TalkingHead
- https://github.com/met4citizen/TalkingHead — 1.2k stars — pushed 2026-04-08 — MIT
- Stack: vanilla JS, ready-player-me avatars, real-time lip-sync, viseme detection
- Gives us: 3D talking head with realistic mouth movement driven by audio. Includes example wiring with Whisper-Web + WebLLM + Kokoro TTS for fully in-browser AI chatbot.
- Forkability: **5/5** — exact problem class, MIT, currently maintained.

### HeadTTS — met4citizen/HeadTTS
- https://github.com/met4citizen/HeadTTS — 130 stars — pushed 2026-04-03 — MIT
- Free neural TTS (Kokoro) with timestamps + visemes for lip-sync. WebGPU/WASM in-browser.
- Gives us: zero-cost TTS option with built-in lip-sync metadata.
- Forkability: **4/5** — narrow focus, drops into TalkingHead.

### Pipecat — pipecat-ai/pipecat
- https://github.com/pipecat-ai/pipecat — 11.7k stars — pushed today — BSD-2
- Open-source framework for voice + multimodal agents. Pluggable STT/LLM/TTS. Daily/LiveKit transport.
- Gives us: production-grade pipeline, conversation flows, interruption handling.
- Forkability: **4/5** — Python-side, hackathon team needs to spin up a worker.

### LiveKit Agents — livekit/agents
- https://github.com/livekit/agents — 10.3k stars — pushed today — Apache-2.0
- Realtime voice AI agent framework. Has agents-js (Node.js, 819 stars) for JS-only stacks.
- Gives us: WebRTC infra + agent worker pattern; works directly in browser via livekit-client.
- Forkability: **4/5** — slightly heavier than Pipecat, but Node.js agents-js is great for Svelte stack.

### a16z-infra/ai-town
- https://github.com/a16z-infra/ai-town — 9.8k stars — pushed 2026-03-21 — MIT
- AI agents living, chatting, socializing in a 2D town. Convex backend, Next.js frontend.
- Gives us: persona/memory/scheduling patterns, prompt patterns for character agents.
- Forkability: **3/5** — instructive, but 2D and not voice. Mine for prompts and agent loop architecture, don't fork wholesale.

### OpenAI Realtime Console — openai/openai-realtime-console
- https://github.com/openai/openai-realtime-console — 3.6k stars — pushed 2025-08-28 — MIT
- React app for inspecting/building/debugging Realtime API. Working WebRTC client, ephemeral token flow, audio visualizer.
- Gives us: ready-to-go React wiring for Realtime — copy the connection code into Svelte.
- Forkability: **5/5** — strip the chrome, keep the connection layer.

### r3f-virtual-girlfriend — wass08/r3f-virtual-girlfriend (frontend + backend)
- https://github.com/wass08/r3f-virtual-girlfriend-frontend — 152 stars — pushed 2024-11
- https://github.com/wass08/r3f-virtual-girlfriend-backend — 118 stars
- Stack: react-three-fiber + GPT + Whisper + ElevenLabs + Rhubarb lip-sync. Exactly the pattern HuskyHac needs.
- Gives us: end-to-end working reference — 3D character + voice in/out + LLM. Wiring is dated (no Realtime API) but architecture is sound.
- Forkability: **4/5** — copy the architecture, replace Whisper+GPT+ElevenLabs glue with Realtime API.

### voicechat2 — lhl/voicechat2
- https://github.com/lhl/voicechat2 — 775 stars — pushed 2024-10 — Apache-2.0
- Local-only SRT/LLM/TTS voice chat reference.
- Gives us: pattern for streaming chunks, latency budget breakdown.
- Forkability: **2/5** — local-first, not browser-first; reference only.

### pipecat-examples — pipecat-ai/pipecat-examples
- https://github.com/pipecat-ai/pipecat-examples — 273 stars — BSD-2
- Sample apps including "patient-intake", "translation-chatbot", "natural-conversation".
- Gives us: copy-paste scene patterns (an "intake" scene maps closely to airport check-in).
- Forkability: **5/5** — designed to be cloned.

### Convai-Unity-WebGL-SDK — Conv-AI/Convai-Unity-WebGL-SDK
- https://github.com/Conv-AI/Convai-Unity-WebGL-SDK — 3 stars — pushed 2025-09 — proprietary
- Convai is the closest commercial product to HuskyHac (3D NPCs + voice).
- Gives us: instructive only — see how their persona prompts and conversation arcs are structured.
- Forkability: **1/5** — proprietary; for inspiration.

---

## RECOMMENDED ARCHITECTURE for HuskyHac

**Chosen stack (hackathon, max wow per hour):**

```
Browser (Svelte + Three.js + R3F)
├── Scene manager: airport / taxi / cafe (Three.js scenes, GLTF NPCs)
├── NPC component:
│   ├── 3D mesh (Ready Player Me / Mixamo)
│   ├── TalkingHead viseme driver (audio-track → mouth shapes)
│   └── State: persona, CEFR level, scene goal
├── Voice loop: WebRTC peer connection → OpenAI Realtime API
│   ├── Mic in → audio track → Realtime
│   ├── Realtime → audio track → Speaker + TalkingHead
│   └── Data channel → transcripts + tool calls
└── UI captions / progress bar / "scene complete" trigger

Backend (Cloudflare Worker / Vercel Edge / tiny Node)
└── POST /api/realtime-token
     → calls OpenAI POST /v1/realtime/client_secrets with our API key
     → returns ek_... ephemeral token (60s TTL)
     → also returns the persona system prompt for that scene

Async feedback lane (non-blocking, parallel call)
└── After each user turn, send transcript to Claude Sonnet 4.6
     → returns {grammar_score, mistakes:[], correction}
     → renders as floating "tutor card" beside NPC
```

**Why this stack:**
1. **Time-to-demo**: Realtime API gives us STT+LLM+TTS in one connect. Most of the build is the 3D scene.
2. **Latency**: ~600 ms voice-to-voice. Crosses the "feels live" threshold.
3. **Multilingual**: Realtime supports 50+ languages with character voices baked in.
4. **Persona**: gpt-realtime accepts `instructions` + `voice` per session — switching NPCs is one config change.
5. **Tool calls** (data channel): scene-completion tools like `place_order(item)` end the scene programmatically — no parsing the LLM's prose.
6. **Fallback**: if Realtime is rate-limited or breaks, graceful degrade to Web Speech STT + Claude Sonnet + ElevenLabs Flash. Costs drop, latency rises ~200 ms.

---

## Cost estimate for a 5-min NPC conversation

Assume the player speaks ~1.5 min and the NPC speaks ~1.5 min (rest is silence/think time).

**Realtime API path:**
- Audio in: 1.5 min × $0.06/min = **$0.09**
- Audio out: 1.5 min × $0.24/min = **$0.36**
- Cached system prompt (persona, ~1k tokens, $0.40/1M cached) = negligible
- Async grammar pass (Claude Sonnet 4.6, ~3k in / 500 out) = $0.009 + $0.0075 = **$0.017**
- **Total: ~$0.47 per scene.**

3 scenes per demo session = **~$1.40 / user / full demo run**.

**Budget path (Web Speech + Claude + ElevenLabs Flash):**
- STT: $0 (Web Speech)
- LLM: Claude Sonnet 4.6 ~5k in / 1k out per scene = $0.015 + $0.015 = $0.03
- TTS: ~600 chars NPC output × $0.00015 = $0.09
- **Total: ~$0.12 per scene, ~$0.36 / demo.**

**Ultra-budget (all free, demo-only)**: Web Speech STT + Claude Haiku 4.5 + Web Speech TTS = **<$0.01/scene**, but voice quality is robotic.

---

## Synthesis & top picks

1. **Spend the first hour wiring `openai/openai-realtime-console` into a Svelte + R3F shell.** It already handles ephemeral tokens, WebRTC, mic in, audio out.
2. **Drop in `met4citizen/TalkingHead`** for the NPC mesh and pipe the Realtime audio track into its viseme detector. Lip-sync is the visible "wow" moment.
3. **Define 3 personas as system prompts** (airport agent, taxi driver, barista) with the CEFR-aware template above. Switch with `session.update({instructions, voice})`.
4. **Use Realtime tool calls for scene-completion** (`order_complete`, `passport_verified`, `destination_set`). Reliable, no prose parsing.
5. **Async grammar lane on Claude Sonnet 4.6** with prompt caching for the persona context. Renders as a non-blocking tutor card.
6. **Keep `wass08/r3f-virtual-girlfriend` open in a tab** as a reference for the 3D-to-LLM wiring pattern.
7. Skip pronunciation GOP, skip Pipecat/LiveKit (unless tool-call complexity blows up), skip ElevenLabs (Realtime voices are good enough for a demo).

The whole stack is buildable by 2 people in a hackathon weekend. The constraint is the 3D scene polish, not the AI plumbing.
