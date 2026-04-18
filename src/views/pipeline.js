import { state, save } from '../store.js';
import { esc } from '../utils/dom.js';
import { fmtD, today } from '../utils/date.js';
import { renderDetail } from './detail.js';

// Pipeline-specific stages (separate from outreach sequence)
const PL_STAGES = [
  { id: 'census',      label: 'Waiting on Census',  bg: '#fef3c7', color: '#92400e', icon: '📋' },
  { id: 'proposal',    label: 'Proposal Sent',      bg: '#e0f2fe', color: '#0369a1', icon: '📄' },
  { id: 'quoted',      label: 'Quoted, Waiting on Plan Confirmation', bg: '#e0e7ff', color: '#3730a3', icon: '💰' },
  { id: 'negotiating', label: 'Negotiating',         bg: '#fce7f3', color: '#9d174d', icon: '🤝' },
  { id: 'enrollment',  label: 'Enrollment',          bg: '#d1fae5', color: '#065f46', icon: '✅' },
  { id: 'onboarding',  label: 'Onboarding',          bg: '#f0fdf4', color: '#14532d', icon: '🚀' },
  { id: 'lost',        label: 'Lost',                bg: '#f3f4f6', color: '#374151', icon: '✕' },
];
const PL_STAGE_MAP = Object.fromEntries(PL_STAGES.map(s => [s.id, s]));

// Leads enter Pipeline when their outreach stageId is one of these
const PIPELINE_STAGEIDS = ['live', 'quoted', 'lost'];

const RISK_CYCLE = [null, 'green', 'yellow', 'red'];
const RISK_COLORS = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
const RISK_LABELS = { green: 'Low', yellow: 'Medium', red: 'High' };
const CATEGORIES = ['', 'Pipeline', 'Best Case', 'Commit'];
const CAT_COLORS = {
  'Pipeline':  { bg: '#eff6ff', color: '#2563eb' },
  'Best Case': { bg: '#fefce8', color: '#ca8a04' },
  'Commit':    { bg: '#d1fae5', color: '#065f46' },
};

// Module-level filter state
let pFilter = { risk: '', category: '' };

// Section collapse state — lost is collapsed by default
let collapsed = { lost: true };

// Auto-assign pipelineStage for leads entering Pipeline for the first time
function ensureStage(l) {
  if (!l.pipelineStage) {
    if (l.stageId === 'live')   l.pipelineStage = 'census';
    else if (l.stageId === 'quoted') l.pipelineStage = 'quoted';
    else if (l.stageId === 'lost')   l.pipelineStage = 'lost';
  }
}

function lastActivityAgo(l) {
  if (!l.activity || !l.activity.length) return null;
  const last = l.activity[l.activity.length - 1];
  if (!last.at) return null;
  const diff = Math.floor((Date.now() - new Date(last.at).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

function dueBadge(d) {
  if (!d) return '';
  const t = new Date(); t.setHours(0,0,0,0);
  const due = new Date(d + 'T00:00:00');
  const diff = Math.round((due - t) / 86400000);
  if (diff < 0)  return `<span class="pl-badge pl-badge-overdue">⚠ ${Math.abs(diff)}d overdue</span>`;
  if (diff === 0) return `<span class="pl-badge pl-badge-today">Today</span>`;
  if (diff <= 3)  return `<span class="pl-badge pl-badge-soon">In ${diff}d</span>`;
  return '';
}

function chip(label, active, onclick) {
  return `<button class="pl-chip${active ? ' pl-chip-active' : ''}" onclick="${onclick}">${label}</button>`;
}

function stageOptionHtml(currentId) {
  return PL_STAGES.map(s =>
    `<option value="${s.id}" ${s.id === currentId ? 'selected' : ''}>${s.label}</option>`
  ).join('');
}

export function renderPipeline() {
  const container = document.getElementById('pipelineTable');
  if (!container) return;

  // Ensure all leads have pipelineStage set; save if any changed
  let changed = false;
  state.leads.forEach(l => {
    if (PIPELINE_STAGEIDS.includes(l.stageId) && !l.pipelineStage) {
      ensureStage(l);
      changed = true;
    }
  });
  if (changed) save();

  let leads = state.leads.filter(l => PIPELINE_STAGEIDS.includes(l.stageId));
  const totalAll = leads.length;

  // Apply filters
  if (pFilter.risk)     leads = leads.filter(l => (l.pipelineRisk || null) === pFilter.risk);
  if (pFilter.category) leads = leads.filter(l => (l.pipelineCategory || '') === pFilter.category);

  // Filter chips
  const riskChips = [
    chip('All', !pFilter.risk, "setPipelineFilter('risk','')"),
    ...(['green','yellow','red'].map(r => {
      const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${RISK_COLORS[r]};margin-right:4px;vertical-align:middle"></span>`;
      return chip(dot + RISK_LABELS[r], pFilter.risk === r, `setPipelineFilter('risk','${r}')`);
    }))
  ].join('');

  const catChips = [
    chip('All', !pFilter.category, "setPipelineFilter('category','')"),
    ...(['Pipeline','Best Case','Commit'].map(c => chip(c, pFilter.category === c, `setPipelineFilter('category','${esc(c)}')`)))
  ].join('');

  // Group leads by pipelineStage
  const groups = {};
  PL_STAGES.forEach(s => { groups[s.id] = []; });
  leads.forEach(l => {
    const ps = l.pipelineStage || 'census';
    if (groups[ps]) groups[ps].push(l);
    else groups['census'].push(l);
  });

  // Sort within each group by company name
  Object.values(groups).forEach(arr => {
    arr.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  });

  // Build sections
  const sections = PL_STAGES.map(stage => {
    const groupLeads = groups[stage.id];
    const count = groupLeads.length;
    if (count === 0 && !pFilter.risk && !pFilter.category) return '';

    const isCollapsed = collapsed[stage.id] || false;
    const chevron = isCollapsed ? '▸' : '▾';

    const cards = groupLeads.map(l => {
      const isSelected = state.selId === l.id;
      const r = l.pipelineRisk || null;
      const dotBg = r ? RISK_COLORS[r] : '#e2e8f0';
      const riskLabel = r ? RISK_LABELS[r] : '';
      const cat = l.pipelineCategory || '';
      const catStyle = CAT_COLORS[cat] || null;
      const catBadge = cat && catStyle
        ? `<span class="pl-cat-badge" style="background:${catStyle.bg};color:${catStyle.color}">${esc(cat)}</span>`
        : '';
      const lastAct = lastActivityAgo(l);
      const ns = (l.pipelineNextSteps || '').replace(/"/g, '&quot;');
      const outreachDate = l.pipelineNextOutreach || '';

      return `<div class="pl-card${isSelected ? ' pl-card-selected' : ''}" onclick="selectPipelineLead('${l.id}')">
        <div class="pl-card-header">
          <div class="pl-card-company">${esc(l.company || '—')}</div>
          <button class="pl-risk-dot" onclick="event.stopPropagation();cyclePipelineRisk('${l.id}')"
            title="${r ? 'Risk: ' + riskLabel + ' — click to change' : 'Click to set risk'}"
            style="background:${dotBg}"></button>
        </div>
        <div class="pl-card-contact">${esc(l.firstName || '')} ${esc(l.lastName || '')}${l.employees ? ' · ' + esc(l.employees) + ' empl' : ''}</div>
        <div class="pl-card-meta">
          ${l.renewalDate ? `<span class="pl-meta-item">Renewal: ${fmtD(l.renewalDate)}</span>` : ''}
          ${lastAct ? `<span class="pl-meta-item">Last: ${lastAct}</span>` : '<span class="pl-meta-item">No activity</span>'}
        </div>
        <div class="pl-card-row" onclick="event.stopPropagation()">
          <div class="pl-card-outreach">
            <input type="date" value="${outreachDate}"
              onchange="setPipelineNextOutreach('${l.id}',this.value)"
              class="pl-date-input">
            ${dueBadge(outreachDate)}
          </div>
          ${catBadge}
        </div>
        <div class="pl-card-row" onclick="event.stopPropagation()">
          <input type="text" value="${ns}" placeholder="Next steps..."
            onchange="setPipelineNextSteps('${l.id}',this.value)"
            class="pl-steps-input">
        </div>
        <div class="pl-card-row" onclick="event.stopPropagation()">
          <select onchange="setPipelineStage('${l.id}',this.value)" class="pl-stage-select" style="background:${stage.bg};color:${stage.color}">
            ${stageOptionHtml(l.pipelineStage || 'census')}
          </select>
          <select onchange="setPipelineCategory('${l.id}',this.value)" class="pl-cat-select">
            ${CATEGORIES.map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${c || '—'}</option>`).join('')}
          </select>
        </div>
      </div>`;
    }).join('');

    return `<div class="pl-section">
      <div class="pl-section-header" onclick="togglePipelineSection('${stage.id}')">
        <span class="pl-section-chevron">${chevron}</span>
        <span class="pl-section-icon">${stage.icon}</span>
        <span class="pl-section-label">${stage.label}</span>
        <span class="pl-section-count">${count}</span>
      </div>
      ${!isCollapsed ? `<div class="pl-card-grid">${count > 0 ? cards : '<div class="pl-empty-section">No leads match filters</div>'}</div>` : ''}
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="pl-header">
      <div class="pl-title">📋 Pipeline</div>
      <div class="pl-count">${leads.length}${leads.length !== totalAll ? ' of ' + totalAll : ''} lead${totalAll !== 1 ? 's' : ''}</div>
    </div>
    <div class="pl-filters">
      <div class="pl-filter-row">
        <span class="pl-filter-label">Risk</span>
        <div class="pl-filter-chips">${riskChips}</div>
      </div>
      <div class="pl-filter-row">
        <span class="pl-filter-label">Category</span>
        <div class="pl-filter-chips">${catChips}</div>
      </div>
    </div>
    <div class="pl-sections">
      ${sections || '<div style="padding:60px;text-align:center;color:#94a3b8"><div style="font-size:14px;font-weight:600;color:#64748b">No pipeline leads yet</div><div style="font-size:12px;margin-top:6px">Leads move here when marked as Connected, Quoted, or Lost</div></div>'}
    </div>`;

  window._plSel = state.selId;
}

export function togglePipelineSection(stageId) {
  collapsed[stageId] = !collapsed[stageId];
  renderPipeline();
}

export function setPipelineFilter(key, val) {
  pFilter[key] = val;
  renderPipeline();
}

export function selectPipelineLead(id) {
  state.selId = id;
  window._plSel = id;
  renderPipeline();
  renderDetail();
}

export function setPipelineStage(id, val) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  l.pipelineStage = val;
  save();
  renderPipeline();
}

export function cyclePipelineRisk(id) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  const cur = RISK_CYCLE.indexOf(l.pipelineRisk || null);
  l.pipelineRisk = RISK_CYCLE[(cur + 1) % RISK_CYCLE.length];
  save();
  renderPipeline();
}

export function setPipelineCategory(id, val) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  l.pipelineCategory = val;
  save();
}

export function setPipelineNextOutreach(id, val) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  l.pipelineNextOutreach = val;
  save();
  renderPipeline();
}

export function setPipelineNextSteps(id, val) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  l.pipelineNextSteps = val;
  save();
}
