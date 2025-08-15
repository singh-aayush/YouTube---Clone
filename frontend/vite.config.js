import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "https://youtube-clone-erlr.onrender.com", // For local host we was using http://localhost:3535 path
    },
  },
  plugins: [react()],
});
