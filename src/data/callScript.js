// ═══════════════════════════════
//  COLD CALL SCRIPT (reusable)
// ═══════════════════════════════
export const CALL_SCRIPT = [
  {
    id: 'gatekeeper', title: '🚪 Gatekeeper Script',
    body: `🎯 GOAL: Win the first 10 seconds. Sound calm, relevant, and intentional.
Gatekeepers are filters — make their job easier.

━━━ STEP 1: OPENERS (choose one, say it slowly) ━━━

Respect + Empathy:
"Hi, this is Nick. I know your role is to protect [DM Name]'s time, so I'll keep this brief."

Familiarity + Relevance:
"Hi, this is Nick. I work with several small business owners in [area], and I thought this might already be on [DM Name]'s radar."

Authority + Certainty:
"Hi, this is Nick. Could you connect me with [DM Name]? I have something specific for them."

Pattern Interrupt:
"Hi, this is Nick. I'm not sure if you're the right person or if it's better to speak with them directly."

Collaboration:
"Hi, this is Nick. Quick question — would you be the best person to point me in the right direction, or would that be [DM Name]?"

━━━ STEP 2: "WHAT IS THIS ABOUT?" ━━━

Stay calm. Stay vague. Stay relevant.

Option 1 – Industry Relevance:
"That's fair. I work with other small business owners in [area], and they've been dealing with rising group health costs. I thought it might be relevant to [DM Name] as well. Best if I share it directly with them."

Option 2 – Respectful Curiosity:
"Good question. I'm not sure yet if it's relevant — that's why it's easier for them to decide."

Option 3 – Insight Teaser:
"I've noticed a trend with small businesses that's costing them on their health coverage. I'm not sure if [DM Name] is seeing the same thing, which is why I reached out."

Option 4 – Peer Social Proof:
"I've spoken with a few other business owners in [area] about this recently. Since [DM Name] runs the company, I thought it might be useful context for them."

Option 5 – Low Pressure:
"I don't want to waste their time if it's not useful. It's usually easier for them to hear it directly and decide quickly."

If asked for company name:
"It's Bridgewater Benefits."

━━━ STEP 3: OBJECTIONS ━━━

"Send me an email":
→ "Email works sometimes. Live is usually faster — would you be open to a quick transfer so they can decide?"
→ "Of course. To make sure it's useful, what would you want me to highlight in that email?"
→ "The reason I ask to connect live is it usually saves time for both sides. Would you mind putting me through briefly?"

"They're busy":
→ "I only need 30 seconds. If it's not relevant, I'll step away."
→ "Totally expected. Since this is quick, is now better or should I try back later?"
→ "That's why I keep it short and let them decide fast."

"We're not interested":
→ "Totally fair. Is that because you already have something in place, or because it hasn't been a priority?"
→ "When I hear that, it's usually timing or an existing plan. Is that the case here?"
→ "That makes sense. Would it be reasonable to check back later this year?"

"It's my job to screen these calls":
→ "I understand, and you're doing it well. Usually [DM Name] decides very quickly if it's worth continuing — would you be open to letting them make that call?"
→ "Of course. What I've found is it's often quicker if they hear the first 30 seconds directly."
→ "That's exactly why I keep these short. If you could transfer me, they can decide right away."

DM is unavailable:
→ "No problem — when would be a good time to try back?"
→ "Do you happen to have a good cell number for them?"
→ "Would you be able to schedule a quick call for us to connect?"

━━━ QUICK REMINDERS ━━━
• Tone matters more than the words
• Calm confidence beats clever scripts
• Do NOT pitch the gatekeeper
• Short, low-pressure requests are hardest to refuse`
  },
  {
    id: 'opener1', title: '💬 Opener 1: "Heard the Name Tossed Around?"',
    body: `Lead with context:
"Hi [Name], we work with a few other [small businesses / dental offices / etc.] in [area]. It's Nick Burt from Bridgewater Benefits."

"Heard the name tossed around?"

[If NO]
"Ha! Guess I'm not as popular as I thought. Well, the reason for my call is…"
— OR —
"Huh! Well, we work with a few other [industry] in [area] and the reason I called you is…"

[If YES]
"What'd you hear?"

─────────────────────────────────
ALTERNATE: Value-Led Opener

Lead directly with a specific idea or result instead of name recognition:

"Hi [Name], I was calling to share a quick idea that has helped my clients like you to save 20% on their benefits — I was curious if you have a sec to discuss this."

Why this works: You're leading with value and a concrete outcome rather than asking for permission to pitch. Tailor the stat or idea to what's relevant for that specific group (cost savings, compliance, carrier options, etc.).`
  },
  {
    id: 'opener2', title: '💬 Opener 2: Research-Based',
    body: `"[Name], I just [saw your LinkedIn post / noticed you opened a new office / read about your recent growth].

I'm going to be honest — this is a cold call, but it is a well-researched one. Can I get 30 seconds to tell you why that prompted me to call you specifically, then you can tell me whether or not it makes sense for us to speak?"

Triggers to personalize:
• "I just read about the big case win" (they'd be collecting money)
• "I just saw you opened a new office" (tax/benefits implications)
• "I was reading about your growing headcount" (staffing + benefits costs)`
  },
  {
    id: 'denial', title: '❌ If They Deny Permission to Pitch',
    body: `Response 1:
"Shoot, my bad. Just so nobody from my team bugs you again…
Is it just that I caught you at a horrible time, or is it that you already know what we do, and this just isn't a priority at all?"

Response 2:
"I appreciate you being upfront. To be honest, I don't really love making these calls and I'm sure you're not a fan either.
Look, I did my research on ya and this isn't just a random call. Could I take 30 seconds to share what I found and then you can totally hang up on me if it's not relevant?"`
  },
  {
    id: 'pitch', title: '🎯 Problem Proposition',
    body: `Triggering Problem:
"The reason I'm calling is that health insurance premiums continue to increase, especially impacting small business employers. It's frankly outrageous."

One-Sentence Solution:
"I help employers like yourself look at creative options in the health insurance market and receive the personalized servicing that they deserve. And no, this isn't an AI pitch."

Interest-Based CTA:
"I'm wondering if you might be open to learning more about how I can help your team — when I'm not completely calling you out of the blue?"`
  },
  {
    id: 'appt', title: '📅 Transition to the Appointment',
    body: `"Based on what you shared, I have a few other suggestions that could really help here."

"What I'd recommend is running a few quotes and seeing if there are any opportunities in the market for savings. We can then set up a 30-minute call where I can walk you through them and we can see if any next steps make sense."

"Would you be able to send me over a census with the ages and zip codes of your employees by this Friday?"`
  },
  {
    id: 'lockin', title: '🔒 Lock It In',
    body: `"Great — I'll send over a calendar invite to lock it in."
"Is this the best number to reach you?"
"What's the best email to send the invite to?"

─────────────────────────────────
IF THEY SAY "CALL ME AFTER [DATE]":

Don't accept a vague "call me later" — lock in a real time instead:

"Let's set up a date and time so we don't have to chase each other around. I can give you a call on the [date+1] at 3pm or the [date+2] at 3pm — how does that work on your end?"

Why this works: Offering two specific options turns a "maybe" into a committed meeting. You get the calendar invite instead of a call-me-maybe.`
  }
];

export const CALL_OBJECTIONS = [
  { q: '"Not interested" / "We\'re all set"', a: `"I would have expected you would not be interested. I would have expected you'd be set. That's exactly why I wanted to speak with you — because your current team may have overlooked different strategies that are working right now."` },
  { q: '"We already have a broker"', a: `"That's great — most of my clients did too before we connected. I'm not here to replace anyone, just to give you a second opinion. Would it hurt to get a fresh set of eyes on your current plan?"` },
  { q: '"Send me something in writing"', a: `"Absolutely — what's the best email? And just so I can make it relevant, does your team currently offer a group health plan, or are you looking to set one up?"` },
  { q: '"We\'re too small"', a: `"I actually work with groups as small as 2 employees. The rates might surprise you — and there are options even for very small teams."` },
  { q: '"We use our payroll company for benefits"', a: `"That's really common — and honestly, payroll companies are great at payroll. But benefits brokerage is a specialty. My service is free to you, and I represent 15+ carriers, which payroll companies often don't. Would you be open to a quick comparison?"` },
];

