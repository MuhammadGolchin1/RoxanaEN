import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { pagesEntries } from './server/pages-build.js';

export default defineConfig(({ mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    base: environment.VITE_BASE_PATH || '/',
    plugins: [react(), pagesEntries()],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  };
});
