import { describe, it, expect, vi, afterEach } from "vitest";
import { buildShareText, evaluationToEmoji, shareOrCopy } from "./share";
import { TileState } from "@/game/constants";

const { CORRECT, PRESENT, ABSENT } = TileState;

describe("evaluationToEmoji", () => {
  it("maps each tile state to its emoji", () => {
    expect(evaluationToEmoji([CORRECT, PRESENT, ABSENT])).toBe("🟩🟨⬛");
  });
});

describe("buildShareText", () => {
  const history = [
    { guess: "alert", evaluation: [PRESENT, ABSENT, PRESENT, PRESENT, ABSENT] },
    { guess: "crane", evaluation: [CORRECT, CORRECT, CORRECT, CORRECT, CORRECT] },
  ];

  it("renders score, optional answer, url, and the emoji grid", () => {
    const text = buildShareText(history, {
      won: true,
      maxGuesses: 6,
      url: "https://example.com",
      answer: "crane",
    });
    expect(text).toBe(
      [
        "Tyler's Wordle 2/6",
        "Word: CRANE",
        "https://example.com",
        "",
        "🟨⬛🟨🟨⬛",
        "🟩🟩🟩🟩🟩",
      ].join("\n")
    );
  });

  it("uses X for the score on a loss", () => {
    const text = buildShareText(history, { won: false });
    expect(text.startsWith("Tyler's Wordle X/6")).toBe(true);
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
