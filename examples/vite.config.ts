import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config for the runnable parent/iframe demo.
 *
 * `root` is this examples/ directory, so the two HTML entry points
 * (index.html = parent, iframe.html = the embedded frame) are served from the
 * same local origin. Both HTML files are declared as Rollup inputs so the
 * production build (`vite build`) emits both pages.
 */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../dist-demo"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        parent: resolve(__dirname, "index.html"),
        iframe: resolve(__dirname, "iframe.html"),
      },
    },
  },
});
