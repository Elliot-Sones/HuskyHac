# Lipsync Integration — TalkingHead vs Alternatives

## TL;DR — recommended choice

**Use `met4citizen/TalkingHead` in `avatarOnly` mode + the `met4citizen/HeadAudio` audio worklet, mounted inside R3F.** This is the only stack that (a) consumes a raw `MediaStreamTrack` from OpenAI Realtime WebRTC, (b) is fully language-agnostic for lip-sync (the Mahalanobis-distance MFCC classifier doesn't care if it's Japanese, French, Mandarin, or English), and (c) has a battle-tested OpenAI Realtime + WebRTC reference implementation we can copy almost verbatim (`HeadAudio/openai.html`).

`avatarOnly: true` is the unlock — discovered in `TalkingHead/README.md` Appendix H. In this mode TalkingHead does **not** create its own canvas/renderer/scene; it exposes `head.armature` (a `THREE.Object3D`) that you `<primitive object={head.armature} />` into your R3F scene, and you drive its animation by calling `head.animate(deltaMs)` from `useFrame`. So TalkingHead is fully compatible with R3F — the "vanilla Three.js" reputation is misleading.

For lipsync algorithm: HeadAudio (audio-driven, MFCC + Gaussian prototypes, 50–100ms latency) is what we want for OpenAI Realtime — text-driven `speakText` requires word-level timestamps which Realtime doesn't expose cleanly. wawa-lipsync is a viable simpler fallback if HeadAudio's WebGPU/worklet setup proves fragile, but quality is materially lower (8 frequency-band heuristics vs trained MFCC classifier).

## TalkingHead deep-dive

**Architecture (CRITICAL):** Two modes, controlled by the `avatarOnly` constructor option.
- **Standalone** (default): owns its own `THREE.WebGLRenderer`, `Scene`, `PerspectiveCamera`, `OrbitControls`, lights, environment map. Appends its canvas as a child of the DOM node passed to the constructor. Incompatible with R3F unless rendered as a separate DOM layer.
- **`avatarOnly: true`** (Appendix H): no renderer/scene/canvas/lights are created. The class exposes `head.armature` (a `THREE.Group`) that you add to your own scene. You call `head.animate(deltaMs)` from your own render loop. **This is the R3F-compatible mode.** Reference: `TalkingHead/modules/talkinghead.mjs:833-870`.

**Input format:**
- `speakText(str)` — needs Google/Azure/Eleven TTS proxy with word-level timestamps (NOT what we have).
- `speakAudio({audio, words, wtimes, wdurations, visemes?, vtimes?, vdurations?})` — accepts `AudioBuffer` or PCM 16-bit LE chunks **plus** pre-aligned word/viseme timing arrays.
- `streamStart()` / `streamAudio({audio, visemes?, words?})` — chunked PCM streaming with viseme data (`lipsyncType: "visemes" | "blendshapes" | "words"`). Designed for live TTS (Azure Speech SDK reference example in `examples/azure-audio-streaming.html`).
- **None of the built-in methods take a raw `MediaStreamTrack`.** This is why we need HeadAudio.

**HeadAudio** (separate companion module by same author, MIT, late 2025): an `AudioWorkletNode` that ingests audio from any Web Audio source (including a `MediaStreamSource` from a remote WebRTC track) and outputs Oculus viseme blendshape values via an `onvalue(key, value)` callback. The `HeadAudio/openai.html` demo (642 lines) shows exact integration with OpenAI Realtime WebRTC — `connection.ontrack` → `audioCtx.createMediaStreamSource(stream).connect(head.audioAnalyzerNode)` and `head.audioSpeechGainNode.connect(headaudio)`.

**Avatar requirements:**
- Mixamo-compatible bone rig (root named "Armature" by default; `mixamorig:` prefix auto-stripped).
- **52 ARKit blendshapes** (`eyeBlinkLeft`, `jawOpen`, `mouthSmileLeft`, … full list in README Appendix A).
- **15 Oculus visemes** (`viseme_aa`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`, `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`, `viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_sil`).
- Compatible avatar sources: **Avaturn (Type-2)**, **Ready Player Me** (RPM shut down Jan 31 2026 per prior research — existing GLBs still work but no new ones), **Avatar SDK / MetaPerson**, **VRoid Studio** (anime style, needs Blender conversion), **MPFB** Blender extension (CC0), Microsoft Rocketbox (needs re-rig in Mixamo). Faceit Blender add-on can generate ARKit+Oculus shapes from any custom mesh.

**Lipsync algorithm:**
- **Text-driven** (`lipsync-en.mjs`, `lipsync-fr.mjs`, `lipsync-de.mjs`, `lipsync-fi.mjs`, `lipsync-lt.mjs`): word→phoneme→viseme with rule-based or letter-to-sound mapping, scaled by TTS word timestamps.
- **Audio-driven** (HeadAudio): MFCC feature vectors → Gaussian prototype Mahalanobis-distance classifier → 15 Oculus viseme values per ~10ms frame. Energy-gated VAD. Pre-trained `model-en-mixed.bin` shipped (~few hundred KB).

**Languages:**
- Built-in text lipsync: **English, German, French, Finnish, Lithuanian** only.
- Via Azure Speech SDK: **100+ languages** (Microsoft generates visemes server-side, fed to `streamAudio`).
- HeadAudio (audio-driven): **language-agnostic in principle** — phonemes have similar acoustic signatures across languages. Trained on English but README explicitly says it works on any audio. Quality on tonal languages (Mandarin) is unverified.

**License + maintenance:** MIT, both repos. TalkingHead 1.2k★, last commit very recent (still active 2026), published to npm as `@met4citizen/talkinghead`. HeadAudio published 2025, MIT. No open issues about R3F integration specifically — Appendix H avatarOnly was added precisely for this use case.

## R3F integration code (winner)

Install: `npm i @met4citizen/talkinghead three`. Download `headaudio.min.mjs`, `headworklet.min.mjs`, `model-en-mixed.bin` from `met4citizen/HeadAudio/dist/` and serve from `/public/headaudio/`.

```jsx
// src/components/TalkingHeadNPC.jsx
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TalkingHead } from '@met4citizen/talkinghead';

export function TalkingHeadNPC({
  avatarUrl,         // GLB with ARKit + Oculus blendshapes (Avaturn / RPM / etc.)
  remoteStream,      // MediaStream from OpenAI Realtime ontrack
  position = [0,0,0],
  lipsyncLang = 'en',
}) {
  const { camera, scene } = useThree();
  const headRef = useRef(null);
  const headAudioRef = useRef(null);
  const [armature, setArmature] = useState(null);

  // 1. Create avatarOnly TalkingHead instance + load avatar
  useEffect(() => {
    let cancelled = false;
    const stub = document.createElement('div'); // never attached; required by ctor
    const head = new TalkingHead(stub, {
      avatarOnly: true,
      avatarOnlyCamera: camera,
      avatarOnlyScene: scene,           // armature auto-added to R3F scene
      lipsyncModules: ['en','fr','de'], // built-in fallback
      lipsyncLang,
      modelFPS: 60,
    });

    (async () => {
      await head.showAvatar({ url: avatarUrl, body: 'F', lipsyncLang });
      if (cancelled) return;
      headRef.current = head;
      setArmature(head.armature);

      // 2. Load HeadAudio worklet (audio-driven viseme detection)
      await head.audioCtx.audioWorklet.addModule('/headaudio/headworklet.min.mjs');
      const { HeadAudio } = await import('/headaudio/headaudio.min.mjs');
      const ha = new HeadAudio(head.audioCtx, {
        parameterData: { vadGateActiveDb: -40, vadGateInactiveDb: -55 },
      });
      await ha.loadModel('/headaudio/model-en-mixed.bin');

      // Pipe analyzer (where we'll inject the OpenAI track) → speech gain → headaudio
      head.audioSpeechGainNode.connect(ha);
      ha.onvalue = (key, value) => {
        Object.assign(head.mtAvatar[key], { newvalue: value, needsUpdate: true });
      };
      ha.start();
      headAudioRef.current = ha;
    })();

    return () => {
      cancelled = true;
      headAudioRef.current?.stop();
      headRef.current?.stop();
    };
  }, [avatarUrl]); // eslint-disable-line

  // 3. Wire OpenAI Realtime MediaStream → TalkingHead audio graph
  useEffect(() => {
    const head = headRef.current;
    if (!head || !remoteStream) return;

    // Chrome bug workaround: a muted <audio> must touch the stream
    const a = new Audio(); a.muted = true; a.srcObject = remoteStream;

    const src = head.audioCtx.createMediaStreamSource(remoteStream);
    src.connect(head.audioAnalyzerNode); // → audioSpeechGainNode → headaudio
    if (head.audioCtx.state !== 'running') head.audioCtx.resume();
    return () => { try { src.disconnect(); } catch {} };
  }, [remoteStream]);

  // 4. Drive animation from R3F's frame loop
  useFrame((_, dt) => { headRef.current?.animate(dt * 1000); });

  return armature ? <primitive object={armature} position={position} /> : null;
}
```

OpenAI Realtime WebRTC bootstrap (caller passes `remoteStream` to component):

```jsx
const pc = new RTCPeerConnection();
const [remote, setRemote] = useState(null);
pc.ontrack = (e) => { if (e.track.kind === 'audio') setRemote(e.streams[0]); };
const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(mic.getAudioTracks()[0], mic);
// ... SDP offer/answer with /v1/realtime/calls (see HeadAudio/openai.html:451-477)

<TalkingHeadNPC avatarUrl="/avatars/sensei.glb" remoteStream={remote} lipsyncLang="ja" />
```

## Avatar shopping list

- **Primary source: Avaturn** (avaturn.me) — Type-2 avatars are TalkingHead-compatible out of the box, free for non-commercial. For commercial: notify them, additional terms apply. Generates from a photo.
- **Secondary: VRoid Studio** for anime/stylized JP/CN characters (free, permissive license; needs Blender script from `met4citizen/TalkingHead/blender/VRoid/VROID.md` to convert VRM→GLB with proper blendshapes).
- **Tertiary: MPFB** (Blender, CC0) for fully open-source pipeline.
- **Required morph targets**: 52 ARKit + 15 Oculus visemes (full list above). Avaturn ships with both.
- **Optional Quaternius**: their characters do NOT have ARKit/Oculus blendshapes by default — would require Faceit add-on or similar to add them. Skip unless we want to invest in custom rigging.
- **Conversion**: For non-Avaturn assets, use Faceit Blender add-on (paid) or hand-rig morph targets. `gltf-transform optimize avatar.glb out.glb --compress meshopt --texture-compress webp` for size.

## Alternatives table

| Solution | Quality | R3F-native? | Languages | Verdict |
|---|---|---|---|---|
| **TalkingHead avatarOnly + HeadAudio** | High (trained MFCC) | Yes (avatarOnly mode) | Any (audio-driven) | **WINNER** — only option with WebRTC track + multilingual + 3D rig |
| **TalkingHead avatarOnly + speakText** | High (phoneme rules) | Yes | Only en/de/fr/fi/lt built-in | Skip — no Realtime audio path |
| wawa-lipsync | Medium (heuristic 7-band FFT, vowel/plosive/fricative FSM) | Yes (R3F-first design) | Any (audio-driven) | Backup — simpler, but accuracy notably lower; ships v0.0.2; consumes `HTMLMediaElement`, would need a tiny `<audio srcObject={stream}>` shim |
| Oculus OVR LipSync (WASM ports) | High | Possible | Any | No actively maintained web port; abandoned forks. Skip. |
| Rhubarb Lip Sync | High (offline) | N/A (server-side) | English-tuned, others poor | Too slow for live conversation. Skip. |
| Ready Player Me built-in lipsync | Medium | Yes (RPM SDK) | English bias | **RPM shut down Jan 31 2026** (confirmed in earlier research). Existing GLBs usable as TalkingHead-compatible meshes; their proprietary lipsync SDK not reliable to depend on. Skip. |
| NVIDIA Audio2Face (web) | Excellent | No (cloud API, no JS SDK) | Strong multilingual | Overkill, server-side, expensive, latency. Flag for Phase 2 only. |

## Risks

1. **HeadAudio model is English-trained.** README claims it works cross-lingually because phoneme acoustics are universal-ish, but Japanese/Mandarin tonality and Mandarin's broader vowel inventory are unvalidated. **Mitigation**: prototype with each target language during Week 1; if quality drops, fall back to wawa-lipsync (also language-agnostic) or train a custom HeadAudio model (training pipeline exists in `HeadAudio/training/`).
2. **HeadAudio is brand-new** (first commit 2025, single maintainer). Lower-bus-factor than TalkingHead itself. **Mitigation**: vendor `headaudio.min.mjs` + `model-en-mixed.bin` into our repo so upstream changes can't break us; the worklet is ~self-contained.
3. **`avatarOnly` mode is marked EXPERIMENTAL** in the README. The constructor still requires a DOM node (we pass a detached `<div>`) and may create resize observers that error in strict R3F lifecycles. **Mitigation**: wrap construction in try/catch; the `headStub` div technique is taken straight from Appendix H pattern.
4. **AudioContext sample-rate mismatch.** OpenAI Realtime WebRTC delivers 24kHz/48kHz Opus; TalkingHead defaults `pcmSampleRate: 22050`. For our path the WebRTC track stays in the `audioCtx` graph as live audio (not PCM), so this only matters if we ever switch to `streamAudio` PCM — flag for later.
5. **Chrome remote-stream bug** (touched by HeadAudio demo): a muted `<audio srcObject={stream}>` must be created or the Web Audio graph won't process the remote track. Already handled in the snippet above — must not be removed.
6. **GLB licensing.** Many avatar generators (Avaturn, RPM legacy) restrict commercial public-web distribution because the GLB is downloadable. **Action**: confirm license per avatar pack before shipping; MPFB (CC0) is the safe default for production.
7. **No 3D position-aware audio yet.** Both TalkingHead and HeadAudio assume a single mono speech source. For multiple NPCs talking simultaneously (unlikely Phase 1) we'd need one `HeadAudio` worklet per NPC + per-NPC `MediaStreamSource`. Doable but uncharted.
