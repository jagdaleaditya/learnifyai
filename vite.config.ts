import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_HASH_ROUTER=1 builds a static copy (relative paths + hash routes) that works on any file host.
export default defineConfig({
  base: process.env.VITE_HASH_ROUTER ? './' : '/',
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: { output: { manualChunks: { charts: ['recharts'], vendor: ['react', 'react-dom', 'react-router-dom'] } } },
  },
});
