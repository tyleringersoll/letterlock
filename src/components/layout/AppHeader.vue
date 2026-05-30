<script setup>
import IconInfo from "@/components/icons/IconInfo.vue";
import IconStats from "@/components/icons/IconStats.vue";

defineEmits(["open-info", "open-stats"]);
</script>

<template>
  <header class="app-header">
    <button
      type="button"
      class="app-header__button"
      aria-label="How to play"
      title="How to play"
      @click="$emit('open-info')"
    >
      <IconInfo />
    </button>

    <h1 class="app-header__title">
      Letterlock
    </h1>

    <button
      type="button"
      class="app-header__button"
      aria-label="Statistics"
      title="Statistics"
      @click="$emit('open-stats')"
    >
      <IconStats />
    </button>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-surface-border);

  &__title {
    margin: 0;
    font-size: clamp(1.2rem, 5vw, 1.7rem);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    color: var(--color-text);
    background: transparent;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover {
      color: var(--color-accent);
      background-color: rgba(255, 255, 255, 0.06);
    }

    :deep(svg) {
      width: 1.5rem;
      height: 1.5rem;
      fill: currentColor;
    }
  }
}
</style>
