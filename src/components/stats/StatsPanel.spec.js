import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import StatsPanel from "./StatsPanel.vue";
import { createEmptyStats } from "@/services/statistics";

const setNav = (key, value) =>
  Object.defineProperty(navigator, key, { value, configurable: true });

function mountPanel() {
  return mount(StatsPanel, {
    props: { stats: createEmptyStats(), justFinished: true, shareText: "grid" },
  });
}

describe("StatsPanel share button", () => {
  afterEach(() => {
    setNav("share", undefined);
    setNav("clipboard", undefined);
  });

  it("shows 'Copied!' after a clipboard fallback", async () => {
    setNav("share", undefined);
    setNav("clipboard", { writeText: vi.fn().mockResolvedValue() });

    const wrapper = mountPanel();
    await wrapper.find(".share-button").trigger("click");
    await flushPromises();

    expect(wrapper.find(".share-button").text()).toBe("Copied!");
  });

  it("shows 'Couldn't copy' when the copy fails", async () => {
    setNav("share", undefined);
    setNav("clipboard", { writeText: vi.fn().mockRejectedValue(new Error("nope")) });

    const wrapper = mountPanel();
    await wrapper.find(".share-button").trigger("click");
    await flushPromises();

    expect(wrapper.find(".share-button").text()).toBe("Couldn't copy");
  });
});
