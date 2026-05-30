import { describe, it, expect } from "vitest";
import {
  createEmptyStats,
  recordResult,
  solveRate,
  normalizeStats,
} from "./statistics";

describe("createEmptyStats", () => {
  it("starts zeroed with a slot per attempt count plus fail", () => {
    const stats = createEmptyStats(7);
    expect(stats.gamesPlayed).toBe(0);
    expect(Object.keys(stats.attemptDistribution)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "fail",
    ]);
  });
});

describe("recordResult", () => {
  it("does not mutate the input", () => {
    const stats = createEmptyStats(7);
    recordResult(stats, { solved: true, attemptNumber: 3 });
    expect(stats.gamesPlayed).toBe(0);
  });

  it("records a solve and grows the streak", () => {
    let stats = createEmptyStats(7);
    stats = recordResult(stats, { solved: true, attemptNumber: 3 });
    stats = recordResult(stats, { solved: true, attemptNumber: 5 });
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesSolved).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.attemptDistribution[3]).toBe(1);
    expect(stats.attemptDistribution[5]).toBe(1);
  });

  it("resets the streak on a loss but keeps the best", () => {
    let stats = createEmptyStats(7);
    stats = recordResult(stats, { solved: true, attemptNumber: 2 });
    stats = recordResult(stats, { solved: true, attemptNumber: 2 });
    stats = recordResult(stats, { solved: false });
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
    expect(stats.attemptDistribution.fail).toBe(1);
  });
});

describe("solveRate", () => {
  it("is 0 with no games played", () => {
    expect(solveRate(createEmptyStats(7))).toBe(0);
  });

  it("rounds to the nearest whole percent", () => {
    const stats = { ...createEmptyStats(7), gamesPlayed: 3, gamesSolved: 2 };
    expect(solveRate(stats)).toBe(67);
  });
});

describe("normalizeStats", () => {
  it("returns empty stats for junk input", () => {
    expect(normalizeStats(null, 7)).toEqual(createEmptyStats(7));
    expect(normalizeStats("nope", 7)).toEqual(createEmptyStats(7));
  });

  it("passes a valid record through and fills any gaps", () => {
    let stats = createEmptyStats(7);
    stats = recordResult(stats, { solved: true, attemptNumber: 4 });
    expect(normalizeStats(stats, 7)).toEqual(stats);
  });

  it("coerces missing distribution buckets to zero", () => {
    const partial = {
      gamesPlayed: 2,
      gamesSolved: 1,
      currentStreak: 0,
      maxStreak: 1,
      attemptDistribution: { 4: 1 },
    };
    const normalized = normalizeStats(partial, 7);
    expect(normalized.attemptDistribution[4]).toBe(1);
    expect(normalized.attemptDistribution[1]).toBe(0);
    expect(normalized.attemptDistribution.fail).toBe(0);
  });
});
