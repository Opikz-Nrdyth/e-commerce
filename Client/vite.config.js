import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8877,
    // Opsional: buka browser otomatis
    open: true,
    // Opsional: izinkan akses dari network
    host: true,
  },
  plugins: [react()],
});
