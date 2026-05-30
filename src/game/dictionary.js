import { answers, acceptedWords } from "@/data/words";
import { DEFAULT_ANSWER_LENGTH } from "./config";

const accepted = new Set(acceptedWords.map((word) => word.toLowerCase()));

export function isValidWord(word) {
  return typeof word === "string" && accepted.has(word.toLowerCase());
}

export function answersOfLength(length) {
  return answers.filter((word) => word.length === length);
}

// random's injectable so tests (and Daily Lock's seeded RNG) can force a word
export function randomAnswer(length = DEFAULT_ANSWER_LENGTH, random = Math.random) {
  const pool = answersOfLength(length);
  if (pool.length === 0) {
    throw new Error(`No answers available for length ${length}.`);
  }
  return pool[Math.floor(random() * pool.length)];
}
