import { DEFAULT_MAX_GUESSES } from "@/game/config";

export const STATS_STORAGE_KEY = "letterlock-stats";
export const FAIL_KEY = "fail";

export function createEmptyStats(maxGuesses = DEFAULT_MAX_GUESSES) {
  const attemptDistribution = {};
  for (let i = 1; i <= maxGuesses; i += 1) attemptDistribution[i] = 0;
  attemptDistribution[FAIL_KEY] = 0;

  return {
    gamesPlayed: 0,
    gamesSolved: 0,
    currentStreak: 0,
    maxStreak: 0,
    attemptDistribution,
  };
}

// hands back a fresh object, doesn't touch the one passed in
export function recordResult(stats, { solved, attemptNumber }) {
  const next = {
    ...stats,
    attemptDistribution: { ...stats.attemptDistribution },
  };

  next.gamesPlayed += 1;

  if (solved) {
    next.gamesSolved += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.attemptDistribution[attemptNumber] =
      (next.attemptDistribution[attemptNumber] || 0) + 1;
  } else {
    next.currentStreak = 0;
    next.attemptDistribution[FAIL_KEY] += 1;
  }

  return next;
}

export function solveRate(stats) {
  if (!stats.gamesPlayed) return 0;
  return Math.round((stats.gamesSolved / stats.gamesPlayed) * 100);
}

// make sure whatever's in storage has the shape we expect
export function normalizeStats(raw, maxGuesses = DEFAULT_MAX_GUESSES) {
  const base = createEmptyStats(maxGuesses);
  if (!raw || typeof raw !== "object") return base;

  base.gamesPlayed = Number(raw.gamesPlayed) || 0;
  base.gamesSolved = Number(raw.gamesSolved) || 0;
  base.currentStreak = Number(raw.currentStreak) || 0;
  base.maxStreak = Number(raw.maxStreak) || 0;

  const dist = raw.attemptDistribution || {};
  for (const key of Object.keys(base.attemptDistribution)) {
    base.attemptDistribution[key] = Number(dist[key]) || 0;
  }

  return base;
}
