import { STAGES } from '../data/stages.js';
import { state, save } from '../store.js';
import { gS } from '../data/stages.js';
import { today, addDays } from '../utils/date.js';
import { uid, esc, log, showToast } from '../utils/dom.js';
import { getPlainText } from '../editor/richText.js';
import { getScriptBody } from '../store.js';
import { renderList } from '../views/list.js';
import { renderDetail } from '../views/detail.js';
import { renderQueue } from '../views/queue.js';

export function clearF(){['fF','fL','fP','fE','fCity','fSt','fWeb','fCo','fInd','fEmp','fLD','fN','fSrc','fDM','fRef','fCarrier','fPlan','fRenew'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});}
export function openAdd(){
  state.editId=null;
  document.getElementById('mtitle').textContent='➕ Add New Lead';
  document.getElementById('mSave').textContent='Add Lead';
  document.getElementById('mSave').onclick=saveLead;
  clearF();
  document.getElementById('fLD').value=today();
  document.getElementById('fSt').value='CA';
  document.getElementById('modal').style.display='flex';
}
export function openEdit(leadId){
  const l=state.leads.find(x=>x.id===leadId);if(!l)return;
  state.editId=leadId;
  document.getElementById('mtitle').textContent='✏️ Edit Lead';
  document.getElementById('mSave').textContent='Save Changes';
  document.getElementById('mSave').onclick=saveLead;
  document.getElementById('fF').value=l.firstName||'';
  document.getElementById('fL').value=l.lastName||'';
  document.getElementById('fP').value=l.phone||'';
  document.getElementById('fE').value=l.email||'';
  document.getElementById('fCity').value=l.city||'';
  document.getElementById('fSt').value=l.state||'';
  document.getElementById('fWeb').value=l.website||'';
  document.getElementById('fCo').value=l.company||'';
  document.getElementById('fInd').value=l.industry||'';
  document.getElementById('fDM').value=l.decisionMaker||'';
  document.getElementById('fEmp').value=l.employees||'';
  document.getElementById('fLD').value=l.leadDate||'';
  document.getElementById('fSrc').value=l.source||'';
  document.getElementById('fRef').value=l.referredBy||'';
  document.getElementById('fCarrier').value=l.carrier||'';
  document.getElementById('fPlan').value=l.planType||'';
  document.getElementById('fRenew').value=l.renewalDate||'';
  document.getElementById('fN').value='';
  document.getElementById('modal').style.display='flex';
}
export function closeModal(){document.getElementById('modal').style.display='none';state.editId=null;}
export function saveLead(){
  const fn=document.getElementById('fF').value.trim();
  const ln=document.getElementById('fL').value.trim();
  const ph=document.getElementById('fP').value.trim();
  if(!fn||!ln||!ph){alert('First Name, Last Name, and Phone are required.');return;}
  if(state.editId){
    const l=state.leads.find(x=>x.id===state.editId);if(!l)return;
    l.firstName=fn;l.lastName=ln;l.phone=ph;
    l.email=document.getElementById('fE').value.trim();
    l.city=document.getElementById('fCity').value.trim();
    l.state=document.getElementById('fSt').value.trim().toUpperCase();
    l.website=document.getElementById('fWeb').value.trim();
    l.company=document.getElementById('fCo').value.trim();
    l.industry=document.getElementById('fInd').value.trim();
    l.decisionMaker=document.getElementById('fDM').value.trim();
    l.employees=document.getElementById('fEmp').value;
    l.leadDate=document.getElementById('fLD').value;
    l.source=document.getElementById('fSrc').value;
    l.referredBy=document.getElementById('fRef').value.trim();
    l.carrier=document.getElementById('fCarrier').value.trim();
    l.planType=document.getElementById('fPlan').value.trim();
    l.renewalDate=document.getElementById('fRenew').value;
    log(l,'Lead info updated','#64748b');
    save();closeModal();renderList();renderDetail();
  }else{
    const note=document.getElementById('fN').value.trim();
    const l={
      id:uid(),firstName:fn,lastName:ln,phone:ph,
      email:document.getElementById('fE').value.trim(),
      city:document.getElementById('fCity').value.trim(),
      state:document.getElementById('fSt').value.trim().toUpperCase(),
      website:document.getElementById('fWeb').value.trim(),
      company:document.getElementById('fCo').value.trim(),
      industry:document.getElementById('fInd').value.trim(),
      decisionMaker:document.getElementById('fDM').value.trim(),
      employees:document.getElementById('fEmp').value,
      leadDate:document.getElementById('fLD').value,
      source:document.getElementById('fSrc').value,
      referredBy:document.getElementById('fRef').value.trim(),
      carrier:document.getElementById('fCarrier').value.trim(),
      planType:document.getElementById('fPlan').value.trim(),
      renewalDate:document.getElementById('fRenew').value,
      stageId:'new',nextFU:today(),taskChecks:{},
      notes:note?[{text:note,at:new Date().toISOString()}]:[],
      activity:[{txt:'Lead added to CRM',col:'#3b82f6',at:new Date().toISOString()}],
      createdAt:new Date().toISOString()
    };
    state.leads.unshift(l);save();closeModal();state.selId=l.id;renderList();renderDetail();
  }
}
export function delLead(leadId){
  if(!confirm('Delete this lead? This cannot be undone.'))return;
  state.leads=state.leads.filter(l=>l.id!==leadId);state.selId=null;save();renderList();renderDetail();
}
export function copyScript(si, leadId){
  const l=state.leads.find(x=>x.id===leadId);if(!l)return;
  const st=gS(l.stageId);const sc=st.scripts[si];if(!sc||!sc.body)return;
  const skey=`s|${l.stageId}|${si}`;
  const subjectKey=`s|${l.stageId}|${si}|subject`;
  let rawBody=getScriptBody(skey,sc.body);
  let rawSubj=getScriptBody(subjectKey,sc.subject||'');
  // Strip HTML from rich-edited content
  rawBody=getPlainText(rawBody);
  rawSubj=getPlainText(rawSubj);
  let txt=(rawSubj?rawSubj+'\n\n':'')+rawBody;
  const areaStr = [l.city, l.state].filter(Boolean).join(', ') || '[area]';
  txt=txt.replace(/\[Name\]/g,l.firstName||'[Name]').replace(/\[Prospect's Name\]/g,l.firstName||'[Name]')
         .replace(/\[Company\]/g,l.company||'[Company]')
         .replace(/\[area\]/g,areaStr)
         .replace(/\[X\]\+/g,(l.employees||'[X]')+'+');
  navigator.clipboard.writeText(txt).then(()=>showToast('📋 Copied!')).catch(()=>{});
}
export function addNote(leadId){
  const inp=document.getElementById('ni_'+leadId);
  if(!inp||!inp.value.trim())return;
  const l=state.leads.find(x=>x.id===leadId);if(!l)return;
  l.notes=l.notes||[];l.notes.push({text:inp.value.trim(),at:new Date().toISOString()});
  log(l,'Note added','#64748b');save();renderDetail();
}
export function researchLead(leadId) {
  const l = state.leads.find(x => x.id === leadId);
  if (!l) return;
  const name = [l.firstName, l.lastName].filter(Boolean).join(' ');
  const company = l.company || '';
  const website = l.website || '';
  const industry = l.industry || '';
  const city = [l.city, l.state].filter(Boolean).join(', ');
  const employees = l.employees ? `~${l.employees} employees` : '';

  const contextParts = [
    company && `Company: ${company}`,
    website && `Website: ${website}`,
    industry && `Industry: ${industry}`,
    city && `Location: ${city}`,
    employees,
  ].filter(Boolean).join('\n');

  const prompt = `I'm a health insurance broker preparing for a cold outreach call. Please research this lead and give me a quick briefing:

Contact: ${name}
${contextParts}

Please tell me:
1. What does this company do and who do they serve?
2. Approximate company size and any recent news or changes
3. Who is likely the decision-maker for employee health benefits?
4. What pain points around health insurance might they have?
5. A specific, personalized opening line I could use to start the call

Keep it concise — I need this in under 2 minutes before I dial.`;

  const url = 'https://claude.ai/new?q=' + encodeURIComponent(prompt);
  window.open(url, '_blank');

  // Show paste-back panel in the detail view
  const existingPanel = document.getElementById('research_panel_' + leadId);
  if (existingPanel) { existingPanel.querySelector('.research-textarea').focus(); return; }

  const panel = document.createElement('div');
  panel.className = 'research-panel';
  panel.id = 'research_panel_' + leadId;
  panel.innerHTML = `
    <div class="research-panel-title">🔍 AI Research — ${esc(name)}${company ? ' · ' + esc(company) : ''}</div>
    <div class="research-panel-sub">Claude opened in a new tab. Once you have the research, paste it below and click <strong>Save to Notes</strong>.</div>
    <textarea class="research-textarea" id="research_ta_${leadId}" placeholder="Paste Claude's research response here…"></textarea>
    <div class="research-panel-actions">
      <button class="btn bp" style="font-size:12px" onclick="saveResearchNote('${leadId}')">💾 Save to Notes</button>
      <button class="btn bg" style="font-size:12px" onclick="dismissResearch('${leadId}')">Dismiss</button>
    </div>`;

  // Insert just above the Notes card
  const detail = document.getElementById('detail');
  if (detail) {
    const notesCard = [...detail.querySelectorAll('.card')].find(c => c.textContent.includes('📝 Notes'));
    if (notesCard) notesCard.parentNode.insertBefore(panel, notesCard);
    else detail.querySelector('.detail') ? detail.querySelector('.detail').prepend(panel) : detail.prepend(panel);
  }
  setTimeout(() => panel.querySelector('.research-textarea').focus(), 100);
}
export function saveResearchNote(leadId) {
  const ta = document.getElementById('research_ta_' + leadId);
  if (!ta || !ta.value.trim()) { showToast('Paste the research first.'); return; }
  const l = state.leads.find(x => x.id === leadId);
  if (!l) return;
  l.notes = l.notes || [];
  l.notes.push({ text: '🔍 AI Research:\n' + ta.value.trim(), at: new Date().toISOString() });
  log(l, 'AI research saved to notes', '#0369a1');
  save();
  dismissResearch(leadId);
  renderDetail();
  showToast('✅ Research saved to notes!');
}
export function dismissResearch(leadId) {
  const panel = document.getElementById('research_panel_' + leadId);
  if (panel) panel.remove();
}
export function sendEmail(si, leadId) {
  const l = state.leads.find(x => x.id === leadId); if (!l) return;
  const st = gS(l.stageId);
  const sc = st.scripts[si]; if (!sc) return;
  const skey = `s|${l.stageId}|${si}`;
  let bodyText = getPlainText(getScriptBody(skey, sc.body || ''));
  const subjectKey = `s|${l.stageId}|${si}|subject`;
  let subjectText = getPlainText(getScriptBody(subjectKey, sc.subject || ''));
  // Personalize
  const areaVal = [l.city, l.state].filter(Boolean).join(', ') || '[area]';
  bodyText = bodyText
    .replace(/\[Name\]/g, l.firstName||'[Name]')
    .replace(/\[Prospect's Name\]/g, l.firstName||'[Name]')
    .replace(/\[Company\]/g, l.company||'[Company]')
    .replace(/\[area\]/g, areaVal)
    .replace(/\[X\]\+/g, (l.employees||'[X]')+'+');
  subjectText = subjectText
    .replace(/\[Prospect's Name\]/g, l.firstName||'[Name]')
    .replace(/\[Name\]/g, l.firstName||'[Name]');
  const mailto = `mailto:${encodeURIComponent(l.email||'')}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
  window.open(mailto, '_blank');
  log(l, `Email draft opened: ${sc.title||sc.tab}`, '#2563eb');
  save();
}
