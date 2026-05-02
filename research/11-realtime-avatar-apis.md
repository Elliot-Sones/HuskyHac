# Real-Time AI Avatar APIs — Vendor Comparison (May 2026)

## TL;DR — recommended choice for HuskyHac

**Use Simli for the hackathon.** Killer combo: $0.009–$0.05/min (10–500x cheaper than D-ID/HeyGen), sub-300ms latency, an **official `simliai/simli-openai-realtime` GitHub starter** that wires OpenAI Realtime audio straight to the avatar's mouth via WebRTC, and an open `simli-client` web SDK. We can BYO audio (raw PCM frames or WebRTC track) — Simli only renders the face. Photorealistic head-only video stream embedded in a `<video>` tag.

**Backup: Beyond Presence** (bey.dev) if we want a head-and-shoulders presenter look — $0.175/min, 250ms speech-to-video, native LiveKit plugin, 29 conversational languages including JA/FR/ES/ZH.

**Avoid:** D-ID ($5.90/min — 600x Simli's price), Soul Machines (in receivership Feb 2026), Synthesia (real-time "Video Agents" still rolling out to enterprise only), HeyGen LiveAvatar at $0.10/min Lite is fine but TOS-locks the avatar IP and the BYO-audio path is more painful than Simli.

This replaces 50% of our planned build only if we accept a 2D photorealistic talking-head video instead of the 3D Three.js character. **Important architectural fork** noted in the recommendation section.

## Vendor comparison table

| Vendor | Pricing (May 2026) | Latency | Languages | BYO-audio? | Open SDK? | Demo URL | Verdict |
|---|---|---|---|---|---|---|---|
| **Simli** | $0.009–$0.05/min (Trinity-1: <$0.01/min) | <300ms STV | Any (TTS-driven) | Yes — PCM + WebRTC | Yes (MIT, multiple repos) | simli.com | **Winner — cheapest, OSS, BYO works** |
| **Beyond Presence** | $0.175–$0.35/min; 20 free min | 250ms STV / 1s e2e | 29 incl. JA/FR/ES/ZH | Yes (Speech-to-Video API) | TS + Python SDKs; LiveKit plugin | beyondpresence.ai | Strong runner-up |
| **HeyGen LiveAvatar** | $0.10/min (Lite + BYO LLM); $99/mo plan min | ~1.5s e2e | 175+ | Yes (Lite mode, BYO LLM, BYO TTS via integration) | JS SDK (closed); examples on GH | heygen.com/products/liveavatar | OK but more locked-in |
| **Tavus CVI** | $0.32–$0.37/min overage; 25 free min | ~600ms (Sparrow-0) | 30+ incl. JA/FR/ES/ZH | Yes — custom LLM/TTS layers | Daily.co WebRTC; vibecode quickstart | tavus.io/cvi | Pricier; best UX polish |
| **Anam.ai** | $0.18/min Starter; $12 mo; 30 free min | 180ms model / sub-1s e2e | 70+ incl. JA/FR/ES/ZH | Yes — audio passthrough mode (ElevenLabs partner pattern) | JS SDK; OSS WordPress + travel demos | anam.ai | Cheap-ish, polished, smaller eco |
| **D-ID** | $5.90/min streaming | ~1–2s | 100+ | Yes (BYO LLM) | Closed JS SDK | d-id.com/agents | **Skip — 60–600x too expensive** |
| **Beyond Presence (S2V)** | $0.0875–$0.175/min | 250ms | TTS-bound | Yes | LiveKit plugin | bey.dev | Cheaper than Managed Agents tier |
| **Convai** | Quote-only; no public per-min | ~700ms | 50+ | Yes — they ship the rig + Three.js Web SDK | **Three.js + React Web SDK (the only 3D one)** | convai.com | **Special: only 3D-Three.js vendor** |
| **Inworld AI** | TTS $5–$50/M chars + LLM passthrough | <200ms TTFA | 30+ TTS | Yes (it IS the platform — no rendered face) | Open Realtime API | inworld.ai | **Not an avatar vendor** — voice + LLM only |
| **Soul Machines** | Six-figure enterprise | ~1s | 30+ | Limited | Closed | n/a (receivership) | **Dead — Feb 2026 receivership** |
| **Synthesia 3.0 / Video Agents** | Enterprise only | ~live | 140+ | Limited; closed pipeline | None public | synthesia.io/3 | **Not GA in 2026 for self-serve** |
| **Runway Characters** | Bundled in Runway plans (~$15+/mo) | "real-time" claim | 30+ | Unclear (text-driven) | Closed | runwayml.com | Newer; image-to-character; unverified for BYO audio |
| **LiveAvatar (liveavatar.com)** | n/a — appears to be HeyGen's product brand | n/a | n/a | n/a | n/a | n/a | Same as HeyGen LiveAvatar |

## Per-vendor deep-dives

### Simli (RECOMMENDED)
- **Pricing:** $0.05/min pay-as-you-go; **$0.009/min** January 2026 update; **Trinity-1 Gaussian-splatting tier <$0.01/min**. $10 free credits + 50 free minutes/month top-up. By far the cheapest credible option.
- **Latency:** <300ms speech-to-video. Built around Gaussian-splatting neural face, not full body.
- **Languages:** Audio-driven so language-agnostic in principle; wired to ElevenLabs/Cartesia/Deepgram/Whisper — JA/FR/ES/ZH all work via TTS choice.
- **Avatar look:** Photorealistic head-only (talking-bust). Stylised options also available.
- **Customisation:** Upload a face image → custom avatar; preset library; voice cloning via integrated TTS.
- **Integration:** **BYO audio confirmed.** Two paths — (a) feed PCM frames to `simli-client` over WebRTC, (b) use the Pipecat/LiveKit plugin. Avatar receives raw audio and outputs lipsynced video.
- **Embed:** `<video>` element fed by their WebRTC client; React/Next examples in `create-simli-app`.
- **OSS starters (live, well-maintained):**
  - `simliai/create-simli-app-openai` — OpenAI + Simli template (this is the killer for us)
  - `simliai/create-simli-agent` — generic agent template
  - `simliai/simli-ai-agent-demo` — WebRTC demo
  - `simliai/create-simli-app-elevenlabs` — ElevenLabs flavor
  - `simliai/simli-client` — the web SDK itself
  - `simliai/simli-openai-realtime` — direct OpenAI Realtime integration
  - `jjmlovesgit/Simli_GPT4o-realtime` — community port
- **Risk:** Head-only crop (no body, no Three.js scene). If we want our French sensei NPC walking around a 3D Tokyo street, Simli only gives us a floating photoreal face. Workaround: composite the Simli `<video>` into a 2D HUD overlay or onto a billboard quad in our R3F scene.
- **Demo:** simli.com landing page has a live talking demo.

### Beyond Presence (bey.dev)
- **Pricing:** Free 20 min Managed Agents / 40 min S2V. Starter $49/mo (140 min managed, 280 min S2V). Overage $0.175–$0.35/min. **Speech-to-Video API as low as $0.0875/min** at Scale.
- **Latency:** 250ms speech-to-video animation; <1s end-to-end with their managed agent.
- **Languages:** 29 conversational (JA, FR, ES, ZH-Mandarin, KO, PT, etc.). Avatar speaks any TTS-supported language.
- **Avatar look:** Hyper-realistic head + shoulders presenter.
- **Customisation:** Record a short video of yourself → digital twin; or pick from preset gallery.
- **Integration:** **BYO audio via Speech-to-Video API.** Native plugins for **LiveKit**, **n8n**, **Pipecat**. Their Managed Agents includes ASR+LLM+TTS, but you can use raw S2V to BYO everything.
- **Embed:** WebRTC `<video>` (LiveKit room) or their JS SDK.
- **OSS:** github.com/bey-dev org; Python + TS SDKs. Community starter `tomasbusse/vocab-trainer-avatar` is directly relevant — **English vocab trainer using LiveKit + Beyond Presence avatar** — closest analogue to HuskyHac in the wild.
- **Risk:** Newer (TS SDK April 2026, Python Dec 2025). License terms on digital-twin commercial use need a read.

### HeyGen LiveAvatar
- **Pricing:** $99/mo API plan minimum. **Lite mode + BYO LLM = 1 credit/min = $0.10/min.** Full mode (their GPT-4o-mini + ElevenLabs) is more expensive per-credit.
- **Latency:** ~1–1.5s end-to-end (slower than Simli/BeyondPresence but acceptable).
- **Languages:** 175+ via their voice library (full coverage of FR, JA, ZH, ES regionals).
- **Avatar look:** Photorealistic head-and-shoulders. Largest preset library of all vendors.
- **Customisation:** Upload your own photo/video → instant avatar; preset gallery of 100s.
- **Integration:** **BYO audio in Lite mode.** Lite = HeyGen does ASR + face render, you supply LLM responses (or TTS). Documented OpenAI Realtime integration exists (Silversky tutorial on Medium).
- **Embed:** WebRTC + their `@heygen/streaming-avatar` JS SDK takes over a `<video>` element.
- **OSS:** Many community examples (`Diksha8859/heygen-avatar-voice-video-assistant` — Deepgram + Azure OpenAI; `onedream0824/heygen_avatar` — ChatGPT; `AgriciDaniel/lipnardo` — Claude Code skill). HeyGen also publishes official examples.
- **Risk:** TOS restricts redistribution; avatar IP is HeyGen's not ours. Slower than competitors. Most expensive in the "cheap tier."

### Tavus CVI
- **Pricing:** Free 25 min. Starter $59/mo. Overage $0.32–$0.37/min. Most expensive of the modern crop except D-ID.
- **Latency:** ~600ms (Sparrow-0 turn-taking model collapses dead air); SLA <1s utterance-to-utterance; new <500ms tier announced.
- **Languages:** 30+ via Cartesia + ElevenLabs TTS. Confirmed FR, JA, ZH, ES.
- **Avatar look:** The most polished — full-face micro-expressions via Phoenix-3 model, Raven-0 reads user's face for empathic response.
- **Customisation:** "Replicas" — train from a 2-min video; preset library.
- **Integration:** **BYO LLM, STT, TTS layers** all swappable. Their stack uses Daily.co WebRTC under the hood.
- **Embed:** Daily.co `<DailyProvider>` + `<DailyVideo>` React components. Full vibecode template at `Tavus-Engineering/tavus-vibecode-quickstart`.
- **OSS:** Strong — official `Tavus-Engineering/tavus-vibecode-quickstart`, `andy-tavus/microphone-only-cvi`, `andy-tavus/text_chat_only_cvi`, plus 8+ community apps (oral exam tutor `evalora-v2`, AI EdTech tutor `kar69-96/Personal-TA` — also language-tutor adjacent).
- **Risk:** 3.5–4x Simli's price. Premium positioning. Polish you may not need for hackathon judging.

### Anam.ai
- **Pricing:** Free 30 min/mo. Starter **$12/mo for 45 min** + $0.18/min overage. Explorer $49/mo (90 min, custom LLM, 3 concurrent). Growth $299/mo (300 min). Per-second billing.
- **Latency:** 180ms model latency; sub-1s end-to-end.
- **Languages:** 70+ with native voices. Multilingual conversations supported with configurable transcription language. JA/FR/ES/ZH all confirmed.
- **Avatar look:** Photorealistic head — CARA-3 diffusion model (claims #1 on Avatar Benchmark 2025), 25fps 720x480.
- **Customisation:** Upload image or generate from text prompt → real-time avatar in <2 min. 20 stock avatars. Voice cloning available.
- **Integration:** **BYO audio confirmed via "audio passthrough"** — explicitly designed for ElevenLabs Conversational AI as drop-in face. Should work identically with OpenAI Realtime by piping the Realtime output audio stream to Anam.
- **Embed:** JS SDK; `<video>` element via WebRTC.
- **OSS:** `mcherif/anam-travel-agent`, `Hadbah-Inshal/ai-avatar-demo` (Zep + custom LLM), `shawnkelshaw/anam-on-wordpress`. Smaller ecosystem than Simli/Tavus.
- **Risk:** Smaller team / smaller ecosystem; less battle-tested.

### D-ID Agents / Streaming API
- **Pricing:** **$5.90/min.** That's it. That's the deal-breaker.
- **Latency:** ~1–2s, 100fps render.
- **Languages:** 100+ via integrated voices.
- **BYO:** Yes, can wire any LLM.
- **Verdict:** **Skip.** 65x more expensive than Beyond Presence S2V, 600x more than Simli Trinity-1. Pioneered the space, now overpriced relative to what it delivers.

### Synthesia
- Real-time "Video Agents" announced for enterprise rollout early 2026, not self-serve API. Synthesia 3.0 "Express-2" avatars are still primarily for pre-recorded video. **Skip for hackathon.**

### Soul Machines
- **In receivership as of Feb 5, 2026.** Service unreliable. Skip.

### Inworld AI
- Sells voice + LLM orchestration, **not a rendered face.** TTS-1.5 Mini $5/M chars (~$0.005/min), Max $10/M (~$0.01/min). LLMs at provider cost. Founder pricing locked in until May 7, 2026.
- Useful for our voice/LLM stack if we *don't* use OpenAI Realtime. Doesn't replace the avatar layer.
- **Not in the avatar comparison.**

### Convai
- **The only vendor that ships a Three.js + React Web SDK that animates a 3D rigged character** (ARKit, MetaHuman, custom blendshapes — same blendshape system as our planned TalkingHead build).
- Pricing is quote-only / opaque. Free tier exists for hobby use.
- Latency ~700ms, decent.
- **They handle ASR + LLM + lipsync (via NeuroSync) end-to-end** — but their architecture *is* "BYO scene": you bring the GLB and the Three.js scene, they drive the mouth.
- This is structurally **closer to our planned TalkingHead build than to Simli/HeyGen.** It's not a `<video>` competitor — it's a "lipsync-as-a-service for your own 3D avatar."
- If we keep the 3D character path and just want to skip writing the lipsync code ourselves, Convai is the relevant offering. But it doesn't fit the "embed a video stream" hypothesis the user asked about.
- **OSS:** Convai blog has Three.js/React tutorials and Reallusion avatar walkthroughs.

### Runway Characters
- New (2026 launch). Deploy any image as a real-time conversational character. Bundled in Runway subscription (~$15+/mo). Limited public details on BYO-audio. **Watchlist; don't bet a hackathon on it.**

## Open-source starter kits per vendor (quick index)

| Repo | Stars (approx) | License | What it does |
|---|---|---|---|
| `simliai/simli-openai-realtime` | active 2026 | MIT (vendor org) | **OpenAI Realtime + Simli — plug-and-play for HuskyHac** |
| `simliai/create-simli-app-openai` | active | MIT | One-command Next.js app w/ OpenAI + Simli |
| `simliai/simli-client` | active | MIT | Web SDK |
| `Tavus-Engineering/tavus-vibecode-quickstart` | Mar 2026 | MIT | Tavus React quickstart |
| `andy-tavus/microphone-only-cvi` | active | MIT | Mic-input only template |
| `tomasbusse/vocab-trainer-avatar` | Jan 2026 | unknown | **English vocab tutor w/ LiveKit + Beyond Presence — direct HuskyHac analogue** |
| `mcherif/anam-travel-agent` | Jan 2026 | unknown | Anam + tools demo |
| `Hadbah-Inshal/ai-avatar-demo` | Jan 2026 | unknown | Anam + Zep memory + custom LLM |
| `mascotbot-templates/openai-realtime-avatar` | Apr 2026 | unknown | OpenAI Realtime + Mascot Bot animated avatar |
| `Diksha8859/heygen-avatar-voice-video-assistant` | Nov 2025 | unknown | HeyGen + Deepgram + Azure OpenAI |
| `michel-adelino/openai-realtime-avatar` | Mar 2026 | unknown | OpenAI Realtime + avatar demo |

## BYO-OpenAI-Realtime integration patterns

**The critical question: can we route OpenAI Realtime's audio output to the avatar's mouth?** Yes for every modern vendor on the table. Three patterns observed:

**Pattern A — Vendor as pure renderer (BEST for HuskyHac):**
```
[mic] → OpenAI Realtime (STT + LLM + TTS in one) → audio stream
                                                     ↓
                                      [Simli / Beyond Presence S2V / Anam passthrough]
                                                     ↓
                                            <video> element in DOM
```
Used by: Simli (PCM frames over WebRTC), Beyond Presence Speech-to-Video API, Anam audio-passthrough mode, HeyGen Lite (with custom-TTS bridge).

**Pattern B — Vendor as audio sink + own TTS:**
```
[mic] → OpenAI Realtime (STT + LLM, text mode) → text → vendor TTS → vendor avatar render
```
Used by: HeyGen LiveAvatar default (ElevenLabs Flash 2.5 forced), Tavus when you don't override TTS layer. **Loses Realtime's low-latency speech-to-speech — avoid.**

**Pattern C — Vendor takes over the whole stack:**
```
[mic] → vendor ASR → vendor LLM → vendor TTS → vendor avatar
```
Used by: Tavus default, HeyGen Full mode, Beyond Presence Managed Agents. **Loses our prompt control — definitely avoid for a language tutor.**

For HuskyHac, **Pattern A with Simli or Beyond Presence** is the right answer. Both have working OSS reference impls.

## Cost projection for HuskyHac

Assumptions: 1 hackathon weekend dev = ~10 hrs of avatar conversation across team testing. Production = average user does 15 min/day, 5 days/week = 75 min/user/month.

**Hackathon dev/demo (10 hrs = 600 min):**
| Vendor | Cost |
|---|---|
| Simli (Trinity-1, $0.009/min) | **$5.40** |
| Simli (standard, $0.05/min) | $30 |
| Beyond Presence (S2V Free + overage, $0.175/min) | $0 (free 40 min) + $98 = ~$98 (or stay in Starter $49 + 320 overage min × $0.175 = ~$105) |
| Beyond Presence (Managed Agents) | Free 20 min + 580 × $0.35 = $203 |
| Tavus | Free 25 min + 575 × $0.37 = $213 |
| Anam ($0.18/min, free 30 min) | $103 |
| HeyGen Lite ($0.10/min) + $99/mo plan | $99 + ($60 if over plan minutes) |
| D-ID | $3,540 (lol no) |

**Per-user-session in production (75 min/user/month):**
| Vendor | $/user/month |
|---|---|
| Simli Trinity-1 | $0.68 |
| Simli standard | $3.75 |
| Beyond Presence Scale ($0.0875/min) | $6.56 |
| Anam ($0.18/min) | $13.50 |
| Beyond Presence Starter ($0.175/min) | $13.13 |
| Tavus Growth ($0.32/min) | $24.00 |
| HeyGen Lite ($0.10/min) | $7.50 |
| D-ID | $442.50 |

For a free or freemium-tier language app, **only Simli and HeyGen Lite have margins that survive**. Beyond Presence Scale is acceptable for paid users. Tavus, Anam, D-ID require >$25/mo subscription pricing to break even.

## Recommendation

**Hackathon weekend: Simli + OpenAI Realtime, using `simliai/create-simli-app-openai` as the starter.** Single command to bootstrap, BYO audio works out of the box, $0.009–$0.05/min so the entire weekend's testing costs less than a coffee. WebRTC delivers the avatar to a `<video>` tag we can position absolutely over the 3D scene or on a billboard quad in R3F.

**Strategic fork the team needs to call before Monday:**
- **If we ship a 2D-talking-head experience:** Simli wins. Replace the entire planned TalkingHead + HeadAudio + GLB pipeline. Saves us the avatarOnly R3F integration risk in research note `09-lipsync-integration.md`. ~50% of the avatar-layer build deletes.
- **If we keep the immersive 3D-walk-around vision (Three.js sensei in a Tokyo street scene):** Simli's photoreal face doesn't fit the aesthetic. **Convai** is the only vendor whose offering plugs into that path (Three.js + ARKit blendshape rig, lipsync-as-a-service). Otherwise stay with the planned TalkingHead build from research note 09.

**Hedge:** Build the hackathon demo with Simli (Pattern A) first — it's the lowest-risk, highest-quality result for a 48-hour build. If judges/users react that "the floating face breaks immersion," we have weekend +1 to swap to TalkingHead/Convai for the 3D path. The Simli-OpenAI Realtime wiring is throwaway code; the OpenAI Realtime conversation logic (system prompt, tutor scaffolding, language switching) is reusable across all paths.

**Backup vendor in case of Simli outage during demo:** Beyond Presence Speech-to-Video API. Same Pattern A architecture, ~3x more expensive but production-grade.

Sources:
- [HeyGen API Pricing](https://www.heygen.com/api-pricing) / [LiveAvatar FAQ](https://help.heygen.com/en/articles/12758866-liveavatar-faq) / [Silversky OpenAI Realtime + HeyGen tutorial](https://medium.com/@silverskytechnology/building-a-real-time-ai-avatar-assistant-with-openai-realtime-heygen-cb5f222732a5)
- [Tavus pricing](https://www.tavus.io/pricing) / [Tavus language support](https://docs.tavus.io/sections/conversational-video-interface/language-support) / [Tavus CVI overview](https://docs.tavus.io/sections/conversational-video-interface/overview-cvi)
- [Anam pricing](https://anam.ai/pricing) / [Anam multilingual docs](https://docs.anam.ai/concepts/multilingual) / [Anam API docs](https://anam.ai/api)
- [Simli docs](https://docs.simli.com/) / [Simli homepage](https://www.simli.com/) / [Verda blog on Simli inference](https://verda.com/blog/how-simli-achieved-cost-efficient-real-time-inference-for-interactive-ai)
- [Beyond Presence pricing](https://www.beyondpresence.ai/pricing) / [Beyond Presence API docs](https://docs.bey.dev/get-started/api) / [LiveKit BeyondPresence plugin](https://docs.livekit.io/agents/models/avatar/plugins/bey/)
- [D-ID review heyfish.ai](https://heyfish.ai/d-id-review)
- [Soul Machines receivership context](https://anam.ai/blog/anam-vs-soul-machines)
- [Synthesia 3.0 announcement](https://www.synthesia.io/3)
- [Convai Three.js tutorial](https://convai.com/blog/ai-avatars-inside-browser-threejs-react-convai-web-sdk-tutorial) / [Convai pricing](https://convai.com/pricing)
- [Inworld founder pricing](https://inworld.ai/founder-pricing)
- [Live Avatar landscape comparison (Medium, Garcia)](https://medium.com/@ggarciabernardo/the-live-avatar-landscape-apis-transport-and-subjective-evaluation-of-10-leading-providers-5b5b6e8a54dc)
- [Best AI Avatar APIs developer guide (Percify)](https://percify.io/blog/best-ai-avatar-apis-in-2026-developer-comparison-guide)
