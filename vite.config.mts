import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { config } from 'dotenv';
const env = config({ path: '.env.test' });

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    globals: true,
    restoreMocks: true,
    env: env.parsed,
  },
  plugins: [tsconfigPaths()],
});
