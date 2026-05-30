import { TileState } from "@/game/constants";

export const APP_NAME = "Letterlock";

// add up locked / misplaced / unused across every attempt
export function tallyStates(history) {
  const counts = {
    [TileState.LOCKED]: 0,
    [TileState.MISPLACED]: 0,
    [TileState.UNUSED]: 0,
  };
  for (const turn of history) {
    for (const state of turn.evaluation) {
      if (state in counts) counts[state] += 1;
    }
  }
  return counts;
}

// plain text summary - no emoji grid, no puzzle number
export function buildShareText(history, { solved, appName = APP_NAME } = {}) {
  const attempts = history.length;
  const noun = attempts === 1 ? "attempt" : "attempts";
  const headline = solved
    ? `${appName} solved in ${attempts} ${noun}.`
    : `${appName} not solved in ${attempts} ${noun}.`;

  const counts = tallyStates(history);
  const summary =
    `Locked: ${counts[TileState.LOCKED]} | ` +
    `Misplaced: ${counts[TileState.MISPLACED]} | ` +
    `Unused: ${counts[TileState.UNUSED]}`;

  return `${headline}\n${summary}`;
}

// pop the native share sheet if we can (ios -> messages, etc), otherwise just copy.
// returns what actually happened so the ui can react
export async function shareOrCopy(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "dismissed";
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
