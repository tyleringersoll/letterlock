import { computed, readonly, ref } from "vue";
import { GameStatus, PlayMode, TileState } from "@/game/constants";
import { createConfig } from "@/game/config";
import { deriveLetterStates, evaluateAttempt, isSolved } from "@/game/engine";
import { isValidWord, randomAnswer } from "@/game/dictionary";
import { seededRandom, dateSeed } from "@/game/random";
import { storage as defaultStorage } from "@/services/storage";
import {
  STATS_STORAGE_KEY,
  normalizeStats,
  recordResult,
} from "@/services/statistics";

// one slot per mode lives under this key: { free: {...}, daily: {...} }
export const GAMES_STORAGE_KEY = "letterlock-games";
export const MODE_STORAGE_KEY = "letterlock-mode";
export const INVALID_FEEDBACK_MS = 1000;

const LETTER_RE = /^[a-z]$/i;

export function useGame({
  storage = defaultStorage,
  announce = () => {},
  onFinish = () => {},
  random = Math.random,
  config: configOverrides = {},
  mode: initialMode = PlayMode.FREE,
} = {}) {
  const config = createConfig(configOverrides);
  const { answerLength, maxGuesses } = config;

  const mode = ref(initialMode);
  const answer = ref("");
  const history = ref([]); // [{ attempt, evaluation }]
  const currentAttempt = ref("");
  const status = ref(GameStatus.PLAYING);
  const invalidAttempt = ref(false);
  const stats = ref(normalizeStats(storage.read(STATS_STORAGE_KEY), maxGuesses));

  let invalidTimer = null;

  const letterStates = computed(() => deriveLetterStates(history.value));

  const activeRow = computed(() =>
    status.value === GameStatus.PLAYING ? history.value.length : -1
  );

  const solvedRow = computed(() =>
    status.value === GameStatus.SOLVED ? history.value.length - 1 : -1
  );

  // dimensions come straight from config - no fixed grid size
  const board = computed(() => {
    const rows = [];
    for (let r = 0; r < maxGuesses; r += 1) {
      const submitted = history.value[r];
      const isCurrent = r === activeRow.value;
      const tiles = [];

      for (let c = 0; c < answerLength; c += 1) {
        if (submitted) {
          tiles.push({
            letter: submitted.attempt[c],
            state: submitted.evaluation[c],
          });
        } else if (isCurrent) {
          const letter = currentAttempt.value[c] ?? "";
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

  function pickAnswer() {
    if (mode.value === PlayMode.DAILY) {
      return randomAnswer(answerLength, seededRandom(dateSeed()));
    }
    return randomAnswer(answerLength, random);
  }

  function persistGame() {
    const games = storage.read(GAMES_STORAGE_KEY) || {};
    games[mode.value] = {
      answer: answer.value,
      attempts: history.value.map((turn) => turn.attempt),
      current: currentAttempt.value,
      day: dateSeed(),
    };
    storage.write(GAMES_STORAGE_KEY, games);
  }

  function clearInvalid() {
    invalidAttempt.value = false;
    if (invalidTimer) {
      clearTimeout(invalidTimer);
      invalidTimer = null;
    }
  }

  function flagInvalid(message) {
    invalidAttempt.value = true;
    announce(message, "assertive");
    if (invalidTimer) clearTimeout(invalidTimer);
    invalidTimer = setTimeout(() => {
      invalidAttempt.value = false;
    }, INVALID_FEEDBACK_MS);
  }

  function addLetter(letter) {
    if (isOver.value) return;
    if (currentAttempt.value.length >= answerLength) return;
    if (!LETTER_RE.test(letter)) return;
    clearInvalid();
    currentAttempt.value += letter.toLowerCase();
    persistGame();
  }

  function removeLetter() {
    if (isOver.value || !currentAttempt.value) return;
    clearInvalid();
    currentAttempt.value = currentAttempt.value.slice(0, -1);
    persistGame();
  }

  function finishGame(solved) {
    status.value = solved ? GameStatus.SOLVED : GameStatus.LOST;
    stats.value = recordResult(stats.value, {
      solved,
      attemptNumber: history.value.length,
    });
    storage.write(STATS_STORAGE_KEY, stats.value);
    announce(
      solved
        ? `Solved in ${history.value.length} ${
            history.value.length === 1 ? "attempt" : "attempts"
          }.`
        : `Out of attempts. The word was ${answer.value.toUpperCase()}.`,
      "assertive"
    );
    onFinish({ solved });
  }

  function submitAttempt() {
    if (isOver.value) return;

    const attempt = currentAttempt.value;

    if (attempt.length < answerLength) {
      flagInvalid("Not enough letters");
      return;
    }
    if (!isValidWord(attempt)) {
      flagInvalid("Not an accepted word");
      return;
    }

    clearInvalid();
    const evaluation = evaluateAttempt(attempt, answer.value);
    history.value = [...history.value, { attempt, evaluation }];
    currentAttempt.value = "";

    if (isSolved(evaluation)) {
      finishGame(true);
    } else if (history.value.length >= maxGuesses) {
      finishGame(false);
    }

    persistGame();
  }

  function startNewGame() {
    answer.value = pickAnswer();
    history.value = [];
    currentAttempt.value = "";
    status.value = GameStatus.PLAYING;
    clearInvalid();
    persistGame();
  }

  function reconstruct(attempts, ans) {
    return attempts
      .filter((a) => typeof a === "string" && a.length === answerLength)
      .slice(0, maxGuesses)
      .map((attempt) => ({ attempt, evaluation: evaluateAttempt(attempt, ans) }));
  }

  function sanitizeCurrent(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, answerLength);
  }

  // returns false (so the caller can start fresh) if the slot is finished and
  // finished games aren't allowed for this mode
  function applySaved(slot, { allowFinished }) {
    const turns = reconstruct(slot.attempts, slot.answer);
    const last = turns[turns.length - 1];
    const solved = Boolean(last && isSolved(last.evaluation));
    const lost = !solved && turns.length >= maxGuesses;
    const finished = solved || lost;

    if (finished && !allowFinished) return false;

    answer.value = slot.answer;
    history.value = turns;
    status.value = solved
      ? GameStatus.SOLVED
      : lost
        ? GameStatus.LOST
        : GameStatus.PLAYING;
    currentAttempt.value = finished ? "" : sanitizeCurrent(slot.current);
    clearInvalid();
    return true;
  }

  // resume the saved game for `targetMode`, or deal a fresh one
  function loadOrStart(targetMode) {
    const games = storage.read(GAMES_STORAGE_KEY) || {};
    const slot = games[targetMode];
    const valid =
      slot &&
      typeof slot.answer === "string" &&
      slot.answer.length === answerLength &&
      Array.isArray(slot.attempts);

    if (targetMode === PlayMode.DAILY) {
      // today's daily is locked: resume it even when finished
      if (valid && slot.day === dateSeed() && applySaved(slot, { allowFinished: true })) {
        return;
      }
      startNewGame();
      return;
    }

    // free play: resume only an unfinished game, otherwise deal a new word
    if (valid && applySaved(slot, { allowFinished: false })) return;
    startNewGame();
  }

  function setMode(nextMode) {
    if (nextMode !== PlayMode.FREE && nextMode !== PlayMode.DAILY) return;
    if (nextMode === mode.value) return;
    persistGame(); // keep the mode we're leaving (board + typed letters)
    mode.value = nextMode;
    storage.write(MODE_STORAGE_KEY, nextMode);
    loadOrStart(nextMode);
  }

  function restore() {
    const savedMode = storage.read(MODE_STORAGE_KEY);
    if (savedMode === PlayMode.FREE || savedMode === PlayMode.DAILY) {
      mode.value = savedMode;
    }
    loadOrStart(mode.value);
  }

  return {
    answer: readonly(answer),
    history: readonly(history),
    currentAttempt: readonly(currentAttempt),
    status: readonly(status),
    invalidAttempt: readonly(invalidAttempt),
    stats: readonly(stats),
    mode: readonly(mode),
    board,
    letterStates,
    activeRow,
    solvedRow,
    isOver,
    addLetter,
    removeLetter,
    submitAttempt,
    startNewGame,
    setMode,
    restore,
    answerLength,
    maxGuesses,
  };
}
