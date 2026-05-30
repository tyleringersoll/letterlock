# Letterlock

A browser-based six-letter word puzzle built as a front-end state-management and interaction exercise.

You have seven attempts to find the hidden word. After each attempt, every letter is marked as **locked** (right letter, right place), **misplaced** (in the word, wrong place), or **unused** (not in the word).

## What it is

Letterlock is a small, self-contained word puzzle written in Vue 3. It was built to practice front-end state management, input handling, and responsive layout — keeping the game rules in pure, testable modules and the UI as a thin, reactive layer on top.

## Technical highlights

- **Configurable puzzle size.** Board dimensions are derived from `answerLength` and `maxGuesses` (default 6 letters × 7 attempts) rather than a fixed grid, so the same code renders any size.
- **On-screen and physical keyboard input**, sharing one set of actions.
- **Attempt validation** against an accepted-word list, with clear feedback for short or unrecognized words.
- **Pure game core.** Scoring, statistics, and sharing live in dependency-free modules ([`src/game`](src/game), [`src/services`](src/services)) covered by unit tests.
- **Reactive state machine** ([`useGame`](src/composables/useGame.js)) that exposes the board and keyboard as computed values — no direct DOM manipulation.
- **Two modes.** Free Play (a fresh random word each round, the default) and Daily Lock (one date-seeded word per day).
- **Accessibility.** ARIA grid semantics, live-region announcements, a focus-trapped result panel, full keyboard play, a high-contrast color option, and reduced-motion support.
- **Responsive layout** that scales the board to fit short viewports.
- **Local stats and resume.** Records and in-progress games persist in `localStorage` behind a defensive wrapper.

## Word lists

The word and answer lists are a small curated set of common six-letter words; the accepted-guess list is derived from the public system word list (`/usr/share/dict/words`).

## Architecture

```
src/
├── game/          Pure rules: config, constants, engine (evaluateAttempt), dictionary, random
├── services/      storage · statistics · share  (pure, framework-free)
├── composables/   useGame · useKeyboard · useFocusTrap · useAnnouncer · useTheme · useScrollLock
├── components/    game/ input/ stats/ ui/ icons/ layout/ a11y/
├── views/         GameView (orchestrator)
└── styles/        design tokens + global theme (CSS custom properties)
```

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm test         # run the unit tests (Vitest)
npm run build    # production build to dist/
npm run lint     # lint and auto-fix
```

## Portfolio description

> Built a browser-based word puzzle as a front-end exercise, including keyboard input, validation logic, local game state, responsive layout, and animated feedback.
