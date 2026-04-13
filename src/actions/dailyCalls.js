import { state, saveDailyCalls } from '../store.js';

export function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // offset to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0'));
  }
  return dates;
}

export function toggleDailyCall(dateStr, idx) {
  if (!state.dailyCalls[dateStr]) {
    state.dailyCalls[dateStr] = [false, false, false];
  }
  state.dailyCalls[dateStr][idx] = !state.dailyCalls[dateStr][idx];
  saveDailyCalls();
}
