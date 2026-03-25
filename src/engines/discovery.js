import { DISC_NO_INS, DISC_HAS_INS } from '../data/discovery.js';
import { state, save } from '../store.js';
import { esc } from '../utils/dom.js';
import { renderDetail } from '../views/detail.js';

export function setDiscoveryType(leadId, type) {
  const l = state.leads.find(x => x.id === leadId);
  if (!l) return;
  if (!l.discovery) l.discovery = { type: null, answers: {} };
  l.discovery.type = type || null;
  save();
  renderDetail();
}
export function saveDiscoveryAnswer(leadId, key) {
  const l = state.leads.find(x => x.id === leadId);
  if (!l) return;
  if (!l.discovery) l.discovery = { type: null, answers: {} };
  const el = document.getElementById('dq_' + leadId + '_' + key);
  if (!el) return;
  l.discovery.answers = l.discovery.answers || {};
  l.discovery.answers[key] = el.value;
  save();
}
export function updateScoreHint(leadId) {
  const scoreEl = document.getElementById('dq_' + leadId + '_h3score');
  const hintEl  = document.getElementById('dq_' + leadId + '_scorehint');
  const taEl    = document.getElementById('dq_' + leadId + '_h3fu');
  if (!scoreEl || !hintEl) return;
  const val = parseInt(scoreEl.value);
  const l = state.leads.find(x => x.id === leadId);
  if (l) {
    if (!l.discovery) l.discovery = { type: null, answers: {} };
    l.discovery.answers['h3score'] = scoreEl.value;
    save();
  }
  if (!val || isNaN(val) || val < 1 || val > 10) {
    hintEl.textContent = '';
    if (taEl) taEl.placeholder = 'Their answer…';
    return;
  }
  if (val < 8) {
    hintEl.innerHTML = '📌 Follow-up: <em>What would have made it better?</em>';
    hintEl.style.color = '#dc2626';
    if (taEl) taEl.placeholder = 'What would have made it better?';
  } else {
    hintEl.innerHTML = '📌 Follow-up: <em>What do you like most about your current setup?</em>';
    hintEl.style.color = '#10b981';
    if (taEl) taEl.placeholder = 'What do you like most about your current setup?';
  }
}
export function renderDiscoveryHtml(lead) {
  const disc = lead.discovery || { type: null, answers: {} };
  const ans  = disc.answers || {};
  const type = disc.type || '';
  const id   = lead.id;
  const taStyle = 'width:100%;box-sizing:border-box;border:1.5px solid #e2e8f0;border-radius:7px;padding:8px 10px;font-size:12px;resize:vertical;min-height:54px;font-family:inherit;color:#1e293b;background:#fafbfc;outline:none;transition:border 0.15s';
  const lblStyle = 'display:block;font-size:12px;font-weight:700;color:#334155;margin-bottom:5px;line-height:1.45';
  const qWrap = 'margin-bottom:15px';

  let questionsHtml = '';

  if (type === 'no_insurance') {
    questionsHtml = DISC_NO_INS.map((q, i) => `
      <div style="${qWrap}">
        <label style="${lblStyle}">${i+1}. ${esc(q.label)}</label>
        <textarea id="dq_${id}_${q.key}" style="${taStyle}" onblur="saveDiscoveryAnswer('${id}','${q.key}')" onfocus="this.style.border='1.5px solid #2563eb'" onblur2="this.style.border='1.5px solid #e2e8f0'" placeholder="Their answer…">${esc(ans[q.key]||'')}</textarea>
      </div>`).join('');

  } else if (type === 'has_insurance') {
    questionsHtml = DISC_HAS_INS.map((q, i) => {
      if (q.isScore) {
        const scoreVal = ans['h3score'] || '';
        const scoreNum = parseInt(scoreVal);
        const hintText = (!isNaN(scoreNum) && scoreNum >= 1 && scoreNum <= 10)
          ? (scoreNum < 8
              ? '📌 Follow-up: <em>What would have made it better?</em>'
              : '📌 Follow-up: <em>What do you like most about your current setup?</em>')
          : '';
        const hintColor = (!isNaN(scoreNum) && scoreNum < 8) ? '#dc2626' : '#10b981';
        const fuPlaceholder = (!isNaN(scoreNum) && scoreNum >= 1 && scoreNum <= 10)
          ? (scoreNum < 8 ? 'What would have made it better?' : 'What do you like most about your current setup?')
          : 'Their answer to the follow-up…';
        return `
          <div style="${qWrap}">
            <label style="${lblStyle}">${i+1}. ${esc(q.label)}</label>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <input type="number" id="dq_${id}_h3score" min="1" max="10" value="${esc(scoreVal)}"
                style="width:68px;border:1.5px solid #e2e8f0;border-radius:7px;padding:6px 10px;font-size:16px;font-weight:800;text-align:center;color:#1e293b;background:#fafbfc;outline:none"
                oninput="updateScoreHint('${id}')" placeholder="1–10">
              <span id="dq_${id}_scorehint" style="font-size:11px;font-weight:700;color:${hintColor}">${hintText}</span>
            </div>
            <textarea id="dq_${id}_h3fu" style="${taStyle}" onblur="saveDiscoveryAnswer('${id}','h3fu')" placeholder="${fuPlaceholder}">${esc(ans['h3fu']||'')}</textarea>
          </div>`;
      }
      return `
        <div style="${qWrap}">
          <label style="${lblStyle}">${i+1}. ${esc(q.label)}</label>
          <textarea id="dq_${id}_${q.key}" style="${taStyle}" onblur="saveDiscoveryAnswer('${id}','${q.key}')" placeholder="Their answer…">${esc(ans[q.key]||'')}</textarea>
        </div>`;
    }).join('');
  }

  const emptyMsg = !type ? `<div style="color:#94a3b8;font-size:12px;font-style:italic">Select a prospect type above to load the question set.</div>` : '';

  return `<div class="card">
    <div class="sec-title">🎯 Discovery Questions</div>
    <div style="margin-bottom:16px">
      <label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Prospect Type</label>
      <select onchange="setDiscoveryType('${id}', this.value)"
        style="border:1.5px solid #e2e8f0;border-radius:7px;padding:8px 12px;font-size:13px;font-weight:600;color:#1e293b;background:#fff;outline:none;width:100%;max-width:340px;cursor:pointer">
        <option value="" ${!type?'selected':''}>— Select type —</option>
        <option value="no_insurance" ${type==='no_insurance'?'selected':''}>🔵 No Health Insurance (First-Time Buyer)</option>
        <option value="has_insurance" ${type==='has_insurance'?'selected':''}>🟢 Has Health Insurance</option>
      </select>
    </div>
    ${emptyMsg}
    ${questionsHtml}
  </div>`;
}
