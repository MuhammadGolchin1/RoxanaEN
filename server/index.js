import http from 'node:http';
import { existsSync } from 'node:fs';
import { createHandler } from './forms.js';

// Local credentials remain private. Hosting providers may supply the same env keys.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const handler = createHandler();
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const host = process.env.API_HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const init = { method: incoming.method, headers: incoming.headers };
    if (!['GET', 'HEAD'].includes(incoming.method)) {
      init.body = incoming;
      init.duplex = 'half';
    }
    const request = new Request(`http://${incoming.headers.host}${incoming.url}`, init);
    const response = await handler.fetch(request, process.env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) for await (const chunk of response.body) outgoing.write(chunk);
    outgoing.end();
  } catch {
    outgoing.writeHead(500, { 'Content-Type': 'application/json' });
    outgoing.end(JSON.stringify({ error: 'Your request could not be sent. Please try again.' }));
  }
});
server.listen(port, host, () => console.log(`Forms API: http://${host}:${port}/api/forms`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
