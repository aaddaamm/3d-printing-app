import { defineConfig } from "vite";

const API_PROXY_TARGET = process.env["VITE_API_PROXY_TARGET"] ?? "http://localhost:3000";

export default defineConfig({
  root: "frontend",
  base: "/ui/",
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/jobs": API_PROXY_TARGET,
      "/projects": API_PROXY_TARGET,
      "/summary": API_PROXY_TARGET,
      "/rates": API_PROXY_TARGET,
      "/tasks": API_PROXY_TARGET,
      "/health": API_PROXY_TARGET,
      "/ui/data": API_PROXY_TARGET,
      "/ui/covers": API_PROXY_TARGET,
      "/ui/printers": API_PROXY_TARGET,
    },
  },
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
