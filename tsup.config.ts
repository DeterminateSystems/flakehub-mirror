import { defineConfig } from "tsup";
import { name } from "./package.json";

export default defineConfig({
  name,
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: {
    resolve: true,
  },
});
