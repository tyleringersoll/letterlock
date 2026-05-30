import { describe, it, expect, afterEach } from "vitest";
import { lockScroll, unlockScroll } from "./useScrollLock";

const isLocked = () => document.body.classList.contains("scroll-locked");

describe("useScrollLock", () => {
  afterEach(() => {
    document.body.className = "";
  });

  it("locks and unlocks the body", () => {
    lockScroll();
    expect(isLocked()).toBe(true);
    unlockScroll();
    expect(isLocked()).toBe(false);
  });

  it("stays locked until every owner releases", () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(isLocked()).toBe(true); // one owner still holds it
    unlockScroll();
    expect(isLocked()).toBe(false);
  });

  it("does not go negative on an extra unlock", () => {
    unlockScroll();
    lockScroll();
    expect(isLocked()).toBe(true);
    unlockScroll();
    expect(isLocked()).toBe(false);
  });
});
