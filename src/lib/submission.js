/** Credentials and original recipient IDs stay on the server. */
export function formsEndpoint({
  configured = import.meta.env?.VITE_FORMS_API_URL || '',
  development = import.meta.env?.DEV ?? true,
  hostname = globalThis.location?.hostname || 'localhost',
} = {}) {
  if (configured.trim()) {
    const url = new URL(configured.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('The contact service address is invalid.');
    if (!development && url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('The contact service requires a secure connection.');
    return url.href;
  }
  return development || ['localhost', '127.0.0.1', '[::1]'].includes(hostname) ? '/api/forms' : null;
}

export async function sendSubmission(kind, payload, photos = {}) {
  const endpoint = formsEndpoint();
  if (!endpoint) throw new Error('Online submissions are not available on this site yet. Please contact the Roxana team using the links below.');
  const body = new FormData();
  body.append('kind', kind);
  body.append('payload', JSON.stringify(payload));
  for (const view of ['front', 'side', 'back']) if (photos[view]) body.append(view, photos[view]);
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST', body, credentials: 'omit', signal: AbortSignal.timeout(180000),
    });
  } catch { return 'unknown'; }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (result?.status === 'unknown') return 'unknown';
    throw new Error(result?.error || 'Your request could not be sent. Please try again.');
  }
  return result?.status === 'submitted' ? 'submitted' : 'unknown';
}
