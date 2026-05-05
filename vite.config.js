import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': env,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
      },
    },
    optimizeDeps: {
      include: [
        '@tailwindConfig',
      ],
    },
    server: {
      port: parseInt(env.PORT) || 5173, // Default to 5173 if PORT is not set
      host: true, // Allows external access
      allowedHosts: [
        'admin.shuttleapp.transev.site',
        '.transev.site', // Allows all subdomains of transev.site
        'localhost',
        '127.0.0.1',
      ],
    },
    preview: {
      port: parseInt(env.PORT) || 5173,
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
  };
});