import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Keyboard from "./Keyboard.vue";
import { TileState } from "@/game/constants";

describe("Keyboard", () => {
  it("emits the right event for letters, enter, and backspace", async () => {
    const wrapper = mount(Keyboard);

    await wrapper.find('[aria-label="q"]').trigger("click");
    await wrapper.find('[aria-label="Submit guess"]').trigger("click");
    await wrapper.find('[aria-label="Delete letter"]').trigger("click");

    expect(wrapper.emitted("letter")[0]).toEqual(["q"]);
    expect(wrapper.emitted("enter")).toHaveLength(1);
    expect(wrapper.emitted("backspace")).toHaveLength(1);
  });

  it("reflects aggregated letter states on the keys", () => {
    const wrapper = mount(Keyboard, {
      props: { letterStates: { a: TileState.CORRECT, s: TileState.ABSENT } },
    });
    expect(wrapper.find('[aria-label="a, correct"]').classes()).toContain(
      "key--correct"
    );
    expect(wrapper.find('[aria-label="s, absent"]').classes()).toContain(
      "key--absent"
    );
  });
});
