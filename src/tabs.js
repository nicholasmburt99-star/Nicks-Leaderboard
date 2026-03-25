import { state } from './store.js';
import { renderList } from './views/list.js';
import { renderQueue } from './views/queue.js';
import { renderKanban } from './views/kanban.js';
import { renderOverview } from './views/overview.js';
import { renderLost } from './views/lost.js';
import { renderDetail } from './views/detail.js';

export function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tab-' + tab);
  if (btn) btn.classList.add('active');
  document.getElementById('view-leads').style.display    = tab === 'queue'    ? 'flex' : 'none';
  const ov = document.getElementById('view-overview');
  if (ov) { ov.style.display = tab === 'overview' ? 'flex' : 'none'; }
  const kv = document.getElementById('view-kanban');
  if (kv) { kv.style.display = tab === 'kanban' ? 'flex' : 'none'; }
  const em = document.getElementById('view-email');
  if (em) { em.style.display = tab === 'email' ? 'flex' : 'none'; }
  const lt = document.getElementById('view-lost');
  if (lt) { lt.style.display = tab === 'lost' ? 'flex' : 'none'; }
  if (tab === 'overview') renderOverview();
  if (tab === 'kanban') renderKanban();
  if (tab === 'queue') { renderList(); renderDetail(); }
  if (tab === 'lost') renderLost();
}
export function goToLead(id) {
  switchTab('queue');
  state.selId = id;
  renderList();
  renderDetail();
}
