<script setup>
import KeyboardKey from "./KeyboardKey.vue";
import IconBackspace from "@/components/icons/IconBackspace.vue";

defineProps({
  letterStates: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["letter", "enter", "backspace"]);

const ROWS = [
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
    class="keyboard"
    role="group"
    aria-label="Keyboard"
  >
    <div
      v-for="(row, index) in ROWS"
      :key="index"
      class="keyboard__row"
    >
      <KeyboardKey
        v-if="index === 2"
        key-value="enter"
        label="Enter"
        :wide="true"
        aria-label="Submit guess"
        @press="onPress"
      />
      <KeyboardKey
        v-for="letter in row"
        :key="letter"
        :key-value="letter"
        :label="letter"
        :state="letterStates[letter] || ''"
        @press="onPress"
      />
      <KeyboardKey
        v-if="index === 2"
        key-value="backspace"
        :wide="true"
        aria-label="Delete letter"
        @press="onPress"
      >
        <IconBackspace />
      </KeyboardKey>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.keyboard {
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  padding: 0 0.25rem;

  &__row {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 0.4rem;

    // nudge the middle row in so it looks like a real keyboard
    &:nth-child(2) {
      padding: 0 5%;
    }
  }
}
</style>
