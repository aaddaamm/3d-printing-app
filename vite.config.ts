import { defineConfig } from "vite";

export default defineConfig({
  root: "frontend",
  base: "/ui/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "app.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
