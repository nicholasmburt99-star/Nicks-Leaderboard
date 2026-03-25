
// ═══════════════════════════════
//  PIPELINE STAGES
// ═══════════════════════════════
export const STAGES = [
  {
    id: 'new', label: 'New Lead', short: 'New',
    color: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', followDays: 0, theme: null,
    tasks: [],
    scripts: []
  },
  {
    id: 'day1', label: 'Day 1 – Launch', short: 'Day 1',
    color: '#2563eb', bg: '#dbeafe', text: '#1e3a8a', followDays: 2, theme: '📩 Theme 1: 1st Big Problem',
    tasks: [
      { icon: '📬', label: 'Email/Text: Send personalized problem email or text' },
      { icon: '🤝', label: 'LinkedIn: Send blank connection request (no message)' },
      { icon: '☎️', label: 'Cold Call: Dial — NO voicemail if no answer' },
    ],
    scripts: [
      {
        tab: '📬 Email 1', title: 'Email 1: Personalized Problem',
        subject: 'Subject Line: [Prospect\'s Name]\'s Health Insurance',
        body: `[Prospect's Name],

I saw that [personalized context — e.g., your team is rapidly expanding / you recently opened a new location] — [connecting problem: expanding means managing rising health insurance costs for your growing team].

I guide business owners in reviewing, setting up, and managing group health plans that fit their budget and remain compliant so you can focus on growing your business.

Open to discussing how I can help you find the right business group health insurance plan?`,
        note: 'Personalization → 1st Problem → One-sentence Solution → Interest-based CTA'
      },
      {
        tab: '💬 Text 1', title: 'Text 1: Personalized Problem',
        body: `Hi [Name], this is Nick.

[Company] has [X]+ employees and with tons of growth comes the challenge of balancing the cost of health benefits.

[Add personalized context — e.g., "Building a family-owned business in [area] for 20+ years can't be easy, and navigating how to offer health insurance to employees can be one of the most challenging next steps."]

I help small CA business owners find group health plans that fit their budget and give employees benefits they actually value.

Open to a quick chat to see if I can be helpful? Here's a brief video proving I'm not spam or AI! [link]`,
        note: 'Personalization → 1st Problem → Solution → Interest-based CTA'
      },
      {
        tab: '🤝 LinkedIn', title: 'LinkedIn: Blank Connection Request',
        body: `Send a BLANK connection request — no message.

Blank requests have higher acceptance rates. Personalizing can trigger "sales alarms" and lower acceptance chances.`,
        note: 'No message — keep it blank'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script', isCallScript: true }
    ]
  },
  {
    id: 'day3', label: 'Day 3 – Bubble-Up', short: 'Day 3',
    color: '#4f46e5', bg: '#e0e7ff', text: '#3730a3', followDays: 2, theme: '📩 Theme 1: 1st Big Problem',
    tasks: [
      { icon: '☎️', label: 'Cold Call: Leave Voicemail #1 (point to email)' },
      { icon: '📬', label: 'Email/Text: Bubble-up — reply to Email 1 thread' },
      { icon: '🤝', label: 'LinkedIn: Send context-only message (no pitch)' },
    ],
    scripts: [
      {
        tab: '📱 Voicemail 1', title: 'Voicemail #1',
        body: `"Hi [Name], I'm calling to share a tip you can use for saving 20% on your group's benefits — I work with a few other small businesses in [area] and this has been working really well for them.

No need to call back. I'm about to hit send on an email.

Just so we don't play phone tag, mind replying and letting me know if it's even moderately interesting?

It'll come from Nick at Bridgewater Benefits, cheers."`,
        tip: '💡 Always lead with a value hook — vary the tip based on the group (e.g., compliance deadline, carrier switch savings, level-funded options). Best times to call: 10am–Noon or 4–7pm local. Avoid Monday mornings.'
      },
      {
        tab: '📬 Email 2', title: 'Email 2: Bubble-Up',
        subject: 'Subject Line: REPLY to the original email thread',
        body: `Hey [Name], just tried you over the phone.

Any thoughts?`,
        note: 'Short on purpose — allude to the call, point back to Email 1'
      },
      {
        tab: '💬 Text 2', title: 'Text 2: Bubble-Up',
        body: `Hey [Name], just shot you a voice message. What do you think?`,
        note: 'Allude to call → point back to first text'
      },
      {
        tab: '🤝 LinkedIn', title: 'LinkedIn Message 1: Context Only',
        body: `Hey [Name] — noticed your [recent LinkedIn post / request for group health insurance info] and sent you an email the other day about it.

I know everyone hates the whole connect-and-pitch thing, so I won't restate it all here.

Did you see my note by chance?`,
        note: 'Point back to email. Do NOT re-pitch on LinkedIn.'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script (If They Pick Up)', isCallScript: true }
    ]
  },
  {
    id: 'day5', label: 'Day 5 – Push', short: 'Day 5',
    color: '#7c3aed', bg: '#ede9fe', text: '#4c1d95', followDays: 2, theme: '📩 Theme 1: 1st Big Problem',
    tasks: [
      { icon: '☎️', label: 'Cold Call: Dial — NO voicemail if no answer' },
      { icon: '💬', label: 'Text: Bubble-up (reference the call attempt)' },
    ],
    scripts: [
      {
        tab: '💬 Text', title: 'Text: Bubble-Up (2nd)',
        body: `Hey [Name], just tried calling again. Open to chatting?`,
        note: 'Short — allude to call, point back to 1st text'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script (If They Pick Up)', isCallScript: true }
    ]
  },
  {
    id: 'day7', label: 'Day 7 – Make it Real', short: 'Day 7',
    color: '#6d28d9', bg: '#ddd6fe', text: '#4c1d95', followDays: 4, theme: '📩 Theme 1: 1st Big Problem',
    tasks: [
      { icon: '☎️', label: 'Cold Call: Leave Voicemail #2' },
      { icon: '📬', label: 'Email/Text: "Make it Real" — share Google Business profile / case study' },
      { icon: '🤝', label: 'LinkedIn: Bubble-up message ("Any thoughts?")' },
    ],
    scripts: [
      {
        tab: '📱 Voicemail 2', title: 'Voicemail #2',
        body: `[Name], we work with a few other small businesses in the [area] reviewing and maintaining their health insurance benefits.

I'm sure you've got that taken care of, but I'm about to press send on an email to give you an idea of how I support other folks.

Just so we don't play phone tag, mind replying and letting me know if it's even moderately interesting?

It'll come from Nick at Bridgewater Benefits, cheers.`,
        tip: '💡 Keep it casual and low-pressure — you\'re not asking for a meeting, just a quick reply. Pairs directly with Email 3 which goes out right after this voicemail.'
      },
      {
        tab: '📬 Email 3', title: 'Email 3: Make it Real',
        subject: 'Subject Line: REPLY to the original email thread',
        body: `Left you a VM. Here's a link to my Google Business Profile with reviews from my satisfied clients. [link]

Open to discussing how I can help?`,
        note: 'Make it tangible — social proof (reviews, case study, or brief demo video)'
      },
      {
        tab: '💬 Text 3', title: 'Text 3: Make it Real',
        body: `Just left you a VM. Sharing my Google Business Profile here so you can see client reviews for my agency. [link]

Open to a quick conversation?`,
        note: 'Make it real — sell the social proof'
      },
      {
        tab: '🤝 LinkedIn', title: 'LinkedIn Message 2: Bubble-Up',
        body: `Any thoughts?`,
        note: 'Short and simple — mirrors the email bubble-up'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script (If They Pick Up)', isCallScript: true }
    ]
  },
  {
    id: 'day11', label: 'Day 11 – 2nd Problem', short: 'Day 11',
    color: '#c026d3', bg: '#fae8ff', text: '#86198f', followDays: 4, theme: '📧 Theme 2: 2nd Big Problem',
    tasks: [
      { icon: '☎️', label: 'Cold Call: Dial — NO voicemail (phase out calls now)' },
      { icon: '📬', label: 'Email/Text: New subject line — lead with 2nd biggest problem' },
    ],
    scripts: [
      {
        tab: '📬 Email 4', title: 'Email 4: 2nd Biggest Problem',
        subject: 'Subject Line: Navigating Group Health Insurance (NEW thread — new subject!)',
        body: `[Name],

Understanding what insurance carrier to select, reviewing market trends to verify you are offering the right plan design, and staying compliant with CA Labor Law is a juggling act — it takes a PhD-level education to understand even where to start!

I help busy business owners focus on building their businesses and retaining talent by thoroughly reviewing the health insurance market, educating them on possible options, and keeping their team compliant.

Open to seeing why employers select me as their employee benefits quarterback over massive payroll companies?`,
        note: 'Change subject line — start a fresh thread. Reuse the personalization from Email 1 if possible.'
      },
      {
        tab: '💬 Text 4', title: 'Text 4: 2nd Biggest Problem',
        body: `Hi [Name],

Choosing the right insurance, keeping up with market changes, and staying compliant with CA labor laws is unnecessarily complex.

I handle all of that for busy business owners so they can focus on growing and retaining talent.

Open to a quick chat on why employers choose me as their benefits quarterback over big payroll companies?`,
        note: '2nd problem → solution → CTA'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script (If They Pick Up)', isCallScript: true }
    ]
  },
  {
    id: 'day15', label: 'Day 15 – Right Person?', short: 'Day 15',
    color: '#ea580c', bg: '#ffedd5', text: '#9a3412', followDays: 4, theme: '📧 Theme 2: 2nd Big Problem',
    tasks: [
      { icon: '☎️', label: 'Cold Call: Dial — NO voicemail' },
      { icon: '📬', label: 'Email/Text: "Right person?" — ask if they\'re the correct contact' },
    ],
    scripts: [
      {
        tab: '📬 Email 5', title: 'Email 5: Right Person?',
        subject: 'Subject Line: REPLY to the Theme 2 email thread',
        body: `Hey [Name] – I'd hate to bother you if this doesn't fall on your plate.

Is there someone else on the team you think I should reach out to?`,
        note: '"Wrong person?" gives an easy out — and often surfaces a referral or confirms they ARE the right person.'
      },
      {
        tab: '💬 Text 5', title: 'Text 5: Right Person?',
        body: `Hey [Name], if this isn't your responsibility, no worries at all.

Who would you recommend I reach out to?`,
        note: 'Simple and non-pushy — opens the door for a referral or confirmation.'
      },
      { tab: '☎️ Call Script', title: 'Cold Call Script (If They Pick Up)', isCallScript: true }
    ]
  },
  {
    id: 'day19', label: 'Day 19 – Pushaway', short: 'Day 19',
    color: '#dc2626', bg: '#fee2e2', text: '#991b1b', followDays: 4, theme: '🔎 Theme 3: Get the Truth',
    tasks: [
      { icon: '📬', label: 'Email/Text: Pushaway — thumbs up or thumbs down?' },
    ],
    scripts: [
      {
        tab: '📬 Email 6', title: 'Email 6: Pushaway (Not Interested?)',
        subject: 'Subject Line: Reach back out?',
        body: `Hey [Name] – I shared a few ways that I help employers provide attractive employee benefits, but I'd hate to keep reaching out if we weren't a fit.

Mind giving me the thumbs-up or thumbs-down?`,
        note: 'Creates loss aversion — they\'re on the fence and this nudges a reply.'
      },
      {
        tab: '💬 Text 6', title: 'Text 6: Pushaway',
        body: `Hey [Name] – I shared a few ways that I help employers navigate employee benefits, but I'd hate to keep reaching out if we weren't a fit.

Mind reacting to this message with a thumbs-up or thumbs-down?`,
        note: '"React to this message" is natural on mobile — easy engagement.'
      }
    ]
  },
  {
    id: 'day23', label: 'Day 23 – Final Pushaway', short: 'Day 23',
    color: '#b91c1c', bg: '#fecaca', text: '#7f1d1d', followDays: 30, theme: '🔎 Theme 3: Get the Truth',
    tasks: [
      { icon: '📬', label: 'Email/Text: Final pushaway — let them know you\'ll reach back in 30 days' },
    ],
    scripts: [
      {
        tab: '📬 Email 7', title: 'Email 7: Reach Back Out?',
        subject: 'Subject Line: REPLY to the Theme 3 email thread',
        body: `Hey [Name], I'll assume this isn't a fit for now. In case you'd ever like to consider us, I'm including a few resources below:

One Sentence Summary: I help employers set up and manage group health insurance by integrating with payroll providers, representing 15+ local and nationwide carriers, and keeping employers up-to-date with local compliance.

Case Study: I helped a San Diego business save 55% on their monthly premium by simply switching to a more competitive carrier — a move their previous broker had not shared with the employer.

I usually reconnect with folks every 30 days or so to see if anything has changed.

Mind letting me know if I shouldn't reach back out?`,
        note: 'Acknowledge the breakup → leave brief resources → tell them you\'re coming back in 30 days. Draws out last replies.'
      },
      {
        tab: '💬 Text 7', title: 'Text 7: Final Pushaway',
        body: `Hey [Name], I figure this isn't a challenge you face right now. I've sent over an email with some more resources. In case you'd ever like help, you have my number!

I usually reconnect with folks every 30 days or so to see if anything has changed.

Mind letting me know if I shouldn't reach back out?`,
        note: 'Point to email for full resources — keep text brief.'
      }
    ]
  },
  {
    id: 'live', label: 'Connected, Recontact Later', short: 'Connected',
    color: '#059669', bg: '#d1fae5', text: '#065f46', followDays: 1, theme: null,
    tasks: [
      { icon: '🎯', label: 'Work through discovery questions to understand their situation' },
      { icon: '📋', label: 'Identify the biggest pain point (rising premiums vs. compliance vs. new plan)' },
      { icon: '📅', label: 'Get a census (ages + zip codes) and schedule the 30-min quote review call' },
    ],
    scripts: [
      { tab: '☎️ Full Call Script', title: 'Full Cold Call / Discovery Script', isCallScript: true }
    ]
  },
  {
    id: 'quoted', label: 'Quote Sent', short: 'Quoted',
    color: '#4f46e5', bg: '#e0e7ff', text: '#3730a3', followDays: 2, theme: null,
    tasks: [
      { icon: '📬', label: 'Send quote / proposal via email' },
      { icon: '📅', label: 'Schedule follow-up call to walk through options together' },
    ],
    scripts: [
      {
        tab: '📋 Follow-Up', title: 'Quote Follow-Up Script',
        body: `OPENING:
"Hi [Name], this is Nick from Bridgewater Benefits. I'm following up on the health insurance quote I sent over — did you get a chance to take a look?"

[If yes]
"Great! Do you have any questions about the plans? I want to make sure you feel confident before making a decision."

[If no]
"No worries — let me give you a quick overview…" [walk through top 1–2 options]

CLOSING:
"Based on what you told me, I think [Plan Name] at $[X]/month would be the best fit because [it keeps Dr. X in-network / lowest deductible / best subsidy match].

Would you like to go ahead and get that enrolled today?"`,
        objections: [
          { q: '"It\'s more than I expected"', a: `Let me walk you through exactly what this plan gets you — [explain the key benefits: network, deductible, out-of-pocket max, coverage highlights]. When we get you [specific benefit most important to them], would that make the price worth it to you?\n\nAvoid asking "what can you afford" — that boxes you in on budget before they've felt the value. Instead, anchor to the benefit first, then let them tell you if the price works.` },
          { q: '"I need more time to think"', a: "Absolutely, no pressure. Can I ask — is there anything specific you're unsure about? I want to make sure you have all the info you need." },
          { q: '"I\'m going to use my payroll company"', a: "That's really common — my service is actually free to you, paid by the carrier. What I offer is the expertise to match you to the right plan and the ongoing servicing that payroll companies don't provide." },
          { q: '"I\'ll just shop around"', a: "Totally fair. Just keep in mind I represent 15+ carriers — I'm essentially doing the shopping for you for free. What would it hurt to see the comparison?" }
        ]
      }
    ]
  },
  {
    id: 'won', label: 'Closed – Won ✓', short: 'Won',
    color: '#10b981', bg: '#ecfdf5', text: '#065f46', followDays: 30, theme: null,
    tasks: [],
    scripts: [
      {
        tab: '🎉 Post-Sale', title: 'Post-Sale Follow-Up (1 Week Later)',
        body: `"Hi [Name]! It's Nick from Bridgewater Benefits. I just wanted to check in — have you received your insurance cards and welcome materials? Is everything looking good?

Also — if you ever have questions about your plan, need to make changes, or your situation changes at all, please don't hesitate to reach out. I'm your resource year-round.

And if you know anyone else who might be looking for health coverage or group benefits, a referral would mean a lot to me!"`,
        tip: '🗓️ Mark their renewal date — reach out proactively 60–90 days before renewal to retain and upsell.'
      }
    ]
  },
  {
    id: 'lost', label: 'Closed – Lost', short: 'Lost',
    color: '#6b7280', bg: '#f3f4f6', text: '#374151', followDays: 30, theme: null,
    tasks: [],
    scripts: [
      {
        tab: '🔄 Re-Engage', title: 'Re-Engagement Script (30 Days Later)',
        body: `"Hi [Name], it's Nick from Bridgewater Benefits — we connected about a month ago about your group health insurance.

I just wanted to check in to see if anything has changed or if the timing is any better. I know these things are often about timing.

If it's still not a fit, just let me know and I'll leave you alone — but if there's been any shift, I'd love to pick up where we left off. Fair?"`,
        tip: '💡 Check your notes for the reason they passed and personalize the re-engagement. Common reasons: already covered, using payroll company, Medicaid, price.'
      }
    ]
  },
  {
    id: 'unqualified', label: 'Unqualified', short: 'Unqual',
    color: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6', followDays: 0, theme: null,
    tasks: [], scripts: []
  }
];

export function gS(id) { return STAGES.find(s => s.id === id) || STAGES[0]; }
export function gSI(id) { return STAGES.findIndex(s => s.id === id); }
