import { MAX_GUESSES, TileState } from "@/game/constants";

const EMOJI = Object.freeze({
  [TileState.CORRECT]: "🟩",
  [TileState.PRESENT]: "🟨",
  [TileState.ABSENT]: "⬛",
});

export function evaluationToEmoji(evaluation) {
  return evaluation
    .map((state) => EMOJI[state] ?? EMOJI[TileState.ABSENT])
    .join("");
}

export function buildShareText(
  history,
  { won, maxGuesses = MAX_GUESSES, url, title = "Tyler's Wordle", answer } = {}
) {
  const score = won ? history.length : "X";
  const lines = [`${title} ${score}/${maxGuesses}`];

  if (answer) lines.push(`Word: ${answer.toUpperCase()}`);
  if (url) lines.push(url);

  lines.push("");
  lines.push(history.map((turn) => evaluationToEmoji(turn.evaluation)).join("\n"));

  return lines.join("\n");
}

// pop the native share sheet if we can (ios -> messages, etc), otherwise just copy.
// returns what actually happened so the ui can react
export async function shareOrCopy(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "dismissed"; // user backed out
      // anything else - drop down to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
