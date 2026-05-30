<script setup>
import { TileState } from "@/game/constants";

defineProps({
  highContrast: { type: Boolean, default: false },
});

const emit = defineEmits(["toggleContrast"]);

const examples = [
  {
    word: "weary",
    highlight: 0,
    state: TileState.CORRECT,
    text: "W is in the word and in the correct spot.",
  },
  {
    word: "pilot",
    highlight: 1,
    state: TileState.PRESENT,
    text: "I is in the word but in the wrong spot.",
  },
  {
    word: "vague",
    highlight: 2,
    state: TileState.ABSENT,
    text: "G is not in the word in any spot.",
  },
];

const labels = {
  [TileState.CORRECT]: "correct",
  [TileState.PRESENT]: "present, wrong spot",
  [TileState.ABSENT]: "absent",
};
</script>

<template>
  <div class="how-to-play">
    <p>
      Guess the five-letter word in six tries. Every play deals a brand-new word,
      so you can play as many times as you like.
    </p>
    <p>After each guess, the tiles show how close you were:</p>

    <ul class="examples">
      <li
        v-for="example in examples"
        :key="example.word"
        class="examples__item"
      >
        <span
          class="examples__tiles"
          aria-hidden="true"
        >
          <span
            v-for="(letter, index) in example.word.split('')"
            :key="index"
            class="mini-tile"
            :class="index === example.highlight ? `mini-tile--${example.state}` : ''"
          >
            {{ letter }}
          </span>
        </span>
        <span class="examples__text">
          <strong>{{ example.word[example.highlight].toUpperCase() }}</strong>
          ({{ labels[example.state] }}) — {{ example.text }}
        </span>
      </li>
    </ul>

    <div class="setting">
      <label class="setting__label">
        <input
          type="checkbox"
          :checked="highContrast"
          @change="emit('toggleContrast', $event.target.checked)"
        >
        High-contrast (colour-blind) mode
      </label>
    </div>

    <p class="how-to-play__credit">
      Built with Vue 3 by Tyler Ingersoll —
      <a
        href="https://github.com/tyleringersoll/vue-wordle"
        target="_blank"
        rel="noopener"
      >
        source on GitHub
      </a>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.how-to-play {
  p {
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  &__credit {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
}

.examples {
  list-style: none;
  margin: 0 0 1.5rem;
  padding: 0;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  &__tiles {
    display: flex;
    gap: 0.25rem;
  }

  &__text {
    font-size: 0.95rem;
    line-height: 1.4;
  }
}

.mini-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tile-text);
  border: 2px solid var(--color-tile-border-filled);
  border-radius: 3px;

  &--correct {
    color: #fff;
    background-color: var(--color-correct);
    border-color: var(--color-correct);
  }

  &--present {
    color: #fff;
    background-color: var(--color-present);
    border-color: var(--color-present);
  }

  &--absent {
    color: #fff;
    background-color: var(--color-absent);
    border-color: var(--color-absent);
  }
}

.setting {
  padding-top: 1rem;
  border-top: 1px solid var(--color-surface-border);

  &__label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
  }

  input {
    width: 1.1rem;
    height: 1.1rem;
    cursor: pointer;
  }
}
</style>
