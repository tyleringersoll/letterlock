export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const TileState = Object.freeze({
  EMPTY: "empty",
  TBD: "tbd",
  CORRECT: "correct",
  PRESENT: "present",
  ABSENT: "absent",
});

export const TILE_RANK = Object.freeze({
  [TileState.ABSENT]: 1,
  [TileState.PRESENT]: 2,
  [TileState.CORRECT]: 3,
});

// screen-reader wording for tiles and keyboard keys
export const STATE_LABEL = Object.freeze({
  [TileState.CORRECT]: "correct",
  [TileState.PRESENT]: "present in word",
  [TileState.ABSENT]: "absent",
});

export const GameStatus = Object.freeze({
  PLAYING: "playing",
  WON: "won",
  LOST: "lost",
});
