<script setup>
import { computed } from "vue";
import { STATE_LABEL, TileState } from "@/game/constants";

const props = defineProps({
  letter: { type: String, default: "" },
  state: { type: String, default: TileState.EMPTY },
  position: { type: Number, default: 0 },
});

const ariaLabel = computed(() => {
  if (!props.letter) return "empty";
  const label = STATE_LABEL[props.state];
  return label ? `${props.letter}, ${label}` : props.letter;
});

const isEvaluated = computed(() =>
  [TileState.LOCKED, TileState.MISPLACED, TileState.UNUSED].includes(props.state)
);
</script>

<template>
  <div
    class="tile"
    :class="[
      `tile--${state}`,
      { 'tile--filled': !!letter, 'tile--reveal': isEvaluated },
    ]"
    role="gridcell"
    :aria-label="ariaLabel"
    :style="{ '--tile-index': position }"
  >
    <span
      class="tile__face"
      aria-hidden="true"
    >{{ letter }}</span>
  </div>
</template>

<style lang="scss" scoped>
.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  // font scales with tile width (board width / column count)
  font-size: clamp(0.8rem, calc(57cqw / var(--cols, 6)), 2rem);
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  color: var(--color-tile-text);
  background-color: var(--color-tile-bg);
  border: 2px solid var(--color-tile-border);
  // rounded, not square
  border-radius: 28%;
  user-select: none;
  transition: border-color 0.12s ease, transform 0.12s ease;

  &--filled {
    border-color: var(--color-tile-border-filled);
    animation: tile-press 0.12s ease;
  }

  &--locked {
    color: var(--color-locked-text);
    background-color: var(--color-locked);
    border-color: var(--color-locked);
  }

  // red outline, no fill
  &--misplaced {
    color: var(--color-tile-text);
    background-color: transparent;
    border-color: var(--color-misplaced);
    box-shadow: inset 0 0 0 2px var(--color-misplaced);
  }

  &--unused {
    color: var(--color-tile-unused-text);
    background-color: var(--color-unused);
    border-color: var(--color-unused);
  }

  // reveal: settle in with a small spin + scale (not a flip)
  &--reveal {
    animation: tile-reveal 0.42s ease both;
    animation-delay: calc(var(--tile-index) * 0.16s);
  }
}

@keyframes tile-press {
  0% {
    transform: scale(0.92);
  }
  60% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes tile-reveal {
  0% {
    transform: scale(0.5) rotate(-8deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.12) rotate(3deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile--filled,
  .tile--reveal {
    animation: none;
    transition: none;
  }
}
</style>
