import { state, save, getScriptBody } from '../store.js';
import { gS } from '../data/stages.js';
import { today } from '../utils/date.js';
import { log, showToast, esc } from '../utils/dom.js';
import { getPlainText } from '../editor/richText.js';
import { personalize, needsReview, sendGmailMessage, createGmailDraft, getClientId, saveClientId } from '../actions/gmailApi.js';

// Each item: { lead, scriptIndex, sc, subject, body, needsReview }
let _items = [];

function buildItems() {
  const t = today();
  const items = [];
  state.leads.forEach(lead => {
    if (lead.nextFU !== t) return;
    const st = gS(lead.stageId);
    if (!st || !st.scripts) return;
    st.scripts.forEach((sc, si) => {
      // Email scripts have a subject line and are not call scripts
      if (!sc.subject || sc.isCallScript) return;
      const skey = `s|${lead.stageId}|${si}`;
      const subjKey = `s|${lead.stageId}|${si}|subject`;
      let body = personalize(getPlainText(getScriptBody(skey, sc.body || '')), lead);
      let subject = personalize(getPlainText(getScriptBody(subjKey, sc.subject || '')), lead);
      items.push({ lead, scriptIndex: si, sc, subject, body, review: needsReview(body) || needsReview(subject) });
    });
  });
  return items;
}

export function openOutreachModal() {
  const clientId = getClientId();
  _items = buildItems();

  const modal = document.getElementById('outreachModal');
  if (!modal) return;

  // ── No Client ID: show setup instructions ──────────────────────────────
  if (!clientId) {
    modal.innerHTML = `
      <div class="modal-box" style="max-width:560px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:16px;font-weight:800;color:#1e293b">📧 Connect Gmail First</div>
          <button onclick="closeOutreachModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#64748b">✕</button>
        </div>
        <p style="font-size:13px;color:#475569;margin-bottom:16px">Paste your Google Cloud OAuth Client ID below to enable batch email sending. You only do this once.</p>
        <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;line-height:1.8">
          <strong style="color:#1e293b">Setup steps (one-time, ~10 min):</strong><br>
          1. Go to <strong>console.cloud.google.com</strong><br>
          2. Create a project → enable <strong>Gmail API</strong><br>
          3. OAuth consent screen → External → fill in name + Gmail<br>
          4. Credentials → Create OAuth 2.0 Client ID → <strong>Web Application</strong><br>
          5. Authorized JavaScript origins → add <strong>https://nicks-leaderboard.vercel.app</strong><br>
          6. Copy the Client ID and paste below
        </div>
        <input id="gmailClientIdInput" type="text" placeholder="123456789-abc.apps.googleusercontent.com"
          style="width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:12px">
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button onclick="closeOutreachModal()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;font-size:13px">Cancel</button>
          <button onclick="saveGmailClientId()" style="padding:8px 18px;border:none;border-radius:8px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:13px">Save & Continue</button>
        </div>
      </div>`;
    modal.style.display = 'flex';
    return;
  }

  // ── Nothing due today ───────────────────────────────────────────────────
  if (!_items.length) {
    modal.innerHTML = `
      <div class="modal-box" style="max-width:420px;text-align:center;padding:40px 32px">
        <div style="font-size:36px;margin-bottom:12px">🎉</div>
        <div style="font-size:16px;font-weight:800;color:#1e293b;margin-bottom:8px">Nothing due today</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:24px">No leads have a follow-up date of today.</div>
        <button onclick="closeOutreachModal()" style="padding:8px 20px;border:none;border-radius:8px;background:#2563eb;color:white;font-weight:700;cursor:pointer">Done</button>
      </div>`;
    modal.style.display = 'flex';
    return;
  }

  renderOutreachModal();
  modal.style.display = 'flex';
}

function renderOutreachModal() {
  const modal = document.getElementById('outreachModal');
  if (!modal) return;

  const reviewItems = _items.filter(i => i.review);
  const readyItems  = _items.filter(i => !i.review);
  const noEmail     = _items.filter(i => !i.lead.email);
  const sendable    = _items.filter(i => i.lead.email);

  const draftRows = reviewItems.map(item => {
    const hasNoEmail = !item.lead.email;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
      <div>
        <span style="font-weight:700;color:#1e293b">${esc(item.lead.firstName)} ${esc(item.lead.lastName)}</span>
        <span style="color:#64748b;margin-left:6px">${esc(item.lead.company||'')} · ${esc(item.sc.title||item.sc.tab)}</span>
      </div>
      ${hasNoEmail ? '<span style="font-size:10px;font-weight:700;color:#dc2626">skip — no email</span>' : '<span style="color:#f59e0b;font-size:11px;font-weight:700">📝 will draft</span>'}
    </div>`;
  }).join('');

  const readyRows = readyItems.map(item => {
    const hasNoEmail = !item.lead.email;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
      <div>
        <span style="font-weight:700;color:#1e293b">${esc(item.lead.firstName)} ${esc(item.lead.lastName)}</span>
        <span style="color:#64748b;margin-left:6px">${esc(item.lead.company||'')} · ${esc(item.sc.title||item.sc.tab)}</span>
      </div>
      ${hasNoEmail ? '<span style="font-size:10px;font-weight:700;color:#dc2626">skip — no email</span>' : '<span style="color:#10b981;font-size:11px;font-weight:700">✓ ready</span>'}
    </div>`;
  }).join('');

  const total = _items.length;
  const sendableReady = sendable.filter(i => !i.review).length;
  const sendableDraft = sendable.filter(i => i.review).length;
  const btnLabel = sendableDraft
    ? `Send ${sendableReady} · Draft ${sendableDraft} →`
    : `Send ${sendableReady} Email${sendableReady!==1?'s':''} →`;

  modal.innerHTML = `
    <div class="modal-box" style="max-width:620px;max-height:85vh;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-shrink:0">
        <div style="font-size:16px;font-weight:800;color:#1e293b">📧 Send Today's Outreach</div>
        <button onclick="closeOutreachModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#64748b">✕</button>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:16px;flex-shrink:0">${total} lead${total!==1?'s':''} due today${noEmail.length?' · '+noEmail.length+' will be skipped (no email address)':''}</div>

      <div style="overflow-y:auto;flex:1;padding-right:4px">
        ${readyItems.length ? `
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:#10b981;margin-bottom:8px">✅ Ready to Send (${readyItems.length})</div>
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:4px 14px;background:white;margin-bottom:16px">${readyRows}</div>
        ` : ''}

        ${reviewItems.length ? `
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:#f59e0b;margin-bottom:8px">📝 Will Become Gmail Drafts (${reviewItems.length})</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px">These emails still have [brackets] — they'll be saved as drafts in your Gmail. Finish them from your inbox.</div>
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:4px 14px;background:white">${draftRows}</div>
        ` : ''}
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-shrink:0;padding-top:12px;border-top:1px solid #e2e8f0">
        <button onclick="closeOutreachModal()" style="padding:9px 18px;border:1px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;font-size:13px;font-weight:600">Cancel</button>
        <button onclick="sendAllOutreach()" id="om-send-btn"
          style="padding:9px 20px;border:none;border-radius:8px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:13px">
          ${btnLabel}
        </button>
      </div>
    </div>`;
}

export function closeOutreachModal() {
  const modal = document.getElementById('outreachModal');
  if (modal) modal.style.display = 'none';
  _items = [];
}

export function saveGmailClientId() {
  const val = document.getElementById('gmailClientIdInput')?.value?.trim();
  if (!val) { showToast('Paste your Client ID first'); return; }
  saveClientId(val);
  _items = buildItems();
  if (!_items.length) {
    closeOutreachModal();
    showToast('✅ Gmail connected! No leads due today.');
  } else {
    renderOutreachModal();
  }
}

// Called by inline oninput handlers to keep _items in sync with edits
window._omUpdate = function(idx, field, val) {
  if (_items[idx]) _items[idx][field] = val;
};

export async function sendAllOutreach() {
  const btn = document.getElementById('om-send-btn');
  const origLabel = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Working…'; }

  const toProcess = _items.filter(i => i.lead.email);
  console.log('[outreach] Processing', toProcess.length, 'emails');
  showToast(`📧 Starting outreach for ${toProcess.length}…`);

  let sent = 0, drafted = 0, failed = 0;

  for (const item of toProcess) {
    const action = item.review ? 'draft' : 'send';
    try {
      if (item.review) {
        await createGmailDraft(item.lead.email, item.subject, item.body);
        log(item.lead, `Gmail draft created — finish in Gmail: ${item.sc.title || item.sc.tab}`, '#f59e0b');
        console.log('[outreach] drafted', item.lead.email);
        drafted++;
      } else {
        await sendGmailMessage(item.lead.email, item.subject, item.body);
        log(item.lead, `Email sent via Gmail: ${item.sc.title || item.sc.tab}`, '#2563eb');
        console.log('[outreach] sent', item.lead.email);
        sent++;
      }
    } catch (err) {
      console.error('[outreach] failed', action, item.lead.email, err.message);
      if (err.message === 'NO_CLIENT_ID') {
        showToast('Gmail not connected — add your Client ID first');
        if (btn) { btn.disabled = false; btn.textContent = origLabel; }
        return;
      }
      if (err.message.includes('popup') || err.message.includes('access_denied')) {
        showToast('Gmail authorization cancelled');
        if (btn) { btn.disabled = false; btn.textContent = origLabel; }
        return;
      }
      log(item.lead, `Email ${action} failed: ${item.sc.title || item.sc.tab} — ${err.message}`, '#dc2626');
      failed++;
    }
  }

  save();
  closeOutreachModal();
  const parts = [];
  if (sent) parts.push(`📧 Sent ${sent}`);
  if (drafted) parts.push(`📝 Drafted ${drafted}`);
  if (failed) parts.push(`❌ Failed ${failed}`);
  showToast(parts.join(' · ') || 'No emails to send');
}
