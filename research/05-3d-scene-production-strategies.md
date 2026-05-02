# 3D Scene Production Strategies — Hackathon Edition

## Research Question
What's the fastest path to 5 believable 3D scenes (airport, taxi, cafe, hotel lobby, street market) for HuskyHac, a browser-deployable Three.js + Threlte (Svelte) language-learning game with NPCs?

## Strategy comparison (TL;DR)

| Strategy | Time/scene | Total (5 scenes) | Wow (1-10) | Complexity (1-10) | Cost | Best when… |
|---|---|---|---|---|---|---|
| A. Asset packs (Kenney/Quaternius/Synty) | 1-2 hr | 6-10 hr | 7 | 4 | $0 (Synty $30) | Need real 3D walkable scenes; consistent style |
| B. AI-gen 3D (Meshy / Tripo / Rodin) | 2-4 hr | 12-20 hr | 6-8 | 7 | $0-50 | Very specific props; willing to fix topology |
| C. 360° panoramas (Skybox AI / Polyhaven) | 20-40 min | 2-4 hr | 8-9 | 3 | $0-24 | **Max wow per hour, fixed-camera dialogue** |
| D. 2.5D stylized (parallax planes) | 1-2 hr | 6-10 hr | 8 | 5 | $0-30 | Want a Ghibli/anime look with low tech risk |
| E. Pure 2D VN | 30 min | 2-3 hr | 4 | 2 | $0 | Backup if Three.js itself goes sideways |

**Verdict at a glance:** **C (360° panoramas) is the clear hackathon winner**, with A as the fallback for any scene needing walkable depth.

---

## Strategy A — Pre-made asset packs

**Pros:** Free, CC0, consistent low-poly style across scenes, immediately glTF-ready.
**Cons:** No single pack covers all 5 scenes; you'll mix sources and aesthetics will clash.

### Top sources

- **Kenney.nl** — CC0, all packs export OBJ/FBX/DAE/STL/glTF. <https://kenney.nl/assets/category:3D>
  - City Kit (Suburban) — 40 houses, just remade <https://kenney.nl/assets/city-kit-suburban>
  - City Kit (Commercial) — 50 assets, shopfronts & signs <https://kenney.nl/assets/city-kit-commercial>
  - City Kit (Roads) — for taxi street view <https://kenney.nl/assets/city-kit-roads>
  - Nature Kit — 330 assets <https://kenney.nl/assets/nature-kit>
  - Kenney Game Assets All-in-1 (60k+ assets, $20 itch tip) <https://kenney.itch.io/kenney-game-assets>
- **Quaternius** — CC0, glTF native. <https://quaternius.com/>
  - Universal Base Characters (rigged humanoid, Mixamo-retargetable) <https://quaternius.itch.io/universal-base-characters>
  - Ultimate Modular Women Pack (10 chars × 24 anims) <https://quaternius.com/packs/ultimatemodularwomen.html>
- **Poly Pizza** — aggregator, mostly CC0 glTF <https://poly.pizza/>
- **Sketchfab** — filter by Downloadable + CC0/CC-BY; glTF is the standard export <https://sketchfab.com/3d-models/categories>
- **Synty POLYGON City Pack** — $30, 331 assets, polished but Unity-oriented (FBX → convert via Blender to glTF) <https://syntystore.com/products/polygon-city-pack>

### Time budget per scene
~30 min hunting + 30 min compositing in Threlte + 30 min lighting/camera = ~1.5 hr.

---

## Strategy B — AI-generated 3D

State of the art in May 2026 has shifted: Meshy 6, Tripo Smart Mesh P1.0, and Rodin Gen-2 produce **single props** that are usable, but full **scene** generation is still rough. Best used to fill gaps in asset packs (e.g., a custom "Parisian cafe sign", a specific market stall) — not to author a full airport.

| Tool | Strength | Format | Pricing | URL |
|---|---|---|---|---|
| **Meshy** | Best general quality (Meshy 6, ~600k faces, PBR), 1-min generation | OBJ/FBX/glTF/GLB | Free tier; paid ~$20/mo | <https://www.meshy.ai/> |
| **Tripo** | Fastest (~10s preview), cleanest quad topology, auto-rig characters | STL/OBJ/FBX/GLB/USDZ | Free tier; ~$10/mo | <https://www.tripo3d.ai/> |
| **Luma Genie** | Very fast 4-variant previews, decent fidelity | blend/obj/fbx/glTF/usdz | Free tier | <https://lumalabs.ai/genie> |
| **Rodin (Hyper3D)** | Photoreal 4K PBR, hero-asset quality | glTF/GLB | Credit-based, more $$ | <https://hyper3d.ai/> |
| **CSM / Sloyd** | Stylized game-ready, browser editor | GLB | Free tier | <https://csm.ai/>, <https://sloyd.ai/> |

**Browser-render gotchas:** AI meshes often arrive at 50-200 MB with 4K textures. Run through `gltf-transform` or `gltfpack` (Meshopt + Draco) before shipping.

### Time budget
2-4 hr per scene if you're stitching ~10 AI-generated props together; quality is uneven and you spend time fixing topology/UVs. Skip unless you need a hero asset that doesn't exist on Kenney/Sketchfab.

---

## Strategy C — 360° panoramas (THE WINNER)

Wrap an equirectangular panorama on a sphere (or use `THREE.EquirectangularReflectionMapping` as scene background), then place 2-3 low-poly NPCs in front of the camera. The panorama provides 100% of the "wow" with effectively zero modeling work. This is a *visual novel rendered in 3D* — exactly the right fidelity-to-effort ratio for a dialogue-driven game with a fixed camera.

### Sources

- **Polyhaven HDRIs** — CC0, 16-24K, includes:
  - Rostock-Laage Airport (89k+ downloads) <https://polyhaven.com/a/rostock_laage_airport>
  - Comfy Café <https://polyhaven.com/a/comfy_cafe>
  - Leadenhall Market <https://polyhaven.com/a/leadenhall_market>
  - Wide Street 02 <https://polyhaven.com/a/wide_street_02>
  - Hotel/lobby: search Indoor category <https://polyhaven.com/hdris/indoor>
- **Skybox AI by Blockade Labs** — text-to-360°, 8K (free) / 16K (Business), 48+ visual styles, **also exports GLB depth-mesh** for parallax. Free tier, Pro $24/mo. <https://www.blockadelabs.com/>
- **Flickr "Equirectangular" tag** — many CC-licensed real photos <https://flickr.com/photos/tags/equirectangular>
- **Google Street View** can be tile-stitched (legally fragile; prefer Polyhaven/Skybox)

### Three.js implementation (≈10 lines)
```js
// Threlte: <T.Scene background={hdriTexture} />
const tex = await new RGBELoader().loadAsync('/hdri/cafe.hdr');
tex.mapping = THREE.EquirectangularReflectionMapping;
scene.background = tex;
scene.environment = tex; // free PBR lighting on NPCs!
```
NPCs go in front. Add 1-2 free-floating prop GLBs (a coffee cup, a luggage cart) for foreground depth. Done.

Reference: <https://threejs.org/examples/webgl_panorama_equirectangular.html>

### Pro move: Skybox AI depth-mesh
Skybox AI now exports a GLB with displaced geometry, so the background reacts to camera parallax (slight head-bob) — gives genuine 3D feel without any modeling. <https://support.blockadelabs.com/hc/en-us/articles/31649281677074>

---

## Strategy D — 2.5D stylized (Ghibli-style)

Generate a flat illustration in MidJourney / Stable Diffusion / Sora-Image, slice it into 3-5 depth layers in Photoshop/Procreate, place each on a separate Z-plane in Three.js. Camera-relative parallax sells the depth. Spline AI can also export camera-baked stylized scenes.

- **Spline AI** — text-to-3D scene + Three.js export. <https://spline.design/ai-generate>
- **MidJourney + Photoshop layer slicing** — manual but the highest aesthetic ceiling.
- Reference tutorial: <https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/>

Higher art ceiling than C, but adds 30-60 min of layer-slicing per scene and needs an artistic eye to get right. Pick this only if your team has illustration chops.

---

## Strategy E — Pure 2D visual novel

Single static background image + portrait sprites. Lowest wow (4/10) but bulletproof. Useful as a *content-fallback*: if any scene is broken at hour 18, drop in a 2D placeholder and keep shipping.

---

## NPCs (humanoid characters)

| Source | Style | Format | Cost | Notes |
|---|---|---|---|---|
| **Mixamo** (Adobe) | Realistic-ish | FBX/DAE → convert to GLB | Free | Still alive in 2026; auto-rig + 3000+ animations. Convert FBX→GLB with Blender or `FBX2glTF`. <https://www.mixamo.com/> |
| **Quaternius Universal Base Characters** | Stylized low-poly | glTF native, humanoid rig | CC0 | Mixamo-retargetable, ships with anims. <https://quaternius.itch.io/universal-base-characters> |
| **VRoid Studio** | Anime | VRM (→ GLB via converter) | Free | Best if going Strategy D anime route. <https://vroid.com/en/studio> |
| **Avaturn** | Photo-real from selfie | glTF/GLB | Free tier + paid SDK | Good RPM replacement. <https://avaturn.me/> |
| **Meshcapade Me** | Anatomically accurate | FBX/OBJ/glTF | API tier | Photo→avatar. <https://me.meshcapade.com/> |
| **Convai** | NPC-focused, includes dialogue+lipsync SDK | GLB | Free tier | All-in-one if you want AI chat NPCs. <https://convai.com/> |

**WARNING — Ready Player Me shut down January 31, 2026.** Existing avatar URLs may still resolve but new avatars cannot be created. Use Avaturn or Quaternius instead.

### Recommended NPC pipeline (fastest)
1. Pick character from **Quaternius Universal Base Characters** (already glTF, already rigged).
2. Reskin via texture swap to vary nationality (one base mesh × 5-8 textures).
3. Pull idle/talk/wave anims from Mixamo, retarget via Blender Mixamo addon (or use Quaternius' built-in anims).
4. Drop into Threlte with `<GLTF>` + `useGltfAnimations`.

---

## Animation & lipsync

**Idle/talk/gesture cycles:** Mixamo "Idle", "Talking", "Waving Gesture", "Looking Around" — 4 anims cover 90% of NPC believability. Free.

**Lipsync:** **wawa-lipsync** — open-source, real-time, browser-native, uses WebAudio + MFCC. Outputs viseme weights you map to morph targets (or simple jaw-bone rotation if your character lacks visemes). Three.js + R3F demo included.
- npm: `npm i wawa-lipsync`
- Repo: <https://github.com/wass08/wawa-lipsync>
- Tutorial: <https://wawasensei.dev/tuto/real-time-lipsync-web>

If your characters lack viseme morph targets (Quaternius/Mixamo defaults don't), do "wawa-jaw-flap": map the average lipsync amplitude to a jawbone Y-rotation. Looks fine, costs nothing.

**Engine choice:** Stay with **Three.js + Threlte**. PlayCanvas is faster at runtime but slower to start (proprietary editor). Unity WebGL bundles are 10-50 MB and 21× larger than equivalent web-native — wrong tool for hackathon. Godot Web is improving but tooling for glTF/HDRI is less polished than Three.js. Stick with Threlte: `<T.Scene>`, `<GLTF>`, `useGltfAnimations` is the shortest path to ship.

---

## RECOMMENDATION for HuskyHac

**Strategy C (360° panoramas) + Quaternius NPCs + Mixamo anims + wawa-lipsync.**

### Why
The game is dialogue-driven with a fixed/limited camera per scene. Players talk to NPCs — they don't free-roam an airport. A panoramic backdrop delivers 90% of the "wow" of a fully modeled scene at 5% of the work. HDRIs from Polyhaven are real photos at 16K — visual fidelity is *higher* than any low-poly pack you could realistically assemble. Skybox AI's GLB depth-mesh export adds parallax for free.

### Concrete recipe (target: 5 scenes in ~6 hours)
1. **Hour 0-1:** Scaffold Threlte scene with equirectangular HDRI background loader + a single Quaternius character + Mixamo idle anim + camera. One reusable `<DialogueScene hdri="..." npcs={[...]}>` Svelte component.
2. **Hour 1-2:** Drop in 5 Polyhaven HDRIs (airport, cafe, market, hotel — fall back to Skybox AI for missing ones like "taxi interior"). Configure 5 scene routes.
3. **Hour 2-4:** Generate 5-8 NPC variants by texture-swapping Quaternius base characters. Add 3-4 Mixamo anims (Idle, Talking, Wave, Listen).
4. **Hour 4-5:** Wire **wawa-lipsync** to NPC jawbone. Hook to TTS audio (ElevenLabs/Web Speech API).
5. **Hour 5-6:** Per-scene polish — foreground prop GLB (a luggage cart, a coffee cup), particle accents (steam, dust motes), one ambient audio loop per scene.

**Total scene-build time: ~6 hours for all 5 scenes.** Strategy A (asset packs) would take 10+ hours for inferior visual results.

### Risk mitigation
If a panorama feels too static for a specific scene, **upgrade only that scene to Strategy A** with a Kenney pack. The architecture stays identical (same Threlte scene component), so you can swap incrementally.

---

## Specific asset shopping list

### Scenes (Strategy C panoramas)
- **Airport:** Rostock-Laage Airport HDRI — Polyhaven CC0 — <https://polyhaven.com/a/rostock_laage_airport>
- **Taxi:** Skybox AI prompt "interior of taxi cab, leather seats, city visible through windows, cinematic" — Blockade Labs free tier — <https://skybox.blockadelabs.com/>
- **Cafe:** Comfy Café HDRI — Polyhaven CC0 — <https://polyhaven.com/a/comfy_cafe>
- **Hotel lobby:** Skybox AI prompt "elegant hotel lobby, marble floor, chandelier, reception desk" — or browse Polyhaven Indoor — <https://polyhaven.com/hdris/indoor>
- **Street market:** Leadenhall Market HDRI — Polyhaven CC0 — <https://polyhaven.com/a/leadenhall_market>

### NPCs
- Universal Base Characters — Quaternius CC0 — <https://quaternius.itch.io/universal-base-characters>
- Ultimate Modular Women Pack — Quaternius CC0 — <https://quaternius.com/packs/ultimatemodularwomen.html>

### Animations
- Mixamo Idle / Talking / Waving / Listening — free Adobe account — <https://www.mixamo.com/>

### Foreground props (optional polish)
- Poly Pizza filtered "luggage", "coffee cup", "lantern", "suitcase" — CC0 mostly — <https://poly.pizza/>
- Kenney City Kit Commercial for shop-front foreground silhouettes — <https://kenney.nl/assets/city-kit-commercial>

### Lipsync
- wawa-lipsync npm package — MIT — <https://github.com/wass08/wawa-lipsync>

### Optional all-in-one alternative
- Convai (AI NPC + dialogue + lipsync in one SDK) — free tier — <https://convai.com/> — only if you want chat-LLM dialogue baked in.
