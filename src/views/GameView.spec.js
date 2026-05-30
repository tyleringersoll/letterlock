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

  it("renders a 6x5 board and a full keyboard", () => {
    wrapper = mount(GameView, { attachTo: document.body });
    expect(wrapper.findAll(".board-row")).toHaveLength(6);
    expect(wrapper.findAll(".board-row")[0].findAll(".tile")).toHaveLength(5);
    expect(wrapper.find('[aria-label="Submit guess"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Delete letter"]').exists()).toBe(true);
  });

  it("types letters from the on-screen keyboard into the active row", async () => {
    wrapper = mount(GameView, { attachTo: document.body });

    for (const letter of ["q", "w", "e", "r", "t"]) {
      await wrapper.find(`.keyboard [aria-label="${letter}"]`).trigger("click");
    }

    const firstRow = wrapper.findAll(".board-row")[0];
    const text = firstRow.findAll(".tile").map((t) => t.text()).join("");
    expect(text).toBe("qwert");
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
