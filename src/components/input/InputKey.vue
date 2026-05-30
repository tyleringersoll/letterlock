<script setup>
import { computed } from "vue";
import { STATE_LABEL } from "@/game/constants";

const props = defineProps({
  keyValue: { type: String, required: true },
  label: { type: String, default: "" },
  state: { type: String, default: "" },
  variant: { type: String, default: "letter" }, // letter | action
  ariaLabel: { type: String, default: "" },
});

const emit = defineEmits(["press"]);

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  const stateLabel = STATE_LABEL[props.state];
  return stateLabel ? `${props.label}, ${stateLabel}` : props.label;
});
</script>

<template>
  <button
    type="button"
    class="key"
    :class="[state && `key--${state}`, `key--${variant}`]"
    :aria-label="computedAriaLabel"
    @click="emit('press', keyValue)"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style lang="scss" scoped>
.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  height: 3.25rem;
  padding: 0;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--color-key-text);
  background-color: var(--color-key-bg);
  border: 1px solid var(--color-key-border);
  border-radius: 999px; // pill keys
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: background-color 0.15s ease, transform 0.05s ease, border-color 0.15s ease;

  &:hover {
    background-color: var(--color-key-bg-hover);
  }

  &:active {
    transform: translateY(1px);
  }

  &--action {
    flex: 1.6;
    border-radius: 0.9rem;
    background-color: var(--color-key-action);
    border-color: var(--color-key-action);
    color: #fff;

    &:hover {
      background-color: var(--color-key-action-hover);
    }
  }

  &--locked {
    color: #fff;
    background-color: var(--color-locked);
    border-color: var(--color-locked);
  }

  // red outline, keeps the key surface
  &--misplaced {
    color: var(--color-key-text);
    border-color: var(--color-misplaced);
    box-shadow: inset 0 0 0 2px var(--color-misplaced);
  }

  &--unused {
    color: var(--color-key-unused-text);
    background-color: var(--color-unused);
    border-color: var(--color-unused);
  }

  :deep(svg) {
    width: 1.4rem;
    height: 1.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .key {
    transition: none;
  }
}
</style>
