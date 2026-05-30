import { nextTick, watch } from "vue";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// keep tab focus inside while it's open, hand focus back when it closes
export function useFocusTrap(containerRef, activeRef) {
  let previouslyFocused = null;

  const focusable = () => {
    const container = containerRef.value;
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) =>
        !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );
  };

  function onKeydown(event) {
    if (event.key !== "Tab") return;
    const items = focusable();
    if (items.length === 0) {
      event.preventDefault();
      containerRef.value?.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === containerRef.value)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  watch(activeRef, (active) => {
    if (active) {
      previouslyFocused = document.activeElement;
      document.addEventListener("keydown", onKeydown, true);
      nextTick(() => {
        const items = focusable();
        (items[0] ?? containerRef.value)?.focus();
      });
    } else {
      document.removeEventListener("keydown", onKeydown, true);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
      previouslyFocused = null;
    }
  });
}
