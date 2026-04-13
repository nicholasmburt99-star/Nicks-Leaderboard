import { db, CRM_DOC } from './firebase.js';
import { setDoc } from 'firebase/firestore';

export const state = {
  leads: JSON.parse(localStorage.getItem('bpcrm2_leads') || '[]'),
  scriptOverrides: JSON.parse(localStorage.getItem('bpcrm2_scripts') || '{}'),
  okrs: JSON.parse(localStorage.getItem('bpcrm2_okrs') || '[]'),
  dailyCalls: JSON.parse(localStorage.getItem('bpcrm2_dailyCalls') || '{}'),
  selId: null,
  editId: null,
  activeFilter: 'due',
  searchQ: '',
  activeTab: 'kanban',
};

// Debounced Firestore write — waits 1.5s after last change before writing
let _fsTimer = null;
function _writeToFirestore() {
  if (_fsTimer) clearTimeout(_fsTimer);
  _fsTimer = setTimeout(() => {
    setDoc(CRM_DOC, {
      leads: JSON.stringify(state.leads),
      scripts: JSON.stringify(state.scriptOverrides),
      okrs: JSON.stringify(state.okrs),
      dailyCalls: JSON.stringify(state.dailyCalls),
    }).catch(e => console.warn('Firestore save error:', e));
  }, 1500);
}

// Callback invoked after every save — set in main.js to re-render active tab
let _onSave = null;
export function setOnSave(fn) { _onSave = fn; }

export function save() {
  localStorage.setItem('bpcrm2_leads', JSON.stringify(state.leads));
  _writeToFirestore();
  if (_onSave) _onSave();
}
export function saveScriptOverrides() {
  localStorage.setItem('bpcrm2_scripts', JSON.stringify(state.scriptOverrides));
  _writeToFirestore();
}
export function saveOKRs() {
  localStorage.setItem('bpcrm2_okrs', JSON.stringify(state.okrs));
  _writeToFirestore();
  if (_onSave) _onSave();
}
export function saveDailyCalls() {
  localStorage.setItem('bpcrm2_dailyCalls', JSON.stringify(state.dailyCalls));
  _writeToFirestore();
  if (_onSave) _onSave();
}
export function getScriptBody(key, defaultText) { return state.scriptOverrides[key] !== undefined ? state.scriptOverrides[key] : defaultText; }
export function isEdited(key) { return state.scriptOverrides[key] !== undefined; }
