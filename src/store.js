export const state = {
  leads: JSON.parse(localStorage.getItem('bpcrm2_leads') || '[]'),
  scriptOverrides: JSON.parse(localStorage.getItem('bpcrm2_scripts') || '{}'),
  selId: null,
  editId: null,
  activeFilter: 'due',
  searchQ: '',
  activeTab: 'queue',
};
export function save() { localStorage.setItem('bpcrm2_leads', JSON.stringify(state.leads)); }
export function saveScriptOverrides() { localStorage.setItem('bpcrm2_scripts', JSON.stringify(state.scriptOverrides)); }
export function getScriptBody(key, defaultText) { return state.scriptOverrides[key] !== undefined ? state.scriptOverrides[key] : defaultText; }
export function isEdited(key) { return state.scriptOverrides[key] !== undefined; }
