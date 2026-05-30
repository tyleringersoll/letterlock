# Vue Wordle

An accessible, infinitely-replayable [Wordle](https://www.nytimes.com/games/wordle/) clone built with **Vue 3** and **Vite**. Every play deals a brand-new word, so you can play as many times as you like.

**Live:** [vue-wordle-tyleringersoll.netlify.app](https://vue-wordle-tyleringersoll.netlify.app/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/90900e60-a588-4166-b07a-0a3362199b5e/deploy-status)](https://app.netlify.com/sites/wordle-tyleringersoll/deploys)

## Highlights

- **Pure, fully-tested game core.** The Wordle rules, statistics, sharing, and storage live in dependency-free modules under [`src/game`](src/game) and [`src/services`](src/services), each covered by unit tests.
- **State-driven UI, zero DOM hacking.** A [`useGame`](src/composables/useGame.js) state machine exposes the board and keyboard as computed values; components are a pure function of state.
- **Accessibility first.** ARIA grid semantics, polite/assertive live-region announcements, a focus-trapped modal that restores focus, full keyboard play, a colour-blind (high-contrast) theme, and `prefers-reduced-motion` support.
- **Resilient.** In-progress games and statistics persist through a defensive storage wrapper (graceful fallback when `localStorage` is unavailable), with a migration from the original stats schema.

## Architecture

```
src/
├── game/          Pure rules: constants, engine (evaluateGuess), dictionary
├── services/      storage · statistics · share  (pure, framework-free)
├── composables/   useGame · useKeyboard · useFocusTrap · useAnnouncer · useTheme
├── components/    game/ keyboard/ stats/ ui/ icons/ layout/ a11y/
├── views/         GameView (orchestrator)
└── styles/        design tokens + global theme (CSS custom properties)
```

The dependency arrow points one way: components depend on composables, composables depend on services and the game core, and the game core depends on nothing. That is what keeps the rules testable in isolation.

## Prerequisites

- Node.js 18+ (20+ recommended)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm test         # run the unit tests once (Vitest)
npm run test:watch
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # lint and auto-fix
```

## How to play

Guess the five-letter word in six tries. After each guess the tiles reveal how close you were:

- 🟩 **Correct** — right letter, right spot.
- 🟨 **Present** — right letter, wrong spot.
- ⬛ **Absent** — not in the word.

Open the **ℹ︎** menu to toggle high-contrast mode.
