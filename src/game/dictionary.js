import { library, words } from "@/data/library";
import { WORD_LENGTH } from "./constants";

export const answers = library;

const validGuesses = new Set(
  [...library, ...words].map((word) => word.toLowerCase())
);

export function isValidWord(word) {
  return typeof word === "string" && validGuesses.has(word.toLowerCase());
}

// random's injectable so tests can force a specific word
export function randomAnswer(random = Math.random) {
  return answers[Math.floor(random() * answers.length)];
}

export { WORD_LENGTH };
