# Chat-UI Game Repos — Lifeline-style / messenger / AI-NPC starters

## Research Question
Open-source repos to fork or study for building a chat/messenger-style interactive game (branching narrative, optional LLM dialogue).

## Key Findings

### inkle/ink — inkle/ink
- **URL:** https://github.com/inkle/ink
- **Stars:** 4,739 | **Last commit:** 2026-05-01 | **License:** MIT
- **Stack:** C# compiler producing portable JSON story files; runtime ports exist for every major platform.
- **What it is:** The canonical narrative scripting language from inkle (80 Days, Heaven's Vault). Designed exactly for branching dialogue, variables, conditionals, choices — the script half of any chat game.
- **Forkability: 5/5** — Don't fork the compiler; consume it. Author scripts in Ink, run them in the browser via inkjs, render messages into a chat skin. This is the highest-leverage building block in the entire space.

### y-lohse/inkjs — y-lohse/inkjs
- **URL:** https://github.com/y-lohse/inkjs
- **Stars:** 628 | **Last commit:** 2026-05-01 | **License:** MIT
- **Stack:** TypeScript port of the Ink runtime; framework-agnostic (works in React/Svelte/Next/Vite).
- **What it is:** The official-blessed JS runtime that lets browser apps execute Ink stories — yields lines + choices you render however you like.
- **Forkability: 5/5** — This is the engine you wrap with a messenger UI. Pair with an Ink author file and a chat-bubble component and you have the spine of a Lifeline clone in a weekend.

### inkle/inky — inkle/inky
- **URL:** https://github.com/inkle/inky
- **Stars:** 2,656 | **Last commit:** 2026-04-27 | **License:** unspecified (Inkle's editor; see repo)
- **Stack:** Electron-based authoring IDE for Ink with live preview.
- **What it is:** The writer-facing tool for Ink. Not for forking — for giving non-engineers on the team a way to author and test branching dialogue.
- **Forkability: 2/5** — Use it as a tool, not a base. Critical for your writers; not relevant to game runtime.

### Monogatari/Monogatari — Monogatari/Monogatari
- **URL:** https://github.com/Monogatari/Monogatari
- **Stars:** 841 | **Last commit:** 2026-04-28 | **License:** MIT
- **Stack:** Vanilla JS web visual-novel engine; saves, history, choices, audio, characters baked in.
- **What it is:** A complete browser visual-novel framework. Default UI is VN-style (sprite + text box) but the script/state model maps cleanly onto a chat surface — swap the renderer, keep the engine.
- **Forkability: 4/5** — Solid choice if you want batteries-included (saves, history, scenes) and are willing to rewrite the view layer to look like iMessage.

### liana-p/narrat-engine — liana-p/narrat-engine
- **URL:** https://github.com/liana-p/narrat-engine
- **Stars:** 188 | **Last commit:** 2026-04-26 | **License:** MIT
- **Stack:** TypeScript + Vue + Vite + Pinia; opinionated narrative-game engine with custom scripting, RPG stats, skill checks.
- **What it is:** A modern web narrative engine with structured branching, variables, and a polished default theme — closer to Disco Elysium than Lifeline, but the data model is right.
- **Forkability: 4/5** — Best modern stack of any narrative engine here. Realistic to fork the runtime and replace the screen layout with a chat thread; smaller community than Ink so expect to read source.

### YarnSpinnerTool/YarnSpinner — YarnSpinnerTool/YarnSpinner
- **URL:** https://github.com/YarnSpinnerTool/YarnSpinner
- **Stars:** 2,723 | **Last commit:** 2026-05-01 | **License:** MIT
- **Stack:** C# core compiler + runtime; first-class Unity integration, community web/JS bindings exist but are not first-class.
- **What it is:** The Night in the Woods dialogue language. Excellent if you go Unity/WebGL; weaker if you want pure web/React.
- **Forkability: 3/5** — Study its node-based dialogue model; only fork if Unity is acceptable. For browser-first, prefer Ink + inkjs.

### a16z-infra/ai-town — a16z-infra/ai-town
- **URL:** https://github.com/a16z-infra/ai-town
- **Stars:** 9,801 | **Last commit:** 2026-05-02 | **License:** MIT
- **Stack:** Next.js + Convex (reactive DB) + OpenAI/Together; multi-agent simulation with persistent memory.
- **What it is:** A deployable starter kit where AI characters live, talk, and remember. Map-based, but the agent loop (memory, planning, conversation) is exactly what you need for LLM-driven NPCs.
- **Forkability: 4/5** — Don't ship the map; lift the agent + memory architecture and point it at a chat-thread UI. The strongest reference for "characters that text you back and remember."

### SillyTavern/SillyTavern — SillyTavern/SillyTavern
- **URL:** https://github.com/SillyTavern/SillyTavern
- **Stars:** 26,790 | **Last commit:** 2026-05-02 | **License:** AGPL-3.0
- **Stack:** Node.js + vanilla JS; multi-backend LLM frontend (OpenAI, Anthropic, local llama.cpp, Kobold, etc.).
- **What it is:** Mature LLM chat frontend with character cards, lorebooks, persona swaps, group chats, regenerate, edit-message — essentially every feature an AI-NPC chat game needs.
- **Forkability: 2/5** — AGPL is a hard blocker for a commercial fork. Study character-card format, prompt templates, and group-chat patterns; don't copy code into a closed codebase.

### chatscope/chat-ui-kit-react — chatscope/chat-ui-kit-react
- **URL:** https://github.com/chatscope/chat-ui-kit-react
- **Stars:** 1,743 | **Last commit:** 2026-05-01 | **License:** MIT
- **Stack:** React component library — MessageList, Message, TypingIndicator, Avatar, ConversationHeader, attachments.
- **What it is:** A drop-in chat-UI kit for React with all the primitives a messenger game needs out of the box.
- **Forkability: 5/5** — Use as a dependency, not a fork. Pair with inkjs for narrative or AI SDK for LLM characters and you have the entire view layer for free.

### vercel/chatbot — vercel/chatbot (a.k.a. vercel/ai-chatbot)
- **URL:** https://github.com/vercel/chatbot
- **Stars:** 20,223 | **Last commit:** 2026-05-02 | **License:** Other (Vercel-friendly, check repo)
- **Stack:** Next.js App Router + Vercel AI SDK + streaming + auth + persistence; OpenAI/Anthropic providers swappable.
- **What it is:** Production-grade AI chatbot template — streaming, persistence, multi-model, message branching. Generic chatbot, not a game, but it's the path of least resistance to "shipped streaming chat with auth."
- **Forkability: 4/5** — Best starting skeleton if the game is LLM-driven. Replace assistant logic with a character runtime (Ink-driven or LLM-prompted) and restyle the bubbles.

## Synthesis

The ecosystem splits cleanly into three pieces and the right move is to compose them, not fork one mega-repo. **For scripted branching narrative** (the Lifeline path), Ink is the unambiguous winner — `inkle/ink` is the language, `y-lohse/inkjs` is the browser runtime, and `inkle/inky` is the writer's IDE. Authors write `.ink` files, the runtime yields one line + optional choices at a time, and the chat UI just decides when to type-animate vs. when to surface choice buttons. **For the chat surface itself**, `chatscope/chat-ui-kit-react` covers 90% of the components a messenger game needs (typing indicator, bubbles, attachments) and is MIT, so it's a dependency rather than a fork. **For LLM-driven characters**, `a16z-infra/ai-town` is the reference architecture for memory + agent loops, and `vercel/chatbot` is the production-shaped Next.js skeleton with streaming and auth already wired. SillyTavern is the most feature-rich LLM frontend in existence, but AGPL kills it as a fork base — treat it as a design reference for character cards and prompt structure. Narrat and Monogatari are credible all-in-one alternatives if you'd rather adopt one engine than glue three together; Narrat has the more modern stack (Vue + Vite). The gap in the ecosystem: nobody has shipped an open `inkjs + chatscope` messenger boilerplate. That gap is the cheapest place to land.

## Top Picks (TL;DR)
1. **y-lohse/inkjs + inkle/ink + chatscope/chat-ui-kit-react** — the boring-correct stack: Ink scripts run in the browser, rendered into off-the-shelf chat components. Fastest path to a Lifeline-style demo.
2. **vercel/chatbot** — fork this if the game is LLM-driven; you get streaming, persistence, model swapping, and Next.js auth on day one. Replace the assistant prompt with character personas.
3. **a16z-infra/ai-town** — study, don't fork wholesale. Lift its memory/agent loop into your codebase when you need NPCs that remember earlier conversations.
