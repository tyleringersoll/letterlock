<script setup>
import LetterTile from "./LetterTile.vue";

defineProps({
  tiles: { type: Array, required: true },
  invalid: { type: Boolean, default: false },
  solved: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="attempt-row"
    :class="{ 'attempt-row--invalid': invalid, 'attempt-row--solved': solved }"
    role="row"
  >
    <LetterTile
      v-for="(tile, i) in tiles"
      :key="i"
      :letter="tile.letter"
      :state="tile.state"
      :position="i"
    />
  </div>
</template>

<style lang="scss" scoped>
.attempt-row {
  display: grid;
  grid-template-columns: repeat(var(--cols, 6), 1fr);
  gap: 0.4rem;

  // rejected attempt: quick nudge + warning outline (no big shake)
  &--invalid {
    animation: attempt-reject 0.4s ease;
  }

  // solved row: glow pulse, staggered per tile (no bounce)
  &--solved :deep(.tile) {
    animation: tile-glow 0.7s ease;
    animation-delay: calc(var(--tile-index) * 0.09s + 0.5s);
  }
}

@keyframes attempt-reject {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

@keyframes tile-glow {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(0, 183, 255, 0);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 0 1.2rem var(--color-accent);
    transform: translateY(-6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .attempt-row--invalid,
  .attempt-row--solved :deep(.tile) {
    animation: none;
  }
}
</style>
