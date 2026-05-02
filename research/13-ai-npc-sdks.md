# AI NPC SDKs for Game Devs (May 2026)

## TL;DR — should we adopt one?

**Adopt Convai for the hackathon.** It is the only SDK that actually ships a Three.js / React-Three-Fiber starter, supports custom GLB avatars, drives blendshape lipsync at 60fps, speaks all four target languages (FR/JA/ES/CMN), and has a usable free tier (~3,000 interactions/month). Time-to-first-talking-NPC is well under a day on the existing starter repo.

**The strategic risk** is lock-in: Convai's brain, voice, and orchestration are bundled, and pricing scales by interaction. For HuskyHac specifically, we already have a Realtime/Claude voice stack designed in research/06. So the *winning move* is: **use Convai's web SDK as the demo accelerator + reference implementation for the hackathon**, but architect our own NPC layer behind a thin adapter so we can swap in our DIY OpenAI-Realtime + TalkingHead pipeline later. Inworld is the strongest "polished" alternative but its web SDK is a thinner port of its Unity-first product, and pricing is now metered TTS/STT/LLM with no obvious "5 free characters forever" tier. AI Town is fork-worthy for the simulation/memory layer, not as an NPC runtime.

---

## SDK comparison table

| SDK | Browser/Three.js support | Languages | Free tier (May 2026) | License | Hackathon-fit |
|---|---|---|---|---|---|
| **Convai** | First-class — Web SDK + official R3F starter (`Conv-AI/ThreeJs-World-Tutorial`); 60fps ARKit/MetaHuman blendshape streaming; GLB upload | 23+ incl. FR / JA / ES / CMN / KO / DE / IT / PT / AR / HI | ~3,000 interactions/mo on Creator plan; free tier limited but live | Closed SaaS; commercial OK on paid; check ToS for hackathon | A+ — talking NPC in <1 day |
| **Inworld AI** | `@inworld/web-core` npm pkg + chat example; no official R3F starter; SDK is TS/Node-shaped | Multilingual TTS (~30+); LLM is BYO so any | Free start: ~40 min TTS + 5 voices; Founder plans $25–$1,500/mo until 7 May 2026 (close-call to deadline); else metered ($25/1M chars TTS, $0.35/hr STT, LLM at provider cost) | Closed SaaS; commercial license included on paid | B — solid web SDK but you wire 3D/lipsync yourself |
| **Charisma.ai** | Web SDK exists (publish to web/VR/games); narrative-first, no-code story engine | Multi-language TTS via ElevenLabs/etc | Free creator tier; Pro adds support; bespoke pricing for studios | Closed SaaS | C — great for branching narrative, weaker for free-form voice tutor |
| **NVIDIA ACE** | NIM microservices + sample web frontend; NOT a drop-in JS SDK | Strong multilingual via Riva | NIMs require NVIDIA AI Enterprise license OR cloud API credits; gated | Mixed — NIMs proprietary | D — built for engine integration, not browser hackathon |
| **Hume EVI** | Excellent React/TS SDK, WebSocket streaming; voice-only (no character mesh) | 11 langs live, 20+ "coming soon" | Has free credits; $0.072/min EVI 4 typical | Closed SaaS, commercial OK | B for voice; you BYO 3D + lipsync |
| **Replica Studios** | Web platform + REST API; primarily TTS/voice acting | 20+ TTS langs | Free tier limited; per-character minute pricing | Closed SaaS | C — voice only, not a full NPC runtime |
| **AI Town (a16z-infra)** | Convex + React; not a 3D engine, 2D pixel-art | Any (BYO LLM/TTS) | MIT, fully self-host | MIT — fork freely | B as a *pattern source*: memory model, agent loop, conversation pruning |
| **NPC Engine (open source)** | Local LLM, mostly desktop/Godot focus; not browser-first | LLM-dependent | Free / OSS | MIT/Apache | D — wrong runtime for our browser target |
| **Spark.AI / misc** | Various; mostly Unity-first | varies | varies | varies | C — no clear web edge |
| **OpenAI Custom GPTs / Anthropic Projects (DIY)** | We control everything | All major langs | Pay-as-you-go | Per provider ToS | A for control, B for time-to-demo |

---

## Convai deep dive

### Architecture
Fully managed end-to-end: Convai cloud handles STT, LLM brain, TTS, **and** facial blendshape stream. You feed mic frames over WebSocket; you receive `{userQuery, audioResponse, blendshapeFrame}` back. The Web SDK is `convai-web-sdk` on npm. There is also `Convai-JS-SDK-Alpha` (older). The Web SDK exposes `ConvaiClient` (vanilla TS) and a React `useConvaiClient` hook plus a `<ConvaiWidget />` drop-in.

### Sample integration code (verified pattern)
```ts
import { ConvaiClient } from 'convai-web-sdk';

const convaiClient = new ConvaiClient({
  apiKey: process.env.CONVAI_API_KEY,
  characterId: '<your-character-uuid>',
  enableAudio: true,
  enableFacialData: true,
  faceModel: 3,        // 3 = OVR lipsync; ARKit/MetaHuman also supported
  sessionId: '<persists conversation>',
});

convaiClient.setResponseCallback((res) => {
  if (res.hasUserQuery())     console.log('user said:', res.getUserQuery());
  if (res.hasAudioResponse()) playPCM(res.getAudioResponse());
  if (res.hasFacialData())    npcMesh.applyBlendshapes(res.getFacialData());
});

// Push mic audio chunks:
convaiClient.startAudioChunk();
// ...stream...
convaiClient.endAudioChunk();
```

### Languages
Confirmed list includes: `es-ES`, `fr-FR`, `ja-JP`, `cmn-CN` (Mandarin), `ko-KR`, `de-DE`, `it-IT`, `pt-BR`, `ar`, `hi-IN`, `ru-RU`, `nl-NL`, `tr-TR`, `vi-VN`, `pl-PL`, plus regional variants. All four HuskyHac targets are first-class.

### 3D avatar
- Character library exists (their stock avatars) — but you can **BYO GLB**. Docs: "GLB Characters for Convai." Ready Player Me works directly. Reallusion ActorCore needs Blender export to GLB.
- Lipsync runs server-side and streams blendshapes at 60fps in ARKit (61) or MetaHuman (251) format. We map them onto our GLB's morph targets.

### Memory / state / goals
Convai supports per-character "Knowledge Bank," persistent `sessionId`, "Roleplay Mode," and Actions (custom triggers your code listens for, e.g., `[ORDER_PLACED]`). This maps cleanly to our scene-completion pattern: we register an Action like `scene_complete` and Convai's brain emits it when goals are satisfied. There is also a "Lǎoshī Mode" (teacher) framing in their language-learning materials.

### Pricing & free tier (May 2026)
- **Creator (free)**: ~3,000 interactions/month, full feature access for prototypes. (1 interaction = 1 user input + 1 NPC response.) For a hackathon demo this is plenty.
- **Indie/Gamer**: ~$9–$29/mo, 3,000 interactions, more characters.
- **Pro/Scale**: ~$99/mo, 40,000 interactions.
- **Enterprise**: custom; on-prem option.
- Caveat: pricing pages were partially blocked from extraction; numbers above are from third-party indexes (saasworthy/softwaresuggest) and are consistent across sources but should be reverified before commercial launch.

### License
Closed-source SaaS. Commercial use OK on paid tiers. Hackathon use is fine on free Creator. We do not own the brain or voice — full lock-in if we depend on it for scene logic.

### Sample apps to fork
- `Conv-AI/ThreeJs-World-Tutorial` — official R3F + ConvAI NPC starter (last touched Aug 2024; archived but functional reference).
- `Conv-AI/Convai-Web-SDK` — SDK source.
- `Conv-AI/web-sdk-cdn` — drop-in CDN bundle.
- Convai blog: "Build Browser-Based Low-Latency Conversational AI Avatars with Three.js and React" — full walkthrough.

---

## Inworld deep dive

### Architecture
Originally Unity/Unreal-first; now consumption-priced "Agent Runtime" + first-party TTS/STT and a **Router** that lets you call 220+ LLMs. The web path is `@inworld/web-core` (current; the older `@inworld/web-sdk` is deprecated). It's Node/TS shaped — you handle session lifecycle, audio capture, message rendering yourself. No official Three.js or R3F starter; you'd fork their `examples/chat` and bolt 3D on.

### Languages
Multilingual TTS (Mini and Max tiers, ~30+ langs). LLM is whatever you route to via Inworld's Router or directly.

### Free tier / pricing (May 2026)
- "Start free" tier: up to 40 min TTS, 5 custom voices, full Realtime API access, commercial license included.
- **Founder plans (locked rates, must subscribe before 7 May 2026)**: Creator $25/mo, Developer $300/mo, Growth $1,500/mo. TTS Mini $5/1M chars, Max $10/1M chars, STT $0.21–0.28/hour. **The 7 May deadline is essentially the hackathon weekend** — if we want Founder rates, sign up immediately.
- On-Demand (after 7 May): TTS Mini $25/1M, Max $35/1M, STT $0.35/hr, LLMs at provider cost.

### Strengths over Convai
- **Memory + Goals + Relationships + Scene Triggers are first-class** in their character editor — better narrative tooling than Convai. Relationships persist per Player Profile (ally→enemy emergent).
- Clean separation between runtime and models lets us swap LLMs without changing character config.
- Commercial license on free tier.

### Weaknesses for HuskyHac
- No official R3F starter; lipsync is **not bundled** in the web SDK (you'd pair with TalkingHead or HeyGen).
- Web SDK is less mature than Convai's; Inworld's center of gravity is still Unity.
- Pricing is metered per-component, harder to predict than Convai's interaction count.

### Sample apps
- `inworld-ai/inworld-web-sdk` — official monorepo, including `examples/chat`.
- npm: `@inworld/web-core` (current 2.x).

---

## Other SDKs — short reviews

- **Charisma.ai** — strongest if you're building branching narrative trees (writers without code). For free-form language tutor conversation, the dialog-tree backbone is overhead, not advantage. Has web SDK; pricing is bespoke at higher tiers.
- **NVIDIA ACE** — production-grade, but the integration target is Unreal/Unity/Omniverse. Browser support is via NIM microservices and sample frontend, not a drop-in JS SDK. Skip for hackathon, revisit for native client v2.
- **Hume EVI** — best-in-class emotion-aware voice, great React SDK, but voice-only. We'd still need our own 3D + lipsync. Could be a *complement* to Convai or our DIY stack if we want better emotional prosody, but adds latency and cost.
- **Replica Studios** — TTS/voice acting library, not an NPC runtime. Useful if we want unique character voices in 20+ languages, otherwise ElevenLabs/Cartesia (already chosen in research/06) are better integrated.
- **AI Town (a16z-infra)** — MIT-licensed multi-agent simulation kit. Not browser-3D and not an SDK, but the architecture is **the** reference for: simulation engine separated from chat tables, agent goal loop, conversation pruning, vector-DB memory, deployable on Convex. **Read `ARCHITECTURE.md` even if we don't fork it.**
- **NPC Engine (mantle-labs / npc-engine)** — local LLM NPC runtime, but desktop/Godot focus. Wrong target.
- **Spark.AI** — sparse public presence; deprioritized.
- **Latitude Voyage** — AI RPG platform; not an SDK we can embed in our app.
- **Custom GPTs / Claude Projects** — fine for prototyping a persona, but not a runtime: no streaming voice, no avatar hooks, no goal triggers. Use for *persona authoring* only.

---

## Recommendation

**Adopt Convai as the hackathon path. Build a thin `NpcDriver` adapter so a future swap to our DIY Realtime+TalkingHead stack is one file, not a rewrite.**

Why Convai wins for HuskyHac specifically:
1. Only SDK with an *official, working* R3F + 3D-NPC starter.
2. Speaks all four target languages with character-distinct voices.
3. Server-side blendshape lipsync at 60fps removes the lipsync research-spike (research/09) from the critical path.
4. Free tier covers a hackathon demo; signup-to-talking-NPC is hours, not days.
5. Actions / Roleplay Mode / Knowledge Bank map directly to our scene-completion + persona model.

Risks we're consciously taking:
- **Lock-in.** Mitigate via the `NpcDriver` adapter (see "If we DON'T adopt" below — same interface either way).
- **Pricing creep.** A 5-min voice scene is roughly 25–40 interactions (turns), so 3,000/mo free = ~75–100 demo sessions. Beyond that, $9–$29/mo is fine; serious traffic pushes us off Convai anyway.
- **Free tier ToS.** Reverify "commercial / hackathon judging" use is allowed before submitting.

---

## If we adopt the winner — fork-worthy starter

**Repo:** `Conv-AI/ThreeJs-World-Tutorial` — https://github.com/Conv-AI/ThreeJs-World-Tutorial

**Walkthrough (target: <1 day to talking NPC):**
1. `git clone` the repo, `pnpm i`, `pnpm dev`. Vite + React + R3F boots.
2. Sign up at convai.com (free Creator), create a Character, copy `apiKey` + `characterId` into `.env`.
3. In Convai dashboard: set character **Language = `fr-FR`** (or whichever scene), set **Backstory = our scene system prompt** ("You are Marie, a Parisian barista... reply only in French at A2..."), enable **Actions** with `scene_complete`.
4. In the React app, replace the demo NPC's `apiKey`/`characterId` with ours. The starter already wires mic capture, response callback, blendshape application to a GLB.
5. Swap the demo GLB for our HuskyHac character GLB (Ready Player Me URL works directly).
6. Hook Convai's `Action` callback → emit our scene-state event when `scene_complete` fires.
7. Companion blog post for reference: convai.com/blog/ai-avatars-inside-browser-threejs-react-convai-web-sdk-tutorial.

**Total surface area we own:** ~200 lines of glue code + a GLB + a system prompt per scene. The brain, voice, and lipsync are managed.

---

## If we DON'T adopt — what specific patterns to copy from these SDKs into our DIY

If we go DIY (research/06's OpenAI Realtime + Claude + TalkingHead stack), steal these concretely:

1. **Persona schema (Inworld-shape):**
   ```ts
   type Persona = {
     name: string;
     coreDescription: string;     // 1-2 paragraph backstory
     personalityTraits: string[]; // ["impatient", "warm", "loves jazz"]
     knowledge: string[];         // RAG snippets
     goals: { id: string; description: string; }[];
     relationships: Record<PlayerId, { affinity: number; tags: string[] }>;
     voiceId: string;
   };
   ```
   Inworld's editor proves this is the minimal useful set. Convai's "Knowledge Bank" maps to `knowledge`.

2. **Scene-completion via in-band token (Convai Actions pattern):**
   Tell the LLM: "When the player has successfully ordered a coffee, end your reply with the literal token `[SCENE_COMPLETE:order_placed]`." Strip the token before TTS, fire a state-machine event on the client. This is exactly what Convai's Actions are under the hood.

3. **Memory model (AI Town pattern):**
   - Short-term: last N turns in context.
   - Mid-term: summarize older turns into a rolling "memory" string.
   - Long-term: embed each turn into a vector store, retrieve top-K relevant on each new turn.
   - Keep chat messages **separate** from game-engine state (AI Town's explicit architectural choice). Conversation table ↔ scene state table, joined by `sessionId`.

4. **Driver adapter so we can A/B Convai vs DIY:**
   ```ts
   interface NpcDriver {
     start(persona: Persona): Promise<NpcSession>;
   }
   interface NpcSession {
     sendUserAudio(chunk: Float32Array): void;
     onAudioResponse(cb: (pcm: Float32Array) => void): void;
     onTranscript(cb: (text: string, isFinal: boolean) => void): void;
     onBlendshapes(cb: (frame: BlendshapeFrame) => void): void;  // null on DIY at first
     onAction(cb: (name: string, args: any) => void): void;       // scene_complete etc.
     end(): void;
   }
   ```
   `ConvaiDriver`, `RealtimeDriver`, `ClaudeDriver` all conform. One interface, three runtimes.

5. **Relationship persistence (Inworld pattern):** even a single number per (playerId, npcId) pair, persisted in localStorage/Supabase, unlocks "Marie remembers you tipped her." Cheap, huge UX win.

---

## Sources

- [Convai Web SDK docs](https://docs.convai.com/api-docs/plugins-and-integrations/web-plugins/convai-web-sdk)
- [Convai Three.js R3F starter](https://github.com/Conv-AI/ThreeJs-World-Tutorial)
- [Convai Web SDK repo](https://github.com/Conv-AI/Convai-Web-SDK)
- [Convai language list API](https://docs.convai.com/api-docs/api-reference/core-api-reference/character-crafting-apis/language-list-api)
- [Convai GLB characters docs](https://docs.convai.com/api-docs/plugins-and-integrations/web-plugins/glb-characters-for-convai)
- [Convai pricing](https://convai.com/pricing)
- [Convai R3F tutorial blog](https://convai.com/blog/ai-avatars-inside-browser-threejs-react-convai-web-sdk-tutorial)
- [Inworld web-core npm](https://www.npmjs.com/package/@inworld/web-core)
- [Inworld web SDK repo](https://github.com/inworld-ai/inworld-web-sdk)
- [Inworld founder pricing](https://inworld.ai/founder-pricing)
- [Inworld relationships docs](https://docs.inworld.ai/docs/runtime-character-attributes/relationships/)
- [Charisma.ai pricing](https://charisma.ai/pricing)
- [NVIDIA ACE samples](https://github.com/NVIDIA/ACE)
- [Hume EVI overview](https://dev.hume.ai/docs/empathic-voice-interface-evi/overview)
- [AI Town repo](https://github.com/a16z-infra/ai-town)
- [AI Town ARCHITECTURE.md](https://github.com/a16z-infra/ai-town/blob/main/ARCHITECTURE.md)
