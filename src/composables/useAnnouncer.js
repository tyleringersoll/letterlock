import { nextTick, ref } from "vue";

const CLEAR_DELAY_MS = 1200;

export function useAnnouncer() {
  const polite = ref("");
  const assertive = ref("");
  const toast = ref({ text: "", id: 0 });

  let clearTimer = null;

  function announce(message, urgency = "polite") {
    const region = urgency === "assertive" ? assertive : polite;
    // clear synchronously, then set next tick - this forces a real text change
    // so an identical message still gets re-announced
    polite.value = "";
    assertive.value = "";
    nextTick(() => {
      region.value = message;
    });

    toast.value = { text: message, id: toast.value.id + 1 };

    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      polite.value = "";
      assertive.value = "";
      toast.value = { text: "", id: toast.value.id };
    }, CLEAR_DELAY_MS);
  }

  return { polite, assertive, toast, announce };
}
