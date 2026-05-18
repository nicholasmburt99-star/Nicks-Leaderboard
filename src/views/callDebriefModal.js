import { state, save } from '../store.js';
import { uid, esc, log, showToast } from '../utils/dom.js';
import { renderDetail } from './detail.js';
import { renderList } from './list.js';

let _pending = null; // { leadId, outcome, afterSave }

export function openCallDebrief(leadId, outcome, afterSave) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;
  _pending = { leadId, outcome, afterSave };
  const modal = document.getElementById('callDebriefModal');
  if (!modal) return;
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.company || 'this lead';
  const outcomeLabel = outcome === 'connected' ? '🤝 Connected' : outcome === 'not_interested' ? '🚫 Not Interested' : outcome;
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:16px;font-weight:800;color:#1e293b">📞 Post-Call Debrief</div>
        <button onclick="skipCallDebrief()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#64748b">✕</button>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:16px">${esc(name)} · ${outcomeLabel} · 2 minutes to anchor what just happened</div>

      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;display:block;margin-bottom:4px">Emotion</label>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-style:italic">What did I feel most?</div>
        <textarea id="cdb-emotion" rows="2" class="cdb-textarea" placeholder="e.g. calm, frustrated, hopeful, off-balance"></textarea>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;display:block;margin-bottom:4px">Mirror</label>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-style:italic">What did I mirror well?</div>
        <textarea id="cdb-mirror" rows="2" class="cdb-textarea" placeholder="e.g. matched their pace, reflected their language back"></textarea>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;display:block;margin-bottom:4px">Micro-Win</label>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-style:italic">What can I anchor for next time?</div>
        <textarea id="cdb-microwin" rows="2" class="cdb-textarea" placeholder="e.g. opening with their pain point landed; got a soft next step"></textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid #e2e8f0">
        <button class="btn bg" onclick="skipCallDebrief()">Skip</button>
        <button class="btn bp" onclick="saveCallDebrief()">Save & Continue</button>
      </div>
    </div>`;
  modal.style.display = 'flex';
  setTimeout(() => { const el = document.getElementById('cdb-emotion'); if (el) el.focus(); }, 80);
}

function closeModal() {
  const modal = document.getElementById('callDebriefModal');
  if (modal) modal.style.display = 'none';
}

export function saveCallDebrief() {
  if (!_pending) { closeModal(); return; }
  const lead = state.leads.find(l => l.id === _pending.leadId);
  if (!lead) { closeModal(); _pending = null; return; }
  const emotion = document.getElementById('cdb-emotion')?.value.trim() || '';
  const mirror = document.getElementById('cdb-mirror')?.value.trim() || '';
  const microWin = document.getElementById('cdb-microwin')?.value.trim() || '';
  if (!emotion && !mirror && !microWin) { showToast('Capture at least one note, or click Skip.'); return; }
  lead.callDebriefs = lead.callDebriefs || [];
  lead.callDebriefs.push({
    id: uid(),
    at: new Date().toISOString(),
    outcome: _pending.outcome,
    emotion, mirror, microWin,
  });
  log(lead, `📞 Post-Call Debrief: ${[emotion && 'emotion', mirror && 'mirror', microWin && 'micro-win'].filter(Boolean).join(', ')}`, '#7c3aed');
  save();
  showToast('🧠 Debrief saved');
  const after = _pending.afterSave;
  _pending = null;
  closeModal();
  if (after) after();
  renderList();
  renderDetail();
}

export function skipCallDebrief() {
  const after = _pending && _pending.afterSave;
  _pending = null;
  closeModal();
  if (after) after();
}
