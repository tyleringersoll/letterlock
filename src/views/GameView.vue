<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GameStatus } from "@/game/constants";
import { useGame } from "@/composables/useGame";
import { useKeyboard } from "@/composables/useKeyboard";
import { useAnnouncer } from "@/composables/useAnnouncer";
import { useTheme } from "@/composables/useTheme";
import { buildShareText } from "@/services/share";

import AppHeader from "@/components/layout/AppHeader.vue";
import GameBoard from "@/components/game/GameBoard.vue";
import Keyboard from "@/components/keyboard/Keyboard.vue";
import HowToPlay from "@/components/game/HowToPlay.vue";
import StatsPanel from "@/components/stats/StatsPanel.vue";
import AppModal from "@/components/ui/AppModal.vue";
import GameToast from "@/components/ui/GameToast.vue";
import LiveRegion from "@/components/a11y/LiveRegion.vue";

const SHARE_URL = "https://vue-wordle-tyleringersoll.netlify.app/";
const RESULTS_DELAY_MS = { [GameStatus.WON]: 2200, [GameStatus.LOST]: 1500 };

const { polite, assertive, toast, announce } = useAnnouncer();
const { highContrast } = useTheme();

const game = useGame({ announce });
const {
  board,
  letterStates,
  activeRow,
  winningRow,
  status,
  invalidGuess,
  answer,
  history,
  stats,
  addLetter,
  removeLetter,
  submit,
  startNewGame,
  restore,
} = game;

const infoOpen = ref(false);
const statsOpen = ref(false);
const resultsOpen = ref(false);

const anyModalOpen = computed(
  () => infoOpen.value || statsOpen.value || resultsOpen.value
);

useKeyboard({
  onLetter: addLetter,
  onEnter: submit,
  onBackspace: removeLetter,
  isEnabled: () => !anyModalOpen.value,
});

const shareText = computed(() =>
  buildShareText(history.value, {
    won: status.value === GameStatus.WON,
    answer: answer.value,
    url: SHARE_URL,
  })
);

const resultTitle = computed(() =>
  status.value === GameStatus.WON
    ? "You win! 🎉"
    : `The word was ${answer.value.toUpperCase()}`
);

let resultsTimer = null;
watch(status, (next) => {
  if (next === GameStatus.WON || next === GameStatus.LOST) {
    resultsTimer = setTimeout(() => {
      resultsOpen.value = true;
    }, RESULTS_DELAY_MS[next]);
  }
});

function onResultsClose() {
  resultsOpen.value = false;
  startNewGame();
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

    <main class="game-view__main">
      <GameBoard
        :board="board"
        :active-row="activeRow"
        :winning-row="winningRow"
        :invalid="invalidGuess"
      />
      <Keyboard
        :letter-states="letterStates"
        @letter="addLetter"
        @enter="submit"
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
        :just-finished="true"
        :highlight="winningRow >= 0 ? winningRow + 1 : 0"
        :share-text="shareText"
      />
    </AppModal>

    <AppModal
      :open="statsOpen"
      title="Statistics"
      @close="statsOpen = false"
    >
      <StatsPanel :stats="stats" />
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

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    // phones are short, so push the keyboard to the bottom
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    max-width: 30rem;
    margin: 0 auto;
    padding: 1rem 0.5rem;
    overflow: hidden;

    // bigger screens have height to spare - keep the keyboard tucked under the board
    @media (min-width: $md) {
      justify-content: center;
      gap: 1.5rem;
    }
  }
}
</style>
