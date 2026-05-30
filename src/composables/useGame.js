import { computed, readonly, ref } from "vue";
import {
  GameStatus,
  MAX_GUESSES,
  TileState,
  WORD_LENGTH,
} from "@/game/constants";
import {
  deriveLetterStates,
  evaluateGuess,
  isWinningEvaluation,
} from "@/game/engine";
import { isValidWord, randomAnswer } from "@/game/dictionary";
import { storage as defaultStorage } from "@/services/storage";
import {
  STATS_STORAGE_KEY,
  migrateStats,
  recordResult,
} from "@/services/statistics";

export const GAME_STORAGE_KEY = "wordleGame";
export const INVALID_FEEDBACK_MS = 1000;

const LETTER_RE = /^[a-z]$/i;

export function useGame({
  storage = defaultStorage,
  announce = () => {},
  random = Math.random,
} = {}) {
  const answer = ref("");
  const history = ref([]);
  const currentGuess = ref("");
  const status = ref(GameStatus.PLAYING);
  const invalidGuess = ref(false);
  const stats = ref(migrateStats(storage.read(STATS_STORAGE_KEY)));

  let invalidTimer = null;

  const letterStates = computed(() => deriveLetterStates(history.value));

  const activeRow = computed(() =>
    status.value === GameStatus.PLAYING ? history.value.length : -1
  );

  const winningRow = computed(() =>
    status.value === GameStatus.WON ? history.value.length - 1 : -1
  );

  const board = computed(() => {
    const rows = [];
    for (let r = 0; r < MAX_GUESSES; r += 1) {
      const submitted = history.value[r];
      const isCurrent = r === activeRow.value;
      const tiles = [];

      for (let c = 0; c < WORD_LENGTH; c += 1) {
        if (submitted) {
          tiles.push({ letter: submitted.guess[c], state: submitted.evaluation[c] });
        } else if (isCurrent) {
          const letter = currentGuess.value[c] ?? "";
          tiles.push({ letter, state: letter ? TileState.TBD : TileState.EMPTY });
        } else {
          tiles.push({ letter: "", state: TileState.EMPTY });
        }
      }

      rows.push({ tiles, submitted: Boolean(submitted), current: isCurrent });
    }
    return rows;
  });

  const isOver = computed(() => status.value !== GameStatus.PLAYING);

  function persistGame() {
    storage.write(GAME_STORAGE_KEY, {
      answer: answer.value,
      guesses: history.value.map((turn) => turn.guess),
    });
  }

  function persistStats() {
    storage.write(STATS_STORAGE_KEY, stats.value);
  }

  function clearInvalid() {
    invalidGuess.value = false;
    if (invalidTimer) {
      clearTimeout(invalidTimer);
      invalidTimer = null;
    }
  }

  function flagInvalid(message) {
    invalidGuess.value = true;
    announce(message, "assertive");
    if (invalidTimer) clearTimeout(invalidTimer);
    invalidTimer = setTimeout(() => {
      invalidGuess.value = false;
    }, INVALID_FEEDBACK_MS);
  }

  function addLetter(letter) {
    if (isOver.value) return;
    if (currentGuess.value.length >= WORD_LENGTH) return;
    if (!LETTER_RE.test(letter)) return;
    clearInvalid();
    currentGuess.value += letter.toLowerCase();
  }

  function removeLetter() {
    if (isOver.value || !currentGuess.value) return;
    clearInvalid();
    currentGuess.value = currentGuess.value.slice(0, -1);
  }

  function finishGame(won) {
    status.value = won ? GameStatus.WON : GameStatus.LOST;
    stats.value = recordResult(stats.value, {
      won,
      guessNumber: history.value.length,
    });
    persistStats();
    announce(
      won
        ? `Solved in ${history.value.length} ${
            history.value.length === 1 ? "guess" : "guesses"
          }!`
        : `Out of guesses. The word was ${answer.value.toUpperCase()}.`,
      "assertive"
    );
  }

  function submit() {
    if (isOver.value) return;

    const guess = currentGuess.value;

    if (guess.length < WORD_LENGTH) {
      flagInvalid("Not enough letters");
      return;
    }
    if (!isValidWord(guess)) {
      flagInvalid("Not in word list");
      return;
    }

    clearInvalid();
    const evaluation = evaluateGuess(guess, answer.value);
    history.value = [...history.value, { guess, evaluation }];
    currentGuess.value = "";

    if (isWinningEvaluation(evaluation)) {
      finishGame(true);
    } else if (history.value.length >= MAX_GUESSES) {
      finishGame(false);
    }

    persistGame();
  }

  function startNewGame() {
    answer.value = randomAnswer(random);
    history.value = [];
    currentGuess.value = "";
    status.value = GameStatus.PLAYING;
    clearInvalid();
    persistGame();
  }

  // only pick up a game that's still going, otherwise just deal a new word
  function restore() {
    const saved = storage.read(GAME_STORAGE_KEY);
    const validSave =
      saved &&
      typeof saved.answer === "string" &&
      saved.answer.length === WORD_LENGTH &&
      Array.isArray(saved.guesses);

    if (!validSave) {
      startNewGame();
      return;
    }

    const turns = saved.guesses
      .filter((g) => typeof g === "string" && g.length === WORD_LENGTH)
      .slice(0, MAX_GUESSES)
      .map((guess) => ({ guess, evaluation: evaluateGuess(guess, saved.answer) }));

    const last = turns[turns.length - 1];
    const finished =
      (last && isWinningEvaluation(last.evaluation)) || turns.length >= MAX_GUESSES;

    if (finished) {
      startNewGame();
      return;
    }

    answer.value = saved.answer;
    history.value = turns;
    currentGuess.value = "";
    status.value = GameStatus.PLAYING;
  }

  return {
    answer: readonly(answer),
    history: readonly(history),
    currentGuess: readonly(currentGuess),
    status: readonly(status),
    invalidGuess: readonly(invalidGuess),
    stats: readonly(stats),
    board,
    letterStates,
    activeRow,
    winningRow,
    isOver,
    addLetter,
    removeLetter,
    submit,
    startNewGame,
    restore,
    WORD_LENGTH,
    MAX_GUESSES,
  };
}
