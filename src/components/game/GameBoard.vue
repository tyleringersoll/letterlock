<script setup>
import BoardRow from "./BoardRow.vue";

defineProps({
  board: { type: Array, required: true },
  activeRow: { type: Number, default: -1 },
  winningRow: { type: Number, default: -1 },
  invalid: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="board"
    role="grid"
    aria-label="Game board: six rows of five letters"
  >
    <BoardRow
      v-for="(row, index) in board"
      :key="index"
      :tiles="row.tiles"
      :invalid="invalid && index === activeRow"
      :win="index === winningRow"
    />
  </div>
</template>

<style lang="scss" scoped>
.board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 0.375rem;
  // shrink the board on short screens so the keyboard always has room.
  // first line is the fallback for browsers without dvh.
  width: min(100%, 21rem);
  width: min(100%, clamp(8rem, (100dvh - 20rem) * 5 / 6, 21rem));
  margin: 0 auto;
  padding: 0.5rem;
  aspect-ratio: 5 / 6;
  // lets the tiles scale their font off the actual board width
  container-type: inline-size;
}
</style>
