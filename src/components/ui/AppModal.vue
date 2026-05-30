<script setup>
import { onBeforeUnmount, ref, useId, watch } from "vue";
import { useFocusTrap } from "@/composables/useFocusTrap";
import { lockScroll, unlockScroll } from "@/composables/useScrollLock";
import IconClose from "@/components/icons/IconClose.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
});

const emit = defineEmits(["close"]);

const dialogRef = ref(null);
const openRef = ref(props.open);
const titleId = useId();

let holdsLock = false;

function setLock(locked) {
  if (locked && !holdsLock) {
    holdsLock = true;
    lockScroll();
  } else if (!locked && holdsLock) {
    holdsLock = false;
    unlockScroll();
  }
}

watch(
  () => props.open,
  (value) => {
    openRef.value = value;
    setLock(value);
  }
);

useFocusTrap(dialogRef, openRef);

function close() {
  emit("close");
}

function onKeydown(event) {
  if (event.key === "Escape" && props.open) close();
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", onKeydown);
}

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onKeydown);
  }
  setLock(false);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal"
        @click.self="close"
      >
        <div
          ref="dialogRef"
          class="modal__dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
        >
          <button
            type="button"
            class="modal__close"
            aria-label="Close dialog"
            @click="close"
          >
            <IconClose />
          </button>
          <h2
            v-if="title"
            :id="titleId"
            class="modal__title"
          >
            {{ title }}
          </h2>
          <div class="modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.7);

  &__dialog {
    position: relative;
    width: 100%;
    max-width: 32rem;
    margin: auto;
    padding: clamp(1.5rem, 5vw, 3rem);
    background-color: var(--color-surface);
    border: 1px solid var(--color-surface-border);
    border-radius: 0.75rem;
    box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.45);

    &:focus-visible {
      outline: none;
    }
  }

  &__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
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
      width: 1.4rem;
      height: 1.4rem;
    }
  }

  &__title {
    margin: 0 2rem 1.25rem 0;
    font-size: 1.5rem;
    color: var(--color-accent);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}
</style>
