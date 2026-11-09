import test from 'node:test';
import assert from 'node:assert/strict';
import { createBaleSender } from '../src/lib/submission.js';
import { messageParts } from '../src/lib/bale-messages.js';
import { calculateBmi, validateContact } from '../src/lib/assessment.js';

const config = { apiBase: 'https://tapi.bale.ai', token: '123456789:test_token_not_real', chatIds: ['10000001', '10000002'] };
const reference = 'RX-00000000-0000-4000-8000-000000000001';
const assessment = () => ({ reference, name: 'Test Person', channel: 'phone', contact: '+447700900123', height: '200', weight: '120', health: ['Type 2 diabetes'], healthDetail: '' });
const questionnaire = () => ({ reference, answers: { name: 'Test Person', age: '32', gender: 'Woman', height: '165', weight: '70.5', contact: '@example', photos: "I'll add photos now" } });
const opaque = () => ({ type: 'opaque', status: 0, ok: false, json() { throw new Error('Opaque responses must not be read'); } });

test('BMI threshold stays precise and supports English and Persian digits', () => {
  assert.equal(calculateBmi('200', '120').inRange, true);
  assert.equal(calculateBmi('200', '119.99').inRange, false);
  assert.equal(calculateBmi('200', '119.99').display, '29.99');
  assert.equal(calculateBmi('۱۶۵', '۸۴٫۵').display, '31.04');
  assert.equal(calculateBmi('0', '84').invalidHeight, true);
});

test('contact validation accepts international and original Iranian numbers', () => {
  assert.equal(validateContact('Jane Smith', 'phone', '+44 7700 900123').value, '+447700900123');
  assert.equal(validateContact('Jane Smith', 'phone', '09123456789').value, '09123456789');
  assert.equal(validateContact('Jane Smith', 'instagram', '@jane.smith').value, '@jane.smith');
  assert.equal(validateContact('123', 'phone', '+447700900123').name, null);
});

test('button transport directly calls Bale for both recipients without a proxy or preflight', async () => {
  const calls = [];
  const send = createBaleSender(config, async (url, init) => { calls.push({ url, ...init }); return opaque(); });
  assert.equal(await send('assessment', assessment()), 'dispatched');
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(call => call.body.get('chat_id')).sort(), config.chatIds);
  for (const call of calls) {
    assert.equal(call.url, 'https://tapi.bale.ai/bot' + config.token + '/sendMessage');
    assert.equal(call.method, 'POST'); assert.equal(call.mode, 'no-cors'); assert.equal(call.credentials, 'omit');
    assert.equal(call.headers, undefined); assert.ok(call.body instanceof URLSearchParams);
    assert.match(call.body.get('text'), /BMI: 30\.00/);
    assert.equal(/[\u0600-\u06ff]/.test(call.body.get('text')), false);
  }
});

test('readable positive receipts are confirmed, but opaque responses only mean dispatched', async () => {
  assert.equal(await createBaleSender(config, async () => Response.json({ ok: true }))('assessment', assessment()), 'submitted');
  assert.equal(await createBaleSender(config, async () => opaque())('assessment', assessment()), 'dispatched');
});

test('questionnaire text and photos go directly to both destinations with progress updates', async () => {
  const calls = [], progress = [];
  const send = createBaleSender(config, async (url, init) => { calls.push({ url, body: init.body, mode: init.mode }); return opaque(); });
  const photo = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1])], { type: 'image/png' });
  assert.equal(await send('questionnaire', questionnaire(), { front: photo }, { onProgress: (sent, total) => progress.push([sent, total]) }), 'dispatched');
  assert.equal(calls.filter(call => call.url.endsWith('/sendMessage')).length, 2);
  const pictures = calls.filter(call => call.url.endsWith('/sendPhoto'));
  assert.equal(pictures.length, 2);
  for (const picture of pictures) {
    assert.equal(picture.mode, 'no-cors'); assert.ok(picture.body instanceof FormData);
    assert.equal(picture.body.get('photo').size, photo.size);
    assert.match(picture.body.get('caption'), /Reference: RX-/);
  }
  assert.deepEqual(progress.at(-1), [4, 4]);
});

test('long questionnaire answers are split into English messages within the service limit', () => {
  const payload = questionnaire();
  for (const field of ['occupation', 'goal', 'conditions', 'medications', 'pain', 'injuries', 'sleep', 'equipment', 'habits']) payload.answers[field] = 'Long answer. '.repeat(130);
  const parts = messageParts('questionnaire', payload);
  assert.ok(parts.length > 1);
  for (const part of parts) { assert.ok(part.length <= 4096); assert.match(part, /Roxana lifestyle questionnaire/); }
  assert.match(parts.join('\n'), /Eating habits:/);
});

test('repeated and concurrent clicks do not send the same reference twice', async () => {
  let calls = 0;
  const send = createBaleSender(config, async () => { calls++; await new Promise(resolve => setTimeout(resolve, 5)); return opaque(); });
  const results = await Promise.all([send('assessment', assessment()), send('assessment', assessment())]);
  assert.deepEqual(results, ['dispatched', 'dispatched']);
  assert.equal(await send('assessment', assessment()), 'dispatched'); assert.equal(calls, 2);
});

test('network failure and partial delivery stay uncertain without an automatic resend', async () => {
  let calls = 0;
  const send = createBaleSender(config, async (url, init) => { calls++; if (init.body.get('chat_id') === config.chatIds[1]) throw new TypeError('Network failure'); return opaque(); });
  assert.equal(await send('assessment', assessment()), 'unknown');
  assert.equal(await send('assessment', assessment()), 'unknown'); assert.equal(calls, 2);
});

test('a readable rejection never produces a successful confirmation', async () => {
  const send = createBaleSender(config, async () => Response.json({ ok: false }, { status: 401 }));
  await assert.rejects(send('assessment', assessment()), /Bale rejected/);
});

test('invalid form data, configuration and image files are rejected before contacting Bale', async () => {
  let calls = 0;
  const fetch = async () => { calls++; return opaque(); };
  const send = createBaleSender(config, fetch);
  await assert.rejects(send('assessment', { ...assessment(), height: '0' }), /height/);
  await assert.rejects(createBaleSender({ ...config, token: '' }, fetch)('assessment', assessment()), /not configured/);
  await assert.rejects(send('questionnaire', questionnaire(), { front: new Blob(['not a png'], { type: 'image/png' }) }), /valid JPG or PNG/);
  assert.equal(calls, 0);
});
