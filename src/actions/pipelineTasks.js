import { state, save } from '../store.js';
import { uid } from '../utils/dom.js';
import { today } from '../utils/date.js';
import { renderDetail } from '../views/detail.js';

export function addPipelineTask(leadId, text, dueDate) {
  const t = (text || '').trim();
  if (!t) return;
  const l = state.leads.find(x => x.id === leadId);
  if (!l) return;
  if (!Array.isArray(l.pipelineTasks)) l.pipelineTasks = [];
  l.pipelineTasks.push({ id: uid(), text: t, done: false, dueDate: dueDate || '' });
  save();
  renderDetail();
}

export function togglePipelineTask(leadId, taskId) {
  const l = state.leads.find(x => x.id === leadId);
  const t = l?.pipelineTasks?.find(x => x.id === taskId);
  if (!t) return;
  t.done = !t.done;
  save();
  renderDetail();
}

export function deletePipelineTask(leadId, taskId) {
  const l = state.leads.find(x => x.id === leadId);
  if (!l || !Array.isArray(l.pipelineTasks)) return;
  l.pipelineTasks = l.pipelineTasks.filter(x => x.id !== taskId);
  save();
  renderDetail();
}

export function setPipelineTaskDue(leadId, taskId, dueDate) {
  const l = state.leads.find(x => x.id === leadId);
  const t = l?.pipelineTasks?.find(x => x.id === taskId);
  if (!t) return;
  t.dueDate = dueDate || '';
  save();
  renderDetail();
}

export function getDuePipelineTaskCount() {
  const t = today();
  let count = 0;
  state.leads.forEach(l => {
    (l.pipelineTasks || []).forEach(task => {
      if (!task.done && task.dueDate && task.dueDate <= t) count++;
    });
  });
  return count;
}
