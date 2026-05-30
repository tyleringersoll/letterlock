import { onBeforeUnmount, onMounted } from "vue";

const LETTER_RE = /^[a-zA-Z]$/;

export function useKeyboard({ onLetter, onEnter, onBackspace, isEnabled }) {
  function handleKeydown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isEnabled && !isEnabled()) return;

    const { key } = event;
    if (key === "Enter") onEnter?.();
    else if (key === "Backspace") onBackspace?.();
    else if (LETTER_RE.test(key)) onLetter?.(key.toLowerCase());
  }

  onMounted(() => window.addEventListener("keydown", handleKeydown));
  onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
}
