<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { GameStatus, PlayMode } from "@/game/constants";
import { useGame } from "@/composables/useGame";
import { useKeyboard } from "@/composables/useKeyboard";
import { useAnnouncer } from "@/composables/useAnnouncer";
import { useTheme } from "@/composables/useTheme";
import { buildShareText } from "@/services/share";

import AppHeader from "@/components/layout/AppHeader.vue";
import ModeToggle from "@/components/layout/ModeToggle.vue";
import PuzzleBoard from "@/components/game/PuzzleBoard.vue";
import InputPanel from "@/components/input/InputPanel.vue";
import HowToPlay from "@/components/game/HowToPlay.vue";
import StatsPanel from "@/components/stats/StatsPanel.vue";
import AppModal from "@/components/ui/AppModal.vue";
import GameToast from "@/components/ui/GameToast.vue";
import LiveRegion from "@/components/a11y/LiveRegion.vue";

// let the tiles finish revealing before the results panel slides in
const RESULTS_DELAY_MS = { [GameStatus.SOLVED]: 2000, [GameStatus.LOST]: 1400 };

const { polite, assertive, toast, announce } = useAnnouncer();
const { highContrast } = useTheme();

const infoOpen = ref(false);
const statsOpen = ref(false);
const resultsOpen = ref(false);

const anyModalOpen = computed(
  () => infoOpen.value || statsOpen.value || resultsOpen.value
);

// reveal the results panel only when a game finishes during play (not on
// restore or a mode switch, which set status without calling onFinish)
let resultsTimer = null;
function onFinish() {
  resultsTimer = setTimeout(() => {
    resultsOpen.value = true;
  }, RESULTS_DELAY_MS[status.value] ?? 1500);
}

const game = useGame({ announce, onFinish });
const {
  board,
  letterStates,
  activeRow,
  solvedRow,
  status,
  invalidAttempt,
  answer,
  history,
  stats,
  mode,
  answerLength,
  maxGuesses,
  addLetter,
  removeLetter,
  submitAttempt,
  startNewGame,
  setMode,
  restore,
} = game;

useKeyboard({
  onLetter: addLetter,
  onEnter: submitAttempt,
  onBackspace: removeLetter,
  isEnabled: () => !anyModalOpen.value,
});

const solved = computed(() => status.value === GameStatus.SOLVED);

const shareText = computed(() =>
  buildShareText(history.value, { solved: solved.value })
);

const resultTitle = computed(() =>
  solved.value ? "Solved!" : `The word was ${answer.value.toUpperCase()}`
);

function onResultsClose() {
  resultsOpen.value = false;
  // Daily Lock is one puzzle per day - don't deal a new word on close
  if (mode.value !== PlayMode.DAILY) startNewGame();
}

onMounted(() => restore());
onBeforeUnmount(() => {
  if (resultsTimer) clearTimeout(resultsTimer);
});
</script>

<template>
  <div class="game-view">
    <AppHeader
      @open-info="infoOpen = true"
      @open-stats="statsOpen = true"
    />

    <div class="game-view__modebar">
      <ModeToggle
        :mode="mode"
        @select="setMode"
      />
    </div>

    <main class="game-view__main">
      <PuzzleBoard
        :board="board"
        :columns="answerLength"
        :rows="maxGuesses"
        :active-row="activeRow"
        :solved-row="solvedRow"
        :invalid="invalidAttempt"
      />
      <InputPanel
        :letter-states="letterStates"
        @letter="addLetter"
        @enter="submitAttempt"
        @backspace="removeLetter"
      />
    </main>

    <GameToast :message="toast" />
    <LiveRegion
      :polite="polite"
      :assertive="assertive"
    />

    <AppModal
      :open="resultsOpen"
      :title="resultTitle"
      @close="onResultsClose"
    >
      <StatsPanel
        :stats="stats"
        :max-guesses="maxGuesses"
        :just-finished="true"
        :highlight="solvedRow >= 0 ? solvedRow + 1 : 0"
        :share-text="shareText"
      />
    </AppModal>

    <AppModal
      :open="statsOpen"
      title="Your record"
      @close="statsOpen = false"
    >
      <StatsPanel
        :stats="stats"
        :max-guesses="maxGuesses"
      />
    </AppModal>

    <AppModal
      :open="infoOpen"
      title="How to play"
      @close="infoOpen = false"
    >
      <HowToPlay
        :high-contrast="highContrast"
        @toggle-contrast="highContrast = $event"
      />
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>
.game-view {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__modebar {
    display: flex;
    justify-content: center;
    padding: 0.6rem 0.5rem 0.2rem;
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    max-width: 32rem;
    margin: 0 auto;
    padding: 0.5rem 0.5rem 1rem;
    overflow: hidden;

    @media (min-width: $md) {
      justify-content: center;
      gap: 1.25rem;
    }
  }
}
</style>
