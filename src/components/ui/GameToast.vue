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
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  pointer-events: none;
}

.toast {
  margin: 0;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  text-align: center;
  color: #111;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.4);
}

.toast-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.toast-leave-active {
  transition: opacity 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
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
