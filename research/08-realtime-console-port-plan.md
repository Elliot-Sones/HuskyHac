# OpenAI Realtime Console — Port Plan into viber3d

Source: `https://github.com/openai/openai-realtime-console` @ commit `ab8b8f5` (2025-08-28). MIT, ~3.6k stars. The repo is intentionally tiny — **5 React components + 1 Express server + 1 Vite config**, ~400 lines total of meaningful code.

## Architecture summary (one paragraph)

The console is a single-page React 18 + Vite app served by a thin Express SSR server (`server.js`). The Express server holds the OpenAI API key in `process.env.OPENAI_API_KEY` and exposes **two endpoints**: `GET /token` (mints an ephemeral `client_secret` via `POST https://api.openai.com/v1/realtime/client_secrets`), and `POST /session` (the experimental "all-in-one SDP" path — proxies the browser's SDP offer to `https://api.openai.com/v1/realtime/calls`). The browser path used by `App.jsx` is the **direct WebRTC** flow: fetch `/token` → `new RTCPeerConnection()` → `getUserMedia({audio:true})` → `pc.addTrack(mic)` → `pc.createDataChannel("oai-events")` → create local SDP offer → `POST` raw SDP to `https://api.openai.com/v1/realtime/calls?model=gpt-realtime` with `Authorization: Bearer ${EPHEMERAL_KEY}` → set the SDP answer as remote description. Audio plays via `pc.ontrack` writing the MediaStream to a hidden `<audio autoplay>`. JSON events (model speech transcripts, function calls, lifecycle) flow through the data channel; tool calls arrive as `response.done` events with `output[i].type === "function_call"` and the client responds with `conversation.item.create` (function_call_output) + `response.create`.

## Files to port (concrete table)

| Source file (realtime-console) | Destination (viber3d project) | Modifications | Est. time |
|---|---|---|---|
| `server.js` (lines 31–73, the `/token` and `/session` handlers only) | `server/realtime-token.ts` (new — wire as Vercel Function or Express route depending on deploy target) | Convert to TypeScript; drop Vite SSR middleware (viber3d already has its own dev server); add CORS for the dev port; update `sessionConfig` to set `instructions`, `voice: "marin"`, `tools: [scene_complete]`, `input_audio_transcription` | 1 h |
| `client/components/App.jsx` (lines 14–58, `startSession`) | `src/realtime/useRealtime.ts` (new React hook) | Refactor from class-y component into `useRealtime()` hook returning `{ start, stop, sendEvent, dataChannel, remoteStream, status }`. Expose the `MediaStream` from `pc.ontrack` as a state variable so a TalkingHead consumer can tap it. **Critical tap point: line 26** — `pc.ontrack = (e) => setRemoteStream(e.streams[0])` instead of writing directly to an `<audio>` element. | 2 h |
| `client/components/App.jsx` (lines 82–142, `sendClientEvent`, `sendTextMessage`, data-channel listeners) | merged into `src/realtime/useRealtime.ts` | Replace `setEvents` chat-log array with a typed event emitter (`mitt` or just a `Set<Listener>`). NPCs subscribe to specific event types (`response.audio_transcript.delta`, `response.done`, `input_audio_buffer.speech_started`). | 1 h |
| `client/components/ToolPanel.jsx` (lines 7–39, `sessionUpdate` shape; lines 75–109, function-call detection in `response.done`) | `src/realtime/tools.ts` + `src/realtime/handlers/sceneComplete.ts` | Replace `display_color_palette` tool with `scene_complete({reason, score})`. Keep the exact `response.done` → loop over `output[]` → match `output.type === "function_call"` pattern. Send back `conversation.item.create` with `type: "function_call_output"` then `response.create` to continue the convo. | 1.5 h |
| `client/entry-client.jsx`, `entry-server.jsx`, `pages/index.jsx`, `index.js`, `vite.config.js`, `tailwind.config.js`, `postcss.config.cjs` | **drop** — viber3d brings its own | none | 0 |
| `client/base.css`, `Button.jsx` | **drop** | none | 0 |
| `package.json` deps | merge into viber3d `package.json` | Add only `dotenv` (server) and (if using Express deploy) `express`. Drop `react-feather`, `react-router-dom`, `history`, `minipass`, `tailwindcss`. viber3d already has React 19, Vite, Tailwind. | 0.25 h |

**Total file count to port: 2 logical units** (one server endpoint, one client hook + tool handler).

## Files to DROP (UI we don't need)

- `client/components/EventLog.jsx` — debug JSON viewer; useful during dev only, copy into `src/realtime/DevEventLog.tsx` behind a `?debug=1` query if wanted (~5 min).
- `client/components/SessionControls.jsx` — start/stop button + text input. Replaced by viber3d game UI (push-to-talk on a key, or always-on mic when scene is active).
- `client/components/ToolPanel.jsx` rendering — keep only the *logic* (function-call detection); drop the `<FunctionCallOutput>` color-swatch JSX.
- `client/components/Button.jsx` — viber3d/shadcn equivalents.
- `client/entry-server.jsx`, `entry-client.jsx`, `pages/index.jsx`, SSR plumbing — viber3d isn't SSR'd.
- `react-feather`, `react-router-dom` deps — not needed.

## Token endpoint code (paste-ready)

```ts
// server/realtime-token.ts  (Vercel/Express compatible)
import "dotenv/config";

const sessionConfig = {
  type: "realtime",
  model: "gpt-realtime",
  voice: "marin",
  instructions:
    "You are an NPC in a Spanish-immersion 3D game. Speak ONLY Spanish. " +
    "Wait for the player to greet you. When the scene goal is met, call scene_complete().",
  input_audio_transcription: { model: "whisper-1" },
  tools: [
    {
      type: "function",
      name: "scene_complete",
      description: "Call when the player has accomplished the scene goal.",
      parameters: {
        type: "object",
        strict: true,
        properties: {
          reason: { type: "string" },
          score: { type: "number", description: "0..1 fluency rating" },
        },
        required: ["reason", "score"],
      },
    },
  ],
  tool_choice: "auto",
};

export async function handleToken(_req: Request): Promise<Response> {
  const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: sessionConfig }),
  });
  const data = await r.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## WebRTC client code (skeleton, with TalkingHead tap point marked)

```ts
// src/realtime/useRealtime.ts
import { useCallback, useRef, useState } from "react";

type Status = "idle" | "connecting" | "live" | "error";

export function useRealtime() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  // === TALKINGHEAD TAP POINT ===
  // remoteStream is the MediaStream coming back from OpenAI.
  // 1. Pipe it into a hidden <audio autoplay srcObject={remoteStream}> for playback.
  // 2. Pipe the SAME stream into an AnalyserNode (Web Audio) →
  //    feed RMS / FFT into TalkingHead.setAudioVolume() each frame for lipsync.
  // Tee is free: MediaStream can be the source of multiple consumers.
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const start = useCallback(async () => {
    setStatus("connecting");
    const { value: ephemeralKey } = await fetch("/token").then((r) => r.json());

    const pc = new RTCPeerConnection();
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);   // <-- the tap

    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(mic.getTracks()[0]);

    const dc = pc.createDataChannel("oai-events");
    dcRef.current = dc;
    dc.addEventListener("open", () => setStatus("live"));
    dc.addEventListener("message", (e) => onServerEvent(JSON.parse(e.data)));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpRes = await fetch(
      "https://api.openai.com/v1/realtime/calls?model=gpt-realtime",
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      },
    );
    await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
    pcRef.current = pc;
  }, []);

  const sendEvent = useCallback((msg: any) => {
    msg.event_id ??= crypto.randomUUID();
    dcRef.current?.send(JSON.stringify(msg));
  }, []);

  const stop = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    setStatus("idle");
    setRemoteStream(null);
  }, []);

  return { status, start, stop, sendEvent, remoteStream };
}
```

The TalkingHead consumer:

```tsx
// src/scene/NpcMouth.tsx
useEffect(() => {
  if (!remoteStream) return;
  const ac = new AudioContext();
  const src = ac.createMediaStreamSource(remoteStream);
  const analyser = ac.createAnalyser();
  src.connect(analyser);
  const buf = new Uint8Array(analyser.frequencyBinCount);
  let raf: number;
  const tick = () => {
    analyser.getByteTimeDomainData(buf);
    let rms = 0;
    for (const v of buf) rms += (v - 128) ** 2;
    talkingHead.setMouthOpen(Math.sqrt(rms / buf.length) / 64);
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { cancelAnimationFrame(raf); ac.close(); };
}, [remoteStream]);
```

## Tool-call handler example (scene_complete wired)

```ts
// src/realtime/handlers/sceneComplete.ts
export function onServerEvent(ev: any, ctx: { sendEvent: (m:any)=>void; onComplete:(p:any)=>void }) {
  if (ev.type !== "response.done" || !ev.response?.output) return;
  for (const out of ev.response.output) {
    if (out.type === "function_call" && out.name === "scene_complete") {
      const args = JSON.parse(out.arguments);
      ctx.onComplete(args);              // <-- viber3d game advances scene
      ctx.sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: out.call_id,
          output: JSON.stringify({ ok: true }),
        },
      });
      ctx.sendEvent({ type: "response.create" });
    }
  }
}
```

## Compatibility & gotchas

- **React 18 → 19**: realtime-console pins `react@^18.2.0`. The code uses only `useState`, `useEffect`, `useRef` — all 100 % compatible with React 19. No StrictMode-double-invoke hazards because `startSession` is only triggered by user click. **No migration work.**
- **TypeScript strictness**: source is `.jsx` with no types. Rewriting to `.ts`/`.tsx` is part of the port (already shown above). Define an `OAIServerEvent` union type for the ~25 documented event types to satisfy `strict`.
- **Server runtime**: realtime-console assumes Node 18+ Express. viber3d ships pure-Vite (no server). Pick one:
  - Vercel/Netlify edge function (cleanest for static viber3d deploy; ~30 LOC).
  - Vite dev middleware (`vite-plugin-node`) for local-only dev (no separate process).
  - Standalone Express on a different port + Vite proxy (matches realtime-console exactly).
- **CORS**: if token endpoint is on a different origin than the Vite dev server (5173), add `Access-Control-Allow-Origin`. Same-origin in production via `vercel.json` rewrite is simpler.
- **Beta deprecation (HARD DEADLINE)**: OpenAI's Realtime *Beta* sunsets **2026-05-07** (5 days from today). The console code already uses the GA shape (`/v1/realtime/calls`, `/v1/realtime/client_secrets`, `gpt-realtime` model name). The header `OpenAI-Beta: realtime=v1` in `server.js` line 40 is **vestigial — drop it** in the port to avoid coupling to the deprecated beta.
- **Mic permissions**: `getUserMedia` requires HTTPS or `localhost`. Vercel previews are HTTPS by default; fine.
- **Autoplay**: the hidden `<audio autoplay>` requires a prior user gesture. Tying `start()` to a button click satisfies that.

## Cost & latency reality-check (May 2026)

- **Pricing (gpt-realtime, GA, May 2026):** input audio ≈ **$0.06/min**, output audio ≈ **$0.24/min**. A typical 90-second NPC exchange (≈30 s player + 60 s AI) runs **~$0.27**. Text-token component negligible for short scenes. (Mini variant exists at lower cost — `gpt-realtime-mini` — worth A/B testing for non-critical NPCs.)
- **Latency:** measured first-audio-out ≈ **500–800 ms** end-to-end on good networks; STUN RTT typically **60–70 ms**. Anecdotal Twitter/Discord reports are consistent. Set a 1.2 s budget.
- **Breaking changes since Aug 2025:**
  - Realtime *Beta* removed **2026-05-07** — already noted; the console's GA endpoints are unaffected.
  - Voice list expanded; `marin` and `cedar` are newer GA-only voices (the console picks `marin`).
  - `session.update` schema slightly tightened — `type: "realtime"` is now required at top level (already in `server.js` line 20).
  - Video input added in GA; not relevant to HuskyHac unless we add lip-reading later.
- **Network reality:** WebRTC degrades gracefully on flaky wifi (jitter buffer absorbs ~150 ms), much better than the deprecated WebSocket path. Stick with WebRTC for the player-facing client.

## Total port effort estimate

| Task | Hours |
|---|---|
| Token endpoint (TS + deploy wiring) | 1.0 |
| `useRealtime` hook (port + types) | 2.0 |
| Event-bus refactor (drop chat array) | 1.0 |
| Tool config + `scene_complete` handler | 1.5 |
| TalkingHead audio-tap integration | 1.5 |
| Strip UI, wire to viber3d push-to-talk | 1.0 |
| Smoke test on dev + Vercel preview | 1.0 |
| Type-strict pass + cleanup | 1.0 |
| **Total** | **10 h** (1.5 focused dev days) |

Risk-adjusted (CORS quirks, autoplay edge cases, first-time TalkingHead wire-up): **~14 h / 2 dev days**.

---

### Sources

- [openai-realtime-console (GitHub, MIT)](https://github.com/openai/openai-realtime-console) — last commit 2025-08-28
- [OpenAI Realtime API guide](https://platform.openai.com/docs/guides/realtime)
- [Realtime API with WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI deprecations (Beta sunset 2026-05-07)](https://developers.openai.com/api/docs/deprecations)
- [webrtcHacks: measuring response latency](https://webrtchacks.com/measuring-the-response-latency-of-openais-webrtc-based-real-time-api/)
- [webrtcHacks: how OpenAI does WebRTC in gpt-realtime](https://webrtchacks.com/how-openai-does-webrtc-in-the-new-gpt-realtime/)
