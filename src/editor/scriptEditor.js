import { STAGES } from '../data/stages.js';
import { state, save, saveScriptOverrides, getScriptBody, isEdited } from '../store.js';
import { esc, escPre } from '../utils/dom.js';
import { renderScriptBody, buildRichToolbar, getRichVal, getPlainText, toRichHtml } from './richText.js';
import { renderCallScript } from '../engines/callScript.js';
import { renderDetail } from '../views/detail.js';

export function startStageEdit(key, si, stageId) {
  const bodyEl = document.getElementById('sb_text_' + si);
  const wrap = document.getElementById('sb_' + si);
  if (!bodyEl || !wrap || wrap.querySelector('.rich-edit-area')) return;
  // Expand if collapsed
  if (wrap.style.display === 'none') {
    wrap.style.display = '';
    const section = document.getElementById('ss_' + si);
    if (section) section.classList.add('open');
  }
  const st = gS(stageId);
  const defaultText = st.scripts[si] ? st.scripts[si].body : '';
  const current = getScriptBody(key, defaultText);
  bodyEl.style.display = 'none';
  const editDiv = document.createElement('div');
  editDiv.id = 'edit_ui_' + si;
  editDiv.innerHTML = `${buildRichToolbar()}
    <div class="rich-edit-area" id="edit_re_${si}" contenteditable="true">${toRichHtml(current)}</div>
    <div class="script-edit-actions">
      <button class="btn bs" onclick="saveStageEdit('${key}',${si},'${stageId}')">💾 Save</button>
      <button class="btn bg" onclick="cancelStageEdit(${si})">Cancel</button>
      ${isEdited(key)?`<button class="btn bw" onclick="resetStageEdit('${key}',${si},'${stageId}')" style="margin-left:auto">↩ Reset to Default</button>`:''}
    </div>`;
  bodyEl.after(editDiv);
  const re = document.getElementById('edit_re_' + si);
  if (re) re.focus();
}
export function saveStageEdit(key, si, stageId) {
  const html = getRichVal('edit_re_' + si);
  if (html === null) return;
  state.scriptOverrides[key] = html;
  saveScriptOverrides();
  showToast('✅ Script saved!');
  renderDetail();
}
export function cancelStageEdit(si) {
  const editDiv = document.getElementById('edit_ui_' + si);
  const bodyEl = document.getElementById('sb_text_' + si);
  if (editDiv) editDiv.remove();
  if (bodyEl) bodyEl.style.display = '';
}
export function resetStageEdit(key, si, stageId) {
  if (!confirm('Reset this script to the default text?')) return;
  delete state.scriptOverrides[key];
  saveScriptOverrides();
  showToast('↩ Reset to default');
  renderDetail();
}
export function startCallEdit(key, i, sectionId) {
  const bodyEl = document.getElementById('cs_body_' + i);
  const block = document.getElementById('cs_' + i);
  if (!bodyEl || !block || block.querySelector('.rich-edit-area')) return;
  const sec = CALL_SCRIPT.find(s => s.id === sectionId);
  const defaultText = sec ? sec.body : '';
  const current = getScriptBody(key, defaultText);
  bodyEl.style.display = 'none';
  block.classList.add('open');
  const editDiv = document.createElement('div');
  editDiv.id = 'call_edit_ui_' + i;
  editDiv.innerHTML = `${buildRichToolbar()}
    <div class="rich-edit-area" id="call_re_${i}" contenteditable="true">${toRichHtml(current)}</div>
    <div class="call-edit-actions">
      <button class="btn bs" onclick="saveCallEdit('${key}',${i})">💾 Save</button>
      <button class="btn bg" onclick="cancelCallEdit(${i})">Cancel</button>
      ${isEdited(key)?`<button class="btn bw" onclick="resetCallEdit('${key}',${i})" style="margin-left:auto">↩ Reset to Default</button>`:''}
    </div>`;
  bodyEl.after(editDiv);
  const re = document.getElementById('call_re_' + i);
  if (re) re.focus();
}
export function saveCallEdit(key, i) {
  const html = getRichVal('call_re_' + i);
  if (html === null) return;
  state.scriptOverrides[key] = html;
  saveScriptOverrides();
  showToast('✅ Script saved!');
  renderDetail();
}
export function cancelCallEdit(i) {
  const editDiv = document.getElementById('call_edit_ui_' + i);
  const bodyEl = document.getElementById('cs_body_' + i);
  if (editDiv) editDiv.remove();
  if (bodyEl) bodyEl.style.display = '';
}
export function resetCallEdit(key, i) {
  if (!confirm('Reset this section to the default text?')) return;
  delete state.scriptOverrides[key];
  saveScriptOverrides();
  showToast('↩ Reset to default');
  renderDetail();
}
export function startObjEdit(key, blockId) {
  const bodyId = blockId.replace('cso_', 'cso_body_').replace('qo_', 'qo_body_').replace('lobj_', 'lobj_') + (blockId.startsWith('lobj_') ? '_body' : '');
  const bodyEl = document.getElementById(bodyId);
  const block = document.getElementById(blockId);
  if (!bodyEl || !block || block.querySelector('.rich-edit-area')) return;
  const current = getScriptBody(key, bodyEl.textContent);
  bodyEl.style.display = 'none';
  block.classList.add('open');
  const editDiv = document.createElement('div');
  editDiv.id = 'obj_edit_' + blockId;
  editDiv.innerHTML = `${buildRichToolbar()}
    <div class="rich-edit-area" id="obj_re_${blockId}" contenteditable="true" style="min-height:80px">${toRichHtml(current)}</div>
    <div class="call-edit-actions">
      <button class="btn bs" onclick="saveObjEdit('${key}','${blockId}')">💾 Save</button>
      <button class="btn bg" onclick="cancelObjEdit('${blockId}')">Cancel</button>
      ${isEdited(key)?`<button class="btn bw" onclick="resetObjEdit('${key}','${blockId}')" style="margin-left:auto">↩ Reset to Default</button>`:''}
    </div>`;
  bodyEl.after(editDiv);
  const re = document.getElementById('obj_re_' + blockId);
  if (re) re.focus();
}
export function saveObjEdit(key, blockId) {
  const html = getRichVal('obj_re_' + blockId);
  if (html === null) return;
  state.scriptOverrides[key] = html;
  saveScriptOverrides();
  showToast('✅ Saved!');
  renderDetail();
}
export function cancelObjEdit(blockId) {
  const editDiv = document.getElementById('obj_edit_' + blockId);
  const bodyId = blockId.replace('cso_', 'cso_body_').replace('qo_', 'qo_body_');
  const bodyEl = document.getElementById(bodyId);
  if (editDiv) editDiv.remove();
  if (bodyEl) bodyEl.style.display = '';
}
export function resetObjEdit(key, blockId) {
  if (!confirm('Reset to the default response?')) return;
  delete state.scriptOverrides[key];
  saveScriptOverrides();
  showToast('↩ Reset to default');
  renderDetail();
}
export function escForVal(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
