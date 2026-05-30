import { describe, it, expect } from "vitest";
import {
  evaluateGuess,
  isWinningEvaluation,
  deriveLetterStates,
} from "./engine";
import { TileState } from "./constants";

const { CORRECT, PRESENT, ABSENT } = TileState;

describe("evaluateGuess", () => {
  it("marks an exact match as all correct", () => {
    expect(evaluateGuess("crane", "crane")).toEqual([
      CORRECT,
      CORRECT,
      CORRECT,
      CORRECT,
      CORRECT,
    ]);
  });

  it("marks letters that are absent", () => {
    expect(evaluateGuess("fghij", "crane")).toEqual([
      ABSENT,
      ABSENT,
      ABSENT,
      ABSENT,
      ABSENT,
    ]);
  });

  it("marks a present-but-misplaced letter", () => {
    expect(evaluateGuess("alert", "crane")).toEqual([
      PRESENT,
      ABSENT,
      PRESENT,
      PRESENT,
      ABSENT,
    ]);
  });

  it("does not over-credit duplicate letters in the guess", () => {
    expect(evaluateGuess("eerie", "crane")).toEqual([
      ABSENT,
      ABSENT,
      PRESENT,
      ABSENT,
      CORRECT,
    ]);
  });

  it("caps misplaced duplicates at the answer's letter count", () => {
    expect(evaluateGuess("otter", "rebut")).toEqual([
      ABSENT,
      PRESENT,
      ABSENT,
      PRESENT,
      PRESENT,
    ]);
  });

  it("handles the classic 'one letter, two slots' case", () => {
    expect(evaluateGuess("babes", "abbey")).toEqual([
      PRESENT,
      PRESENT,
      CORRECT,
      CORRECT,
      ABSENT,
    ]);
  });

  it("is case-insensitive", () => {
    expect(evaluateGuess("CRANE", "crane")).toEqual(
      evaluateGuess("crane", "crane")
    );
  });

  it("throws when lengths differ", () => {
    expect(() => evaluateGuess("toolong", "crane")).toThrow();
  });
});

describe("isWinningEvaluation", () => {
  it("is true only when every tile is correct", () => {
    expect(isWinningEvaluation([CORRECT, CORRECT, CORRECT])).toBe(true);
    expect(isWinningEvaluation([CORRECT, PRESENT, CORRECT])).toBe(false);
    expect(isWinningEvaluation([])).toBe(false);
  });
});

describe("deriveLetterStates", () => {
  it("aggregates the best state seen for each letter", () => {
    const history = [
      { guess: "alert", evaluation: [PRESENT, ABSENT, PRESENT, PRESENT, ABSENT] },
      { guess: "crane", evaluation: [CORRECT, CORRECT, CORRECT, CORRECT, CORRECT] },
    ];
    const states = deriveLetterStates(history);
    expect(states.a).toBe(CORRECT);
    expect(states.r).toBe(CORRECT);
    expect(states.e).toBe(CORRECT);
    expect(states.l).toBe(ABSENT);
    expect(states.t).toBe(ABSENT);
  });

  it("never downgrades a letter", () => {
    const history = [
      { guess: "aaaaa", evaluation: [CORRECT, ABSENT, ABSENT, ABSENT, ABSENT] },
    ];
    expect(deriveLetterStates(history).a).toBe(CORRECT);
  });
});
