import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import GameView from "./GameView.vue";
import { HIGH_CONTRAST_CLASS } from "@/composables/useTheme";

describe("GameView (integration)", () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    document.body.className = "";
  });

  it("renders a 7x6 board and the input panel", () => {
    wrapper = mount(GameView, { attachTo: document.body });
    const rows = wrapper.findAll(".attempt-row");
    expect(rows).toHaveLength(7);
    expect(rows[0].findAll(".tile")).toHaveLength(6);
    expect(wrapper.find('[aria-label="Submit attempt"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Delete letter"]').exists()).toBe(true);
  });

  it("types letters from the input panel into the active row", async () => {
    wrapper = mount(GameView, { attachTo: document.body });

    for (const letter of ["p", "l", "a", "n", "e", "t"]) {
      await wrapper.find(`.input-panel [aria-label="${letter}"]`).trigger("click");
    }

    const firstRow = wrapper.findAll(".attempt-row")[0];
    const text = firstRow.findAll(".tile").map((t) => t.text()).join("");
    expect(text).toBe("planet");
  });

  it("toggles high-contrast mode from the How-to-play dialog", async () => {
    wrapper = mount(GameView, { attachTo: document.body });

    await wrapper.find('[aria-label="How to play"]').trigger("click");
    const checkbox = document.body.querySelector('.setting input[type="checkbox"]');
    expect(checkbox).not.toBeNull();

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));
    await nextTick();

    expect(document.body.classList.contains(HIGH_CONTRAST_CLASS)).toBe(true);
  });
});
