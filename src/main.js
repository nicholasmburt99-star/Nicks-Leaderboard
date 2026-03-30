import './style.css';
import { CALL_SCRIPT, CALL_OBJECTIONS } from './data/callScript.js';
import { DISC_NO_INS, DISC_HAS_INS, CONV_STAGES } from './data/discovery.js';
import { STAGES } from './data/stages.js';
import { today, skipWeekend, addDays, fmtD, fmtDT, fuSt } from './utils/date.js';
import { uid, esc, escPre, log, showToast } from './utils/dom.js';
import { state, save, saveScriptOverrides, getScriptBody, isEdited } from './store.js';
import { gS, gSI } from './data/stages.js';
import { getChecks, toggleTask } from './actions/tasks.js';
import { renderList } from './views/list.js';
import { renderDetail } from './views/detail.js';
import { renderOverview } from './views/overview.js';
import { renderKanban } from './views/kanban.js';
import { renderLost } from './views/lost.js';
import { renderPipeline, selectPipelineLead, cyclePipelineRisk, setPipelineCategory, setPipelineNextSteps, setPipelineStage, setPipelineNextOutreach, setPipelineFilter } from './views/pipeline.js';
import { openOutreachModal, closeOutreachModal, sendAllOutreach, saveGmailClientId } from './views/outreachModal.js';
import { renderCallScript, renderLiveCallScript, setConvStage } from './engines/callScript.js';
import { setDiscoveryType, saveDiscoveryAnswer, updateScoreHint, renderDiscoveryHtml } from './engines/discovery.js';
import { fmtRich, buildRichToolbar, getPlainText, toRichHtml, getRichVal, renderScriptBody } from './editor/richText.js';
import { startStageEdit, saveStageEdit, cancelStageEdit, resetStageEdit, startCallEdit, saveCallEdit, cancelCallEdit, resetCallEdit, startObjEdit, saveObjEdit, cancelObjEdit, resetObjEdit, escForVal } from './editor/scriptEditor.js';
import { selLead, onSearch, setF, moveS, jumpS, setFU, toggleCS, toggleObj, toggleScriptBody, toggleScriptCollapse } from './actions/pipeline.js';
import { clearF, openAdd, openEdit, closeModal, saveLead, delLead, copyScript, addNote, deleteNote, startNoteEdit, saveNoteEdit, researchLead, saveResearchNote, dismissResearch, saveResearch, saveLostReason, sendEmail } from './actions/leads.js';
import { daysInStage, logCallOutcome, requestCallback } from './actions/callOutcomes.js';
import { exportCSV, exportJSON, parseJSONFile, openImport, closeImport, parsePaste, doImport, addImportRow, parseCSVFile } from './actions/importExport.js';
import { switchTab, goToLead } from './tabs.js';
import { setReContact, reengageLead } from './views/lost.js';
import { kanbanScrollStart, kanbanScrollStop, kanbanDragStart, kanbanDragEnd, kanbanDragOver, kanbanDragLeave, kanbanDrop } from './views/kanban.js';

Object.assign(window, {
  selLead, onSearch, setF, moveS, jumpS, setFU, goToLead, switchTab,
  renderList, renderDetail, renderOverview, renderKanban, renderLost, renderPipeline,
  selectPipelineLead, cyclePipelineRisk, setPipelineCategory, setPipelineNextSteps,
  setPipelineStage, setPipelineNextOutreach, setPipelineFilter,
  openAdd, openEdit, closeModal, saveLead, delLead, copyScript, sendEmail, addNote, deleteNote, startNoteEdit, saveNoteEdit,
  researchLead, saveResearchNote, dismissResearch, saveResearch, saveLostReason,
  logCallOutcome, requestCallback,
  exportCSV, exportJSON, parseJSONFile, openImport, closeImport, parsePaste, doImport, addImportRow, parseCSVFile,
  setDiscoveryType, saveDiscoveryAnswer, updateScoreHint, setConvStage,
  showToast,
  startStageEdit, saveStageEdit, cancelStageEdit, resetStageEdit,
  startCallEdit, saveCallEdit, cancelCallEdit, resetCallEdit,
  startObjEdit, saveObjEdit, cancelObjEdit, resetObjEdit,
  fmtRich, toggleCS, toggleObj, toggleScriptBody, toggleScriptCollapse,
  setReContact, reengageLead,
  openOutreachModal, closeOutreachModal, sendAllOutreach, saveGmailClientId,
  getChecks, toggleTask,
  kanbanScrollStart, kanbanScrollStop, kanbanDragStart, kanbanDragEnd,
  kanbanDragOver, kanbanDragLeave, kanbanDrop,
});

document.addEventListener('keydown', e => {
  if (document.getElementById('modal').style.display !== 'none' && e.key === 'Escape') closeModal();
});

// INIT — fix any existing leads whose nextFU falls on a weekend
(function fixWeekendDates() {
  let changed = false;
  state.leads.forEach(l => {
    if (l.nextFU) {
      const safe = skipWeekend(l.nextFU);
      if (safe !== l.nextFU) { l.nextFU = safe; changed = true; }
    }
  });
  if (changed) save();
})();
renderKanban();
