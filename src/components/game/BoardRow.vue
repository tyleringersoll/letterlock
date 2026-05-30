<script setup>
import BoardTile from "./BoardTile.vue";

defineProps({
  tiles: { type: Array, required: true },
  invalid: { type: Boolean, default: false },
  win: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="board-row"
    :class="{ 'board-row--invalid': invalid, 'board-row--win': win }"
    role="row"
  >
    <BoardTile
      v-for="(tile, i) in tiles"
      :key="i"
      :letter="tile.letter"
      :state="tile.state"
      :position="i"
    />
  </div>
</template>

<style lang="scss" scoped>
.board-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.375rem;

  &--invalid {
    animation: row-shake 0.5s ease;
  }

  &--win :deep(.tile) {
    animation: tile-bounce 0.55s ease;
    animation-delay: calc(var(--tile-index) * 0.1s + 0.6s);
  }
}

@keyframes row-shake {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-8px);
  }
  40%,
  60% {
    transform: translateX(8px);
  }
}

@keyframes tile-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-24px);
  }
  60% {
    transform: translateY(-12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .board-row--invalid,
  .board-row--win :deep(.tile) {
    animation: none;
  }
}
</style>
