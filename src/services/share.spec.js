import { describe, it, expect, vi, afterEach } from "vitest";
import { buildShareText, tallyStates, shareOrCopy } from "./share";
import { TileState } from "@/game/constants";

const { LOCKED, MISPLACED, UNUSED } = TileState;

const history = [
  {
    attempt: "rocket",
    evaluation: [UNUSED, MISPLACED, UNUSED, UNUSED, MISPLACED, LOCKED],
  },
  {
    attempt: "planet",
    evaluation: [LOCKED, LOCKED, LOCKED, LOCKED, LOCKED, LOCKED],
  },
];

describe("tallyStates", () => {
  it("counts each state across every attempt", () => {
    expect(tallyStates(history)).toEqual({
      [LOCKED]: 7,
      [MISPLACED]: 2,
      [UNUSED]: 3,
    });
  });
});

describe("buildShareText", () => {
  it("is a plain text summary, not an emoji grid", () => {
    const text = buildShareText(history, { solved: true });
    expect(text).toBe(
      "Letterlock solved in 2 attempts.\nLocked: 7 | Misplaced: 2 | Unused: 3"
    );
    expect(text).not.toMatch(/🟩|🟨|⬛|🟦/);
  });

  it("reads differently when not solved", () => {
    const text = buildShareText(history, { solved: false });
    expect(text.startsWith("Letterlock not solved in 2 attempts.")).toBe(true);
  });
});

describe("shareOrCopy", () => {
  const setNav = (key, value) =>
    Object.defineProperty(navigator, key, { value, configurable: true });

  afterEach(() => {
    setNav("share", undefined);
    setNav("clipboard", undefined);
  });

  it("uses the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue();
    setNav("share", share);
    expect(await shareOrCopy("grid")).toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: "grid" });
  });

  it("reports when the user dismisses the sheet", async () => {
    const abort = Object.assign(new Error("cancel"), { name: "AbortError" });
    setNav("share", vi.fn().mockRejectedValue(abort));
    expect(await shareOrCopy("grid")).toBe("dismissed");
  });

  it("falls back to clipboard when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue();
    setNav("clipboard", { writeText });
    expect(await shareOrCopy("grid")).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("grid");
  });

  it("falls back to clipboard when share fails for another reason", async () => {
    setNav("share", vi.fn().mockRejectedValue(new Error("boom")));
    const writeText = vi.fn().mockResolvedValue();
    setNav("clipboard", { writeText });
    expect(await shareOrCopy("grid")).toBe("copied");
  });
});
