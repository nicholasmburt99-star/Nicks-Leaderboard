import { STAGES } from '../data/stages.js';
import { state } from '../store.js';
import { gS } from '../data/stages.js';
import { today, fmtD, fmtDT } from '../utils/date.js';
import { esc } from '../utils/dom.js';

export function renderOverview() {
  const container = document.getElementById('overviewInner');
  if (!container) return;

  const t = today();
  // Active = in pipeline but NOT quoting/won/lost
  const totalActive     = state.leads.filter(l => !['quoted','won','lost','unqualified'].includes(l.stageId)).length;
  const totalQuoting    = state.leads.filter(l => l.stageId === 'quoted').length;
  const totalLost       = state.leads.filter(l => l.stageId === 'lost').length;
  const totalWon        = state.leads.filter(l => l.stageId === 'won').length;
  const totalUnqualified = state.leads.filter(l => l.stageId === 'unqualified').length;

  const statsHtml = `<div class="ov-stats">
    <div class="ov-stat" style="background:#eff6ff">
      <div class="ov-stat-val" style="color:#2563eb">${totalActive}</div>
      <div class="ov-stat-lbl" style="color:#2563eb">Active</div>
    </div>
    <div class="ov-stat" style="background:#fefce8">
      <div class="ov-stat-val" style="color:#ca8a04">${totalQuoting}</div>
      <div class="ov-stat-lbl" style="color:#ca8a04">Quoting</div>
    </div>
    <div class="ov-stat" style="background:#fef2f2">
      <div class="ov-stat-val" style="color:#dc2626">${totalLost}</div>
      <div class="ov-stat-lbl" style="color:#dc2626">Lost</div>
    </div>
    <div class="ov-stat" style="background:#f5f3ff">
      <div class="ov-stat-val" style="color:#7c3aed">${totalUnqualified}</div>
      <div class="ov-stat-lbl" style="color:#7c3aed">Unqualified</div>
    </div>
    <div class="ov-stat" style="background:#d1fae5">
      <div class="ov-stat-val" style="color:#10b981">${totalWon}</div>
      <div class="ov-stat-lbl" style="color:#10b981">Won</div>
    </div>
  </div>`;

  // Monthly breakdown — keyed by leadDate (user-specified received date), falling back to createdAt
  const monthKey = iso => (iso || '').slice(0, 7); // 'YYYY-MM'
  const fmtMonth = key => {
    if (!key || key === 'unknown') return 'Unknown Date';
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const byMonth = {};
  state.leads.forEach(l => {
    // Use leadDate first (user-set received date), then createdAt
    const dateStr = l.leadDate || (l.createdAt ? l.createdAt.split('T')[0] : '');
    const key = monthKey(dateStr) || 'unknown';
    if (!byMonth[key]) byMonth[key] = { active: 0, lost: 0, won: 0 };
    if (l.stageId === 'won') byMonth[key].won++;
    else if (l.stageId === 'lost') byMonth[key].lost++;
    else byMonth[key].active++;
  });
  const months = Object.keys(byMonth).filter(k => k !== 'unknown').sort().reverse();
  if (byMonth['unknown']) months.push('unknown');

  const monthRows = months.length
    ? months.map(key => {
        const d = byMonth[key];
        const av = (n, cls) => `<div class="mb-val ${cls}${n===0?' zero':''}">${n}</div>`;
        return `<div class="mb-row">
          <div class="mb-month">${fmtMonth(key)}</div>
          ${av(d.active,'active')}
          ${av(d.lost,'lost')}
          ${av(d.won,'won')}
        </div>`;
      }).join('')
    : `<div style="padding:12px 8px;font-size:12px;color:#94a3b8">No leads yet — add your first lead to see monthly stats.</div>`;

  const monthBreakdownHtml = `<div class="month-breakdown">
    <div class="mb-title">📅 Monthly Breakdown <span style="font-weight:500;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:10px">(based on date lead was added)</span></div>
    <div class="mb-head">
      <span>Month</span>
      <span class="mb-h-active">Active</span>
      <span class="mb-h-lost">Lost</span>
      <span class="mb-h-won">Won</span>
    </div>
    ${monthRows}
  </div>`;

  // WEEKLY SUMMARY — resets every Monday at midnight local time
  const weekStart = new Date();
  const dow = weekStart.getDay(); // 0=Sun, 1=Mon … 6=Sat
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  weekStart.setHours(0, 0, 0, 0);
  let newLeadsWeek = 0, dialsWeek = 0, apptsWeek = 0, lostUnqualWeek = 0;

  // New state.leads added this week
  state.leads.forEach(l => {
    if (l.createdAt && new Date(l.createdAt) >= weekStart) newLeadsWeek++;
  });

  // Dials, appointments, lost/unqualified from activity logs
  state.leads.forEach(l => {
    (l.activity || []).forEach(a => {
      if (new Date(a.at) >= weekStart) {
        // Dials = any call attempt logged
        if (a.txt.includes('No Answer') || a.txt.includes('Voicemail') || a.txt.includes('Connected') || a.txt.includes('Callback') || a.txt.includes('Not Interested')) dialsWeek++;
        // Appointments = callback requests (scheduled follow-up)
        if (a.txt.includes('Callback requested')) apptsWeek++;
        // Lost or unqualified this week
        if (a.txt.includes('marked lost') || a.txt.includes('→ Unqualified') || a.txt.includes('→ Closed – Lost')) lostUnqualWeek++;
      }
    });
  });

  const weeklyHtml = `<div class="weekly-card" style="display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap">
    <div class="ov-stat" style="background:#f0f9ff;flex:1;min-width:120px">
      <div class="ov-stat-val" style="color:#2563eb">${newLeadsWeek}</div>
      <div class="ov-stat-lbl" style="color:#2563eb">New Leads Added</div>
    </div>
    <div class="ov-stat" style="background:#f0fdf4;flex:1;min-width:120px">
      <div class="ov-stat-val" style="color:#10b981">${dialsWeek}</div>
      <div class="ov-stat-lbl" style="color:#10b981">Dials Made</div>
    </div>
    <div class="ov-stat" style="background:#fefce8;flex:1;min-width:120px">
      <div class="ov-stat-val" style="color:#ca8a04">${apptsWeek}</div>
      <div class="ov-stat-lbl" style="color:#ca8a04">Appointments Set</div>
    </div>
    <div class="ov-stat" style="background:#fef2f2;flex:1;min-width:120px">
      <div class="ov-stat-val" style="color:#dc2626">${lostUnqualWeek}</div>
      <div class="ov-stat-lbl" style="color:#dc2626">Lost / Unqualified</div>
    </div>
  </div>`;

  // CONVERSION BY SOURCE
  const bySource = {};
  state.leads.forEach(l => {
    const src = l.source || 'Untracked';
    if (src === 'Untracked') return;
    if (!bySource[src]) bySource[src] = { total: 0, won: 0, lost: 0 };
    bySource[src].total++;
    if (l.stageId === 'won') bySource[src].won++;
    if (l.stageId === 'lost') bySource[src].lost++;
  });

  const sourceRows = Object.keys(bySource).length > 0
    ? Object.keys(bySource).sort().map(src => {
        const d = bySource[src];
        const winRate = d.won + d.lost > 0 ? Math.round((d.won / (d.won + d.lost)) * 100) : '—';
        return `<div style="display:grid;grid-template-columns:1fr 80px 80px 80px;align-items:center;padding:10px 8px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:13px;font-weight:700;color:#1e293b">${esc(src)}</div>
          <div style="font-size:14px;font-weight:800;text-align:center;color:#64748b">${d.total}</div>
          <div style="font-size:14px;font-weight:800;text-align:center;color:#10b981">${d.won}</div>
          <div style="font-size:13px;font-weight:700;text-align:center;color:#2563eb">${winRate}${winRate !== '—' ? '%' : ''}</div>
        </div>`;
      }).join('')
    : '<div style="padding:10px 8px;font-size:12px;color:#94a3b8;text-align:center">No leads with tracked sources yet.</div>';

  const sourceBreakdownHtml = Object.keys(bySource).length > 0 ? `<div class="source-breakdown" style="background:white;border-radius:12px;padding:14px 18px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    <div class="mb-title">📊 Conversion by Source</div>
    <div style="display:grid;grid-template-columns:1fr 80px 80px 80px;gap:0;margin-bottom:8px;align-items:center">
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b">Source</div>
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;text-align:center">Total</div>
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#10b981;text-align:center">Won</div>
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#2563eb;text-align:center">Rate</div>
    </div>
    ${sourceRows}
  </div>` : '';

  container.innerHTML = `
    <div style="font-size:15px;font-weight:800;color:#1e293b;margin-bottom:14px">📊 Pipeline Overview</div>
    <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.6px">This Week <span style="font-weight:500;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:10px">(Mon ${fmtD(weekStart.toISOString().split('T')[0])} – now)</span></div>
    ${weeklyHtml}
    ${sourceBreakdownHtml}
    ${statsHtml}
    ${monthBreakdownHtml}
  `;
}
