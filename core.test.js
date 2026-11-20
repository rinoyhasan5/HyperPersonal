const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadApp(storage = {}) {
  const elements = { app: { innerHTML: '' }, pageLabel: { textContent: '' } };
  const document = {
    getElementById: id => elements[id] || (elements[id] = { innerHTML: '', textContent: '', classList: { add() {}, remove() {} } }),
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
  const localStorage = { getItem: k => Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null, setItem: (k, v) => { storage[k] = String(v); } };
  const context = vm.createContext({ document, localStorage, window: { scrollTo() {} }, console, setTimeout, clearTimeout, URL, Blob });
  const src = fs.readFileSync(require.resolve('./customers.js'), 'utf8') + '\n' + fs.readFileSync(require.resolve('./catalog.js'), 'utf8') + '\n' + fs.readFileSync(require.resolve('./analytics.js'), 'utf8') + '\n' + fs.readFileSync(require.resolve('./app.js'), 'utf8');
  vm.runInContext(src, context);
  return { context, elements, storage };
}

test('customer profiles produce different, available hybrid recommendations', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`({a:recommend(customers[0],3),b:recommend(customers[1],3)})`, context);
  assert.equal(result.a.length, 3);
  assert.equal(result.b.length, 3);
  assert.ok(result.a.every(p => p.stock > 0 && p.score > 0));
  assert.notDeepEqual(result.a.map(p => p.id), result.b.map(p => p.id));
  assert.ok(result.a.some(p => p.collab > 0));
  assert.ok(result.a.every(p => p.why && p.factors && p.stock > 0));
});

test('new customer uses content and popularity fallback without collaborative claim', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`recommend({id:'new',consent:true,categories:['Denim'],style:'casual value',purchases:[],interactionProductIds:[],aov:0})`, context);
  assert.ok(result.length);
  assert.ok(result.every(p => p.collab === 0 && p.collaborativeAvailable === false && p.stock > 0));
  assert.ok(result.every(p => p.factors.content + p.factors.popularity + p.factors.business === 1));
});

test('persisted customer product interactions enter recommendation history', () => {
  const event={id:'evt-test',type:'assistant_question',customerId:'C-1048',details:{itemId:'P-03'}};
  const { context } = loadApp({'hyperpersonal:events':JSON.stringify([event])});
  const result=vm.runInContext(`({ids:purchasedIds(customers[0]),rec:recommend(customers[0],8).find(p=>p.id==='P-04')})`,context);
  assert.ok(Array.from(result.ids).includes('P-03'));
  assert.ok(result.rec.collab>0);
});

test('baseline scores stay bounded on extreme or invalid profile inputs', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`customerScores({views:Infinity,carts:-5,last:NaN,engagement:999,orders:-2,discounts:Infinity,aov:NaN})`, context);
  for (const key of ['intent','churn','sensitivity']) assert.ok(result[key] >= 0 && result[key] <= 1);
  assert.equal(result.historicalSpend, 0);
});

test('hybrid score is the weighted sum of actual normalized components', () => {
  const { context } = loadApp();
  const ok = vm.runInContext(`(()=>{const p=recommend(customers[0],1)[0];return Math.abs(p.score-(p.content*weights.content+p.collab*weights.collaborative+p.pop*weights.popularity+p.business*weights.business))<1e-10})()`, context);
  assert.equal(ok, true);
});

test('item similarity uses cosine over co-purchase interaction vectors', () => {
  const { context } = loadApp();
  const values = vm.runInContext(`({related:cosine(productVector('P-01'),productVector('P-05')),unrelated:cosine(productVector('P-01'),productVector('P-04'))})`, context);
  assert.ok(values.related > values.unrelated);
});

test('context controls action eligibility and preserves no action', () => {
  const { context } = loadApp();
  const eligible = vm.runInContext(`({a:eligible(customers[0]),b:eligible(customers[1])})`, context);
  assert.ok(eligible.a.includes('No action'));
  assert.ok(eligible.a.includes('Loyalty reward'));
  assert.ok(!eligible.a.includes('Targeted offer'));
  assert.ok(eligible.b.includes('Targeted offer'));
  assert.ok(eligible.b.includes('Support check-in'));
});

test('targeted offer recommendation obeys the persisted 14-day interval cap', () => {
  const { context } = loadApp();
  const eligible = vm.runInContext(`(()=>{const c=customers[1];state.offerRecommendedAt[c.id]=Date.now();const blocked=eligible(c).includes('Targeted offer');state.offerRecommendedAt[c.id]=Date.now()-15*24*60*60*1000;const expired=eligible(c).includes('Targeted offer');return{blocked,expired}})()`, context);
  assert.equal(eligible.blocked, false);
  assert.equal(eligible.expired, true);
});

test('opted-out customer receives no personalized ranking or action', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`(()=>{const c={...customers[0],consent:false};return{items:recommend(c),eligible:eligible(c)}})()`, context);
  assert.equal(result.items.length, 0);
  assert.equal(Array.from(result.eligible).join(','), 'No action');
});

test('feedback updates only selected customer and action parameters', () => {
  const { context } = loadApp();
  const before = vm.runInContext(`bandit['C-1048']['Personalized product'].beta`, context);
  const untouchedContext = loadApp().context;
  const otherPrior = vm.runInContext(`bandit['C-2091']['Personalized product'].alpha`, untouchedContext);
  vm.runInContext(`state.lastAction={customer:'C-1048',action:'Personalized product'};outcome(true)`, context);
  const result = vm.runInContext(`({a:bandit['C-1048']['Personalized product'].alpha,b:bandit['C-1048']['Personalized product'].beta,other:bandit['C-2091']['Personalized product'].alpha})`, context);
  assert.ok(result.a > 2.5);
  assert.ok(result.b > before);
  assert.equal(result.other, otherPrior);
});

test('retrieval respects catalog stock and budget constraints', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`retrieve('workwear under $100',customers[0])`, context);
  assert.ok(result.length > 0);
  assert.ok(result.every(p => p.stock > 0 && p.price <= 100));
  const names = vm.runInContext(`products.map(p=>p.name)`, context);
  assert.ok(result.every(p => names.includes(p.name)));
});

test('bandit parameters persist and restore across app reloads', () => {
  const first = loadApp();
  vm.runInContext(`state.lastAction={customer:'C-1048',action:'Personalized product'};outcome(true)`, first.context);
  const second = loadApp(first.storage);
  const alpha = vm.runInContext(`bandit['C-1048']['Personalized product'].alpha`, second.context);
  const feedback = vm.runInContext(`state.feedback`, second.context);
  assert.ok(alpha > 2.5);
  assert.equal(feedback, 1);
});

test('Thompson sampler returns values within a valid probability range', () => {
  const { context } = loadApp();
  const samples = vm.runInContext(`[betaSample(.5,.5),betaSample(4,2),betaSample(1,1)]`, context);
  assert.ok(samples.every(x => x >= 0 && x <= 1 && Number.isFinite(x)));
});

test('negative feedback increments beta and changes the posterior', () => {
  const { context } = loadApp();
  const values = vm.runInContext(`(()=>{const x=bandit['C-2091']['Targeted offer'],before=x.beta;state.lastAction={customer:'C-2091',action:'Targeted offer'};outcome(false);return{x,before}})()`, context);
  assert.ok(values.x.beta > values.before);
});

test('customer context changes arm priors and positive feedback earns more reward', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`(()=>{const c={...customers[0]},base=contextualPrior(c,'Support check-in');c.last=90;c.engagement=5;const changed=contextualPrior(c,'Support check-in');return{base,changed,pos:rewardBreakdown(customers[0],'Personalized product',true).reward,neg:rewardBreakdown(customers[0],'Personalized product',false).reward}})()`, context);
  assert.notEqual(result.base, result.changed);
  assert.ok(result.pos > result.neg && result.pos <= 1 && result.neg >= 0);
});

test('contextual Thompson ranking applies both posterior sample and customer prior', () => {
  const { context } = loadApp();
  const selected=vm.runInContext(`selectAction(customers[0])`,context).ranked[0];
  assert.ok(Number.isFinite(selected.posteriorSample));
  assert.ok(Math.abs(selected.sample-(.8*selected.posteriorSample+.2*selected.contextPrior))<1e-10);
});

test('sentiment baseline escalates frustrated language to human support', () => {
  const { context } = loadApp();
  const html = vm.runInContext(`(()=>{document.getElementById('sentimentInput').value='I am frustrated and angry about this late order';return sentiment()})()`, context);
  assert.match(html, /Frustrated/);
  assert.match(html, /Priority human support|human/i);
});

test('heuristic churn estimate stays bounded and isolated from bandit feedback', () => {
  const { context } = loadApp();
  const result = vm.runInContext(`(()=>{const c=customers[1],start=churn(c);state.feedback=10;return{start,end:churn(c)}})()`, context);
  assert.ok(result.start >= 0 && result.start <= 1);
  assert.equal(result.end, result.start);
});

test('core demo views render without runtime errors', () => {
  const { context, elements } = loadApp();
  vm.runInContext(`for (const v of ['overview','customers','experience','storefront','assistant','optimization','insights','governance','integrations']) {view=v;render()}`, context);
  assert.match(elements.app.innerHTML, /Integrations|adapters/i);
  assert.equal(elements.pageLabel.textContent, 'Integrations');
  vm.runInContext(`view='experience';render()`, context);
  assert.match(elements.app.innerHTML,/marketingForm/);
});

test('end-to-end demo journey switches storefront, retrieves catalog, and learns from feedback', () => {
  const { context, storage } = loadApp();
  const journey = vm.runInContext(`(()=>{
    selected=customers[0];view='storefront';render();const first=document.getElementById('app').innerHTML;
    selected=customers[1];persist();render();const second=document.getElementById('app').innerHTML;
    const retrieved=retrieve('workwear under $100',selected);
    const exp=generate(selected);state.lastAction={customer:selected.id,action:exp.action};
    const arm=bandit[selected.id][exp.action],before=arm.alpha+arm.beta;outcome(true);
    return {changed:first!==second,firstHas: first.includes('Amelia'),secondHas:second.includes('Jordan'),retrieved:retrieved.length>0,grounded:retrieved.every(p=>products.some(x=>x.id===p.id)),updated:arm.alpha+arm.beta===before+1,persisted:!!localStorage.getItem('hyperpersonal:bandit'),events:state.analytics.byType.experience_generated===1&&state.analytics.byType.bandit_feedback===1,analyticsStored:!!localStorage.getItem('hyperpersonal:events')};
  })()`, context);
  assert.ok(journey.changed && journey.firstHas && journey.secondHas);
  assert.ok(journey.retrieved && journey.grounded && journey.updated && journey.persisted && journey.events && journey.analyticsStored);
});

test('marketing content form produces a customer-specific local fallback draft', async () => {
  const { context, elements, storage } = loadApp();
  elements.marketingChannel={value:'email'};
  elements.marketingProduct={value:'P-01'};
  elements.marketingGoal={value:'Introduce new workwear'};
  vm.runInContext(`view='experience';render()`,context);
  await vm.runInContext(`generateMarketing({preventDefault(){},currentTarget:{querySelector(){return {disabled:false}}}})`,context);
  const output=vm.runInContext(`state.generatedContent`,context);
  assert.equal(output.provider,'local-fallback');
  assert.match(output.content,/Amelia/);
  assert.match(output.content,/The Atelier Linen Blazer/);
  assert.ok(JSON.parse(storage['hyperpersonal:events']).some(event=>event.type==='marketing_generated'));
});
