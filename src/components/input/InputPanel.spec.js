import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InputPanel from "./InputPanel.vue";
import { TileState } from "@/game/constants";

describe("InputPanel", () => {
  it("emits the right event for letters, enter, and delete", async () => {
    const wrapper = mount(InputPanel);

    await wrapper.find('[aria-label="q"]').trigger("click");
    await wrapper.find('[aria-label="Submit attempt"]').trigger("click");
    await wrapper.find('[aria-label="Delete letter"]').trigger("click");

    expect(wrapper.emitted("letter")[0]).toEqual(["q"]);
    expect(wrapper.emitted("enter")).toHaveLength(1);
    expect(wrapper.emitted("backspace")).toHaveLength(1);
  });

  it("reflects aggregated letter states on the keys", () => {
    const wrapper = mount(InputPanel, {
      props: { letterStates: { a: TileState.LOCKED, s: TileState.UNUSED } },
    });
    expect(wrapper.find('[aria-label="a, locked"]').classes()).toContain(
      "key--locked"
    );
    expect(wrapper.find('[aria-label="s, unused"]').classes()).toContain(
      "key--unused"
    );
  });
});
