import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { useAnnouncer } from "./useAnnouncer";

describe("useAnnouncer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows a toast and live message, then auto-clears both", async () => {
    const { toast, polite, assertive, announce } = useAnnouncer();

    announce("Not in word list", "assertive");
    expect(toast.value.text).toBe("Not in word list");
    await nextTick();
    expect(assertive.value).toBe("Not in word list");

    vi.advanceTimersByTime(1200);
    expect(toast.value.text).toBe("");
    expect(assertive.value).toBe("");
    expect(polite.value).toBe("");
  });

  it("re-announces an identical message by clearing first", async () => {
    const { assertive, announce } = useAnnouncer();

    announce("Not in word list", "assertive");
    await nextTick();
    expect(assertive.value).toBe("Not in word list");

    // a repeat must blank the region first, otherwise the live region's text
    // never changes and screen readers stay silent
    announce("Not in word list", "assertive");
    expect(assertive.value).toBe("");
    await nextTick();
    expect(assertive.value).toBe("Not in word list");
  });

  it("bumps the toast id so an identical message re-triggers", () => {
    const { toast, announce } = useAnnouncer();
    announce("oops");
    const firstId = toast.value.id;
    announce("oops");
    expect(toast.value.id).toBe(firstId + 1);
  });
});
