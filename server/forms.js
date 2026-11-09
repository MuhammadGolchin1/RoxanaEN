/** Server-only form delivery. Vite loads credentials from .env.local. */
const EMBEDDED_ASSETS = {};
const HEALTH_OPTIONS = ['Type 2 diabetes', 'High blood pressure', 'High cholesterol', 'Sleep apnea', 'other'];
const FIELDS = [
  ['name', 'Preferred name'], ['age', 'Age'], ['gender', 'Gender'],
  ['height', 'Height (cm)'], ['weight', 'Weight (kg)'], ['contact', 'Contact'],
  ['occupation', 'Occupation and daily activity'], ['goal', 'Goals'],
  ['conditions', 'Medical conditions'], ['medications', 'Medication and dosage'],
  ['pain', 'Joint, muscle or bone pain'], ['injuries', 'Past injuries or surgery'],
  ['sleep', 'Sleep'], ['photos', 'Photo preference'], ['experience', 'Exercise experience'],
  ['location', 'Training location'], ['availability', 'Time available for exercise'],
  ['equipment', 'Equipment'], ['allergies', 'Food allergies or intolerances'],
  ['dislikes', 'Foods to exclude'], ['favorites', 'Favorite home-cooked dishes'],
  ['supplements', 'Supplements and vitamins'], ['habits', 'Eating habits'],
];
const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
function json(data, status = 200) {
  return Response.json(data, {status, headers:{...HEADERS, 'Cache-Control':'no-store'}});
}
class DeliveryError extends Error {
  constructor(message, definitelyNotDelivered = false) {
    super(message);
    this.definitelyNotDelivered = definitelyNotDelivered;
  }
}
function connectionWasBlocked(error) {
  const blockedCodes = new Set(['EACCES', 'EPERM', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ENETUNREACH', 'EHOSTUNREACH', 'UND_ERR_CONNECT_TIMEOUT']);
  const cause = error.cause ?? error;
  if (blockedCodes.has(cause.code)) return true;
  return Array.isArray(cause.errors) && cause.errors.length > 0 && cause.errors.every(connectionWasBlocked);
}
function deliveryResponse(result) {
  return json(result, result.status === 'failed' ? 502 : 200);
}
function normalize(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, d => String('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩'.indexOf(d) % 10));
}
function number(value, min, max) {
  const text = normalize(value).trim().replace(/[٫,]/g, '.');
  if (text.length > 12 || !/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const n = Number(text);
  return n >= min && n <= max ? Math.round(n * 100) : null;
}
function validName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 80 &&
    /^[\p{L}\p{M} .‌’'-]+$/u.test(name) && /\p{L}/u.test(name);
}
function validContact(contact, channel) {
  if (typeof contact !== 'string' || contact.length > 40) return false;
  const value = normalize(contact).trim();
  if (channel !== 'instagram') {
    const phone = value.replace(/[\s()-]/g, '');
    if (/^(?:0|\+98|0098)9\d{9}$/.test(phone) || /^\+[1-9]\d{6,14}$/.test(phone)) return true;
    if (channel === 'phone') return false;
  }
  const username = value.replace(/^@/, '');
  return /^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/.test(username) && !username.includes('..');
}
export function validateSubmission(kind, payload) {
  if (!payload || typeof payload !== 'object' || !/^RX-[a-f0-9-]{36}$/i.test(payload.reference || '')) return 'Invalid request reference.';
  if (kind === 'assessment') {
    if (!validName(payload.name) || !['phone','instagram'].includes(payload.channel) || !validContact(payload.contact, payload.channel)) return 'Enter a valid name and contact details.';
    if (number(payload.height,70,270) === null || number(payload.weight,15,650) === null) return 'Enter a valid height and weight.';
    if (!Array.isArray(payload.health) || payload.health.length > 5 || payload.health.some(h => !HEALTH_OPTIONS.includes(h))) return 'Choose valid health conditions.';
    if (typeof payload.healthDetail !== 'string' || payload.healthDetail.length > 250) return 'Please shorten your health note.';
    return null;
  }
  if (kind !== 'questionnaire') return 'Unknown form.';
  const a = payload.answers;
  if (!a || typeof a !== 'object' || Array.isArray(a)) return 'Invalid questionnaire.';
  if (!validName(a.name) || !validContact(a.contact)) return 'Enter a valid name and contact details.';
  const age = normalize(a.age);
  if (!/^\d{1,3}$/.test(age) || +age < 1 || +age > 120) return 'Enter an age between 1 and 120.';
  if (!['Woman','Man','Other','Prefer not to say'].includes(a.gender)) return 'Choose a gender option.';
  if (number(a.height,70,270) === null || number(a.weight,15,650) === null) return 'Enter a valid height and weight.';
  for (const [id] of FIELDS) if (a[id] !== undefined && (typeof a[id] !== 'string' || a[id].length > 1800)) return 'Please shorten your answers.';
  if (a.photos && !["I'll add photos now", "I'll send them later", "I'd rather not"].includes(a.photos)) return 'Choose a photo option.';
  return null;
}
function messageParts(kind, payload) {
  const ref = `English Roxana website\nReference: ${payload.reference}\n`;
  if (kind === 'assessment') {
    const height = number(payload.height,70,270), weight = number(payload.weight,15,650);
    const bmi = weight * 1e6 / height ** 2;
    const inRange = weight * 1e6 >= 30 * height ** 2;
    const display = !inRange && Math.round(bmi * 100) === 3000 ? 29.99 : bmi;
    return [`Roxana follow-up request\n${ref}\nName: ${payload.name}\n${payload.channel}: ${payload.contact}\nHeight: ${normalize(payload.height)} cm\nWeight: ${normalize(payload.weight)} kg\nBMI: ${display.toFixed(2)}\nHealth conditions: ${payload.health.join(', ') || 'Not specified'}\nHealth note: ${payload.healthDetail || 'None'}\nResult: ${inRange ? 'Within' : 'Outside'} initial assessment range`];
  }
  const parts = []; let current = '';
  for (const [id, label] of FIELDS) {
    const answer = `${label}: ${payload.answers[id]?.trim() || 'Not answered'}\n\n`;
    if ((current + answer).length > 3200 && current) { parts.push(current); current = ''; }
    current += answer;
  }
  if(current) parts.push(current);
  return parts.map((part,index)=>`Roxana lifestyle questionnaire\n${ref}Part ${index+1} of ${parts.length}\n\n${part}`);
}
export function createHandler(assetManifest = {}, upstreamFetch = globalThis.fetch) {
  const decoded = new Map(), completed = new Map(), inflight = new Map();
  async function submit(request, env) {
    const url = new URL(request.url), origin = request.headers.get('origin');
    if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return json({error:'Invalid request origin.'},403);
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) return json({error:'Expected form data.'},415);
    if (Number(request.headers.get('content-length') || 0) > 16*1024*1024) return json({error:'The form is too large.'},413);
    let chatIds;
    try { chatIds = JSON.parse(env.BALE_CHAT_IDS || '[]'); } catch { chatIds = []; }
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(env.BALE_BOT_TOKEN || '') || !Array.isArray(chatIds) || chatIds.length !== 2 || chatIds.some(id=>typeof id!=='string'||!/^-?\d+$/.test(id)) || new Set(chatIds).size!==chatIds.length) return json({error:'Online submissions are temporarily unavailable. Please contact the Roxana team using the links below.'},503);
    let form, payload;
    try {
      const reader = request.body.getReader(); let size = 0; const chunks = [];
      while (true) {
        const {done,value} = await reader.read(); if(done)break;
        size += value.byteLength;
        if(size > 16*1024*1024){await reader.cancel();return json({error:'The form is too large.'},413);}
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset=0;
      for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
      form = await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('content-type')},body:bytes}).formData();
      payload = JSON.parse(form.get('payload'));
    } catch { return json({error:'The form could not be read. Please try again.'},400); }
    const kind = form.get('kind'), error = validateSubmission(kind,payload);
    if(error)return json({error},400);
    const photos = [];
    for(const view of ['front','side','back']){
      const file = form.get(view); if(!file)continue;
      if(kind!=='questionnaire'||payload.answers.photos!=="I'll add photos now"||typeof file==='string'||!['image/jpeg','image/png'].includes(file.type)||file.size<=0||file.size>5*1024*1024)return json({error:'Photos must be JPG or PNG files, up to 5 MB each.'},400);
      const header=new Uint8Array(await file.slice(0,8).arrayBuffer());
      const isPng=header.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>header[i]===n), isJpeg=header[0]===255&&header[1]===216&&header[2]===255;
      if((file.type==='image/png'&&!isPng)||(file.type==='image/jpeg'&&!isJpeg))return json({error:'Please choose a valid JPG or PNG image.'},400);
      photos.push([view,file]);
    }
    const key=payload.reference;
    if(completed.has(key))return deliveryResponse(completed.get(key));
    if(inflight.has(key))return deliveryResponse(await inflight.get(key));
    const task=(async()=>{
      const parts=messageParts(kind,payload);
      let confirmedMessages = 0;
      async function send(method,body){
        let response;
        try {
          response=await upstreamFetch(`https://tapi.bale.ai/bot${env.BALE_BOT_TOKEN}/${method}`,{method:'POST',body,signal:AbortSignal.timeout(method==='sendPhoto'?30000:12000)});
        } catch (error) {
          if (connectionWasBlocked(error)) throw new DeliveryError('The server could not connect to Bale. Please check its internet access and try again.', true);
          throw new DeliveryError('Delivery could not be confirmed. Please contact the Roxana team before sending again.');
        }
        const data=await response.json().catch(()=>null);
        if(!response.ok||data?.ok!==true){
          if (data?.ok === false) {
            const code = Number(data.error_code ?? response.status);
            const message = code === 401 ? 'Bale could not authenticate the bot. Please check the server bot token.'
              : code === 403 ? 'Bale could not deliver to a configured recipient. Please check the bot access.'
              : code === 429 ? 'Bale is temporarily limiting requests. Please try again later.'
              : 'Bale rejected the request. Please check the server bot settings and try again.';
            throw new DeliveryError(message, true);
          }
          throw new DeliveryError('Delivery could not be confirmed. Please contact the Roxana team before sending again.');
        }
        confirmedMessages += 1;
      }
      const results=await Promise.allSettled(chatIds.map(async chat_id=>{
        for(const text of parts)await send('sendMessage',new URLSearchParams({chat_id,text}));
        for(const [view,file]of photos){
          const body=new FormData();body.append('chat_id',chat_id);
          body.append('caption',`Roxana questionnaire | ${payload.answers.name}\nReference: ${key}\nPhoto: ${view}`);
          body.append('photo',file,`${view}.${file.type==='image/png'?'png':'jpg'}`);
          await send('sendPhoto',body);
        }
      }));
      const success = results.every(r=>r.status==='fulfilled');
      const definitelyFailed = !success && confirmedMessages === 0 && results.every(r=>r.status==='rejected' && r.reason?.definitelyNotDelivered);
      const result={status:success?'submitted':definitelyFailed?'failed':'unknown',reference:key};
      if (definitelyFailed) {
        result.error = results.find(r=>r.status==='rejected').reason.message;
        return result;
      }
      if(completed.size>500)completed.delete(completed.keys().next().value);
      completed.set(key,result);return result;
    })();
    inflight.set(key,task);
    try{return deliveryResponse(await task);}finally{inflight.delete(key);}
  }
  return {
    async fetch(request, env = {}) {
      const url=new URL(request.url);
      if(url.pathname==='/api/forms'){
        if(request.method!=='POST')return json({error:'Method not allowed.'},405);
        return submit(request,env);
      }
      if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:HEADERS});
      let pathname;
      try{pathname=decodeURIComponent(url.pathname);}catch{return new Response('Not found',{status:404});}
      if(pathname.endsWith('/'))pathname+='index.html';
      else if(!pathname.split('/').pop().includes('.')&&assetManifest[pathname+'/index.html'])return Response.redirect(url.origin+pathname+'/'+url.search,308);
      const asset=assetManifest[pathname];
      if(!asset)return new Response('Not found',{status:404,headers:HEADERS});
      let bytes=decoded.get(pathname);
      if(!bytes){bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));decoded.set(pathname,bytes);}
      const headers={...HEADERS,'Content-Type':asset.type,'Accept-Ranges':'bytes','Cache-Control':asset.type.startsWith('text/html')?'no-cache':'public, max-age=86400'};
      if(asset.type.startsWith('text/html'))headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";
      const range=request.headers.get('range');
      if(range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(range);
        if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${bytes.length}`}});
        const start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2]));
        const end=match[1]?(match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1):bytes.length-1;
        if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${bytes.length}`}});
        return new Response(request.method==='HEAD'?null:bytes.slice(start,end+1),{status:206,headers:{...headers,'Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.length}`}});
      }
      return new Response(request.method==='HEAD'?null:bytes,{headers:{...headers,'Content-Length':String(bytes.length)}});
    }
  };
}
export default createHandler(EMBEDDED_ASSETS);
