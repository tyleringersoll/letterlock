function detectBackend() {
  try {
    const probe = "__letterlock_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createStorage(backend = detectBackend()) {
  const memory = new Map();
  const usingMemory = !backend;

  const read = (key, fallback = null) => {
    try {
      const raw = usingMemory ? memory.get(key) : backend.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      const raw = JSON.stringify(value);
      if (usingMemory) memory.set(key, raw);
      else backend.setItem(key, raw);
      return true;
    } catch {
      return false;
    }
  };

  const remove = (key) => {
    try {
      if (usingMemory) memory.delete(key);
      else backend.removeItem(key);
    } catch {
      // nothing we can do
    }
  };

  return { read, write, remove };
}

export const storage = createStorage();
