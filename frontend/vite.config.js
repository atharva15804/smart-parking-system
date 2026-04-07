import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Added backend proxy so /api calls go to Express backend automatically
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
