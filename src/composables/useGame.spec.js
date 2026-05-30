import { describe, it, expect, beforeEach } from "vitest";
import { useGame, GAMES_STORAGE_KEY } from "./useGame";
import { createStorage } from "@/services/storage";
import { STATS_STORAGE_KEY } from "@/services/statistics";
import { GameStatus, PlayMode, TileState } from "@/game/constants";
import { answersOfLength } from "@/game/dictionary";

// pin the rng so we know which answer gets dealt
function rngFor(word) {
  const pool = answersOfLength(6);
  const index = pool.indexOf(word);
  if (index === -1) throw new Error(`"${word}" is not a six-letter answer`);
  return () => (index + 0.5) / pool.length;
}

function type(game, word) {
  for (const letter of word) game.addLetter(letter);
}

describe("useGame", () => {
  let storage;
  const messages = [];
  const announce = (text) => messages.push(text);

  beforeEach(() => {
    storage = createStorage(null);
    messages.length = 0;
  });

  it("starts a new game with a six-letter answer and a 7x6 board", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    expect(game.answer.value).toBe("planet");
    expect(game.status.value).toBe(GameStatus.PLAYING);
    expect(game.board.value).toHaveLength(7);
    expect(game.board.value[0].tiles).toHaveLength(6);
    expect(game.board.value[0].tiles[0].state).toBe(TileState.EMPTY);
  });

  it("derives board dimensions from config", () => {
    const game = useGame({ storage, announce, config: { maxGuesses: 4 } });
    game.startNewGame();
    expect(game.board.value).toHaveLength(4);
    expect(game.maxGuesses).toBe(4);
    expect(game.answerLength).toBe(6);
  });

  it("caps the attempt at the answer length", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "planetary");
    expect(game.currentAttempt.value).toBe("planet");
  });

  it("rejects a too-short attempt with feedback", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "plan");
    game.submitAttempt();
    expect(game.history.value).toHaveLength(0);
    expect(messages).toContain("Not enough letters");
  });

  it("rejects a word that is not accepted", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "zzzzzz");
    game.submitAttempt();
    expect(game.history.value).toHaveLength(0);
    expect(messages).toContain("Not an accepted word");
  });

  it("clears the invalid flag as soon as the attempt is edited", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "plan");
    game.submitAttempt();
    expect(game.invalidAttempt.value).toBe(true);
    game.addLetter("e");
    expect(game.invalidAttempt.value).toBe(false);
  });

  it("solves when the attempt matches and records stats", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "planet");
    game.submitAttempt();
    expect(game.status.value).toBe(GameStatus.SOLVED);
    expect(game.solvedRow.value).toBe(0);
    expect(game.stats.value.gamesSolved).toBe(1);
    expect(game.stats.value.attemptDistribution[1]).toBe(1);
    expect(storage.read(STATS_STORAGE_KEY).gamesSolved).toBe(1);
  });

  it("ignores further input once the game is over", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "planet");
    game.submitAttempt();
    type(game, "abc");
    expect(game.currentAttempt.value).toBe("");
  });

  it("loses after maxGuesses wrong attempts and records a fail", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    for (let i = 0; i < 7; i += 1) {
      type(game, "rocket"); // valid word, not the answer
      game.submitAttempt();
    }
    expect(game.status.value).toBe(GameStatus.LOST);
    expect(game.history.value).toHaveLength(7);
    expect(game.stats.value.attemptDistribution.fail).toBe(1);
  });

  it("derives input-panel letter states from history", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "planet");
    game.submitAttempt();
    expect(game.letterStates.value.p).toBe(TileState.LOCKED);
  });

  it("persists and restores an in-progress free game", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "rocket");
    game.submitAttempt();

    const resumed = useGame({ storage, announce });
    resumed.restore();
    expect(resumed.answer.value).toBe("planet");
    expect(resumed.history.value).toHaveLength(1);
    expect(resumed.history.value[0].attempt).toBe("rocket");
    expect(resumed.status.value).toBe(GameStatus.PLAYING);
  });

  it("starts fresh when the saved game is already finished", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "planet");
    game.submitAttempt();
    const solvesAfterPlay = storage.read(STATS_STORAGE_KEY).gamesSolved;

    const resumed = useGame({ storage, announce, random: rngFor("rocket") });
    resumed.restore();
    expect(resumed.status.value).toBe(GameStatus.PLAYING);
    expect(resumed.history.value).toHaveLength(0);
    expect(resumed.stats.value.gamesSolved).toBe(solvesAfterPlay);
  });

  it("deals a fresh game when there is no valid save", () => {
    storage.write(GAMES_STORAGE_KEY, { free: { answer: "no", attempts: "oops" } });
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.restore();
    expect(game.answer.value).toBe("planet");
    expect(game.history.value).toHaveLength(0);
  });

  it("Daily Lock deals the same word for the same day", () => {
    const a = useGame({ storage, announce });
    a.setMode(PlayMode.DAILY);
    const b = useGame({ storage: createStorage(null), announce });
    b.setMode(PlayMode.DAILY);
    expect(a.mode.value).toBe(PlayMode.DAILY);
    expect(a.answer.value).toBe(b.answer.value);
  });

  it("keeps each mode's game when switching between modes", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "rocket");
    game.submitAttempt();
    expect(game.history.value).toHaveLength(1);

    game.setMode(PlayMode.DAILY); // fresh daily
    expect(game.history.value).toHaveLength(0);
    const dailyAnswer = game.answer.value;
    type(game, "sunset");
    game.submitAttempt();
    const dailyLen = game.history.value.length;

    game.setMode(PlayMode.FREE); // free board comes back
    expect(game.answer.value).toBe("planet");
    expect(game.history.value).toHaveLength(1);
    expect(game.history.value[0].attempt).toBe("rocket");

    game.setMode(PlayMode.DAILY); // daily board comes back
    expect(game.answer.value).toBe(dailyAnswer);
    expect(game.history.value).toHaveLength(dailyLen);
  });

  it("preserves a half-typed attempt across a mode switch", () => {
    const game = useGame({ storage, announce, random: rngFor("planet") });
    game.startNewGame();
    type(game, "roc");
    game.setMode(PlayMode.DAILY);
    game.setMode(PlayMode.FREE);
    expect(game.currentAttempt.value).toBe("roc");
  });
});
