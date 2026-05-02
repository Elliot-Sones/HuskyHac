# Voice Agent Platforms with Avatar Support (May 2026)

## TL;DR — should we adopt one?

**Yes — adopt LiveKit Agents.** Of the platforms surveyed, only LiveKit and Pipecat ship first-class avatar plugins behind a single voice-agent API; LiveKit has the broadest avatar coverage (14 vendors including Tavus, Anam, Simli, Beyond Presence, LemonSlice, bitHuman, Runway), keeps OpenAI Realtime as a swappable "LLM" plugin, and ships a polished Next.js starter (`livekit-examples/agent-starter-react`) that already wires WebRTC, transcription, video tracks, and avatar tiles. We get STT/LLM/TTS/VAD/turn-detection/interruption/tool-calls/avatar for free and re-use the OpenAI Realtime brain we already planned (research file 06).

The cost is one extra moving piece: a long-lived Python or Node agent worker. For a hackathon that's a single `python agent.py dev` process or a Fly/Render worker. LiveKit Cloud's free tier (1,000 agent-min/mo + 5,000 WebRTC min/mo + $2.50 inference credits, no card) covers the demo with room to spare.

**Don't adopt** Vapi/Retell (telephony-shaped, no avatar plugins, opaque pricing), Vocode (effectively unmaintained), Daily Bots (folded into Pipecat), or OpenAI Agents SDK Realtime (no avatar abstraction — you'd still hand-roll lip-sync).

**Hybrid fallback**: if the agent worker becomes a deploy headache, fall back to the realtime-console DIY path from research file 08. The two are not mutually exclusive — the browser code is similar.

---

## Platform comparison table

| Platform | Open source? | Hosted option? | Avatar plugins | OpenAI Realtime compat | Languages | Hackathon-fit |
|---|---|---|---|---|---|---|
| **LiveKit Agents** | Apache-2.0 (server + framework) | LiveKit Cloud (free tier 1k min/mo) | **14**: Tavus, Anam, Simli, Beyond Presence, bitHuman, LemonSlice, Runway, Hedra, D-ID, Avatario, AvatarTalk, Keyframe, LiveAvatar, TruGen | Yes (`livekit-plugins-openai`, RealtimeModel) | All STT/LLM/TTS plugins inherit (OpenAI Realtime = 50+) | **Excellent** — starter app + free tier |
| **Pipecat** | BSD-2-Clause | none (self-host) | 3: Simli, Tavus, HeyGen | Yes (Speech-to-Speech service) | Python only server; client SDKs JS/React/Swift/Kotlin/C++ | Good — but no avatar+browser sample |
| **Vapi** | Closed (some OSS bits) | Managed only | None advertised | Limited (LLM-as-service) | ~50 via providers | Poor for avatars — telephony-first |
| **Retell AI** | Closed | Managed only | None | Limited | ~30 | Poor for avatars |
| **Daily Bots** | Folded into Pipecat | n/a | n/a | n/a | n/a | Skip — superseded |
| **Vocode** | MIT but stalled (~1 yr no commits) | Managed (legacy) | None | Possible via custom | ~20 | Bad — abandoned |
| **OpenAI Agents SDK** (Realtime) | Apache-2.0 (TS + Py) | OpenAI Realtime API | **None** — voice only | Native | Realtime's languages (50+) | Good for voice, no avatar primitive |
| **Inworld Engine** | Closed (Runtime is C++ orchestrator) | Managed | HeyGen Live (one vendor) | Limited (Inworld brain default) | 15 (incl FR/JA/ES/ZH) | Mediocre — vendor lock |
| **Dograh** | OSS | Self-host | None | Yes | Provider-deps | OK for telephony, not avatars |

OpenAI Agents SDK doesn't have an avatar primitive — you'd plug Tavus/Simli yourself, which is what we're trying to avoid.

---

## LiveKit Agents — deep dive

### Architecture (one full turn)

```
[Browser]                  [LiveKit Room]              [Agent Worker]            [Tavus / Simli / …]
React app                  WebRTC SFU                  Python or Node            Avatar service
livekit/components-react   (LiveKit Cloud or           livekit-agents
                            self-hosted)               + livekit-plugins-openai
                                                       + livekit-plugins-tavus

1. Browser POSTs /api/token → server signs JWT with LK_API_KEY/SECRET
2. Browser .connect(wsUrl, token) → joins room as participant
3. Agent worker receives JobRequest → joins same room, starts AgentSession
4. User mic audio → SFU → agent → OpenAI Realtime over WebRTC → response audio
5. Agent forwards response audio via ByteStream to Tavus AvatarSession
6. Tavus generation server joins room as participant, publishes synced
   audio + video tracks
7. Browser subscribes to avatar's video track, renders in <VideoTrack/>;
   if absent, falls back to AudioVisualizer
```

Confirmed by LiveKit's launch blog: *"the avatar generation server joins the LiveKit room as a participant and publishes synchronized audio and video into the room."* The avatar is a **server-side video track**, not a browser-side renderer. Latency overhead ~150–300ms on top of Realtime.

### Avatar plugin coverage (May 2026)

14 vendors, Python-first. Of relevance to us: **Tavus, Anam, Beyond Presence, Simli, LemonSlice** all Python; **Anam, Beyond Presence, LemonSlice, Runway, TruGen** also Node. **HeyGen is NOT yet a LiveKit plugin** (open issue #4187) — if HeyGen matters, use Pipecat instead, or pair LiveKit with Inworld.

### Plugin code (Tavus example)

```python
from livekit.agents import AgentSession, JobContext
from livekit.plugins import openai, silero, tavus

async def entrypoint(ctx: JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="alloy"),
        vad=silero.VAD.load(),
    )
    avatar = tavus.AvatarSession(replica_id="…", persona_id="…")
    await avatar.start(session, room=ctx.room)
    await session.start(room=ctx.room, agent=…)
```

That's the entire integration. Swap `tavus` for `anam` / `bey` / `simli` to A/B vendors.

### Sample apps to fork

- **`livekit-examples/agent-starter-react`** — Next.js + TypeScript, shadcn/ui, `@livekit/components-react`, includes `chat-transcript.tsx`, `tile-layout.tsx` for avatar video, `session-view.tsx` for join logic. **This is the winner.**
- `livekit-examples/agent-starter-python` — matching Python agent, `agent.py` with entrypoint pattern above.
- `livekit-examples/agent-starter-node` — Node version (fewer avatar plugins available).
- `ChitrakshSuri/AI-Avatar-Agent-with-LiveKit-Tavus-Working` — community fork with Tavus + OpenAI already wired, useful as a reference.

### Hosting / deployment

- **Browser client**: any static host (Vercel, Netlify, Cloudflare Pages). Just needs `NEXT_PUBLIC_LIVEKIT_URL` + a signed-token API route.
- **LiveKit server**: LiveKit Cloud free tier OR self-host (`docker run livekit/livekit-server`). Self-host is fine for a hackathon — single Docker container.
- **Agent worker**: NOT serverless-friendly. Long-lived process (`python agent.py dev` or `node agent.ts dev`). Deploy to Fly.io/Render/Railway as a worker, or run locally during demo. **Vercel Serverless Functions are not viable** — the agent maintains a persistent WebSocket to LiveKit and a Realtime session per call.

### Auth / token flow

Browser → your API route (any framework) → server signs JWT with `LK_API_KEY` + `LK_API_SECRET` granting `roomJoin: true, room: <name>` → browser uses token in `Room.connect(wsUrl, token)`. Identical pattern to OpenAI Realtime ephemeral tokens (research file 06), so we already know it.

### Cost (hackathon)

| Item | Cost |
|---|---|
| LiveKit Cloud Build plan | $0 (1k agent min + 5k WebRTC min) |
| OpenAI Realtime via plugin | unchanged from DIY (~$1.80 / 5-min scene) |
| Tavus avatar (separate billing) | ~$0.20–$0.40/min — biggest avatar cost |
| Agent worker host | $0 local, ~$5/mo Fly/Render |

Self-hosted LiveKit + Anam/Simli is fully free for short demos.

---

## Pipecat — deep dive

Python-only server, BSD-2-Clause. Pipeline-based: `Pipeline([transport_in, stt, llm, tts, transport_out])`. Avatar processors live at `pipecat.services.video.simli`, `…tavus`, `…heygen`. **Heygen is supported here but not in LiveKit** — relevant if we like Heygen's avatars best.

Transports: Daily, **LiveKit**, FastAPI WebSocket, raw WebSocket. So Pipecat can ride on top of LiveKit rooms — they're not mutually exclusive.

OpenAI Realtime is supported as a Speech-to-Speech service. Sample apps in `pipecat-ai/pipecat-examples` (`simple-chatbot`, `push-to-talk`, `instant-voice`) — most use Daily, none of the listed examples emphasize avatar in the README.

**Why not Pipecat over LiveKit:** smaller avatar roster (3 vs 14), no Node SDK on the server, fewer polished avatar+React samples. Pipecat is the right call if we want pipeline-level control (e.g., custom VAD, custom interruption logic, language-detection branching). For a hackathon, LiveKit's batteries-included session model wins.

---

## Vapi / Retell / others — short dives

- **Vapi** — voice-agent-as-a-service, telephony-first. Great IVR, no avatar primitive. Avatar would mean wiring Tavus/Simli yourself on top, which defeats the purpose.
- **Retell AI** — same shape as Vapi. Better visual builder, +50–100ms latency. No avatar.
- **Inworld Engine** — Inworld Runtime is a C++ orchestrator that supports HeyGen Live as their avatar partner. Multilingual TTS covers FR/JA/ES/ZH. Closed core; vendor lock-in. Strong choice if we wanted Inworld's character-AI features specifically — but it's a heavier commitment than LiveKit and we already have the OpenAI Realtime brain.
- **Vocode** — abandoned (~1 yr no commits). Skip.
- **Daily Bots** — superseded by Pipecat. Skip.
- **OpenAI Agents SDK (Realtime)** — gives us `RealtimeAgent` + `RealtimeSession` over WebRTC, but no avatar abstraction. If we used this, we'd be back to hand-rolling avatar integration — same as the DIY path, just with OpenAI's wrapper around their own API.
- **Dograh** — OSS, telephony-shaped. No avatar.

---

## Adoption recommendation

**Adopt LiveKit Agents as the orchestration layer.** Concrete reasons:

1. **Avatar pluralism is the moat.** 14 vendors behind one API means we can A/B Tavus vs Anam vs Simli without code changes — critical because avatar quality/latency/price varies wildly per vendor and per language.
2. **OpenAI Realtime stays the brain.** `livekit-plugins-openai` exposes `RealtimeModel` — our research-06 plan survives unchanged.
3. **Starter is excellent.** `agent-starter-react` is a complete Next.js app with avatar-aware tile layout. Forking it puts us at "render an NPC" in well under 8 hours.
4. **Free tier is real.** 1,000 agent-minutes + 5,000 WebRTC-minutes + $2.50 inference credits with no credit card. Hackathon-grade.
5. **Self-hostable.** If LiveKit Cloud is down or the demo is offline-ish, `docker run livekit/livekit-server` gives us full sovereignty.
6. **Plugin economy outside avatars.** Free turn detection, VAD (Silero), interruption handling, tool-calls, transcript stream — saves us writing and debugging this glue.

**Caveat — agent worker is not serverless.** Plan to run it on a small Fly.io/Render dyno or locally during the demo. Document this in the deploy plan; do not promise a Vercel-only deploy.

**When to revisit:** if avatar latency on top of LiveKit's SFU exceeds ~500ms turnaround (test at hour 2). Fallback is the realtime-console DIY path from research file 08 — same browser code, agent removed, lip-sync runs on the client off Realtime audio frames.

---

## Sample app to fork (winner)

**`livekit-examples/agent-starter-react`** (https://github.com/livekit-examples/agent-starter-react)

What it does: Next.js + TypeScript frontend that connects to a LiveKit room, handles voice/video/transcript/screen-share, renders agent avatar tiles, and ships shadcn/ui components. Pairs with `livekit-examples/agent-starter-python` for the worker.

What to modify for HuskyHac:
1. Replace `welcome-view.tsx` with a Three.js R3F scene mount (use research file 05's scene strategy).
2. Subscribe to the avatar video track and texture it onto an NPC mesh (or render flat as a tile in MVP).
3. Wire system prompt from research file 06's CEFR pattern in `agent.py`'s `entrypoint`.
4. Pick avatar plugin — start with **Anam** (Node + Python, multilingual TTS-friendly) or **Simli** (lowest latency, Python-only).
5. Add language picker that swaps `RealtimeModel(language=…)` and avatar replica per scene.

---

## Trade-offs vs. DIY (npm create vite + port realtime-console)

| Aspect | Adopt LiveKit | DIY (research file 08) |
|---|---|---|
| Time to first NPC voice loop | ~3–4 hrs (clone + env + agent + Tavus key) | ~3 hrs (clone realtime-console + ephemeral token route) |
| Time to lip-synced avatar | ~5–6 hrs (one plugin import) | ~10–14 hrs (TalkingHead + viseme pipeline + audio sync) |
| Multi-vendor avatar A/B | Free (swap plugin) | Per-vendor SDK each time |
| OpenAI Realtime brain | Same (`livekit-plugins-openai`) | Same (direct WebRTC) |
| Browser code complexity | Medium (LiveKit SDK + tracks) | Low (one WebRTC peer) |
| Server requirement | **Long-lived agent worker** | None (browser-direct to OpenAI) |
| Vercel-only deploy | No (need Fly/Render) | Yes |
| Free-tier viability | Yes (LK Build + provider creds) | Yes (no infra) |
| Vendor lock-in | LiveKit (mitigated by Apache-2.0 self-host) | None |
| Interruption / VAD / turn-detection | Free | Hand-rolled |
| Transcript streaming | Free | Hand-rolled |
| Tool calls / scene state | Free | Hand-rolled |
| Lip-sync quality | Vendor-grade (Tavus etc.) | Procedural visemes (research file 09) |
| Multilingual reliability | Inherits Realtime + avatar vendor | Inherits Realtime |
| Latency budget | +150–300 ms (extra hop) | Minimum (browser-direct) |
| Bus factor / failure mode | Avatar vendor outage = audio-only fallback (built-in) | NPC silent if any layer fails |
| Cost at demo scale | +$0.20–0.40/min avatar | $0 avatar |

**Net:** LiveKit pays one server-process tax to avoid the ~5–8 hour avatar/lip-sync slog and unlocks vendor A/B. For a hackathon where the win condition is "talking face that looks alive," that's the right trade.

---

## Sources

- LiveKit Agents docs — https://docs.livekit.io/agents/
- LiveKit avatar plugin index — https://docs.livekit.io/agents/models/avatar/
- LiveKit Tavus plugin — https://docs.livekit.io/agents/models/avatar/plugins/tavus/
- LiveKit avatars launch blog — https://livekit.com/blog/bringing-ai-avatars-to-voice-agents
- LiveKit pricing — https://livekit.com/pricing
- agent-starter-react — https://github.com/livekit-examples/agent-starter-react
- livekit/agents repo — https://github.com/livekit/agents
- Pipecat — https://github.com/pipecat-ai/pipecat
- Pipecat examples — https://github.com/pipecat-ai/pipecat-examples
- OpenAI Agents SDK voice — https://openai.github.io/openai-agents-js/guides/voice-agents/
- Inworld + LiveKit — https://inworld.ai/blog/unlocking-studio-quality-voice-ai
- HeyGen LiveKit issue — https://github.com/livekit/agents/issues/4187
- OSS Vapi alternatives — https://blog.dograh.com/free-alternatives-to-vapi-4-oss-options-in-2026/
