import { describe, it, expect } from "vitest";
import { evaluateAttempt, isSolved, deriveLetterStates } from "./engine";
import { TileState } from "./constants";

const { LOCKED, MISPLACED, UNUSED } = TileState;

describe("evaluateAttempt", () => {
  it("marks an exact match as all locked", () => {
    expect(evaluateAttempt("crane", "crane")).toEqual([
      LOCKED,
      LOCKED,
      LOCKED,
      LOCKED,
      LOCKED,
    ]);
  });

  it("marks letters that are unused", () => {
    expect(evaluateAttempt("fghij", "crane")).toEqual([
      UNUSED,
      UNUSED,
      UNUSED,
      UNUSED,
      UNUSED,
    ]);
  });

  it("marks a misplaced letter", () => {
    expect(evaluateAttempt("alert", "crane")).toEqual([
      MISPLACED,
      UNUSED,
      MISPLACED,
      MISPLACED,
      UNUSED,
    ]);
  });

  it("does not over-credit duplicate letters in the attempt", () => {
    expect(evaluateAttempt("eerie", "crane")).toEqual([
      UNUSED,
      UNUSED,
      MISPLACED,
      UNUSED,
      LOCKED,
    ]);
  });

  it("caps misplaced duplicates at the answer's letter count", () => {
    expect(evaluateAttempt("otter", "rebut")).toEqual([
      UNUSED,
      MISPLACED,
      UNUSED,
      MISPLACED,
      MISPLACED,
    ]);
  });

  it("works at a different word length", () => {
    expect(evaluateAttempt("planet", "planet")).toEqual([
      LOCKED,
      LOCKED,
      LOCKED,
      LOCKED,
      LOCKED,
      LOCKED,
    ]);
  });

  it("is case-insensitive", () => {
    expect(evaluateAttempt("CRANE", "crane")).toEqual(
      evaluateAttempt("crane", "crane")
    );
  });

  it("throws when lengths differ", () => {
    expect(() => evaluateAttempt("toolong", "crane")).toThrow();
  });
});

describe("isSolved", () => {
  it("is true only when every tile is locked", () => {
    expect(isSolved([LOCKED, LOCKED, LOCKED])).toBe(true);
    expect(isSolved([LOCKED, MISPLACED, LOCKED])).toBe(false);
    expect(isSolved([])).toBe(false);
  });
});

describe("deriveLetterStates", () => {
  it("aggregates the best state seen for each letter", () => {
    const history = [
      {
        attempt: "alert",
        evaluation: [MISPLACED, UNUSED, MISPLACED, MISPLACED, UNUSED],
      },
      {
        attempt: "crane",
        evaluation: [LOCKED, LOCKED, LOCKED, LOCKED, LOCKED],
      },
    ];
    const states = deriveLetterStates(history);
    expect(states.a).toBe(LOCKED);
    expect(states.r).toBe(LOCKED);
    expect(states.e).toBe(LOCKED);
    expect(states.l).toBe(UNUSED);
    expect(states.t).toBe(UNUSED);
  });

  it("never downgrades a letter", () => {
    const history = [
      { attempt: "aaaaa", evaluation: [LOCKED, UNUSED, UNUSED, UNUSED, UNUSED] },
    ];
    expect(deriveLetterStates(history).a).toBe(LOCKED);
  });
});
