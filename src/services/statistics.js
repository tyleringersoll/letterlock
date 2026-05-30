import { MAX_GUESSES } from "@/game/constants";

export const STATS_STORAGE_KEY = "wordleStats";
export const FAIL_KEY = "fail";

export function createEmptyStats() {
  const guessDistribution = {};
  for (let i = 1; i <= MAX_GUESSES; i += 1) guessDistribution[i] = 0;
  guessDistribution[FAIL_KEY] = 0;

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution,
  };
}

export function recordResult(stats, { won, guessNumber }) {
  const next = {
    ...stats,
    guessDistribution: { ...stats.guessDistribution },
  };

  next.gamesPlayed += 1;

  if (won) {
    next.gamesWon += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.guessDistribution[guessNumber] =
      (next.guessDistribution[guessNumber] || 0) + 1;
  } else {
    next.currentStreak = 0;
    next.guessDistribution[FAIL_KEY] += 1;
  }

  return next;
}

export function winPercentage(stats) {
  if (!stats.gamesPlayed) return 0;
  return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

export function migrateStats(raw) {
  if (!raw || typeof raw !== "object") return createEmptyStats();

  const base = createEmptyStats();
  base.gamesPlayed = Number(raw.gamesPlayed) || 0;
  base.gamesWon = Number(raw.gamesWon ?? raw.totalWins) || 0;
  base.currentStreak = Number(raw.currentStreak) || 0;
  base.maxStreak = Number(raw.maxStreak) || 0;

  const legacy = raw.guessDistribution || {};
  for (let i = 1; i <= MAX_GUESSES; i += 1) {
    base.guessDistribution[i] = Number(legacy[i] ?? legacy[`guess${i}`]) || 0;
  }
  base.guessDistribution[FAIL_KEY] = Number(legacy[FAIL_KEY] ?? legacy.guessX) || 0;

  return base;
}
