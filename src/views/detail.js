import { STAGES, gS, gSI } from '../data/stages.js';
import { state, getScriptBody, isEdited } from '../store.js';
import { today, fmtD, fmtDT, fuSt, addDays } from '../utils/date.js';
import { esc, escPre, log } from '../utils/dom.js';
import { CONV_STAGES } from '../data/discovery.js';
import { renderCallScript, renderLiveCallScript } from '../engines/callScript.js';
import { renderDiscoveryHtml } from '../engines/discovery.js';
import { renderScriptBody, buildRichToolbar } from '../editor/richText.js';
import { getChecks } from '../actions/tasks.js';
import { daysInStage } from '../actions/callOutcomes.js';

export function renderDetail() {
  const panel = document.getElementById(state.activeTab === 'pipeline' ? 'pipeline-detail' : 'detail');
  if(!panel) return;
  if(!state.selId){panel.innerHTML=`<div class="no-sel"><div class="ni">👥</div><h2>Select a lead</h2><p>Click a row to view details</p></div>`;return;}
  const lead = state.leads.find(l=>l.id===state.selId);
  if(!lead){state.selId=null;renderDetail();return;}
  const st = gS(lead.stageId), idx = gSI(lead.stageId), fu = fuSt(lead);
  const checks = getChecks(lead, lead.stageId);

  // Stage track (compact)
  let track = '';
  STAGES.forEach((s,i)=>{
    const dc = i<idx?'done':i===idx?'current':'future';
    const lc = i<idx?'done':i===idx?'current':'';
    const num = i<idx?'✓':(i+1);
    if(i>0) track += `<div class="st-conn-wrap"><div class="st-conn ${i<=idx?'done':''}"></div></div>`;
    track += `<div class="st-step" onclick="jumpS('${s.id}')" title="${s.label}" style="cursor:pointer">
      <div class="st-dot ${dc}">${num}</div>
      <div class="st-lbl ${lc}">${s.short}</div>
    </div>`;
  });

  // Info row
  const locationStr = [lead.city, lead.state].filter(Boolean).join(', ');
  const info = [
    lead.phone?`📞 ${esc(lead.phone)}`:'',
    lead.email?`✉️ ${esc(lead.email)}`:'',
    locationStr?`📍 ${esc(locationStr)}`:'',
    lead.company?`🏢 ${esc(lead.company)}`:'',
    lead.website?`🌐 <a href="${esc(lead.website)}" target="_blank" style="color:#2563eb;text-decoration:none">${esc(lead.website.replace(/^https?:\/\//,''))}</a>`:'',
    lead.industry?`${esc(lead.industry)}`:'',
    lead.employees?`👥 ${esc(lead.employees)} employees`:'',
    lead.source?`📌 ${esc(lead.source)}`:'',
    lead.decisionMaker?`👤 DM: ${esc(lead.decisionMaker)}`:'',
    lead.referredBy?`🤝 Ref: ${esc(lead.referredBy)}`:'',
    lead.carrier || lead.planType ? `📋 ${lead.carrier||''} ${lead.planType?'('+lead.planType+')':''}`:'',
    lead.renewalDate?`🔄 Renews ${fmtD(lead.renewalDate)}`:'',
  ].filter(Boolean).map(x=>`<span>${x}</span>`).join('');

  // Tasks HTML
  let tasksHtml = '';
  if(st.tasks.length){
    const allDone = checks.every(Boolean);
    tasksHtml = `<div class="card">
      <div class="sec-title">✅ Today's Tasks${allDone?' — All Done! 🎉':''}</div>
      <div class="task-list">
        ${st.tasks.map((t,i)=>`
          <div class="task-item ${checks[i]?'done-task':''}" onclick="toggleTask('${lead.id}','${lead.stageId}',${i})">
            <span class="task-icon">${t.icon}</span>
            <div class="task-check">${checks[i]?'✓':''}</div>
            <span class="task-label">${esc(t.label)}</span>
          </div>`).join('')}
      </div>
    </div>`;
  }

  // Scripts HTML
  let scriptsHtml = '';
  if(st.scripts.length){
    // In default (non-live-call) mode, only show Email, Text, and Voicemail scripts
    const isVisible = sc => !sc.isCallScript && (sc.tab.includes('📬') || sc.tab.includes('💬') || sc.tab.includes('📱'));
    const scriptCards = st.scripts.map((sc,si)=>{
      if(sc.isCallScript) return ''; // shown only via live call dropdown
      if(!isVisible(sc)) return ''; // hide LinkedIn, call scripts etc.

      const skey = `s|${lead.stageId}|${si}`;
      const bodyText = getScriptBody(skey, sc.body);
      const edited = isEdited(skey);
      const subjectKey = `s|${lead.stageId}|${si}|subject`;
      const subjectText = getScriptBody(subjectKey, sc.subject||'');
      const editedSubject = isEdited(subjectKey);
      const objHtml = sc.objections ? `<div style="margin-top:12px">
        <div class="call-sec-title">⚡ Objection Handlers</div>
        ${sc.objections.map((o,qi)=>{
          const okey=`s|${lead.stageId}|${si}|obj|${qi}`;
          const oText=getScriptBody(okey,o.a);
          const oEdited=isEdited(okey);
          return `<div class="objection" id="qo_${si}_${qi}">
            <div class="obj-q" onclick="toggleObj('qo_${si}_${qi}')">
              <span>${esc(o.q)}${oEdited?'<span class="edited-badge">✏️ Edited</span>':''}</span>
              <div style="display:flex;align-items:center;gap:6px">
                <button class="btn bg" style="font-size:10px;padding:2px 7px;z-index:2" onclick="event.stopPropagation();startObjEdit('${okey}','qo_${si}_${qi}')">✏️</button>
                <span class="obj-arrow">▼</span>
              </div>
            </div>
            <div class="obj-a" id="qo_body_${si}_${qi}">${escPre(oText)}</div>
          </div>`;
        }).join('')}
      </div>` : '';
      return `<div class="script-section" id="ss_${si}">
        <div class="script-header" onclick="toggleScriptCollapse(${si})">
          <div style="flex:1;min-width:0">
            <div class="script-header-title" style="display:flex;align-items:center;gap:4px">
              <span class="script-chevron">▼</span>
              ${esc(sc.tab)} — ${esc(sc.title)}${edited?'<span class="edited-badge">✏️ Edited</span>':''}
            </div>
            ${sc.subject?`<div class="script-subject" id="subj_${si}" style="margin-left:14px">${esc(subjectText)}${editedSubject?' ✏️':''}</div>`:''}
          </div>
          <div style="display:flex;gap:5px;flex-shrink:0">
            <button class="btn bg copy-btn" onclick="event.stopPropagation();copyScript(${si},'${lead.id}')" style="font-size:10px;padding:3px 8px">📋 Copy</button>
            ${sc.subject !== undefined ? `<button class="btn bg" onclick="event.stopPropagation();sendEmail(${si},'${lead.id}')" style="font-size:10px;padding:3px 8px;background:#eff6ff;color:#2563eb">📧 Send</button>` : ''}
            <button class="btn bg" onclick="event.stopPropagation();startStageEdit('${skey}',${si},'${lead.stageId}')" style="font-size:10px;padding:3px 8px">✏️ Edit</button>
          </div>
        </div>
        <div class="script-body-wrap" id="sb_${si}" style="display:none">
          <div class="script-body" id="sb_text_${si}">${renderScriptBody(bodyText)}</div>
          ${sc.note?`<div class="script-note">💡 ${esc(sc.note)}</div>`:''}
          ${sc.tip?`<div class="script-tip">${esc(sc.tip)}</div>`:''}
          ${objHtml}
        </div>
      </div>`;
    }).join('');
    const cvVal = lead.convStage || '';
    const cvStg = cvVal ? CONV_STAGES.find(s=>s.id===cvVal) : null;
    const selectorHtml = `<div class="conv-stage-bar">
      <label>📞 I'm on a call:</label>
      <select class="conv-stage-select" onchange="setConvStage('${lead.id}',this.value)">
        ${CONV_STAGES.map(s=>`<option value="${s.id}" ${cvVal===s.id?'selected':''}>${esc(s.label)}</option>`).join('')}
      </select>
    </div>`;

    if (cvVal && cvStg) {
      // LIVE CALL MODE — show only the relevant script, full width, no clutter
      const liveContent = renderLiveCallScript(cvStg);
      scriptsHtml = `<div class="card">
        <div class="sec-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📞 LIVE CALL SCRIPT</span>
          <span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:12px;background:#0369a1;color:white">${esc(cvStg.label)}</span>
        </div>
        ${selectorHtml}
        <div style="margin-top:10px">${liveContent}</div>
      </div>`;
    } else {
      // DEFAULT — show outreach scripts (emails, texts, LinkedIn) collapsed
      scriptsHtml = `<div class="card">
        <div class="sec-title">📋 Outreach Scripts</div>
        ${selectorHtml}
        <div style="margin-top:10px">${scriptCards}</div>
      </div>`;
    }
  }

  // Notes
  const notesHtml = (lead.notes||[]).length
    ? [...(lead.notes||[])].reverse().map(n => {
        const isAI = n.text.startsWith('🔍 AI Research:');
        const borderColor = isAI ? '#0369a1' : '#2563eb';
        const bg = isAI ? '#f0f9ff' : '#f8fafc';
        const label = isAI ? '<span style="font-size:9px;font-weight:800;background:#0369a1;color:white;padding:1px 6px;border-radius:10px;margin-left:6px">AI RESEARCH</span>' : '';
        const bodyText = isAI ? n.text.replace('🔍 AI Research:\n','') : n.text;
        return `<div class="note-item" style="border-left-color:${borderColor};background:${bg}">
          <div class="note-meta">${fmtDT(n.at)}${label}</div>
          <div style="white-space:pre-wrap">${esc(bodyText)}</div>
        </div>`;
      }).join('')
    : '<div style="color:#94a3b8;font-size:11px;margin-bottom:8px">No notes yet.</div>';

  // Activity
  const actHtml = (lead.activity||[]).length
    ? (lead.activity||[]).slice().reverse().map(a=>`<div class="act-item"><div class="act-dot" style="background:${a.col||'#2563eb'}"></div><div><div class="act-txt">${esc(a.txt)}</div><div class="act-time">${fmtDT(a.at)}</div></div></div>`).join('')
    : '<div style="color:#94a3b8;font-size:11px">No activity yet.</div>';

  const dayCount = daysInStage(lead);
  const stuckMsg = dayCount > 7 && !['won','lost','unqualified'].includes(lead.stageId) ? `<div style="font-size:11px;color:#f59e0b;font-weight:700;margin-top:6px">⚠️ In this stage for ${dayCount} days — consider moving forward</div>` : '';

  panel.innerHTML = `
    <div class="dh">
      <div>
        <div class="dh-name">${esc(lead.firstName)} ${esc(lead.lastName)}</div>
        <div class="dh-info">${info}</div>
        ${lead.leadDate?`<div style="font-size:10px;color:#94a3b8;margin-top:4px">Lead received: ${fmtD(lead.leadDate)}</div>`:''}
        ${stuckMsg}
      </div>
      <div class="dh-actions">
        <button class="btn bg" onclick="openEdit('${lead.id}')">✏️ Edit</button>
        <button class="btn" style="background:#f0f9ff;color:#0369a1;border:none;padding:6px 11px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer" onclick="researchLead('${lead.id}')" title="Open Claude AI to research this lead">🔍 Research</button>
        <button class="btn bd" onclick="delLead('${lead.id}')">🗑️</button>
      </div>
    </div>

    <div class="fu-bar">
      <label>📅 Next Follow-Up:</label>
      <input type="date" class="fu-input" value="${lead.nextFU||''}" onchange="setFU('${lead.id}',this.value)">
      ${fu?`<span class="fu-status ${fu.cls}">${fu.label}</span>`:''}
      <div style="flex:1"></div>
      <button class="btn bg" style="font-size:10px;padding:3px 8px" onclick="setFU('${lead.id}','${addDays(1)}')">+1d</button>
      <button class="btn bg" style="font-size:10px;padding:3px 8px" onclick="setFU('${lead.id}','${addDays(3)}')">+3d</button>
      <button class="btn bg" style="font-size:10px;padding:3px 8px" onclick="setFU('${lead.id}','${addDays(7)}')">+1wk</button>
    </div>

    <div class="call-outcomes">
      <button class="call-outcome-btn" onclick="logCallOutcome('${lead.id}','connected')">🤝 Connected</button>
      <button class="call-outcome-btn" onclick="requestCallback('${lead.id}')">📅 Callback Requested</button>
      <button class="call-outcome-btn" onclick="logCallOutcome('${lead.id}','not_interested')">🚫 Not Interested</button>
    </div>

    <div class="stage-card">
      <div class="sec-title">📊 Outreach Pipeline — ${STAGES.length} Steps Over 30 Days</div>
      ${st.theme?`<div class="theme-badge" style="background:${st.bg};color:${st.text}">${st.theme}</div>`:''}
      <div class="stage-track">${track}</div>
      <div class="stage-btns">
        ${idx>0?`<button class="btn bg" onclick="moveS('${lead.id}',-1)">← Back</button>`:''}
        <span class="stage-cur" style="background:${st.bg};color:${st.text}">${st.label}</span>
        ${idx<STAGES.length-1?`<button class="btn bp" onclick="moveS('${lead.id}',1)">Next Stage →</button>`:''}
        ${!['quoted','won','lost','unqualified'].includes(lead.stageId)?`<button class="btn" style="background:#7c3aed;color:white;border:none;padding:6px 12px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer" onclick="jumpS('quoted')">📋 Move to Quoting</button>`:''}
        ${lead.stageId!=='won'?`<button class="btn bs" onclick="jumpS('won')">✓ Mark Won</button>`:''}
        <div style="display:flex;gap:6px;margin-left:auto">
          ${lead.stageId!=='lost'?`<button class="btn bw" onclick="jumpS('lost')">Mark Lost</button>`:''}
          ${lead.stageId!=='unqualified'?`<button class="btn" style="background:#f5f3ff;color:#5b21b6;border:1.5px solid #ddd6fe;padding:6px 12px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer" onclick="jumpS('unqualified')">🚫 Unqualified</button>`:''}
        </div>
      </div>
    </div>

    ${tasksHtml}
    ${scriptsHtml}
    ${renderDiscoveryHtml(lead)}

    <div class="card">
      <div class="sec-title">📝 Notes</div>
      <div class="notes-list">${notesHtml}</div>
      <div class="note-add">
        <textarea class="note-input" id="ni_${lead.id}" placeholder="Add a note…"></textarea>
        <button class="btn bp" onclick="addNote('${lead.id}')">Add</button>
      </div>
    </div>

    <div class="card">
      <div class="sec-title">🕐 Activity Log</div>
      ${actHtml}
    </div>
  `;
}
