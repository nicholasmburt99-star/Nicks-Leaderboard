// ═══════════════════════════════
//  DISCOVERY QUESTIONS
// ═══════════════════════════════
export const DISC_NO_INS = [
  { key:'q2',      label:"What's your familiarity with health insurance — have you looked into it at all? And how many W2 employees do you have?" },
  { key:'q3',      label:"What's driving the decision to offer benefits right now — is it keeping your team around, attracting new hires, or something else?" },
  { key:'q5',      label:"Where would you like to be with business health insurance in the next 90 days — and when would you want group coverage to start?" },
  { key:'q8',      label:"So if we can find you an affordable health insurance plan — and you were paying somewhere around $200 to $500 per employee — would that return on investment make sense for keeping your team?" },
  { key:'q9',      label:"Who else would be involved in making this decision with you?" },
  { key:'qp',      label:"Would you like benefits to integrate into payroll? If so, who is your current payroll provider? And who are you offering 401k through?" },
  { key:'q_ready', label:'Once we go over the quote together — if everything looks right and the numbers make sense — are you ready to move forward with health insurance right away? (If no: "Help me understand — what\'s holding you back from moving forward?")' },
  { key:'q11',     label:"To get you accurate quotes, I just need an employee census — basic DOBs and zip codes for each of your eligible employees. Do you have that info readily available? If not, I can send an email requesting this info." },
  { key:'q_slot',  label:"What's a good 15-minute slot next week for us to review the quotes? I'll send a Google Calendar invite to meet." },
];

export const DISC_HAS_INS = [
  { key:'h2',  label:"Quick question. Most employers I speak with right now are dealing with one of two things. Either rising benefits costs they can't really control or employees not really using the benefits they're paying for. Which one's been more of a headache?" },
  { key:'h3',  label:'On a scale of 1–10, how happy are you with your current plan and broker?', isScore:true },
  { key:'h4',  label:"What's been your biggest frustration — is it the rising cost, lack of support, or employees not understanding what they have?" },
  { key:'h5',  label:'What is the most important goal you want to accomplish with your benefits in the next 90 days?' },
  { key:'h6',  label:'If you could fix one thing about your benefits this year, what would it be?' },
  { key:'h8',  label:'When does your plan renew?' },
  { key:'h9',  label:'Who else would be involved in making a change like this?' },
  { key:'h10', label:"I'd love to put some options together for comparison — I just need a quick census and we can set up 30 minutes to go over everything. Does later this week work?" },
];

// ═══════════════════════════════
//  CONVERSATION STAGE
// ═══════════════════════════════
// scriptIds maps to CALL_SCRIPT section ids; 'objections' renders CALL_OBJECTIONS
export const CONV_STAGES = [
  { id: '', label: '📋 Show email / text / outreach scripts' },
  { id: 'dialing',     label: '🚪 Getting through gatekeeper',      scriptIds: ['gatekeeper'] },
  { id: 'dm_connected',label: '🤝 Connected — deliver opener',       scriptIds: ['opener1','opener2'] },
  { id: 'denial',      label: '❌ They pushed back / denied pitch',  scriptIds: ['denial'] },
  { id: 'pitch',       label: '🎯 Pitch / value proposition',        scriptIds: ['pitch'] },
  { id: 'objections',  label: '⚡ Handling an objection',            scriptIds: ['__objections__'] },
  { id: 'appointment', label: '📅 Moving to the appointment',        scriptIds: ['appt'] },
  { id: 'lockin',      label: '🔒 Locking in the appointment',       scriptIds: ['lockin'] },
  { id: 'completed',   label: '✓ Call completed',                    scriptIds: ['__done__'] },
];
