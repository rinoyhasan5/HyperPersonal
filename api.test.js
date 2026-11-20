const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { PassThrough } = require('node:stream');
const { api, createServer, fallbackMarketing, groundedAnswer, retrieveCatalog, safeStaticPath } = require('./server');
const { createStore } = require('./store');

function tempStore() {
  const file = path.join(os.tmpdir(), `hyperpersonal-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  return { file, db: createStore(file) };
}

async function callApi(method, url, body, db) {
  const req = new PassThrough(); req.method = method; req.url = url;
  const res = { status: 0, headers: {}, body: '', writeHead(status, headers) { this.status=status;this.headers=headers; }, end(text='') { this.body+=text; } };
  const pending = api(req,res,new URL(url,'http://local.test'),db);
  req.end(body===undefined?'':JSON.stringify(body));
  await pending;
  return { status:res.status, headers:res.headers, body:JSON.parse(res.body||'{}') };
}

test('JSON store initializes, validates and persists interaction events', () => {
  const {file,db}=tempStore();
  try {
    assert.deepEqual(db.snapshot(),{schemaVersion:1,events:[],bandit:{},banditUpdatedAt:0});
    db.recordEvent({type:'experience_generated',customerId:'C-1048',details:{action:'Personalized product',itemId:'P-01'}});
    db.recordEvent({type:'assistant_question',customerId:'C-1048',details:{itemId:'P-02'}});
    assert.equal(createStore(file).snapshot().events.length,2);
    assert.throws(()=>db.recordEvent({type:'unknown',customerId:'C-1048'}),/Invalid event/);
  } finally { fs.rmSync(file,{force:true}); }
});

test('API records a synthetic interaction and returns updated analytics', async () => {
  const {file,db}=tempStore();
  try {
    const created=await callApi('POST','/api/events',{type:'assistant_question',customerId:'C-2091',details:{itemId:'P-03',query:'private message should not persist'}},db);
    assert.equal(created.status,201);
    assert.equal(created.body.analytics.total,1);
    const summary=await callApi('GET','/api/analytics',undefined,db);
    assert.equal(summary.body.byType.assistant_question,1);
    assert.equal(JSON.stringify(db.snapshot()).includes('private message should not persist'),false);
  } finally { fs.rmSync(file,{force:true}); }
});

test('bandit feedback event persists bounded fractional reward and rejects invalid reward', () => {
  const {file,db}=tempStore();
  try{db.recordEvent({type:'bandit_feedback',customerId:'C-1048',details:{action:'Personalized product',outcome:'positive',reward:.73}});assert.equal(createStore(file).snapshot().events[0].details.reward,.73);assert.throws(()=>db.recordEvent({type:'bandit_feedback',customerId:'C-1048',details:{action:'Personalized product',outcome:'positive',reward:1.5}}),/reward/i)}finally{fs.rmSync(file,{force:true})}
});

test('health endpoint reports file persistence and configuration status', async () => {
  const {file,db}=tempStore(),oldKey=process.env.OPENAI_API_KEY;
  try { process.env.OPENAI_API_KEY='';const health=await callApi('GET','/api/health',undefined,db);assert.equal(health.body.ok,true);assert.equal(health.body.storage,'json-file');assert.equal(health.body.llmConfigured,false); }
  finally { if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;fs.rmSync(file,{force:true}); }
});

test('server startup initializes its persistent data store', () => {
  const file=path.join(os.tmpdir(),`hyperpersonal-startup-${process.pid}-${Math.random().toString(36).slice(2)}.json`),db=createStore(file);
  try { assert.equal(fs.existsSync(file),false);createServer(db);assert.equal(fs.existsSync(file),true);assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')).events,[]); }
  finally { fs.rmSync(file,{force:true}); }
});

test('configured LLM path receives canonical retrieved catalog facts, never client-invented facts', async () => {
  const {file,db}=tempStore(),oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY;
  try {
    process.env.OPENAI_API_KEY='test-only-key';
    let requests=[];global.fetch=async(url,options)=>{requests.push({url,options});return{ok:true,json:async()=>({output_text:'Grounded response [P-01].'})}};
    const answer=await callApi('POST','/api/assistant/answer',{query:'tell me about the linen blazer',documents:[{id:'P-01',name:'Fake coat',price:1,stock:999,description:'Invented details.'}]},db);
    assert.equal(answer.body.provider,'openai-reranked');assert.deepEqual(answer.body.sourceIds,['P-01']);assert.match(answer.body.answer,/Atelier Linen Blazer/);assert.match(answer.body.answer,/\$168/);assert.doesNotMatch(answer.body.answer,/Grounded response/);
    assert.equal(requests[0].url,'https://api.openai.com/v1/responses');
    const prompt=JSON.parse(requests[0].options.body).input;
    assert.match(prompt,/The Atelier Linen Blazer/);assert.doesNotMatch(prompt,/Fake coat|Invented details/);
    const draft=await callApi('POST','/api/content/generate',{customer:{id:'C-1048',firstName:'Invented',style:'injected style'},product:{id:'P-01',name:'Fake coat',price:1,stock:999},channel:'email',goal:'Share an item'},db);
    assert.equal(draft.body.provider,'openai');const draftPrompt=JSON.parse(requests[1].options.body).input;assert.match(draftPrompt,/The Atelier Linen Blazer/);assert.match(draftPrompt,/Amelia/);assert.doesNotMatch(draftPrompt,/Invented|injected style/);
  } finally { global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;fs.rmSync(file,{force:true}); }
});

test('API rejects invalid customers, event types and unsafe bandit parameters', async () => {
  const {file,db}=tempStore();
  try {
    assert.equal((await callApi('POST','/api/events',{type:'assistant_question',customerId:'arbitrary'},db)).status,400);
    assert.equal((await callApi('POST','/api/events',{type:'made_up',customerId:'C-1048'},db)).status,400);
    assert.equal((await callApi('PUT','/api/state',{bandit:{'C-1048':{'No action':{alpha:-1,beta:1,n:0}}}},db)).status,400);
  } finally { fs.rmSync(file,{force:true}); }
});

test('bandit API state persists reward parameters', async () => {
  const {file,db}=tempStore();
  try {
    const bandit={'C-1048':{'No action':{alpha:2,beta:3,n:1}}};
    assert.equal((await callApi('PUT','/api/state',{bandit},db)).status,200);
    const restored=await callApi('GET','/api/state',undefined,createStore(file));
    assert.deepEqual(restored.body.bandit,bandit);
  } finally { fs.rmSync(file,{force:true}); }
});

test('marketing copy fallback uses only supplied product facts and validates input', async () => {
  const {file,db}=tempStore();
  try {
    const prior=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='';
    try {
    const response=await callApi('POST','/api/content/generate',{customer:{id:'C-1048',firstName:'Amelia',style:'premium minimal',categories:['Tailoring']},product:{id:'P-01',name:'Linen Blazer',price:168,stock:4,description:'Linen construction.'},goal:'Introduce workwear',channel:'email'},db);
    assert.equal(response.status,200);assert.equal(response.body.provider,'local-template');assert.match(response.body.content,/Atelier Linen Blazer/);assert.match(response.body.content,/\$168/);assert.doesNotMatch(response.body.content,/Linen construction/);assert.equal(response.body.approvalRequired,true);
    const invalid=await callApi('POST','/api/content/generate',{customer:{id:'C-1048'},product:{id:'P-99',name:'Invented',price:1,stock:1},channel:'email'},db);
    assert.equal(invalid.status,400);
    const noGoal=await callApi('POST','/api/content/generate',{customer:{id:'C-1048'},product:{id:'P-01',stock:18},channel:'email',goal:'x'},db);assert.equal(noGoal.status,400);
    } finally {
    if(prior===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=prior;
    }
  } finally { fs.rmSync(file,{force:true}); }
});

test('assistant fallback responds only from retrieved available documents', async () => {
  const documents=[{id:'P-03',name:'Everyday Straight Denim',price:64,stock:5,description:'Stretch cotton denim.'}];
  const answer=groundedAnswer('denim',documents);
  assert.match(answer,/Everyday Straight Denim/);assert.match(answer,/P-03/);assert.match(answer,/5 available/);
  assert.match(groundedAnswer('unmatched',[]),/could not find/);
});

test('catalog retrieval ranks relevant in-stock items and rejects unsupported questions', () => {
  const denim=retrieveCatalog('Find denim under $70');
  assert.ok(denim.length>0);assert.ok(denim.every(p=>p.stock>0&&p.price<=70));assert.match(denim[0].name,/Denim/i);
  assert.deepEqual(retrieveCatalog('What is your shipping policy?'),[]);
});

test('unsupported RAG question gets a grounded fallback without calling the LLM', async () => {
  const {file,db}=tempStore(),oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY;
  try{process.env.OPENAI_API_KEY='test-only-key';let calls=0;global.fetch=async()=>{calls++;throw new Error('should not call')};const result=await callApi('POST','/api/assistant/answer',{query:'What is your shipping policy?',documents:[{id:'P-01'}]},db);assert.equal(result.status,200);assert.match(result.body.answer,/could not find/);assert.equal(result.body.provider,'catalog-fallback');assert.deepEqual(result.body.sourceIds,[]);assert.equal(calls,0)}finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;fs.rmSync(file,{force:true})}
});

test('fallback marketing templates honor channel and do not invent discounts', () => {
  const copy=fallbackMarketing({customer:{firstName:'Jordan',style:'casual value'},product:{name:'Cotton Tee',price:28,description:'Organic cotton.',stock:6},goal:'Share a basic',channel:'sms'});
  assert.match(copy,/Jordan/);assert.match(copy,/Cotton Tee/);assert.doesNotMatch(copy,/discount|sale|% off/i);
});

test('static server path guard hides credentials and data and blocks traversal', () => {
  assert.equal(safeStaticPath('/.env'),null);
  assert.equal(safeStaticPath('/data/demo-db.json'),null);
  assert.equal(safeStaticPath('/%2e%2e/.env'),null);
  assert.equal(safeStaticPath('/server.js'),null);
  assert.equal(safeStaticPath('/api.test.js'),null);
  assert.match(safeStaticPath('/index.html'),/index\.html$/);
});
