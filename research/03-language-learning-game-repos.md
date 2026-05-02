# Language-Learning Game Projects (open source / forkable)

## Research Question
Open-source codebases we can fork or learn from to build a 3D web language-immersion travel game with AI-NPC dialogue. Player picks a country (France, Japan, Mexico, etc.) → 3D scenes (airport → taxi → cafe) → talks to LLM-driven NPCs in the target language with voice input. Stack: Three.js / Threlte / Svelte / Vite. Tight hackathon timeline; maximize wow-per-hour.

## Key Findings

### AI Town — a16z-infra/ai-town
- **URL:** https://github.com/a16z-infra/ai-town
- **Stars / Activity:** 9,801 | **Last commit:** 2026-05-02 | **License:** MIT
- **Stack:** Convex backend + Next.js + React + PixiJS (2D top-down) + OpenAI/Together/Ollama
- **Scenarios covered:** Persistent virtual town with multiple AI agents that walk around, hold memories, have conversations on schedule. Not language-learning by default, but the *exact* "world full of LLM NPCs you can walk up to and talk to" architecture you need.
- **LLM/Voice:** Pluggable LLMs with full memory/embedding/conversation pipeline; no voice in upstream but easy to bolt on Whisper.
- **Forkability: 2/5** — Too much (Convex, persistent sim) for a 2-day hackathon, but the conversation manager, memory module, and NPC scheduling logic are the gold standard reference. Lift the LLM-NPC interaction loop, not the whole stack. Already MIT and there are dozens of derivative forks (cat-town, ai-classroom).

### LibreLingo — kantord/LibreLingo
- **URL:** https://github.com/kantord/LibreLingo
- **Stars / Activity:** 2,594 | **Last commit:** 2026-05-01 | **License:** AGPL-3.0
- **Stack:** Vue + Vite + YAML course content + Python build pipeline
- **Scenarios covered:** Duolingo-style structured exercises (translate, listen, choose) for many languages. Production-grade course schema covering vocabulary, mini-dialogues, audio.
- **LLM/Voice:** TTS audio assets; no LLM dialogue.
- **Forkability: 3/5** — Don't fork the app, but their YAML course/skill/vocab schema is a ready-made content model for our scenarios (airport vocab, taxi vocab, cafe vocab). Steal the content structure; keep our 3D/LLM frontend. AGPL is sticky — keep their content separate from our engine if we use it.

### BabelDuck — Orenoid/BabelDuck
- **URL:** https://github.com/Orenoid/BabelDuck
- **Stars / Activity:** 682 | **Last commit:** 2026-05-02 | **License:** Custom (source-available)
- **Stack:** Next.js + React + TypeScript + Web Speech API + OpenAI-compatible LLMs
- **Scenarios covered:** Beginner-friendly AI conversation practice. Pre-built role-play scenarios ("at a cafe", "at the airport"), grammar correction, "ask the duck" sub-conversations to clarify without breaking the main chat.
- **LLM/Voice:** Voice input (browser STT) + voice output (TTS) + multi-turn LLM dialogue with system prompts per scenario. Closest existing pattern to our NPC dialogue.
- **Forkability: 2/5** — Highest-leverage reference. Read the prompt-engineering and voice loop end-to-end; copy the scenario-prompt pattern almost verbatim. License is non-OSS, so port the architecture rather than the code.

### dialekt — ccarvalho-eng/dialekt
- **URL:** https://github.com/ccarvalho-eng/dialekt
- **Stars / Activity:** 19 | **Last commit:** 2026-04-09 | **License:** Apache-2.0
- **Stack:** TypeScript + Next.js + LLM API
- **Scenarios covered:** Conversational AI tutor with CEFR-level enforcement (A1→C2), formal/informal register, native-phonetic transliteration (huge for Japanese romaji or Mexican Spanish phonetics).
- **LLM/Voice:** LLM-driven; pronunciation/transliteration aware.
- **Forkability: 2/5** — Tiny, recent, Apache-licensed. The CEFR-level prompting and transliteration trick are exactly what stops our NPC from speaking C2 French to a beginner. Port the system-prompt template directly.

### Antura — vgwb/Antura
- **URL:** https://github.com/vgwb/Antura (also https://vgwb.itch.io/antura)
- **Stars / Activity:** 108 | **Last commit:** 2026 (active) | **License:** Custom open license
- **Stack:** Unity 3D + C#
- **Scenarios covered:** Award-winning 3D literacy/language game for kids — multiple mini-games, full 3D world, originally Arabic literacy then expanded. Real shipped product, fully open source.
- **LLM/Voice:** TTS, no LLM.
- **Forkability: 4/5** — Wrong stack (Unity not web), but the game-design playbook (mini-games gated by a hub world, mascot-led onboarding) is a great pattern reference. Inspiration only — don't try to port C# to Threlte in 48h.

### LanguageImmersionVirtualEnvironment (LIVE) — CS467-LIVE/Language-Immersion-Virtual-Environment
- **URL:** https://github.com/CS467-LIVE/Language-Immersion-Virtual-Environment
- **Stars / Activity:** 3 | **Last commit:** 2025-12-02 | **License:** none specified
- **Stack:** Capstone project — likely Unity or web, "interact naturally with non-English-speaking NPCs"
- **Scenarios covered:** Explicitly an immersive language learning environment with NPC conversations — the closest concept match in the entire search.
- **LLM/Voice:** Implied (LLM-driven NPC dialogue, per description).
- **Forkability: 4/5** — Tiny audience but conceptually identical to HuskyHac. Read the README and design choices for prior-art lessons. No license = study, don't ship.

### AI-powered Immersive Japanese VR (Devpost) — devpost.com/software/ai-powered-immersive-japanese-language-learning-game-in-vr
- **URL:** https://devpost.com/software/ai-powered-immersive-japanese-language-learning-game-in-vr
- **Stars / Activity:** Hackathon submission | **License:** see project page
- **Stack:** Unity VR (Meta Quest) + Claude 3.5 Haiku (NPCs) + OpenAI Whisper (STT) + Azure Speech (TTS, native Japanese voices)
- **Scenarios covered:** Tokyo street, izakaya, train station — exactly the "land in a country, walk through scenes" concept, in VR.
- **LLM/Voice:** Claude for NPCs, Whisper for player input, Azure for natural-voice output. The full pipeline we want.
- **Forkability: 5/5** — Closed-source hackathon project, but the architectural diagram on the Devpost page is a free design doc for our backend. Mirror the Whisper→LLM→TTS pipeline in the browser instead of VR.

### Read Frog — mengxi-ream/read-frog
- **URL:** https://github.com/mengxi-ream/read-frog
- **Stars / Activity:** 5,545 | **Last commit:** 2026-05-02 | **License:** GPL-3.0
- **Stack:** WXT (web extension) + React + TypeScript + multi-LLM
- **Scenarios covered:** Immersive translation browser extension with explanation, dual-language reading, configurable model providers.
- **LLM/Voice:** Multi-provider LLM abstraction (OpenAI, Anthropic, Gemini, Ollama, custom endpoints).
- **Forkability: 3/5** — Not a game, but their `providers/` LLM abstraction is a clean drop-in for our NPC backend so we can swap models cheaply during the hackathon. Copy the provider layer.

### sanidhyy/duolingo-clone (Lingo)
- **URL:** https://github.com/sanidhyy/duolingo-clone
- **Stars / Activity:** 532 | **Last commit:** 2026-04-30 | **License:** MIT
- **Stack:** Next.js 14 + Drizzle + Neon + Clerk + KenneyNL low-poly characters
- **Scenarios covered:** Full Duolingo-clone: lessons, hearts, XP, quests, voice prompts, leaderboard. MIT.
- **LLM/Voice:** Voice prompts via ElevenLabs, no NPC LLM.
- **Forkability: 3/5** — Best-built MIT Duolingo clone. Steal the lesson/XP/hearts UX scaffolding for our progression layer. The KenneyNL character set is also a free 3D asset jumping-off point.

### Mei-Mei — jennieablog/Mei-Mei
- **URL:** https://github.com/jennieablog/Mei-Mei
- **Stars / Activity:** 2 | **Last commit:** 2026-05-01 | **License:** none specified
- **Stack:** Godot
- **Scenarios covered:** HSK1-level Chinese learning game built in a real game engine. Active, indie.
- **LLM/Voice:** None — scripted dialogue.
- **Forkability: 4/5** — Inspiration for the "single-language vertical slice" framing — they ship one language well rather than 50 shallow ones. Mirror the scope discipline.

### CodexLocal (chat-based LLM-NPC games in browser, WebLLM)
- **URL:** https://medium.com/@codexlocalapp/building-immersive-chat-based-llm-games-with-codexlocal-npcs-webllm-and-offline-adventures-110b9610a8a3
- **Stars / Activity:** Article + product (no public repo found) | **License:** n/a
- **Stack:** WebLLM (in-browser LLMs via WebGPU) + chat UI
- **Scenarios covered:** Chat-based interactive fiction with multiple NPCs, fully offline, browser-only.
- **LLM/Voice:** Local in-browser LLM, text-only.
- **Forkability: 5/5** — No source, but the article is a useful pattern blueprint for "browser-only LLM-NPC chat" — useful if we want a no-API-key offline demo as a fallback. Read for ideas.

### Honorable mentions (smaller, browse if curious)
- **playztag/ai-language-tutor** (11 stars, MIT, 2025) — minimalist React tutor; quick reference for prompt scaffolding.
- **ELLE-EndLessLearner** (Ganemo, MIT, 2020) — UCF research-group VR endless-runner language game in UE4. Stale, but a published academic prototype with code.
- **trylingo** (elitenoire, 77 stars) — code-along Duolingo clone with twist.
- **Antura on itch.io** (vgwb.itch.io/antura) — same project, polished build.

## Synthesis

Nothing on the open web exactly matches HuskyHac — a browser, 3D, country-pick, walk-through-scenes, voice-LLM-NPC language game. That's the differentiator. Existing work cleaves into four buckets, each contributing one piece of our stack: (1) **LLM-NPC simulation** — a16z-infra/ai-town is the canonical reference for memory, scheduling, and conversation orchestration, but it's overkill for 48h; (2) **AI conversation tutors** — BabelDuck and dialekt nail the *prompt patterns* (scenario role-play, CEFR enforcement, transliteration) and voice pipeline (browser STT/TTS) we should clone almost verbatim; (3) **Duolingo-clone progression UX** — sanidhyy/duolingo-clone (MIT) gives us hearts/XP/lesson scaffolding, plus KenneyNL low-poly assets; (4) **3D language games** — Antura and Mei-Mei prove the design is viable but ship in Unity/Godot, useful for design lessons not code. The closest single concept match — `CS467-LIVE/Language-Immersion-Virtual-Environment` and the Devpost VR Japanese project — are tiny or closed-source, but their architecture diagrams describe exactly the Whisper → Claude → TTS loop we should build. Practical fork strategy: build atop our existing Threlte stack, port BabelDuck's scenario-prompt + voice loop, port dialekt's CEFR enforcement, lift LibreLingo's content-schema YAML for our airport/taxi/cafe vocab, and steal Lingo's hearts/XP UI for progression.

## Top Picks (TL;DR)
1. **BabelDuck** — clone the role-play scenario prompts + browser voice loop. Single highest-leverage reference for the dialogue UX.
2. **a16z-infra/ai-town** — read for the LLM-NPC conversation orchestration patterns; do *not* fork wholesale.
3. **dialekt** — port the CEFR-level + transliteration system prompts so NPCs speak at the player's level.

Sources:
- [a16z-infra/ai-town](https://github.com/a16z-infra/ai-town)
- [LibreLingo](https://github.com/kantord/LibreLingo)
- [BabelDuck](https://github.com/Orenoid/BabelDuck)
- [dialekt](https://github.com/ccarvalho-eng/dialekt)
- [Antura](https://github.com/vgwb/Antura)
- [LIVE capstone](https://github.com/CS467-LIVE/Language-Immersion-Virtual-Environment)
- [AI VR Japanese Devpost](https://devpost.com/software/ai-powered-immersive-japanese-language-learning-game-in-vr)
- [Read Frog](https://github.com/mengxi-ream/read-frog)
- [sanidhyy/duolingo-clone](https://github.com/sanidhyy/duolingo-clone)
- [Mei-Mei](https://github.com/jennieablog/Mei-Mei)
- [CodexLocal article](https://medium.com/@codexlocalapp/building-immersive-chat-based-llm-games-with-codexlocal-npcs-webllm-and-offline-adventures-110b9610a8a3)
- [Antura on itch.io](https://vgwb.itch.io/antura)
