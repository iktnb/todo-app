import "fake-indexeddb/auto";
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  }

  if (!globalThis.crypto?.randomUUID) {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: vi.fn(() => "test-uuid"),
      },
      configurable: true,
    });
  }
});
