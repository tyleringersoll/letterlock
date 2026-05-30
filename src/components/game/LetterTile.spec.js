import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LetterTile from "./LetterTile.vue";
import { TileState } from "@/game/constants";

describe("LetterTile", () => {
  it("renders the letter and a descriptive aria-label", () => {
    const wrapper = mount(LetterTile, {
      props: { letter: "a", state: TileState.LOCKED, position: 0 },
    });
    expect(wrapper.text()).toBe("a");
    expect(wrapper.attributes("aria-label")).toBe("a, locked");
    expect(wrapper.classes()).toContain("tile--locked");
  });

  it("describes an empty tile as empty", () => {
    const wrapper = mount(LetterTile, {
      props: { letter: "", state: TileState.EMPTY },
    });
    expect(wrapper.attributes("aria-label")).toBe("empty");
  });

  it("exposes the column index for staggered animation", () => {
    const wrapper = mount(LetterTile, {
      props: { letter: "b", state: TileState.TBD, position: 3 },
    });
    expect(wrapper.attributes("style")).toContain("--tile-index: 3");
  });
});
