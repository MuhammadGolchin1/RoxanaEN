import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createHandler } from './server/forms.js';

function localForms(environment) {
  const handler = createHandler();
  function configure(server) {
    server.middlewares.use('/api/forms', async (incoming, outgoing) => {
      try {
        const init = { method: incoming.method, headers: incoming.headers };
        if (!['GET', 'HEAD'].includes(incoming.method)) {
          init.body = incoming;
          init.duplex = 'half';
        }
        const request = new Request(`http://${incoming.headers.host}/api/forms`, init);
        const response = await handler.fetch(request, environment);
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) for await (const chunk of response.body) outgoing.write(chunk);
        outgoing.end();
      } catch {
        outgoing.writeHead(500, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ error: 'Your request could not be sent. Please try again.' }));
      }
    });
  }
  return { name: 'roxana-local-forms', configureServer: configure, configurePreviewServer: configure };
}

export default defineConfig(({ mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    plugins: [react(), localForms(environment)],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
    },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  };
});
