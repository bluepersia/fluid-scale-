import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 20000,
    pool: "threads",
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
