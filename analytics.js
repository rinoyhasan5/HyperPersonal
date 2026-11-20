function renderAnalyticsPage() {
  const metrics = state.analytics?.byType || {};
  const total = state.analytics?.total || 0;
  const recent = state.analytics?.recent || [];
  const eventEntries = Object.entries(metrics);
  return `${header('MEASURE WHAT MATTERS','Insights & analytics','Counts are recorded interactions. No commerce conversion or revenue data is connected.',`<button class="button" id="exportCsv">↓ &nbsp;Export customer CSV</button>`)}
    <div class="grid kpis">
      ${kpi('STORED INTERACTIONS',total,'⌁',state.analyticsSource||'Local data',state.storageMode==='temporary-json-file'?'current instance; may reset':'persisted events')}
      ${kpi('EXPERIENCES',metrics.experience_generated||0,'✳','Generated','events')}
      ${kpi('ASSISTANT QUESTIONS',metrics.assistant_question||0,'✧','Catalog search','events')}
      ${kpi('FEEDBACK ROUNDS',(metrics.bandit_feedback||0)+(metrics.bandit_rounds||0),'↗','Simulated','events')}
    </div>
    <div class="grid dashboard-grid">
      <section class="card section-card"><h3>Recorded interaction mix</h3><p class="subtitle">Durable event counts from this demo workspace.</p>
        ${eventEntries.length?eventEntries.map(([type,count])=>`<div class="bar-row"><span>${escapeHtml(type.replaceAll('_',' '))}</span><div class="bar"><i style="width:${Math.max(4,Math.round(count/Math.max(total,1)*100))}%"></i></div><b>${count}</b></div>`).join(''):'<div class="empty">No interactions recorded yet. Generate an experience, ask the assistant, or submit feedback.</div>'}
        <div class="demo-note">Events include experience generation, storefront visits, assistant questions, sentiment checks, marketing drafts and bandit feedback. Message text is not stored.</div>
      </section>
      <section class="card section-card"><h3>Measurement boundaries</h3>
        <div class="kv"><span>Purchase conversion</span><b>Not connected</b></div>
        <div class="kv"><span>Revenue / CLV actuals</span><b>Not connected</b></div>
        <div class="kv"><span>Customer response outcomes</span><b>Simulated only</b></div>
        <div class="kv"><span>Dashboard line chart</span><b>Illustrative synthetic series</b></div>
        <div class="kv"><span>Persistence</span><b>${escapeHtml(state.analyticsSource||'Browser local fallback')}</b></div>
      </section>
    </div>
    <section class="card section-card" style="margin-top:14px"><div class="row" style="justify-content:space-between"><div><h3>Recent interactions</h3><p class="subtitle">Synthetic customer IDs only; no message bodies are logged.</p></div><span class="pill">${total} total</span></div>
      ${recent.length?`<table class="table"><thead><tr><th>TYPE</th><th>CUSTOMER</th><th>DETAIL</th><th>TIME</th></tr></thead><tbody>${recent.map(x=>`<tr><td>${escapeHtml(x.type.replaceAll('_',' '))}</td><td>${escapeHtml(x.customerId)}</td><td>${escapeHtml(x.details?.itemId||x.details?.action||x.details?.channel||x.details?.outcome||'—')}</td><td>${escapeHtml(new Date(x.at).toLocaleString())}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Your interaction log will appear here.</div>'}
    </section>`;
}
