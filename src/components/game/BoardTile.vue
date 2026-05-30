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
  [TileState.CORRECT, TileState.PRESENT, TileState.ABSENT].includes(props.state)
);
</script>

<template>
  <div
    class="tile"
    :class="[`tile--${state}`, { 'tile--filled': !!letter, 'tile--flip': isEvaluated }]"
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
  max-width: 4rem;
  aspect-ratio: 1 / 1;
  // scales with the board width (set as a container query container)
  font-size: clamp(0.85rem, 9.5cqw, 2rem);
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  color: var(--color-tile-text);
  background-color: var(--color-tile-bg);
  border: 2px solid var(--color-tile-border);
  border-radius: 4px;
  user-select: none;
  transition: border-color 0.1s ease, transform 0.1s ease;

  &--filled {
    border-color: var(--color-tile-border-filled);
    animation: tile-pop 0.1s ease;
  }

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

  &--flip {
    animation: tile-flip 0.5s ease forwards;
    animation-delay: calc(var(--tile-index) * 0.18s);
  }
}

@keyframes tile-pop {
  0% {
    transform: scale(0.9);
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes tile-flip {
  0% {
    transform: rotateX(0);
  }
  50% {
    transform: rotateX(-90deg);
  }
  100% {
    transform: rotateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile--filled,
  .tile--flip {
    animation: none;
    transition: none;
  }
}
</style>
