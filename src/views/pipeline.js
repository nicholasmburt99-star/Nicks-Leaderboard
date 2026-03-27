import { state, save } from '../store.js';
import { esc } from '../utils/dom.js';
import { fmtD, today } from '../utils/date.js';
import { renderDetail } from './detail.js';

// Pipeline-specific stages (separate from outreach sequence)
const PL_STAGES = [
  { id: 'census',  label: 'Waiting on Census', bg: '#fef3c7', color: '#92400e' },
  { id: 'quoted',  label: 'Quoted',             bg: '#e0e7ff', color: '#3730a3' },
  { id: 'lost',    label: 'Lost',               bg: '#f3f4f6', color: '#374151' },
];
const PL_STAGE_MAP = Object.fromEntries(PL_STAGES.map(s => [s.id, s]));

// Leads enter Pipeline when their outreach stageId is one of these
const PIPELINE_STAGEIDS = ['live', 'quoted', 'lost'];

const RISK_CYCLE = [null, 'green', 'yellow', 'red'];
const RISK_COLORS = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
const RISK_LABELS = { green: 'Low', yellow: 'Medium', red: 'High' };
const CATEGORIES = ['', 'Pipeline', 'Best Case', 'Commit'];

// Module-level filter state
let pFilter = { stage: '', risk: '', category: '' };

// Auto-assign pipelineStage for leads entering Pipeline for the first time
function ensureStage(l) {
  if (!l.pipelineStage) {
    if (l.stageId === 'live')   l.pipelineStage = 'census';
    else if (l.stageId === 'quoted') l.pipelineStage = 'quoted';
    else if (l.stageId === 'lost')   l.pipelineStage = 'lost';
  }
}

function dueBadge(d) {
  if (!d) return '';
  const t = new Date(); t.setHours(0,0,0,0);
  const due = new Date(d + 'T00:00:00');
  const diff = Math.round((due - t) / 86400000);
  if (diff < 0)  return `<div style="font-size:10px;font-weight:700;color:#dc2626;background:#fef2f2;padding:1px 5px;border-radius:4px;margin-top:2px;display:inline-block">⚠ ${Math.abs(diff)}d overdue</div>`;
  if (diff === 0) return `<div style="font-size:10px;font-weight:700;color:#92400e;background:#fef3c7;padding:1px 5px;border-radius:4px;margin-top:2px;display:inline-block">Today</div>`;
  if (diff <= 3)  return `<div style="font-size:10px;font-weight:700;color:#92400e;background:#fef3c7;padding:1px 5px;border-radius:4px;margin-top:2px;display:inline-block">In ${diff}d</div>`;
  return '';
}

function chip(label, active, onclick) {
  const base = 'font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;border:1px solid;cursor:pointer;';
  const style = active
    ? base + 'background:#1e293b;color:white;border-color:#1e293b'
    : base + 'background:white;color:#64748b;border-color:#e2e8f0';
  return `<button style="${style}" onclick="${onclick}">${label}</button>`;
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

  // Apply filters
  if (pFilter.stage)    leads = leads.filter(l => l.pipelineStage === pFilter.stage);
  if (pFilter.risk)     leads = leads.filter(l => (l.pipelineRisk || null) === pFilter.risk);
  if (pFilter.category) leads = leads.filter(l => (l.pipelineCategory || '') === pFilter.category);

  // Sort: stage order, then company
  const stageOrder = ['census', 'quoted', 'lost'];
  leads.sort((a, b) => {
    const ai = stageOrder.indexOf(a.pipelineStage || 'census');
    const bi = stageOrder.indexOf(b.pipelineStage || 'census');
    if (ai !== bi) return ai - bi;
    return (a.company || '').localeCompare(b.company || '');
  });

  // Filter chips
  const stageChips = [
    chip('All', !pFilter.stage, "setPipelineFilter('stage','')"),
    ...PL_STAGES.map(s => chip(s.label, pFilter.stage === s.id, `setPipelineFilter('stage','${s.id}')`))
  ].join('');

  const riskChips = [
    chip('All', !pFilter.risk, "setPipelineFilter('risk','')"),
    ...(['green','yellow','red'].map(r => {
      const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${RISK_COLORS[r]};margin-right:4px;vertical-align:middle"></span>`;
      return chip(dot + RISK_LABELS[r], pFilter.risk === r, `setPipelineFilter('risk','${r}')`);
    }))
  ].join('');

  const catChips = [
    chip('All', !pFilter.category, "setPipelineFilter('category','')"),
    ...(['Pipeline','Best Case','Commit'].map(c => chip(c, pFilter.category === c, `setPipelineFilter('category','${c}')`)))
  ].join('');

  const filterBar = `<div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px;background:#f8fafc">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;min-width:60px">Stage</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${stageChips}</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;min-width:60px">Risk</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${riskChips}</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;min-width:60px">Category</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${catChips}</div>
    </div>
  </div>`;

  const totalAll = state.leads.filter(l => PIPELINE_STAGEIDS.includes(l.stageId)).length;

  if (!leads.length) {
    container.innerHTML = `
      <div style="padding:14px 20px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0">
        <div style="font-size:15px;font-weight:800;color:#1e293b">📋 Pipeline</div>
        <div style="font-size:12px;color:#94a3b8">${totalAll} lead${totalAll!==1?'s':''} total</div>
      </div>
      ${filterBar}
      <div style="padding:60px;text-align:center;color:#94a3b8">
        <div style="font-size:14px;font-weight:600;color:#64748b">${totalAll ? 'No leads match these filters' : 'No pipeline leads yet'}</div>
        <div style="font-size:12px;margin-top:6px">${totalAll ? 'Try clearing a filter above' : 'Leads move here when marked as Connected, Quoted, or Lost'}</div>
      </div>`;
    return;
  }

  const rows = leads.map(l => {
    const isSelected = state.selId === l.id;
    const ps = l.pipelineStage || 'census';
    const psInfo = PL_STAGE_MAP[ps] || PL_STAGES[0];
    const r = l.pipelineRisk || null;
    const dotBg = r ? RISK_COLORS[r] : '#e2e8f0';
    const ns = (l.pipelineNextSteps || '').replace(/"/g, '&quot;');
    const outreachDate = l.pipelineNextOutreach || '';

    const stageSelect = `<select onchange="setPipelineStage('${l.id}',this.value)" onclick="event.stopPropagation()"
      style="font-size:11px;font-weight:700;border:none;border-radius:5px;padding:3px 6px;background:${psInfo.bg};color:${psInfo.color};cursor:pointer;outline:none;max-width:150px">
      ${PL_STAGES.map(s => `<option value="${s.id}" ${ps===s.id?'selected':''}>${s.label}</option>`).join('')}
    </select>`;

    const catVal = l.pipelineCategory || '';
    const catSelect = `<select onchange="setPipelineCategory('${l.id}',this.value)" onclick="event.stopPropagation()"
      style="font-size:11px;border:1px solid #e2e8f0;border-radius:5px;padding:2px 4px;background:white;color:#1e293b;cursor:pointer;max-width:90px">
      ${CATEGORIES.map(c => `<option value="${c}" ${c===catVal?'selected':''}>${c||'—'}</option>`).join('')}
    </select>`;

    return `<tr onclick="selectPipelineLead('${l.id}')"
      style="cursor:pointer;${isSelected?'background:#eff6ff;':''}border-bottom:1px solid #f1f5f9"
      onmouseover="if('${l.id}'!==window._plSel)this.style.background='#f8fafc'"
      onmouseout="if('${l.id}'!==window._plSel)this.style.background=''">
      <td style="padding:10px 14px;min-width:160px">
        <div style="font-size:13px;font-weight:700;color:#1e293b">${esc(l.company||'—')}</div>
        <div style="font-size:11px;color:#64748b">${esc(l.firstName)} ${esc(l.lastName)}</div>
      </td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;text-align:center">${esc(l.employees||'—')}</td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;white-space:nowrap">${l.renewalDate?fmtD(l.renewalDate):'—'}</td>
      <td style="padding:10px 8px;text-align:center" onclick="event.stopPropagation()">${stageSelect}</td>
      <td style="padding:10px 8px;text-align:center" onclick="event.stopPropagation()">${catSelect}</td>
      <td style="padding:10px 8px;text-align:center" onclick="event.stopPropagation()">
        <button onclick="cyclePipelineRisk('${l.id}')" title="${r?'Risk: '+RISK_LABELS[r]+' — click to change':'Click to set risk'}"
          style="width:14px;height:14px;border-radius:50%;background:${dotBg};border:none;cursor:pointer;display:block;margin:auto"></button>
      </td>
      <td style="padding:8px 10px;min-width:130px" onclick="event.stopPropagation()">
        <input type="date" value="${outreachDate}"
          onchange="setPipelineNextOutreach('${l.id}',this.value)"
          onclick="event.stopPropagation()"
          style="font-size:11px;border:1px solid #e2e8f0;border-radius:5px;padding:2px 4px;background:white;color:#1e293b;cursor:pointer;width:100%">
        ${dueBadge(outreachDate)}
      </td>
      <td style="padding:10px 14px;min-width:160px" onclick="event.stopPropagation()">
        <input type="text" value="${ns}" placeholder="Add next steps…"
          onchange="setPipelineNextSteps('${l.id}',this.value)"
          onclick="event.stopPropagation()"
          style="font-size:11px;border:none;background:transparent;width:100%;color:#1e293b;outline:none"
          onfocus="this.style.background='#f8fafc';this.style.borderBottom='1px solid #cbd5e1'"
          onblur="this.style.background='transparent';this.style.borderBottom='none'">
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div style="padding:14px 20px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0">
      <div style="font-size:15px;font-weight:800;color:#1e293b">📋 Pipeline</div>
      <div style="font-size:12px;color:#94a3b8">${leads.length}${leads.length!==totalAll?' of '+totalAll:''} lead${totalAll!==1?'s':''}</div>
    </div>
    ${filterBar}
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid #e2e8f0">
            <th style="padding:8px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:left">Company</th>
            <th style="padding:8px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:center">Empl.</th>
            <th style="padding:8px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:left">Renewal</th>
            <th style="padding:8px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:center">Stage</th>
            <th style="padding:8px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:center">Category</th>
            <th style="padding:8px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:center">Risk</th>
            <th style="padding:8px 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:left">Next Outreach</th>
            <th style="padding:8px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:left">Next Steps</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;

  window._plSel = state.selId;
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
