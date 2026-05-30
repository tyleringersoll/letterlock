<script setup>
import InputKey from "./InputKey.vue";
import IconBackspace from "@/components/icons/IconBackspace.vue";

defineProps({
  // letter -> best TileState, from useGame().letterStates
  letterStates: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["letter", "enter", "backspace"]);

const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function onPress(value) {
  if (value === "enter") emit("enter");
  else if (value === "backspace") emit("backspace");
  else emit("letter", value);
}
</script>

<template>
  <div
    class="input-panel"
    role="group"
    aria-label="On-screen input"
  >
    <div
      v-for="(row, index) in LETTER_ROWS"
      :key="index"
      class="input-panel__row"
    >
      <InputKey
        v-for="letter in row"
        :key="letter"
        :key-value="letter"
        :label="letter"
        :state="letterStates[letter] || ''"
        @press="onPress"
      />
    </div>

    <!-- action keys on their own row, not flanking the letters -->
    <div class="input-panel__row input-panel__row--actions">
      <InputKey
        key-value="backspace"
        variant="action"
        aria-label="Delete letter"
        @press="onPress"
      >
        <IconBackspace />
        <span class="input-panel__action-label">Delete</span>
      </InputKey>
      <InputKey
        key-value="enter"
        variant="action"
        label="Enter"
        aria-label="Submit attempt"
        @press="onPress"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-panel {
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
  padding: 0 0.25rem;

  &__row {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 0.4rem;

    &:nth-child(2) {
      padding: 0 5%;
    }

    &--actions {
      margin-top: 0.6rem;
      gap: 0.6rem;
    }
  }

  &__action-label {
    margin-left: 0.5rem;
  }
}
</style>
