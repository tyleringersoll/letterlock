import { ref, watch } from "vue";
import { storage as defaultStorage } from "@/services/storage";

export const HIGH_CONTRAST_KEY = "letterlock-high-contrast";
export const HIGH_CONTRAST_CLASS = "theme-high-contrast";

export function useTheme({ storage = defaultStorage } = {}) {
  const highContrast = ref(Boolean(storage.read(HIGH_CONTRAST_KEY, false)));

  watch(
    highContrast,
    (enabled) => {
      storage.write(HIGH_CONTRAST_KEY, enabled);
      if (typeof document !== "undefined") {
        document.body.classList.toggle(HIGH_CONTRAST_CLASS, enabled);
      }
    },
    { immediate: true }
  );

  return { highContrast };
}
