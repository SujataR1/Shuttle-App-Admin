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
      port: parseInt(env.PORT) || 5173, // Default to 3000 if PORT is not set
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
