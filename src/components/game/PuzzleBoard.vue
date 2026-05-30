<script setup>
import AttemptRow from "./AttemptRow.vue";

defineProps({
  // a maxGuesses x answerLength grid of { letter, state }
  board: { type: Array, required: true },
  columns: { type: Number, required: true },
  rows: { type: Number, required: true },
  activeRow: { type: Number, default: -1 },
  solvedRow: { type: Number, default: -1 },
  invalid: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="board"
    role="grid"
    :aria-label="`Puzzle board, ${rows} attempts of ${columns} letters`"
    :style="{ '--cols': columns, '--rows': rows }"
  >
    <AttemptRow
      v-for="(row, index) in board"
      :key="index"
      :tiles="row.tiles"
      :invalid="invalid && index === activeRow"
      :solved="index === solvedRow"
    />
  </div>
</template>

<style lang="scss" scoped>
.board {
  display: grid;
  grid-template-rows: repeat(var(--rows), 1fr);
  gap: 0.4rem;
  // shape derived from config; aspect ratio = columns / rows
  aspect-ratio: var(--cols) / var(--rows);
  width: min(100%, 24rem);
  width: min(
    100%,
    clamp(7rem, (100dvh - 24rem) * var(--cols) / var(--rows), 24rem)
  );
  margin: 0 auto;
  padding: 0.7rem;
  background-color: var(--color-board);
  border: 1px solid var(--color-board-border);
  border-radius: 1.25rem;
  // lets tiles scale their font off the board width
  container-type: inline-size;
}
</style>
