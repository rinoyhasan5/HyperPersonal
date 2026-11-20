const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const EVENT_TYPES = new Set(['experience_generated','storefront_viewed','assistant_question','sentiment_analyzed','marketing_generated','bandit_feedback','bandit_rounds']);
const CUSTOMERS = new Set(require('./customers').map(customer=>customer.id));
const ACTIONS = new Set(['Personalized product','Complementary item','Targeted offer','Loyalty reward','Support check-in','No action']);
const PRODUCT_IDS = new Set(require('./catalog').map(product=>product.id));
const DETAIL_VALUES = {itemId:new Set([...PRODUCT_IDS,'catalog','none']),outcome:new Set(['positive','no_response','5 simulated rounds']),channel:new Set(['email','sms','social']),provider:new Set(['openai','openai-reranked','gemini','gemini-reranked','local-template','local-fallback','catalog-fallback','grounded-retrieval','personalized','standard','lexicon']),action:ACTIONS};
function validationError(message){const error=new Error(message);error.status=400;return error}

function createStore(file = process.env.HYPERPERSONAL_DATA_FILE || (process.env.VERCEL ? path.join(os.tmpdir(), 'hyperpersonal-demo-db.json') : path.join(__dirname, 'data', 'demo-db.json'))) {
  function read() {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) write({ schemaVersion: 1, events: [], bandit: {}, banditUpdatedAt: 0 });
    try { const db=JSON.parse(fs.readFileSync(file, 'utf8'));db.banditUpdatedAt??=0;return db; }
    catch { const clean = { schemaVersion: 1, events: [], bandit: {}, banditUpdatedAt: 0 }; write(clean); return clean; }
  }
  function write(db) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(temp, file);
  }
  function snapshot() { return read(); }
  function recordEvent(input) {
    if (!input || !EVENT_TYPES.has(input.type) || !CUSTOMERS.has(input.customerId)) throw validationError('Invalid event type or customer.');
    const details = {};
    const allowed = Object.keys(DETAIL_VALUES);
    for (const key of allowed) if (typeof input.details?.[key] === 'string') {if(!DETAIL_VALUES[key].has(input.details[key]))throw validationError(`Invalid ${key} event detail.`);details[key]=input.details[key]}
    if(input.details?.reward!==undefined){if(typeof input.details.reward!=='number'||!Number.isFinite(input.details.reward)||input.details.reward<0||input.details.reward>1)throw validationError('Invalid reward event detail.');details.reward=input.details.reward}
    if (input.type === 'bandit_feedback' && (!ACTIONS.has(details.action) || !['positive','no_response'].includes(details.outcome))) throw validationError('Bandit feedback requires a valid action and outcome.');
    const db = read();
    if(typeof input.id==='string'&&db.events.some(event=>event.id===input.id))return{event:db.events.find(event=>event.id===input.id),analytics:summarize(db.events)};
    const event = { id: typeof input.id==='string'&&/^[a-z0-9-]{8,64}$/i.test(input.id)?input.id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, type: input.type, customerId: input.customerId, details, at: new Date().toISOString() };
    db.events.push(event);
    if (db.events.length > 5000) db.events.splice(0, db.events.length - 5000);
    write(db);
    return { event, analytics: summarize(db.events) };
  }
  function saveBandit(bandit, updatedAt=Date.now()) {
    if (!bandit || typeof bandit !== 'object' || Array.isArray(bandit)) throw validationError('Bandit state must be an object.');
    if(!Number.isFinite(updatedAt)||updatedAt<0)throw validationError('Invalid bandit update timestamp.');
    if(Object.keys(bandit).some(customerId=>!CUSTOMERS.has(customerId)))throw validationError('Unknown customer in bandit state.');
    const db = read();
    for (const customerId of CUSTOMERS) {
      const arms = bandit[customerId]; if (!arms) continue;
      for (const [action, arm] of Object.entries(arms)) {
        if (!arm || typeof arm!=='object' || !ACTIONS.has(action) || !Number.isFinite(arm.alpha) || arm.alpha <= 0 || arm.alpha>1e9 || !Number.isFinite(arm.beta) || arm.beta <= 0 || arm.beta>1e9 || !Number.isInteger(arm.n) || arm.n < 0 || arm.n>1e9) throw validationError('Invalid bandit parameters.');
      }
    }
    if(updatedAt<db.banditUpdatedAt)return db;
    db.bandit = bandit;
    db.banditUpdatedAt=updatedAt;
    write(db);
    return db;
  }
  return { snapshot, recordEvent, saveBandit };
}

function summarize(events) {
  const byType = {};
  for (const event of events) byType[event.type] = (byType[event.type] || 0) + 1;
  return { total: events.length, byType, recent: events.slice(-8).reverse() };
}

module.exports = { createStore, summarize, EVENT_TYPES, CUSTOMERS, ACTIONS };
