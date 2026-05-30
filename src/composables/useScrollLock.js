// shared body scroll lock - ref-counted so overlapping owners don't unlock early
let count = 0;

export function lockScroll() {
  count += 1;
  if (typeof document !== "undefined") {
    document.body.classList.add("scroll-locked");
  }
}

export function unlockScroll() {
  count = Math.max(0, count - 1);
  if (count === 0 && typeof document !== "undefined") {
    document.body.classList.remove("scroll-locked");
  }
}
