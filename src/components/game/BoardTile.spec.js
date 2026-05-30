import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BoardTile from "./BoardTile.vue";
import { TileState } from "@/game/constants";

describe("BoardTile", () => {
  it("renders the letter and a descriptive aria-label for results", () => {
    const wrapper = mount(BoardTile, {
      props: { letter: "a", state: TileState.CORRECT, position: 0 },
    });
    expect(wrapper.text()).toBe("a");
    expect(wrapper.attributes("aria-label")).toBe("a, correct");
    expect(wrapper.classes()).toContain("tile--correct");
  });

  it("describes an empty tile as empty", () => {
    const wrapper = mount(BoardTile, {
      props: { letter: "", state: TileState.EMPTY },
    });
    expect(wrapper.attributes("aria-label")).toBe("empty");
  });

  it("exposes the column index for staggered animation", () => {
    const wrapper = mount(BoardTile, {
      props: { letter: "b", state: TileState.TBD, position: 3 },
    });
    expect(wrapper.attributes("style")).toContain("--tile-index: 3");
  });
});
