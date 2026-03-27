import { state, save } from '../store.js';
import { gS } from '../data/stages.js';
import { esc } from '../utils/dom.js';
import { fmtD } from '../utils/date.js';
import { renderDetail } from './detail.js';
import { renderList } from './list.js';
import { reengageLead } from './lost.js';

const PIPELINE_STAGE_ORDER = ['live', 'quoted', 'lost'];
const RISK_CYCLE = [null, 'green', 'yellow', 'red'];
const RISK_LABELS = { green: 'Low', yellow: 'Medium', red: 'High' };
const CATEGORIES = ['', 'Pipeline', 'Best Case', 'Commit'];

export function renderPipeline() {
  const container = document.getElementById('pipelineTable');
  if (!container) return;

  const leads = state.leads
    .filter(l => PIPELINE_STAGE_ORDER.includes(l.stageId))
    .sort((a, b) => {
      const ai = PIPELINE_STAGE_ORDER.indexOf(a.stageId);
      const bi = PIPELINE_STAGE_ORDER.indexOf(b.stageId);
      if (ai !== bi) return ai - bi;
      return (a.company || '').localeCompare(b.company || '');
    });

  if (!leads.length) {
    container.innerHTML = `<div style="padding:60px;text-align:center;color:#94a3b8">
      <div style="font-size:32px;margin-bottom:12px">📋</div>
      <div style="font-size:14px;font-weight:600;color:#64748b">No pipeline leads yet</div>
      <div style="font-size:12px;margin-top:6px">Leads move here when marked as Connected, Quoted, or Lost</div>
    </div>`;
    return;
  }

  const riskDot = (l) => {
    const r = l.pipelineRisk || null;
    const colors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
    const bg = r ? colors[r] : '#e2e8f0';
    const title = r ? `Risk: ${RISK_LABELS[r]} — click to change` : 'Click to set risk';
    return `<button onclick="cyclePipelineRisk('${l.id}')" title="${title}"
      style="width:14px;height:14px;border-radius:50%;background:${bg};border:none;cursor:pointer;display:block;margin:auto;flex-shrink:0"></button>`;
  };

  const categoryCell = (l) => {
    const val = l.pipelineCategory || '';
    return `<select onchange="setPipelineCategory('${l.id}',this.value)" onclick="event.stopPropagation()"
      style="font-size:11px;border:1px solid #e2e8f0;border-radius:5px;padding:2px 4px;background:white;color:#1e293b;cursor:pointer;max-width:90px">
      ${CATEGORIES.map(c => `<option value="${c}" ${c === val ? 'selected' : ''}>${c || '—'}</option>`).join('')}
    </select>`;
  };

  const stagesBadge = (l) => {
    const st = gS(l.stageId) || {};
    return `<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:5px;background:${st.bg||'#f1f5f9'};color:${st.text||'#475569'};white-space:nowrap">${st.short || l.stageId}</span>`;
  };

  const rows = leads.map(l => {
    const isSelected = state.selId === l.id;
    const ns = (l.pipelineNextSteps || '').replace(/"/g, '&quot;');
    return `<tr onclick="selectPipelineLead('${l.id}')"
      style="cursor:pointer;${isSelected ? 'background:#eff6ff;' : ''}border-bottom:1px solid #f1f5f9;transition:background 0.1s"
      onmouseover="if('${l.id}'!==window._plSel)this.style.background='#f8fafc'"
      onmouseout="if('${l.id}'!==window._plSel)this.style.background=''">
      <td style="padding:10px 14px;min-width:160px">
        <div style="font-size:13px;font-weight:700;color:#1e293b">${esc(l.company || '—')}</div>
        <div style="font-size:11px;color:#64748b">${esc(l.firstName)} ${esc(l.lastName)}</div>
      </td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;text-align:center">${esc(l.employees || '—')}</td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;white-space:nowrap">${l.renewalDate ? fmtD(l.renewalDate) : '—'}</td>
      <td style="padding:10px 8px;text-align:center">${stagesBadge(l)}</td>
      <td style="padding:10px 8px;text-align:center" onclick="event.stopPropagation()">${categoryCell(l)}</td>
      <td style="padding:10px 8px;text-align:center" onclick="event.stopPropagation()">${riskDot(l)}</td>
      <td style="padding:10px 14px;min-width:160px" onclick="event.stopPropagation()">
        <input type="text" value="${ns}" placeholder="Add next steps…"
          onchange="setPipelineNextSteps('${l.id}',this.value)"
          onclick="event.stopPropagation()"
          style="font-size:11px;border:none;background:transparent;width:100%;color:#1e293b;outline:none;cursor:text"
          onfocus="this.style.background='#f8fafc';this.style.borderBottom='1px solid #cbd5e1'"
          onblur="this.style.background='transparent';this.style.borderBottom='none'">
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div style="padding:16px 20px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0">
      <div style="font-size:15px;font-weight:800;color:#1e293b">📋 Pipeline</div>
      <div style="font-size:12px;color:#94a3b8">${leads.length} lead${leads.length !== 1 ? 's' : ''}</div>
    </div>
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
            <th style="padding:8px 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:left">Next Steps</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>`;

  window._plSel = state.selId;
}

export function selectPipelineLead(id) {
  state.selId = id;
  window._plSel = id;
  renderPipeline();
  renderDetail();
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

export function setPipelineNextSteps(id, val) {
  const l = state.leads.find(l => l.id === id);
  if (!l) return;
  l.pipelineNextSteps = val;
  save();
}
