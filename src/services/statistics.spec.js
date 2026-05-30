import { describe, it, expect } from "vitest";
import {
  createEmptyStats,
  recordResult,
  winPercentage,
  migrateStats,
} from "./statistics";

describe("createEmptyStats", () => {
  it("starts fully zeroed with a slot per guess count plus fail", () => {
    const stats = createEmptyStats();
    expect(stats.gamesPlayed).toBe(0);
    expect(Object.keys(stats.guessDistribution)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "fail",
    ]);
  });
});

describe("recordResult", () => {
  it("does not mutate the input", () => {
    const stats = createEmptyStats();
    recordResult(stats, { won: true, guessNumber: 3 });
    expect(stats.gamesPlayed).toBe(0);
  });

  it("records a win and grows the streak", () => {
    let stats = createEmptyStats();
    stats = recordResult(stats, { won: true, guessNumber: 3 });
    stats = recordResult(stats, { won: true, guessNumber: 4 });
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesWon).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.guessDistribution[3]).toBe(1);
    expect(stats.guessDistribution[4]).toBe(1);
  });

  it("resets the current streak on a loss but keeps the max", () => {
    let stats = createEmptyStats();
    stats = recordResult(stats, { won: true, guessNumber: 2 });
    stats = recordResult(stats, { won: true, guessNumber: 2 });
    stats = recordResult(stats, { won: false });
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
    expect(stats.guessDistribution.fail).toBe(1);
  });
});

describe("winPercentage", () => {
  it("is 0 with no games played", () => {
    expect(winPercentage(createEmptyStats())).toBe(0);
  });

  it("rounds to the nearest whole percent", () => {
    const stats = { ...createEmptyStats(), gamesPlayed: 3, gamesWon: 2 };
    expect(winPercentage(stats)).toBe(67);
  });
});

describe("migrateStats", () => {
  it("returns empty stats for junk input", () => {
    expect(migrateStats(null)).toEqual(createEmptyStats());
    expect(migrateStats("nope")).toEqual(createEmptyStats());
  });

  it("upgrades the original schema (totalWins / guess1..guessX)", () => {
    const legacy = {
      gamesPlayed: 10,
      totalWins: 7,
      winPercent: 70,
      currentStreak: 2,
      maxStreak: 5,
      guessDistribution: {
        guess1: 0,
        guess2: 1,
        guess3: 3,
        guess4: 2,
        guess5: 1,
        guess6: 0,
        guessX: 3,
      },
    };
    const migrated = migrateStats(legacy);
    expect(migrated.gamesWon).toBe(7);
    expect(migrated.maxStreak).toBe(5);
    expect(migrated.guessDistribution[3]).toBe(3);
    expect(migrated.guessDistribution.fail).toBe(3);
    expect(migrated.guessDistribution.guessX).toBeUndefined();
  });

  it("passes through the current schema unchanged", () => {
    let stats = createEmptyStats();
    stats = recordResult(stats, { won: true, guessNumber: 4 });
    expect(migrateStats(stats)).toEqual(stats);
  });
});
