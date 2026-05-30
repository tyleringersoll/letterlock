<script setup>
import { TileState } from "@/game/constants";

defineProps({
  highContrast: { type: Boolean, default: false },
});

const emit = defineEmits(["toggleContrast"]);

const examples = [
  {
    word: "planet",
    highlight: 0,
    state: TileState.LOCKED,
    text: "P is locked — right letter, right place.",
  },
  {
    word: "rocket",
    highlight: 1,
    state: TileState.MISPLACED,
    text: "O is misplaced — in the word, but somewhere else.",
  },
  {
    word: "silver",
    highlight: 3,
    state: TileState.UNUSED,
    text: "V is unused — not in the word at all.",
  },
];
</script>

<template>
  <div class="how-to-play">
    <p>
      Solve the hidden six-letter word. Each attempt reveals which letters are
      locked in place, which belong somewhere else, and which are not used.
    </p>
    <p>You have seven attempts. After each one the tiles update:</p>

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
          >{{ letter }}</span>
        </span>
        <span class="examples__text">{{ example.text }}</span>
      </li>
    </ul>

    <div class="setting">
      <label class="setting__label">
        <input
          type="checkbox"
          :checked="highContrast"
          @change="emit('toggleContrast', $event.target.checked)"
        >
        High-contrast colors
      </label>
    </div>

    <p class="how-to-play__credit">
      Letterlock is a small front-end word puzzle.
      <a
        href="https://github.com/tyleringersoll/letterlock"
        target="_blank"
        rel="noopener"
      >Source on GitHub</a>
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
    gap: 0.3rem;
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
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-tile-text);
  background-color: var(--color-tile-bg);
  border: 2px solid var(--color-tile-border-filled);
  border-radius: 28%;

  &--locked {
    color: #fff;
    background-color: var(--color-locked);
    border-color: var(--color-locked);
  }

  &--misplaced {
    color: var(--color-tile-text);
    background-color: transparent;
    border-color: var(--color-misplaced);
    box-shadow: inset 0 0 0 1.5px var(--color-misplaced);
  }

  &--unused {
    color: var(--color-tile-unused-text);
    background-color: var(--color-unused);
    border-color: var(--color-unused);
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
