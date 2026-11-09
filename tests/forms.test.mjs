import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,validateSubmission} from '../server/forms.js';
import {calculateBmi as bmi,validateContact as contact} from '../src/lib/assessment.js';
const reference='RX-00000000-0000-4000-8000-000000000001';
const env={BALE_BOT_TOKEN:'123456789:test_token_not_real',BALE_CHAT_IDS:'["10000001","10000002"]'};
const assessment=()=>({reference,name:'Test Person',channel:'phone',contact:'+447700900123',height:'200',weight:'120',health:['Type 2 diabetes'],healthDetail:''});
const questionnaire=()=>({reference,answers:{name:'Test Person',age:'32',gender:'Woman',height:'165',weight:'70.5',contact:'@example',photos:"I'll add photos now"}});
function request(kind,payload,photo){const body=new FormData();body.append('kind',kind);body.append('payload',JSON.stringify(payload));if(photo)body.append('front',photo,'front.png');return new Request('https://example.test/api/forms',{method:'POST',body,headers:{origin:'https://example.test'}});}
test('BMI cutoff uses the precise value with English digits',()=>{
  assert.equal(bmi('200','120').inRange,true);
  const below=bmi('200','119.99');assert.equal(below.inRange,false);assert.equal(below.display,'29.99');
  assert.equal(bmi('۱۶۵','۸۴٫۵').display,'31.04');
  assert.equal(bmi('0','84').invalidHeight,true);
  assert.equal(bmi('165','650.01').invalidWeight,true);
});
test('contact handling supports international and original Iranian numbers',()=>{
  assert.equal(contact('Jane Smith','phone','+44 7700 900123').value,'+447700900123');
  assert.equal(contact('Jane Smith','phone','09123456789').value,'09123456789');
  assert.equal(contact('Jane Smith','instagram','@jane.smith').value,'@jane.smith');
  assert.equal(contact('123','phone','+447700900123').name,null);
});
test('assessment targets both recipients, recomputes BMI and deduplicates references',async()=>{
  const calls=[];const app=createHandler({},async(url,init)=>{calls.push({url,body:init.body});return Response.json({ok:true});});
  const result=await app.fetch(request('assessment',assessment()),env);assert.equal((await result.json()).status,'submitted');
  assert.equal(calls.length,2);assert.deepEqual(calls.map(c=>c.body.get('chat_id')).sort(),['10000001','10000002']);
  assert.match(calls[0].body.get('text'),/BMI: 30\.00/);
  await app.fetch(request('assessment',assessment()),env);assert.equal(calls.length,2);
});
test('questionnaire sends responses and photos to both recipients',async()=>{
  const calls=[];const app=createHandler({},async(url,init)=>{calls.push({url,body:init.body});return Response.json({ok:true});});
  const png=new Blob([new Uint8Array([137,80,78,71,13,10,26,10,1])],{type:'image/png'});
  const result=await app.fetch(request('questionnaire',questionnaire(),png),env);
  assert.equal((await result.json()).status,'submitted');
  assert.equal(calls.filter(c=>c.url.endsWith('/sendMessage')).length,2);
  assert.equal(calls.filter(c=>c.url.endsWith('/sendPhoto')).length,2);
});
test('an explicit rejection is reported as a retryable failure, never a success',async()=>{
  const app=createHandler({},async()=>Response.json({ok:false},{status:401}));
  const response=await app.fetch(request('assessment',assessment()),env);
  assert.equal(response.status,502);
  const result=await response.json();
  assert.equal(result.status,'failed');assert.match(result.error,/authenticate/);
});
test('a blocked network explains the failure and allows the same reference to be retried',async()=>{
  let blocked=true,calls=0;
  const app=createHandler({},async()=>{
    calls++;
    if(blocked)throw new TypeError('fetch failed',{cause:Object.assign(new Error('blocked'),{code:'EACCES'})});
    return Response.json({ok:true});
  });
  const first=await app.fetch(request('assessment',assessment()),env);
  assert.equal(first.status,502);const result=await first.json();assert.equal(result.status,'failed');assert.match(result.error,/internet access/);
  blocked=false;
  assert.equal((await(await app.fetch(request('assessment',assessment()),env)).json()).status,'submitted');
  assert.equal(calls,4);
});
test('partial delivery and ambiguous timeouts remain unknown to prevent duplicate messages',async()=>{
  const partial=createHandler({},async(url,init)=>init.body.get('chat_id')==='10000001'?Response.json({ok:true}):Response.json({ok:false},{status:403}));
  assert.equal((await(await partial.fetch(request('assessment',assessment()),env)).json()).status,'unknown');
  const timeout=createHandler({},async()=>{throw new DOMException('Timeout','TimeoutError');});
  assert.equal((await(await timeout.fetch(request('assessment',assessment()),env)).json()).status,'unknown');
});
test('invalid forms, cross-origin requests and missing configuration never send messages',async()=>{
  let calls=0;const app=createHandler({},async()=>{calls++;throw Error('Must not send');});
  assert.equal((await app.fetch(request('assessment',{...assessment(),height:'0'}),env)).status,400);
  assert.equal((await app.fetch(request('assessment',assessment()),{})).status,503);
  const foreign=request('assessment',assessment());foreign.headers.set('origin','https://foreign.test');
  assert.equal((await app.fetch(foreign,env)).status,403);
  const fakeImage=new Blob(['not an image'],{type:'image/png'});
  assert.equal((await app.fetch(request('questionnaire',questionnaire(),fakeImage),env)).status,400);
  assert.equal(calls,0);
  assert.notEqual(validateSubmission('questionnaire',{...questionnaire(),answers:{...questionnaire().answers,age:'121'}}),null);
});
test('video supports byte ranges and HEAD requests',async()=>{
  const app=createHandler({'/video.mp4':{type:'video/mp4',data:Buffer.from('0123456789').toString('base64')}});
  const result=await app.fetch(new Request('https://example.test/video.mp4',{headers:{range:'bytes=2-5'}}));
  assert.equal(result.status,206);assert.equal(await result.text(),'2345');assert.equal(result.headers.get('content-range'),'bytes 2-5/10');
  assert.equal((await app.fetch(new Request('https://example.test/video.mp4',{headers:{range:'bytes=100-'}}))).status,416);
  assert.equal(await(await app.fetch(new Request('https://example.test/video.mp4',{method:'HEAD'}))).text(),'');
});

test('the configured Pages origin can submit and preflight, while unrelated origins are blocked',async()=>{
  let calls=0;
  const app=createHandler({},async()=>{calls++;return Response.json({ok:true});});
  const allowedEnv={...env,BALE_ALLOWED_ORIGINS:'https://muhammadgolchin1.github.io'};
  const options=new Request('https://example.test/api/forms',{method:'OPTIONS',headers:{origin:'https://muhammadgolchin1.github.io','sec-fetch-site':'cross-site'}});
  const preflight=await app.fetch(options,allowedEnv);
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://muhammadgolchin1.github.io');
  assert.equal(calls,0);
  const form=request('assessment',assessment());form.headers.set('origin','https://muhammadgolchin1.github.io');form.headers.set('sec-fetch-site','cross-site');
  const submitted=await app.fetch(form,allowedEnv);
  assert.equal((await submitted.json()).status,'submitted');assert.equal(submitted.headers.get('access-control-allow-origin'),'https://muhammadgolchin1.github.io');assert.equal(calls,2);
  const blocked=await app.fetch(new Request('https://example.test/api/forms',{method:'OPTIONS',headers:{origin:'https://foreign.test'}}),allowedEnv);
  assert.equal(blocked.status,403);assert.equal(blocked.headers.get('access-control-allow-origin'),null);
});
