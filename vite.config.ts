import { defineConfig, type UserConfig } from "vite";

const API_PROXY_TARGET = process.env["VITE_API_PROXY_TARGET"] ?? "http://localhost:3000";

export function createViteConfig(apiProxyTarget = API_PROXY_TARGET): UserConfig {
  return {
    root: "frontend",
    base: "/ui/",
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": apiProxyTarget,
        "/jobs": apiProxyTarget,
        "/projects": apiProxyTarget,
        "/summary": apiProxyTarget,
        "/rates": apiProxyTarget,
        "/tasks": apiProxyTarget,
        "/health": apiProxyTarget,
        "/ui/data": apiProxyTarget,
        "/ui/covers": apiProxyTarget,
        "/ui/printers": apiProxyTarget,
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
  };
}

export default defineConfig(createViteConfig());
