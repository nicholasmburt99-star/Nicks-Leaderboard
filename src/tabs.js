import { state } from './store.js';
import { renderKanban } from './views/kanban.js';
import { renderOverview } from './views/overview.js';
import { renderDetail } from './views/detail.js';
import { renderPipeline } from './views/pipeline.js';

export function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tab-' + tab);
  if (btn) btn.classList.add('active');
  const vl = document.getElementById('view-leads');
  if (vl) vl.style.display = 'none';
  const ov = document.getElementById('view-overview');
  if (ov) ov.style.display = tab === 'overview' ? 'flex' : 'none';
  const kv = document.getElementById('view-kanban');
  if (kv) kv.style.display = tab === 'kanban' ? 'flex' : 'none';
  const em = document.getElementById('view-email');
  if (em) em.style.display = tab === 'email' ? 'flex' : 'none';
  const pv = document.getElementById('view-pipeline');
  if (pv) pv.style.display = tab === 'pipeline' ? 'flex' : 'none';
  if (tab === 'overview') renderOverview();
  if (tab === 'kanban') { renderKanban(); renderDetail(); }
  if (tab === 'pipeline') { renderPipeline(); renderDetail(); }
}

export function goToLead(id) {
  const lead = state.leads.find(l => l.id === id);
  const pipelineStages = ['live', 'quoted', 'lost'];
  const tab = lead && pipelineStages.includes(lead.stageId) ? 'pipeline' : 'kanban';
  state.selId = id;
  switchTab(tab);
}
