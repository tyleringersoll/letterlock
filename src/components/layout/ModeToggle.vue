<script setup>
import { PlayMode } from "@/game/constants";

defineProps({
  mode: { type: String, required: true },
});

const emit = defineEmits(["select"]);

const options = [
  { value: PlayMode.FREE, label: "Free Play" },
  { value: PlayMode.DAILY, label: "Daily Lock" },
];
</script>

<template>
  <div
    class="mode-toggle"
    role="group"
    aria-label="Game mode"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="mode-toggle__option"
      :class="{ 'mode-toggle__option--active': option.value === mode }"
      :aria-pressed="option.value === mode"
      @click="emit('select', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.mode-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-surface-border);
  border-radius: 999px;

  &__option {
    padding: 0.4rem 1rem;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--color-text-muted);
    background: transparent;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &--active {
      color: var(--color-on-accent);
      background-color: var(--color-accent);
    }
  }
}
</style>
