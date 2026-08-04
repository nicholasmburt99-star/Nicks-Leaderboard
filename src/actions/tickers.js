import { state, saveCallLog, saveApptLog } from '../store.js';
import { today } from '../utils/date.js';
import { getWeekKey } from './dailyRoutine.js';
import { renderKanban } from '../views/kanban.js';

export const CALLS_GOAL = 20;
export const APPTS_GOAL = 2;

export function getTodayCalls() {
  return state.callLog[today()] || 0;
}
export function getWeekAppts() {
  return state.apptLog[getWeekKey()] || 0;
}

export function incCalls() {
  const t = today();
  state.callLog[t] = (state.callLog[t] || 0) + 1;
  saveCallLog();
  renderKanban();
}
export function decCalls() {
  const t = today();
  state.callLog[t] = Math.max(0, (state.callLog[t] || 0) - 1);
  saveCallLog();
  renderKanban();
}
export function incAppts() {
  const wk = getWeekKey();
  state.apptLog[wk] = (state.apptLog[wk] || 0) + 1;
  saveApptLog();
  renderKanban();
}
export function decAppts() {
  const wk = getWeekKey();
  state.apptLog[wk] = Math.max(0, (state.apptLog[wk] || 0) - 1);
  saveApptLog();
  renderKanban();
}
