import { TileState, TILE_RANK } from "./constants";

// two passes so dup letters don't get double-counted - grab exact matches first, then the leftovers
export function evaluateAttempt(attempt, answer) {
  const g = String(attempt).toLowerCase();
  const a = String(answer).toLowerCase();

  if (g.length !== a.length) {
    throw new Error(
      `Attempt length (${g.length}) must match answer length (${a.length}).`
    );
  }

  const result = new Array(g.length).fill(TileState.UNUSED);
  const remaining = a.split("");

  for (let i = 0; i < g.length; i += 1) {
    if (g[i] === remaining[i]) {
      result[i] = TileState.LOCKED;
      remaining[i] = null;
    }
  }

  for (let i = 0; i < g.length; i += 1) {
    if (result[i] === TileState.LOCKED) continue;
    const idx = remaining.indexOf(g[i]);
    if (idx !== -1) {
      result[i] = TileState.MISPLACED;
      remaining[idx] = null;
    }
  }

  return result;
}

export function isSolved(evaluation) {
  return (
    evaluation.length > 0 &&
    evaluation.every((state) => state === TileState.LOCKED)
  );
}

// best-known state per letter, drives the input panel colors
export function deriveLetterStates(history) {
  const states = {};

  for (const { attempt, evaluation } of history) {
    const letters = String(attempt).toLowerCase().split("");
    letters.forEach((letter, index) => {
      const next = evaluation[index];
      const current = states[letter];
      if (!current || TILE_RANK[next] > TILE_RANK[current]) {
        states[letter] = next;
      }
    });
  }

  return states;
}
