import { state, saveRoutine, saveRoutineLog } from '../store.js';
import { today } from '../utils/date.js';
import { renderDaily } from '../views/dailyRoutine.js';

// Get the Monday of the current week as ISO YYYY-MM-DD
export function getWeekKey(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function getTodayLog() {
  const t = today();
  if (!state.routineLog[t]) {
    state.routineLog[t] = {
      preDay: { done: false, focusSkill: '', strengthTrait: '', emotionalImpact: '' },
      midday: { done: false, at: '' },
      postDay: { done: false, controlled: '', controlledMe: '' },
      fridayReview: { done: false, identityCheck: '', reinforced: '', letSlide: '' },
    };
  }
  return state.routineLog[t];
}

export function setIdentity(val) {
  state.routine.identity = val;
  saveRoutine();
}

export function setWeeklyTheme(val) {
  state.routine.weeklyTheme = val;
  state.routine.weeklyThemeWeekKey = getWeekKey();
  saveRoutine();
}

export function savePreDayField(key, val) {
  const day = getTodayLog();
  day.preDay[key] = val;
  saveRoutineLog();
}

export function togglePreDayDone() {
  const day = getTodayLog();
  day.preDay.done = !day.preDay.done;
  if (day.preDay.done && !day.preDay.at) day.preDay.at = new Date().toISOString();
  if (!day.preDay.done) day.preDay.at = '';
  saveRoutineLog();
  renderDaily();
}

export function markMidday() {
  const day = getTodayLog();
  day.midday.done = !day.midday.done;
  day.midday.at = day.midday.done ? new Date().toISOString() : '';
  saveRoutineLog();
  renderDaily();
}

export function savePostDayField(key, val) {
  const day = getTodayLog();
  day.postDay[key] = val;
  saveRoutineLog();
}

export function togglePostDayDone() {
  const day = getTodayLog();
  day.postDay.done = !day.postDay.done;
  if (day.postDay.done && !day.postDay.at) day.postDay.at = new Date().toISOString();
  if (!day.postDay.done) day.postDay.at = '';
  saveRoutineLog();
  renderDaily();
}

export function saveFridayReviewField(key, val) {
  const day = getTodayLog();
  day.fridayReview[key] = val;
  saveRoutineLog();
}

export function toggleFridayReviewDone() {
  const day = getTodayLog();
  day.fridayReview.done = !day.fridayReview.done;
  if (day.fridayReview.done && !day.fridayReview.at) day.fridayReview.at = new Date().toISOString();
  if (!day.fridayReview.done) day.fridayReview.at = '';
  saveRoutineLog();
  renderDaily();
}
