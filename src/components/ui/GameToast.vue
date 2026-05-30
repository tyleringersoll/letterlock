<script setup>
// just the visual bit - aria-hidden so the live regions do the talking
defineProps({
  message: { type: Object, required: true },
});
</script>

<template>
  <div
    class="toast-area"
    aria-hidden="true"
  >
    <Transition name="toast">
      <p
        v-if="message.text"
        :key="message.id"
        class="toast"
      >
        {{ message.text }}
      </p>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.toast-area {
  position: fixed;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  z-index: 300;
  width: max-content;
  max-width: calc(100% - 2rem);
  pointer-events: none;
}

// slim surface banner with an accent edge, anchored bottom-center
.toast {
  margin: 0;
  padding: 0.7rem 1.1rem;
  font-weight: 700;
  text-align: left;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-surface-border);
  border-left: 4px solid var(--color-accent);
  border-radius: 0.4rem;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.45);
}

.toast-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.toast-leave-active {
  transition: opacity 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}

.toast-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
