<script setup>
import { computed } from "vue";
import { STATE_LABEL } from "@/game/constants";

const props = defineProps({
  keyValue: { type: String, required: true },
  label: { type: String, default: "" },
  state: { type: String, default: "" },
  wide: { type: Boolean, default: false },
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
    :class="[state && `key--${state}`, { 'key--wide': wide }]"
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
  height: 3.5rem;
  padding: 0;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-key-text);
  background-color: var(--color-key-bg);
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: background-color 0.15s ease, transform 0.05s ease;

  &:hover {
    background-color: var(--color-key-bg-hover);
  }

  &:active {
    transform: translateY(1px);
  }

  &--wide {
    flex: 1.5;
    font-size: 0.75rem;
  }

  &--correct {
    color: #fff;
    background-color: var(--color-correct);
  }

  &--present {
    color: #fff;
    background-color: var(--color-present);
  }

  &--absent {
    color: var(--color-key-absent-text);
    background-color: var(--color-absent);
  }

  :deep(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .key {
    transition: none;
  }
}
</style>
