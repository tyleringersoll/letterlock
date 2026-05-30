import { describe, it, expect } from "vitest";
import { createStorage } from "./storage";

describe("createStorage", () => {
  it("round-trips JSON values", () => {
    const store = createStorage(window.localStorage);
    store.write("k", { a: 1, b: [2, 3] });
    expect(store.read("k")).toEqual({ a: 1, b: [2, 3] });
  });

  it("returns the fallback for missing keys", () => {
    const store = createStorage(window.localStorage);
    expect(store.read("missing", "default")).toBe("default");
  });

  it("returns the fallback for corrupt JSON", () => {
    window.localStorage.setItem("bad", "{not json");
    const store = createStorage(window.localStorage);
    expect(store.read("bad", null)).toBeNull();
  });

  it("falls back to memory when there is no backend", () => {
    const store = createStorage(null);
    expect(store.write("x", 42)).toBe(true);
    expect(store.read("x")).toBe(42);
    store.remove("x");
    expect(store.read("x", "gone")).toBe("gone");
  });

  it("does not throw when the backend rejects writes", () => {
    const throwingBackend = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
      removeItem: () => {},
    };
    const store = createStorage(throwingBackend);
    expect(store.write("x", 1)).toBe(false);
  });
});
