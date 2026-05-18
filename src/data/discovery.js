// ═══════════════════════════════
//  DISCOVERY QUESTIONS
// ═══════════════════════════════
export const DISC_NO_INS = [
  { key:'q2',      label:`What's driving the conversation around benefits right now — is something pushing this, or is it more of a 'we've been meaning to look at this' moment?` },
  { key:'q3',      label:`If this worked exactly how you'd want it to — six months from now, what would be different for you and your team?` },
  { key:'q5',      label:`What's happened so far when looking at group benefits has come up internally — has there been any pushback, or is the team aligned?` },
  { key:'q8',      label:`What's the cost of NOT having benefits right now — have you lost anyone over it, or felt the pressure when hiring?` },
  { key:'q9',      label:`Who else would need to feel good about this for it to move forward — and how do those conversations usually go internally?` },
  { key:'qp',      label:`What does your current HR setup look like — payroll, 401k, any existing benefits — and how integrated do you need everything to be?` },
  { key:'q_ready', label:`When we look at the quotes together — what would need to be true for this to feel like a clear yes for you?` },
  { key:'q11',     label:`The last thing I need to get you accurate numbers is a quick employee census — just dates of birth and zip codes. I can send a simple template right now if that's easier than hunting it down. How do you want to handle that?` },
  { key:'q_slot',  label:`Based on everything you've shared — the goal of getting coverage in place by {{Desired_Start_Date}}, and making sure {{Key_Stakeholder}} feels good about it — let's lock in 20 minutes to walk through the numbers together. What does your week look like?` },
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
