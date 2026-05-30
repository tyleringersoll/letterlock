import { describe, it, expect, beforeEach } from "vitest";
import { useGame, GAME_STORAGE_KEY } from "./useGame";
import { createStorage } from "@/services/storage";
import { STATS_STORAGE_KEY } from "@/services/statistics";
import { GameStatus, TileState } from "@/game/constants";
import { answers } from "@/game/dictionary";

// pin the rng so we know which word gets dealt
function rngFor(word) {
  const index = answers.indexOf(word);
  if (index === -1) throw new Error(`"${word}" is not in the answer list`);
  return () => index / answers.length;
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

  it("starts a new game with an answer and an empty board", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    expect(game.answer.value).toBe("crane");
    expect(game.status.value).toBe(GameStatus.PLAYING);
    expect(game.board.value).toHaveLength(6);
    expect(game.board.value[0].tiles[0].state).toBe(TileState.EMPTY);
  });

  it("types and deletes letters into the active row", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "cr");
    expect(game.currentGuess.value).toBe("cr");
    expect(game.board.value[0].tiles[0].letter).toBe("c");
    game.removeLetter();
    expect(game.currentGuess.value).toBe("c");
  });

  it("caps the guess at the word length", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "cranesss");
    expect(game.currentGuess.value).toBe("crane");
  });

  it("rejects a too-short guess with feedback", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "cr");
    game.submit();
    expect(game.history.value).toHaveLength(0);
    expect(messages).toContain("Not enough letters");
  });

  it("rejects a word that is not in the dictionary", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "zzzzz");
    game.submit();
    expect(game.history.value).toHaveLength(0);
    expect(messages).toContain("Not in word list");
  });

  it("clears the invalid flag as soon as the guess is edited", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "zz");
    game.submit();
    expect(game.invalidGuess.value).toBe(true);

    game.addLetter("o");
    expect(game.invalidGuess.value).toBe(false);
  });

  it("clears the invalid flag on backspace", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "zz");
    game.submit();
    expect(game.invalidGuess.value).toBe(true);

    game.removeLetter();
    expect(game.invalidGuess.value).toBe(false);
  });

  it("wins when the guess matches the answer and records stats", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "crane");
    game.submit();
    expect(game.status.value).toBe(GameStatus.WON);
    expect(game.winningRow.value).toBe(0);
    expect(game.stats.value.gamesWon).toBe(1);
    expect(game.stats.value.guessDistribution[1]).toBe(1);
    expect(storage.read(STATS_STORAGE_KEY).gamesWon).toBe(1);
  });

  it("ignores further input once the game is over", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "crane");
    game.submit();
    type(game, "abc");
    expect(game.currentGuess.value).toBe("");
  });

  it("loses after six wrong guesses and records a fail", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    for (let i = 0; i < 6; i += 1) {
      type(game, "stink");
      game.submit();
    }
    expect(game.status.value).toBe(GameStatus.LOST);
    expect(game.history.value).toHaveLength(6);
    expect(game.stats.value.guessDistribution.fail).toBe(1);
  });

  it("derives keyboard letter states from history", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "crane");
    game.submit();
    expect(game.letterStates.value.c).toBe(TileState.CORRECT);
  });

  it("persists and restores an in-progress game", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "stink");
    game.submit();

    const resumed = useGame({ storage, announce });
    resumed.restore();
    expect(resumed.answer.value).toBe("crane");
    expect(resumed.history.value).toHaveLength(1);
    expect(resumed.history.value[0].guess).toBe("stink");
    expect(resumed.status.value).toBe(GameStatus.PLAYING);
  });

  it("starts fresh when the saved game is already finished, without touching stats", () => {
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.startNewGame();
    type(game, "crane");
    game.submit();
    const winsAfterPlay = storage.read(STATS_STORAGE_KEY).gamesWon;

    const resumed = useGame({ storage, announce, random: rngFor("stink") });
    resumed.restore();
    expect(resumed.status.value).toBe(GameStatus.PLAYING);
    expect(resumed.history.value).toHaveLength(0);
    expect(resumed.stats.value.gamesWon).toBe(winsAfterPlay);
  });

  it("deals a fresh game when there is no valid save", () => {
    storage.write(GAME_STORAGE_KEY, { answer: "no", guesses: "oops" });
    const game = useGame({ storage, announce, random: rngFor("crane") });
    game.restore();
    expect(game.answer.value).toBe("crane");
    expect(game.history.value).toHaveLength(0);
  });
});
