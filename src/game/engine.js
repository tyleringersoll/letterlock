import { TileState, TILE_RANK } from "./constants";

export function evaluateGuess(guess, answer) {
  const g = String(guess).toLowerCase();
  const a = String(answer).toLowerCase();

  if (g.length !== a.length) {
    throw new Error(
      `Guess length (${g.length}) must match answer length (${a.length}).`
    );
  }

  const result = new Array(g.length).fill(TileState.ABSENT);
  const remaining = a.split("");

  for (let i = 0; i < g.length; i += 1) {
    if (g[i] === remaining[i]) {
      result[i] = TileState.CORRECT;
      remaining[i] = null;
    }
  }

  for (let i = 0; i < g.length; i += 1) {
    if (result[i] === TileState.CORRECT) continue;
    const idx = remaining.indexOf(g[i]);
    if (idx !== -1) {
      result[i] = TileState.PRESENT;
      remaining[idx] = null;
    }
  }

  return result;
}

export function isWinningEvaluation(evaluation) {
  return (
    evaluation.length > 0 &&
    evaluation.every((state) => state === TileState.CORRECT)
  );
}

export function deriveLetterStates(history) {
  const states = {};

  for (const { guess, evaluation } of history) {
    const letters = String(guess).toLowerCase().split("");
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
