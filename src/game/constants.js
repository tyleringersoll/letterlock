export const TileState = Object.freeze({
  EMPTY: "empty",
  TBD: "tbd",
  LOCKED: "locked", // right letter, right place
  MISPLACED: "misplaced", // in the word, wrong place
  UNUSED: "unused", // not in the word
});

// keyboard colors only ever go up, never down - unused < misplaced < locked
export const TILE_RANK = Object.freeze({
  [TileState.UNUSED]: 1,
  [TileState.MISPLACED]: 2,
  [TileState.LOCKED]: 3,
});

// screen-reader wording for tiles and keys
export const STATE_LABEL = Object.freeze({
  [TileState.LOCKED]: "locked",
  [TileState.MISPLACED]: "misplaced",
  [TileState.UNUSED]: "unused",
});

export const GameStatus = Object.freeze({
  PLAYING: "playing",
  SOLVED: "solved",
  LOST: "lost",
});

export const PlayMode = Object.freeze({
  FREE: "free",
  DAILY: "daily",
});
