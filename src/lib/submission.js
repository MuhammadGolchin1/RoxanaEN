import baleConfig from '../config/bale.json' with { type: 'json' };
import { messageParts, validateSubmission } from './bale-messages.js';

class BaleDeliveryError extends Error {}

function validateConfig(config) {
  if (config.apiBase !== 'https://tapi.bale.ai' || !/^\d+:[A-Za-z0-9_-]+$/.test(config.token || '') ||
      !Array.isArray(config.chatIds) || !config.chatIds.length ||
      config.chatIds.some(id => typeof id !== 'string' || !/^-?\d+$/.test(id)) ||
      new Set(config.chatIds).size !== config.chatIds.length) {
    throw new Error('Message delivery is not configured. Please contact the Roxana team.');
  }
}

async function selectedPhotos(kind, payload, photos) {
  const selected = [];
  for (const view of ['front', 'side', 'back']) {
    const file = photos[view];
    if (!file) continue;
    if (kind !== 'questionnaire' || payload.answers.photos !== "I'll add photos now" ||
        !['image/jpeg', 'image/png'].includes(file.type) || file.size <= 0 || file.size > 5 * 1024 * 1024) {
      throw new Error('Photos must be JPG or PNG files, up to 5 MB each.');
    }
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const png = header.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => header[i] === n);
    const jpeg = header[0] === 255 && header[1] === 216 && header[2] === 255;
    if ((file.type === 'image/png' && !png) || (file.type === 'image/jpeg' && !jpeg)) throw new Error('Please choose a valid JPG or PNG image.');
    selected.push([view, file]);
  }
  return selected;
}

/** Direct browser transport. No local server, proxy or hosted API is involved. */
export function createBaleSender(config = baleConfig, fetchImpl = globalThis.fetch.bind(globalThis)) {
  const completed = new Map();
  const inflight = new Map();

  return async function send(kind, payload, photos = {}, { onProgress = () => {} } = {}) {
    validateConfig(config);
    const error = validateSubmission(kind, payload);
    if (error) throw new Error(error);
    const key = `${kind}:${payload.reference}`;
    if (completed.has(key)) return completed.get(key);
    if (inflight.has(key)) return inflight.get(key);
    if (globalThis.navigator?.onLine === false) throw new Error('You are offline. Please connect to the internet and try again.');

    const task = (async () => {
      const attachments = await selectedPhotos(kind, payload, photos);
      const parts = messageParts(kind, payload);
      const total = config.chatIds.length * (parts.length + attachments.length);
      const deliveries = [];
      onProgress(0, total);

      async function callBale(method, body) {
        const response = await fetchImpl(`${config.apiBase}/bot${config.token}/${method}`, {
          method: 'POST', mode: 'no-cors', credentials: 'omit', body,
          signal: AbortSignal.timeout(method === 'sendPhoto' ? 45000 : 15000),
        });
        // Bale's opaque response means the browser sent the request, not that
        // the service confirmed delivery. Never resend to try to read it.
        if (response.type === 'opaque') {
          deliveries.push('dispatched');
        } else {
          const result = await response.json().catch(() => null);
          if (!response.ok || result?.ok !== true) {
            if (result?.ok === false) throw new BaleDeliveryError('Bale rejected the request. Please check the bot settings and try again.');
            throw new Error('Delivery could not be confirmed.');
          }
          deliveries.push('submitted');
        }
        onProgress(deliveries.length, total);
      }

      const results = await Promise.allSettled(config.chatIds.map(async chatId => {
        for (const text of parts) await callBale('sendMessage', new URLSearchParams({ chat_id: chatId, text }));
        for (const [view, file] of attachments) {
          const body = new FormData();
          body.append('chat_id', chatId);
          body.append('caption', `Roxana questionnaire | ${payload.answers.name}\nReference: ${payload.reference}\nPhoto: ${view}`);
          body.append('photo', file, `${view}.${file.type === 'image/png' ? 'png' : 'jpg'}`);
          await callBale('sendPhoto', body);
        }
      }));
      const allSent = results.every(result => result.status === 'fulfilled');
      if (!allSent && deliveries.length === 0 && results.every(result => result.reason instanceof BaleDeliveryError)) throw results[0].reason;
      const status = allSent ? deliveries.every(delivery => delivery === 'submitted') ? 'submitted' : 'dispatched' : 'unknown';
      if (completed.size >= 500) completed.delete(completed.keys().next().value);
      completed.set(key, status);
      return status;
    })();
    inflight.set(key, task);
    try { return await task; } finally { inflight.delete(key); }
  };
}

export const sendSubmission = createBaleSender();
