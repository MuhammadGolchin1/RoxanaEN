/** Credentials and original recipient IDs stay on the server. */
export async function sendSubmission(kind, payload, photos = {}) {
  const body = new FormData();
  body.append('kind', kind);
  body.append('payload', JSON.stringify(payload));
  for (const view of ['front', 'side', 'back']) if (photos[view]) body.append(view, photos[view]);
  let response;
  try {
    response = await fetch('/api/forms', {
      method: 'POST', body, credentials: 'same-origin', signal: AbortSignal.timeout(180000),
    });
  } catch { return 'unknown'; }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (result?.status === 'unknown') return 'unknown';
    throw new Error(result?.error || 'Your request could not be sent. Please try again.');
  }
  return result?.status === 'submitted' ? 'submitted' : 'unknown';
}
