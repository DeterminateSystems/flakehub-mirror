import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [".direnv", ".jj", "node_modules"],
  },
});
