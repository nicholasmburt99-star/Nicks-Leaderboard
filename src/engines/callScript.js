import { CALL_SCRIPT, CALL_OBJECTIONS } from '../data/callScript.js';
import { CONV_STAGES } from '../data/discovery.js';
import { state, save, getScriptBody, isEdited } from '../store.js';
import { esc, escPre, log } from '../utils/dom.js';
import { renderScriptBody } from '../editor/richText.js';

export function renderCallScript() {
  const sections = CALL_SCRIPT.map((s,i)=>{
    const key = `c|${s.id}`;
    const body = getScriptBody(key, s.body);
    const edited = isEdited(key);
    return `
    <div class="call-block" id="cs_${i}">
      <div class="call-block-q" onclick="toggleCS('cs_${i}')">
        <span>${esc(s.title)}${edited?'<span class="edited-badge">✏️ Edited</span>':''}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn bg" style="font-size:10px;padding:3px 8px;z-index:2" onclick="event.stopPropagation();startCallEdit('${key}',${i},'${s.id}')">✏️ Edit</button>
          <span class="call-arrow">▼</span>
        </div>
      </div>
      <div class="call-block-body" id="cs_body_${i}">${renderScriptBody(body)}</div>
    </div>`;
  }).join('');
  const objections = CALL_OBJECTIONS.map((o,i)=>{
    const key = `co|${i}`;
    const aText = getScriptBody(key, o.a);
    const edited = isEdited(key);
    return `
    <div class="objection" id="cso_${i}">
      <div class="obj-q" onclick="toggleObj('cso_${i}')">
        <span>${esc(o.q)}${edited?'<span class="edited-badge">✏️ Edited</span>':''}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn bg" style="font-size:10px;padding:3px 8px;z-index:2" onclick="event.stopPropagation();startObjEdit('${key}',${i})">✏️ Edit</button>
          <span class="obj-arrow">▼</span>
        </div>
      </div>
      <div class="obj-a" id="cso_body_${i}">${renderScriptBody(aText)}</div>
    </div>`;
  }).join('');
  return `<div class="call-section">${sections}</div>
    <div class="call-sec-title">⚡ Objection Handlers</div>
    ${objections}`;
}
export function setConvStage(leadId, val) {
  const l = state.leads.find(x => x.id === leadId); if (!l) return;
  l.convStage = val;
  if (val) {
    const stg = CONV_STAGES.find(s => s.id === val);
    log(l, `Live call: ${stg ? stg.label : val}`, '#0369a1');
  }
  save(); renderDetail();
}
export function renderLiveCallScript(stg) {
  if (!stg || !stg.scriptIds || !stg.scriptIds.length) return '';
  let html = '';
  stg.scriptIds.forEach(sid => {
    if (sid === '__objections__') {
      html += `<div class="call-sec-title" style="margin-bottom:8px">⚡ Objection Handlers — tap to expand</div>`;
      CALL_OBJECTIONS.forEach((o, i) => {
        const key = `co|${i}`;
        const aText = getScriptBody(key, o.a);
        const edited = isEdited(key);
        html += `<div class="objection" id="lobj_${i}">
          <div class="obj-q" onclick="toggleObj('lobj_${i}')">
            <span>${esc(o.q)}${edited ? '<span class="edited-badge">✏️ Edited</span>' : ''}</span>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="btn bg" style="font-size:10px;padding:2px 7px;z-index:2" onclick="event.stopPropagation();startObjEdit('${key}','lobj_${i}')">✏️</button>
              <span class="obj-arrow">▼</span>
            </div>
          </div>
          <div class="obj-a" id="lobj_${i}_body">${renderScriptBody(aText)}</div>
        </div>`;
      });
      return;
    }
    if (sid === '__done__') {
      html += `<div style="text-align:center;padding:24px 16px">
        <div style="font-size:32px;margin-bottom:10px">🎉</div>
        <div style="font-size:15px;font-weight:800;color:#1e293b;margin-bottom:6px">Call Complete</div>
        <div style="font-size:12px;color:#64748b;line-height:1.6">Log a note below, set your next follow-up date, and advance the lead to the next stage.</div>
      </div>`;
      return;
    }
    const idx = CALL_SCRIPT.findIndex(s => s.id === sid);
    if (idx === -1) return;
    const s = CALL_SCRIPT[idx];
    const key = `c|${s.id}`;
    const body = getScriptBody(key, s.body);
    const edited = isEdited(key);
    // Use the same cs_${idx} / cs_body_${idx} IDs so startCallEdit() works correctly
    html += `<div class="call-block open" id="cs_${idx}" style="margin-bottom:10px">
      <div class="call-block-q" style="cursor:default;background:#f8fafc">
        <span style="font-size:13px;font-weight:800;color:#1e293b">${esc(s.title)}${edited ? '<span class="edited-badge" style="margin-left:6px">✏️ Edited</span>' : ''}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="btn bg" style="font-size:10px;padding:3px 8px;z-index:2" onclick="event.stopPropagation();navigator.clipboard.writeText(document.getElementById('cs_body_${idx}').textContent).then(()=>showToast('📋 Copied!'))">📋 Copy</button>
          <button class="btn bg" style="font-size:10px;padding:3px 8px;z-index:2" onclick="event.stopPropagation();startCallEdit('${key}',${idx},'${s.id}')">✏️ Edit</button>
        </div>
      </div>
      <div class="call-block-body" id="cs_body_${idx}" style="display:block;font-size:13px;line-height:1.85;padding:16px 18px">${renderScriptBody(body)}</div>
    </div>`;
  });
  return html;
}
