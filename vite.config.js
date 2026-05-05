import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simple working config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 18082,
    host: true,
    allowedHosts: [
      'admin.shuttleapp.transev.site',
      '.transev.site',
      'localhost',
      '127.0.0.1',
    ],
  },
  preview: {
    port: 18082,
    host: true,
    allowedHosts: [
      'admin.shuttleapp.transev.site',
      '.transev.site',
      'localhost',
      '127.0.0.1',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});