export const DEFAULT_ANSWER_LENGTH = 6;
export const DEFAULT_MAX_GUESSES = 7;

export const MIN_ANSWER_LENGTH = 4;
export const MAX_ANSWER_LENGTH = 8;

// Board dimensions come from here, never hard-coded, so the grid can be any
// answerLength x maxGuesses.
export function createConfig(overrides = {}) {
  return {
    answerLength: overrides.answerLength ?? DEFAULT_ANSWER_LENGTH,
    maxGuesses: overrides.maxGuesses ?? DEFAULT_MAX_GUESSES,
  };
}
