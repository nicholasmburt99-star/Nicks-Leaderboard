import { state } from '../store.js';
import { esc } from '../utils/dom.js';
import { today, fmtD, fmtDT } from '../utils/date.js';
import { getWeekKey } from '../actions/dailyRoutine.js';

function getTodayLog() {
  return state.routineLog[today()] || {
    preDay: { done: false, focusSkill: '', strengthTrait: '', emotionalImpact: '' },
    midday: { done: false, at: '' },
    postDay: { done: false, controlled: '', controlledMe: '' },
    fridayReview: { done: false, identityCheck: '', reinforced: '', letSlide: '' },
  };
}

function timeOfDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function weekRangeLabel() {
  const startKey = getWeekKey();
  const start = new Date(startKey + 'T00:00:00');
  const end = new Date(start); end.setDate(end.getDate() + 4); // Fri
  const fmt = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${fmt(start)}–${fmt(end)}`;
}

// Pull all callDebriefs from today across all leads, sort by time desc
function getTodayMicroWins() {
  const t = today();
  const wins = [];
  state.leads.forEach(lead => {
    (lead.callDebriefs || []).forEach(d => {
      if (d.at && d.at.startsWith(t)) {
        wins.push({ ...d, leadId: lead.id, leadName: [lead.firstName, lead.lastName].filter(Boolean).join(' '), company: lead.company || '' });
      }
    });
  });
  return wins.sort((a, b) => (a.at > b.at ? -1 : 1));
}

export function renderDaily() {
  const container = document.getElementById('dailyInner');
  if (!container) return;

  const r = state.routine;
  const day = getTodayLog();
  const isFriday = new Date().getDay() === 5;
  const isMonday = new Date().getDay() === 1;
  const currentWeekKey = getWeekKey();
  const themeIsCurrent = r.weeklyTheme && r.weeklyThemeWeekKey === currentWeekKey;
  const wins = getTodayMicroWins();

  const todayDate = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  container.innerHTML = `
    <div class="dr-header">
      <div class="dr-title">🧠 Daily Routine</div>
      <div class="dr-subtitle">${todayDate}</div>
    </div>

    <div class="dr-section">
      <div class="dr-section-title">✨ Identity Statement</div>
      <div class="dr-helper">Decide who you are before you hit quota.</div>
      <input type="text" id="dr-identity"
        class="dr-input"
        placeholder="I am the type of person who…"
        value="${esc(r.identity || '')}"
        onblur="setIdentity(this.value)">
    </div>

    <div class="dr-section${isMonday && !themeIsCurrent ? ' dr-section-highlight' : ''}">
      <div class="dr-section-title">🎯 This Week's Theme (${weekRangeLabel()})</div>
      <div class="dr-helper">Set on Monday. Visible all week. ${isMonday && !themeIsCurrent ? '<strong style="color:#dc2626"> ← New week — set today’s theme</strong>' : ''}</div>
      <input type="text" id="dr-theme"
        class="dr-input"
        placeholder="e.g. Curiosity over control"
        value="${esc(themeIsCurrent ? r.weeklyTheme : '')}"
        onblur="setWeeklyTheme(this.value)">
    </div>

    <div class="dr-section">
      <div class="dr-section-title">🏆 Today's Credibility Anchors</div>
      <div class="dr-helper">Three specific wins or data points to drop early in calls today. Resets every morning.</div>
      ${(()=>{
        const todayAnchors = day.anchors || ['', '', ''];
        return [0,1,2].map(i => `<div class="dr-field">
          <label>Anchor ${i+1}</label>
          <textarea class="dr-textarea" rows="2"
            placeholder="${i === 0 ? "e.g. 'Saved a Bay Area dental practice $14K/year on premiums'" : ''}"
            onblur="saveAnchor(${i},this.value)">${esc(todayAnchors[i] || '')}</textarea>
        </div>`).join('');
      })()}
    </div>

    <div class="dr-section">
      <div class="dr-section-head">
        <div class="dr-section-title">☀️ Pre-Day Setup</div>
        <button class="dr-done-btn ${day.preDay.done ? 'dr-done' : ''}" onclick="togglePreDayDone()">
          ${day.preDay.done ? '✓ Done ' + timeOfDay(day.preDay.at) : 'Mark Done'}
        </button>
      </div>
      <div class="dr-helper">5 min — read identity statement, visualize one high-quality conversation.</div>
      <div class="dr-field">
        <label>Focus skill (today)</label>
        <input type="text" class="dr-input" placeholder="e.g. matching pace and tempo"
          value="${esc(day.preDay.focusSkill || '')}" onblur="savePreDayField('focusSkill',this.value)">
      </div>
      <div class="dr-field">
        <label>My advantage</label>
        <input type="text" class="dr-input" placeholder="e.g. genuine curiosity, prep work"
          value="${esc(day.preDay.strengthTrait || '')}" onblur="savePreDayField('strengthTrait',this.value)">
      </div>
      <div class="dr-field">
        <label>Buyer will feel after talking to me</label>
        <input type="text" class="dr-input" placeholder="e.g. heard, respected, clearer about their options"
          value="${esc(day.preDay.emotionalImpact || '')}" onblur="savePreDayField('emotionalImpact',this.value)">
      </div>
    </div>

    <div class="dr-section">
      <div class="dr-section-head">
        <div class="dr-section-title">🌤 Midday Reset</div>
        <button class="dr-done-btn ${day.midday.done ? 'dr-done' : ''}" onclick="markMidday()">
          ${day.midday.done ? '✓ Done ' + timeOfDay(day.midday.at) : 'Mark Done'}
        </button>
      </div>
      <div class="dr-helper">3 min — stand up, breathe, reset posture and tone.</div>
    </div>

    <div class="dr-section">
      <div class="dr-section-head">
        <div class="dr-section-title">🌙 Post-Day Debrief</div>
        <button class="dr-done-btn ${day.postDay.done ? 'dr-done' : ''}" onclick="togglePostDayDone()">
          ${day.postDay.done ? '✓ Done ' + timeOfDay(day.postDay.at) : 'Mark Done'}
        </button>
      </div>
      <div class="dr-helper">5 min — capture what you controlled vs. what controlled you.</div>
      <div class="dr-field">
        <label>What I controlled</label>
        <textarea class="dr-textarea" rows="2" placeholder="Where did you stay in the driver's seat?"
          onblur="savePostDayField('controlled',this.value)">${esc(day.postDay.controlled || '')}</textarea>
      </div>
      <div class="dr-field">
        <label>What controlled me</label>
        <textarea class="dr-textarea" rows="2" placeholder="What hijacked your tone, pace, or emotion?"
          onblur="savePostDayField('controlledMe',this.value)">${esc(day.postDay.controlledMe || '')}</textarea>
      </div>
    </div>

    ${isFriday ? `
    <div class="dr-section dr-section-highlight">
      <div class="dr-section-head">
        <div class="dr-section-title">🪞 Friday Identity Review</div>
        <button class="dr-done-btn ${day.fridayReview.done ? 'dr-done' : ''}" onclick="toggleFridayReviewDone()">
          ${day.fridayReview.done ? '✓ Done' : 'Mark Done'}
        </button>
      </div>
      <div class="dr-helper">15 min — am I operating as the person I want to be?</div>
      <div class="dr-field">
        <label>Am I operating as my desired identity or reacting as the old?</label>
        <textarea class="dr-textarea" rows="2" placeholder="Be specific. Where did each show up?"
          onblur="saveFridayReviewField('identityCheck',this.value)">${esc(day.fridayReview.identityCheck || '')}</textarea>
      </div>
      <div class="dr-field">
        <label>What habits reinforced my self-belief this week?</label>
        <textarea class="dr-textarea" rows="2"
          onblur="saveFridayReviewField('reinforced',this.value)">${esc(day.fridayReview.reinforced || '')}</textarea>
      </div>
      <div class="dr-field">
        <label>What did I let slide that cost me control?</label>
        <textarea class="dr-textarea" rows="2"
          onblur="saveFridayReviewField('letSlide',this.value)">${esc(day.fridayReview.letSlide || '')}</textarea>
      </div>
    </div>` : ''}

    <div class="dr-section">
      <div class="dr-section-title">⚡ Today's Micro-Wins</div>
      <div class="dr-helper">Auto-collected from post-call debriefs across your leads.</div>
      ${wins.length ? `<div class="dr-wins-list">${wins.map(w => `
        <div class="dr-win">
          <div class="dr-win-head">
            <span class="dr-win-time">${timeOfDay(w.at)}</span>
            <span class="dr-win-lead" onclick="goToLead('${w.leadId}')">${esc(w.leadName || w.company || 'Lead')}</span>
            <span class="dr-win-outcome dr-win-outcome-${w.outcome}">${w.outcome === 'connected' ? 'Connected' : 'Not Interested'}</span>
          </div>
          ${w.emotion ? `<div class="dr-win-row"><strong>Emotion:</strong> ${esc(w.emotion)}</div>` : ''}
          ${w.mirror ? `<div class="dr-win-row"><strong>Mirror:</strong> ${esc(w.mirror)}</div>` : ''}
          ${w.microWin ? `<div class="dr-win-row"><strong>Micro-win:</strong> ${esc(w.microWin)}</div>` : ''}
        </div>
      `).join('')}</div>` : `<div class="dr-empty">No call debriefs yet today. They'll appear here after you save a Post-Call Debrief on any lead.</div>`}
    </div>
  `;
}
