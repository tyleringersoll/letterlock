<script setup>
import { computed, ref } from "vue";
import { winPercentage } from "@/services/statistics";
import { shareOrCopy } from "@/services/share";
import GuessDistribution from "./GuessDistribution.vue";

const props = defineProps({
  stats: { type: Object, required: true },
  justFinished: { type: Boolean, default: false },
  highlight: { type: Number, default: 0 },
  shareText: { type: String, default: "" },
});

const summary = computed(() => [
  { label: "Played", value: props.stats.gamesPlayed },
  { label: "Win %", value: winPercentage(props.stats) },
  { label: "Current streak", value: props.stats.currentStreak },
  { label: "Max streak", value: props.stats.maxStreak },
]);

const shareStatus = ref("idle"); // idle | copied | failed

const shareLabel = computed(() => {
  if (shareStatus.value === "copied") return "Copied!";
  if (shareStatus.value === "failed") return "Couldn't copy";
  return "Share result";
});

async function onShare() {
  const result = await shareOrCopy(props.shareText);
  // the native sheet has its own ui; only flash for the clipboard fallback
  if (result === "copied" || result === "failed") {
    shareStatus.value = result;
    setTimeout(() => {
      shareStatus.value = "idle";
    }, 2000);
  }
}
</script>

<template>
  <div class="stats-panel">
    <h3 class="stats-panel__heading">
      Statistics
    </h3>
    <dl class="summary">
      <div
        v-for="item in summary"
        :key="item.label"
        class="summary__item"
      >
        <dd class="summary__value">
          {{ item.value }}
        </dd>
        <dt class="summary__label">
          {{ item.label }}
        </dt>
      </div>
    </dl>

    <h3 class="stats-panel__heading">
      Guess distribution
    </h3>
    <p
      v-if="!stats.gamesPlayed"
      class="stats-panel__empty"
    >
      Play a game to start building your distribution.
    </p>
    <GuessDistribution
      v-else
      :distribution="stats.guessDistribution"
      :highlight="highlight"
    />

    <button
      v-if="justFinished && shareText"
      type="button"
      class="share-button"
      @click="onShare"
    >
      {{ shareLabel }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.stats-panel {
  &__heading {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text);
  }

  &__empty {
    margin: 0 0 1.5rem;
    color: var(--color-text-muted);
  }
}

.summary {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 0 1.75rem;

  &__item {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
  }

  &__value {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1.1;
  }

  &__label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
}

.share-button {
  display: block;
  width: 100%;
  margin-top: 2rem;
  padding: 0.85rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background-color: var(--color-correct);
  border: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(1.08);
  }
}
</style>
