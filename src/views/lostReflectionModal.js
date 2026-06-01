import { state, save } from '../store.js';
import { esc, log, showToast } from '../utils/dom.js';
import { renderDetail } from './detail.js';
import { renderList } from './list.js';

let _pending = null; // { leadId, afterSave }

export function openLostReflection(leadId, afterSave) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) { if (afterSave) afterSave(); return; }
  _pending = { leadId, afterSave };
  const modal = document.getElementById('lostReflectionModal');
  if (!modal) { if (afterSave) afterSave(); return; }
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.company || 'this lead';
  const r = lead.lostReflection || { signal: '', sequence: '', self: '' };
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px;border-top:4px solid #f59e0b">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:16px;font-weight:800;color:#92400e">🧠 Lost Reflection</div>
        <button onclick="skipLostReflection()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#64748b">✕</button>
      </div>
      <div style="font-size:12px;color:#78350f;margin-bottom:16px">${esc(name)} · Three questions to learn from this loss. Be honest — the patterns repeat unless you spot them.</div>

      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#92400e;display:block;margin-bottom:4px">Signal</label>
        <div style="font-size:11px;color:#b45309;margin-bottom:4px;font-style:italic">What belief did the buyer hold that you didn't disarm?</div>
        <textarea id="lref-signal" rows="2" class="cdb-textarea">${esc(r.signal || '')}</textarea>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#92400e;display:block;margin-bottom:4px">Sequence</label>
        <div style="font-size:11px;color:#b45309;margin-bottom:4px;font-style:italic">Where in your cadence did trust weaken?</div>
        <textarea id="lref-sequence" rows="2" class="cdb-textarea">${esc(r.sequence || '')}</textarea>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#92400e;display:block;margin-bottom:4px">Self</label>
        <div style="font-size:11px;color:#b45309;margin-bottom:4px;font-style:italic">What emotion drove your reaction — ego, fear, or frustration?</div>
        <textarea id="lref-self" rows="2" class="cdb-textarea">${esc(r.self || '')}</textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid #e2e8f0">
        <button class="btn bg" onclick="skipLostReflection()">Skip for now</button>
        <button class="btn bp" onclick="saveLostReflectionModal()">Save Reflection</button>
      </div>
    </div>`;
  modal.style.display = 'flex';
  setTimeout(() => { const el = document.getElementById('lref-signal'); if (el) el.focus(); }, 80);
}

function closeModal() {
  const modal = document.getElementById('lostReflectionModal');
  if (modal) modal.style.display = 'none';
}

export function saveLostReflectionModal() {
  if (!_pending) { closeModal(); return; }
  const lead = state.leads.find(l => l.id === _pending.leadId);
  if (!lead) { closeModal(); _pending = null; return; }
  const signal = document.getElementById('lref-signal')?.value.trim() || '';
  const sequence = document.getElementById('lref-sequence')?.value.trim() || '';
  const self = document.getElementById('lref-self')?.value.trim() || '';
  if (!signal && !sequence && !self) { showToast('Capture at least one answer, or click Skip for now.'); return; }
  lead.lostReflection = { signal, sequence, self };
  log(lead, `🧠 Lost Reflection: ${[signal && 'signal', sequence && 'sequence', self && 'self'].filter(Boolean).join(', ')}`, '#f59e0b');
  save();
  showToast('🧠 Reflection saved');
  const after = _pending.afterSave;
  _pending = null;
  closeModal();
  if (after) after();
  renderList();
  renderDetail();
}

export function skipLostReflection() {
  const after = _pending && _pending.afterSave;
  _pending = null;
  closeModal();
  if (after) after();
}
