<script setup>
import { computed } from "vue";
import { MAX_GUESSES } from "@/game/constants";

const props = defineProps({
  distribution: { type: Object, required: true },
  highlight: { type: Number, default: 0 },
});

const rows = computed(() =>
  Array.from({ length: MAX_GUESSES }, (_, i) => {
    const guessNumber = i + 1;
    return { guessNumber, count: props.distribution[guessNumber] || 0 };
  })
);

const max = computed(() =>
  Math.max(1, ...rows.value.map((row) => row.count))
);

function widthFor(count) {
  return count === 0 ? 0 : Math.max(8, (count / max.value) * 100);
}
</script>

<template>
  <div class="distribution">
    <div
      v-for="row in rows"
      :key="row.guessNumber"
      class="distribution__row"
      :class="{ 'distribution__row--current': row.guessNumber === highlight }"
    >
      <span class="distribution__label">{{ row.guessNumber }}</span>
      <span class="distribution__track">
        <span
          class="distribution__bar"
          :style="{ width: `${widthFor(row.count)}%` }"
        >
          {{ row.count }}
        </span>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.distribution {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__label {
    width: 1ch;
    font-weight: 700;
    text-align: center;
  }

  &__track {
    flex: 1;
    display: flex;
  }

  &__bar {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 1.5rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    background-color: var(--color-bar);
    border-radius: 2px;
  }

  &__row--current &__bar {
    background-color: var(--color-correct);
  }
}
</style>
