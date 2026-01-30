import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": "https://your-render-app.onrender.com",
    },
    allowedHosts: ["unconverging-daxton-pedagogically.ngrok-free.dev"],
  },
});
