import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      // Directs frontend "/api/..." requests to your local Docker backend
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "unconverging-daxton-pedagogically.ngrok-free.dev",
      "localhost",
      "127.0.0.1",
    ],
  },
});
