# Stayze — Master Context (CONTEXT.md)

> **Purpose of this file.** This is the single baseline reference for any agent or person working on Stayze. Tag or read this file to understand the entire business, its documents, decisions, brand, website, operations, and every open item — in detail. It consolidates the whole Google-Drive knowledge base that lives in this workspace as `.docx` / `.xlsx` / `.html` / `.svg` files.
>
> **Source of truth rule.** Google Drive remains the operational source of truth for anything that changes frequently (bookings, pipeline, KPIs, new SOP versions). This file is the *foundational* summary — update it only when something foundational changes (a new tier structure, a pivot, a resolved conflict). Never copy day-to-day operational data here.
>
> **Last consolidated:** 2026-07-03 · **Owner:** Ashwin (admin@stayze.in)

---

## 0. Quick orientation (read this first)

- **What:** Homestay management company in **Chikmagalur, Karnataka, India**. Runs the operational + marketing layer on top of independently-owned homestays. Owners keep their property.
- **Not:** a hotel chain, not an OTA. Positioning wedge = **"verification, not curation."** Customer line: **"Every stay here has been visited, not just listed."**
- **Team:** 3 people — **Ashwin** (primary founder) + 2 co-founders. Non-technical / semi-technical.
- **Scale:** 3 live properties — **P001 Hippla Homestay, P002 CoffeeCharm, P003 Adamya**. ~**₹2.5L** monthly gross, ~**₹85K** monthly profit combined.
- **Current goal:** onboard properties **4 → 9-10 from the open market**, keeping operations **fully manual** until well past property 10.
- **Domain:** stayze.in (registered; Google Workspace configured on it).
- **The five things that are broken/blocking right now** (see §12 for detail): (1) unresolved static-HTML-vs-React tech conflict, (2) placeholder WhatsApp number `910000000000` still live, (3) FitScore never run on the 3 existing properties, (4) no signed owner agreements, (5) no real property photography.

---

## 1. Company identity & brand foundation

**Mission (internal):** Build India's first recognized homestay management brand by making every Stayze property operationally consistent, commercially successful, and genuinely guest-first.

**Vision (5 yr):** 100 branded homestay properties across the Western Ghats and beyond — guests book *Stayze*, not just a property.

**Brand personality:** Reliable · Grounded · Direct and warm · Quietly ambitious.

**Core values (operational, not decorative):**
- **Transparency with owners** — show exactly what guests paid, what Stayze took, and why. No month-end surprises.
- **Standards over shortcuts** — don't onboard a property that isn't ready.
- **Owner success = Stayze's success** — every system is designed around that alignment.
- **Systems over heroics** — build systems that solve problems without the founders.

**What Stayze is NOT:** not luxury, not budget — a **quality** brand. Doesn't compete on price; competes on **consistency**. Grows by replicating standards, not lowering them.

### Tone of voice (applies to ALL copy, no exceptions)
1. Short sentences. One idea at a time. Split anything with >2 clauses.
2. Use **names, not categories** — "Ramu the caretaker," never "on-site hospitality associate."
3. **Banned words:** leverage, synergy, premium experience, exceptional, curated (unless literally curated), world-class, seamless.
4. Always end with a clear next step or a contact number.
5. Don't over-apologize — acknowledge, fix, move on. One sentence.

Write like: *"Your booking at Hippla Homestay is confirmed. Check-in is 2 PM. Ramu will meet you at the gate — his number is below if you get lost."*
Not like: *"We are delighted to confirm your upcoming stay and look forward to providing an exceptional hospitality experience."*

### Visual identity — "Plantation ledger"
Draws from coffee, laterite soil, old account books. Explicitly **avoids** resort-luxury and generic-SaaS gradient/glossy looks.

**Palette:**
| Name | Hex | Role |
|---|---|---|
| Bark brown | `#3D2B1F` | Primary ink |
| Clay | `#B5651D` | Accent |
| Mist green | `#5B7553` | Secondary |
| Paper cream | `#F2ECE0` | Background |
| Charcoal ink | `#2A2620` | Deep text |
| Gold | `#C9A05C` | Highlight |

**Typography:** **Fraunces** (serif, display/headings) · **Inter** (body/UI) · **JetBrains Mono** (all data labels & numerics — this is a *rule*, not a suggestion: every rupee figure, score, or date renders in mono).

---

## 2. Business model (v2.0 — current, supersedes v1)

> v1 (from an early ChatGPT brainstorm) is **archived**. v2 incorporates competitor analysis (OYO, Treebo, SaffronStays, StayVista), the scientific payout framework, the full FitScore, referral network, churn prevention, and the OTA-to-direct roadmap. **Review due: September 2026.**

### Revenue streams
1. **Booking margin (ACTIVE, primary):** Stayze sets the OTA listing price; owner gets an agreed payout %; Stayze keeps the spread after OTA commission.
2. **Monthly service fee (DESIGNED, not active):** ₹4,000/month below a revenue threshold, ₹10,000/month above. Activate ~**property 7**, once per-property cost is measurable.
3. **Direct booking savings (FUTURE):** OTA commission recovered on direct bookings. Build channel at property 6, activate contact list at 10, real engine at 25.

**Deferred, not abandoned:** coffee/spice product sales, experience packages, loyalty programs, mobile app, AI pricing engine, advanced CRM. Parked ideas.

### Owner payout tiers (scored, never negotiated)
| Tier | FitScore | Payout (% of net after OTA) | Profile |
|---|---|---|---|
| **Foundation** | 50-64 | **55%** | High Stayze effort, occupancy <25%, full rebuild |
| **Standard** | 65-79 | **60%** | Moderate effort, occupancy 25-50%, most new onboards |
| **Premium** | 80-100 | **65%** | Low effort, occupancy 50%+, focus on growth |

Formula: base 60% − Stayze effort premium (0-10%) + revenue growth premium (0-5%).
**Hard rule:** Stayze minimum take = **30% of net**; owner maximum payout = **70%**. Tiers reviewed every **6 months**; a property that improves FitScore + sustains a higher rating is auto-upgraded.

### The Uplift Test (MANDATORY before every agreement)
- X = owner's current monthly net **without** Stayze.
- Y = owner's projected payout **with** Stayze at assigned tier, ~50% occupancy.
- **Y > X → sign** (and show the owner the calculation). **Y < X → do not sign;** renegotiate or decline.
- It is a **quality gate, not a sales tool.**

### Unit economics (worked example — Standard tier)
₹4,500/night, 50% occupancy (15 nights), 20% OTA commission:
Gross ₹67,500 − OTA ₹13,500 = Net ₹54,000. Owner (60%) = ₹32,400. Stayze gross margin ₹21,600 − cost ₹3,000 = **Stayze net ₹18,600/month per property**. At 10 properties ≈ **₹1.86L/month net**.

### Cash flow calendar
1st-7th OTA payouts arrive · 8th-9th reconciliation · **10th: pay all owners with full report.**
Buffer: ~₹55K before property 5, ~₹1L before property 7, ~₹1.5-2L before property 10 (covers monsoon dip + OTA payment lag simultaneously).

### Seasonal strategy
Peak Oct-Feb: full pricing + festival premiums. Monsoon Jun-Aug: −20% base, monsoon listing variant, buffer built before June, **revenue-linked (not guaranteed) owner payouts**.

### OTA → Direct roadmap
3 props: collect guest WhatsApp contacts only · 6: Carrd.co landing page + WhatsApp CTA (manual bookings) · 10: activate contact list, target 15-20% direct · 25: proper booking engine (Lodgify), 25-30% direct · 50: 35-40% direct, Stayze brand is the search term.

### Key risks & mitigations
Owner exits on discovering margin → full transparency every month · Monsoon cash gap → 2-month buffer + revenue-linked payouts · OTA raises commission → build direct channel at property 6 · Wrong property onboarded → FitScore gate + 90-day review · Bandwidth collapse at 10 → automate first, hire a coordinator at property 7 if needed.

---

## 3. The FitScore — property evaluation instrument (100-point)

Completed during a **30-45 min in-person visit**. Determines eligibility **and** payout tier. Full blank form: `03 — Owner Acquisition / FitScore Evaluation Instrument — v1.0`.

| Cat | Area | Max | Sub-items |
|---|---|---|---|
| **A** | Location & access | 20 | A1 distance from town (8), A2 road quality (7), A3 nearest landmark (5) |
| **B** | Infrastructure | 25 | B1 water (10), B2 power (8), B3 mobile signal (4), B4 WiFi (3) |
| **C** | Hospitality readiness | 25 | C1 caretaker (10), C2 cleanliness (8), C3 linen/bath (4), C4 meals (3) |
| **D** | Revenue potential | 20 | D1 room count (8), D2 unique feature (7), D3 photo/Instagram (5) |
| **E** | Owner compatibility | 10 | E1 delegation (5), E2 responsiveness (3), E3 long-term intent (2) |

**Auto-reject (any ONE = immediate rejection, regardless of score):**
- Road inaccessible in monsoon (A2=0)
- No water supply / chronic shortage (B1=0)
- No caretaker AND no replacement plan (C1=0)
- Owner insists on controlling listing price (E1=0)
- Owner refuses to follow any SOP
- Active legal/ownership dispute
- Owner mentions selling within 12 months (E3=0)

**Scoring outcomes:** 0-49 reject (revisit in 3-6 mo) · 50-64 Foundation (55%, 90-day targets) · 65-79 Standard (60%) · 80-100 Premium (65%, reserve for top ~20%).
Completed forms file into `02 — Properties / [Property folder]`.

> ⚠️ **Version note:** `SOP-005` still references an **older 10-point** FitScore (min 7/10). That is legacy — the **100-point instrument above is authoritative**. SOP-005 should be updated to point at it (see §12).

---

## 4. Owner acquisition

Two channels run **simultaneously from week 1** (target 3 via direct, 3 via referral, to test which performs before scaling).

### Channel A — Direct approach
Find underperforming Chikmagalur listings on Airbnb/MakeMyTrip. Signals: ≤3.5 stars, <20 reviews, flat pricing (same weekend/weekday rate), weak photos, generic/short description, calendar gaps. Also drive plantation belts (Mullayanagiri road, Kemmangundi route, Baba Budangiri) for signposted properties with no online presence (first-mover). Cost = time only. First contact via **WhatsApp** (Prompt 8 from the Claude Prompt Library), reference something specific, ask only for a 15-min call — **don't pitch first**.

### Channel B — Referral network
Intermediaries introduce owners. **Commission: ₹3,000** (taxi drivers, travel agents, guides, real-estate agents) / **₹5,000** (existing Stayze owners — higher, they stake a relationship). Paid by **bank transfer only**, **after the referred property earns ₹30,000 gross** under Stayze (not on signing — anti-fraud, performance-gated). Flat rate regardless of volume. Max 1 commission per property (first introducer only). Not eligible: the owner themselves, their family, Stayze staff. **Informal until property 6** (share only with the 3 existing owners); formal public launch + flyers at property 6. Full policy: `03 — Owner Acquisition / Referral Network Policy — v1.0`.

### 5-stage sequence (never skip stages)
0. **Build target list** — 10 prospects before approaching the first. Enter each in Pipeline Tracker (stage: Prospect).
1. **First contact** — WhatsApp, no pitch, ask for 15-min call. Target 3/10 agree.
2. **Discovery call** — learn about the owner, don't pitch. Ask: how long listing, bookings/month, hardest part, thought about help, what the property means to them. End with "can I visit?"
3. **Property visit + FitScore** — 30-45 min, score as you go, take 10-15 assessment photos. **Don't reveal the score or mention payout %.** After: calculate total, determine tier, run the Uplift Test on the Owner P&L Model.
4. **Pitch meeting** (same/next day) — open with their current earnings, show the P&L, reveal the FitScore + tier + payout %, handle objections, close with "take the agreement home, no answer needed today."
5. **Agreement + onboarding** — walk the agreement together, sign **two physical copies** (owner keeps one; file the other in `06 — Legal / Signed Agreements`), then run **SOP-005** (14-day target agreement→live).

### Objection handling (key lines)
- *"I'm already on Airbnb, why you?"* → you did the hard part; we add optimized pricing (owners leave 20-30% on the table), pro photos, 24/7 guest response. Show the P&L.
- *"What % do you take?"* → never hide it; show the full breakdown; "what matters is what you earn with vs without us."
- *"I want to stay in control."* → you own it, block your own dates; we only control listing price because dynamic pricing drives occupancy.
- *"What if I'm not happy?"* → 30-day exit clause, WhatsApp message, no penalty.
- *"I heard bad things about OYO."* → OYO hid charges and delayed payments; Stayze sends a full monthly report showing every rupee.

### Competitor lessons
Copy from **OYO** (move fast, visit in person) but never overpromise/hide charges (OYO lost 500+ partners in 2019 over exactly that). Copy from **SaffronStays** (owners as custodians of their homes — emotional positioning cuts churn). Copy from **Treebo** (FitScore as a *recognition* tool — "not every property qualifies" creates desirability).

### Market acquisition specifics (properties 4-9)
Minimum brand presence required **before** outreach: live website, WhatsApp Business number with logo, printed one-pager with real numbers, Instagram with 9-12 posts. (An approached owner will search "Stayze Chikmagalur" before replying — that search result is the entire job of the brand presence right now.) **P4-P5** direct approach (stress-test the system) · **P6-P7** mix + formalize referral + add WhatsApp Business automation · **P8-P9** should take <10 days each; if still 4+ weeks, the bottleneck is process — fix it before P10. Timeline target: P4-9 within 90 days, min 5 new prospects/week.

---

## 5. Operations — deliberately manual (no custom tech before property 10)

Entire operation runs on **Google Workspace + Drive + Notion + WhatsApp + native OTA dashboards**. This is a *deliberate choice*, not an embarrassment.

**Weekly rhythm:** Sunday pricing review (next 4 weeks, all live properties, adjusted manually in each OTA dashboard) · 1st-7th payouts arrive · 8th-9th monthly reconciliation · 10th owner payouts + reports sent together · ongoing WhatsApp guest/caretaker comms.

**Highest-risk manual task:** calendar sync across OTAs — if a property is on 2+ OTAs, block dates on both within 1 hour of any booking (double-booking risk).

**Automation thresholds (do NOT introduce early):**
- **Property 6:** WhatsApp Business API tool (Wati/Interakt, ₹2-4K/mo) for templated messages — still manually triggered.
- **Property 8:** Channel manager (Smoobu, ~₹1.5K/mo per property) if any property is on 2+ OTAs.
- **Not before property 25:** a real booking engine / custom platform.

### SOPs (in `04 — Operations / SOPs`)
- **SOP-001 Check-in:** day-before prep (confirm details, clean, stock essentials, place welcome card, confirm to ops group); 60-min-before final walkthrough + air rooms; be at the gate in person; 5-min orientation max (WiFi, hot water, checkout, your number, 2 nearby things); then give space; confirm check-in to ops within 1 hr. Every property must have a **named backup caretaker** (visited once, has welcome card + WiFi + ops number, available within 2 hrs).
- **SOP-002 Checkout:** standard 11:00 AM. Evening-before warm reminder + ask about the stay (escalate complaints immediately). Morning: available not hovering; room inspection after vacate; walk guest to vehicle; **don't ask for review at checkout**; lost-item sweep within 30 min. Stayze (not caretaker) sends a **single** review request 2-4 hrs later.
- **SOP-003 Escalation matrix.** Golden rule: never leave a guest waiting >30 min for a response, even if the fix takes longer.
  - **L1 caretaker resolves (≤30 min):** hot water, WiFi, lights, cleanliness, towels/water, insects, lockout.
  - **L2 founder resolves (≤1 hr):** significant unhappiness, power cut >1 hr, water failure, medical, no caretaker+no backup, damage, refund/negative-review threats. Founders answer/call back within 15 min.
  - **L3 refund/compensation (Stayze founders ONLY):** caretaker must never promise money. Compensation order: partial refund → complimentary add-on → discount on next booking. Authorized for: power failure >4 hrs, accommodation materially different from listing, caretaker no-show, safety concern.
- **SOP-004 Caretaker daily check-in:** every day a guest is present (+ day before/after), send a fixed-format WhatsApp status to the ops group by **9:30 AM** (Property / Guest / Status / Departure). No message → Stayze calls by 10 AM. Weekly Monday status even with no guest.
- **SOP-005 New property onboarding:** 14-day target. Stage 0 qualify → Stage 1 agreement (Days 1-3, sign 2 copies, collect address/GST/bank/ID) → Stage 2 property setup (Days 3-7, create Drive folder `02 — Properties / P00X`, 20-25 photos in morning light, brief caretaker on SOP-001 & SOP-004, backup caretaker, welcome card) → Stage 3 listing creation (Days 7-10, Airbnb listing, base rate + weekend premium +20% + festival premiums, Moderate cancellation policy, add co-host hello@stayze.in) → Stage 4 go live (Days 10-14, publish, block first 3 days for indexing, add to trackers + Notion CRM, notify owner) → Stage 5 first-booking debrief.

### Churn prevention (why owners stay)
Four lock-ins: **economic** (earn more), **relationship** (respected + informed), **emotional** (proud of what the property became), **switching cost** (12-18 months of reviews/photos/listing equity accrue under the Stayze co-host account and can't transfer).
Systems: (1) **Monthly report** on the 10th — never a payout without the report, never a report without the full breakdown. (2) **Monthly owner call**, 10-12th, ≤10 min, relationship not business; one founder owns each owner relationship. (3) **Recognition milestones** (first booking, first 10 reviews, sustained 4.8+, first ₹1L month, tier upgrade). (4) **Tier upgrade pathway** — owners always know exactly what's needed (Foundation→Standard needs FitScore 65+ AND 4.5+ rating for 90 days; Standard→Premium needs 80+ AND 4.7+ for 90 days). (5) **Switching-cost document** (internal only). **Early warning signs:** stops responding, asks what guests "actually paid" beyond the report, mentions other managers, communicates directly with guests, asks to control pricing "just for the festival," "thinking about trying something different" → personal call within 24 hrs.

---

## 6. Logo system — 4 marks, distinct non-competing roles

Not 4 competing logos — one system. All **12 SVGs exported** and ready in `09 — Brand and Design / 02 — Logo and Visual Identity` (real, valid SVGs with actual brand hex — drop into website/Canva/favicon/print, no conversion needed).

| Mark | Role | Where used |
|---|---|---|
| **Roofline icon** | Primary icon | App icon, favicon, WhatsApp/Instagram avatar — anything needing legibility at tiny size |
| **Wordmark "stayze."** | Primary lockup partner | Paired with roofline for the default horizontal logo — header, docs, email signature |
| **Stamp mark** | **Verification badge** (not a company logo) | Applied to a property *only after it passes FitScore* — property pages, listing graphics. Never the main brand identity. |
| **Contour mark** | Place-mark / background watermark | Low-opacity (12-18%) texture on owner-facing pages + regional social content |

**Lockup rule:** horizontal (icon + wordmark) everywhere by default; stacked or icon-alone only for square/near-square spaces. Color: bark ink on paper backgrounds; reverses to paper cream + clay on dark/bark backgrounds.

**12 files:** `stayze-logo-horizontal-ink/-reversed`, `stayze-logo-stacked-ink/-reversed`, `stayze-icon-ink`, `stayze-icon-avatar-512`, `stayze-favicon-32`, `stayze-wordmark-ink/-reversed`, `stayze-stamp-badge/-reversed`, `stayze-placemark-contour`. Plus `profile-avatar-512.png` (roofline on bark — the actual Instagram profile photo).

---

## 7. Website & product architecture

Three audiences, **shared visual DNA** but distinct messaging + single CTA each:
- **Customer** (`stayze.in`) — warm/sensory, sells the experience. Job: make the guest want to book. **Built (high-fidelity mockup).**
- **Owner** (`stayze.in/owners`) — direct/transparent/evidence-led, sells outcome + safety. **Built as high-fidelity mockup** (was previously folded into the homepage; now its own page).
- **Agent/partner** (`stayze.in/partners`) — plain/transactional, sells the opportunity in <60 sec. **Built as high-fidelity mockup.**

### Product & Architecture Foundation (5 docs, built BEFORE any design)
In `09 — Brand and Design / 03 — Website / 00 — Product and Architecture Foundation`:
1. **PRD v1.0** — problem, positioning (verification not curation — do not re-litigate without a Decision Log entry), audiences + jobs-to-be-done, Phase 1 scope. **Phase 1 = credibility + lead-gen site, NOT a booking engine.** Explicitly out of scope: payments/booking, accounts/login, owner dashboard, live directory tier, multi-language, mobile app, DB-backed search. Success = qualitative (an owner can explain back what Stayze does + what they'd earn in <3 min; site doesn't look generic; verification concept visible on every property).
2. **IA Spec v1.0** — site map (`/`, `/properties`, `/properties/[slug]`, `/owners`, `/partners`; `/about` Phase 2). Every path ends in a WhatsApp link / contact / phone — never a dead end, never a payment screen. Homepage sections: hero → occasion tiles (couples/friends/family/workation, static pre-filtered links) → verification explainer → featured properties (each card shows a visible verification badge) → trust footer. Global header on all pages with always-visible WhatsApp CTA; no mega-menus.
3. **Content & Data Model v1.0** — entities defined even though Phase 1 has no DB: **Property** (property_code, name, location, `status: Verified | Directory`, fitscore_total, tier, occasion_tags, photos, caretaker_name, nearby_recommendations, nightly_rate_from, whatsapp_inquiry_link), **Owner** (name, property_code, payout_tier, agreement_status), **Referral/Partner** (referrer_name/type, commission_amount, property_referred, payment_status), **Occasion tag** (fixed vocab — adding a 5th requires a Decision Log entry). **Every website number must trace to an existing Drive doc — never invented for the site.** Source-of-truth mapping: FitScore/tier ← FitScore Instrument; payout % ← Business Model v2 / Owner Agreement; commission ← Referral Network Policy.
4. **Design System Spec v1.0** — the fix for "generic AI site" is **structure, not color**. Signature move = **the ledger entry** (slight 0.4-0.8° rotation on *key* cards only; monospace uppercase hairline header row; **all numerics in JetBrains Mono**; the stamp used as a real functional verification component). The **verification badge** is the single most important UI component and has explicit states: **Verified** ("Verified — 78/100 — Standard", uses stamp mark in clay) vs **Directory** (Phase 2; plain outline tag "Listed by owner — not yet verified", deliberately NOT the stamp). These two states must never be visually merged. Phase-1 component inventory is fixed/small: header, hero, occasion tile, property card, ledger-entry stat block, model-split block, footer. Disable the rotation below ~480px.
5. **Technical ADR v1.0** — **Direction A** (see conflict in §12): static HTML/CSS/JS, no framework, no backend, no CMS, no database; static host (GitHub Pages/Netlify/Vercel static) pointed at stayze.in; Drive is the canonical/audit copy, live host serves. Revisit only at ~15-20 properties, OR when the directory tier needs real filtering, OR when direct booking becomes active (~25 properties).

### Directory tier (Phase 2 — designed for, not built)
Owners who decline full management can list as unverified directory entries; Stayze acts as a lead-referral layer, funneling them toward full management once they see bookings. **Critical rule:** a directory listing must NEVER carry the same verification badge as a FitScored property, or the whole "every stay visited" promise collapses. IA + data model reserve the structural slot now. **No numerical trigger defined yet for when Phase 2 begins** (open item).

### Customer portal vision (v0.1 draft — 2026-07-03)
A founder vision for an **emotion-first, experience-led customer portal** (built on Next.js) exists: `…/00 — Product and Architecture Foundation / 06 — Customer Portal Product Vision — v0.1 (draft).md`. Signature move: call listings **"Stays," not "Properties"** ("Discover Your Next Stay"). Full-screen video hero, visual filters, story-led Stay pages (Quick Facts, "What You'll Experience," map, image reviews, availability calendar, sticky booking card), a 3-step booking flow with payment, Inspiration collections, Local Guides (SEO), a Trust section, and mobile-first bottom nav (Home/Search/Saved/Trips/Profile). **It diverges from the Phase-1 PRD/IA on 8 points** (biggest: online booking+payment, which the PRD deferred to ~25 properties and the IA said "never a payment screen"; plus availability data source, user accounts, best-price-guarantee vs OTA parity, aesthetic blend with the ledger design system). See the draft's "Reconciliation" section. **Not reconciled yet — architecture pending founder's detailed version.**

### Standout design direction (v0.2 — 2026-07-04, research-grounded)
The first customer-portal mockups were rejected for looking like "another OTA" (search bar → filter chips → card grid → map). A deep-research pass (26 sources, 23 claims verified) on how boutique/curated-travel brands beat OTAs produced a new direction: **"The Field Journal / Plantation Ledger."** Doc: `…/00 — Product and Architecture Foundation / 07 — Standout Design Direction + Research — v0.2.md`. Deck: `Stayze — Customer Portal — Standout Design v2.pptx` (root, 11 slides). Six patterns applied: curation-as-flex (Welcome Beyond ~2-3% accept, SLH "anti-chain"), browse-by-feeling not filters (Black Tomato "every journey starts with a feeling"), story-before-room (Aficionados essays, Aman "Meditations"), verification = a named person who visited (SLH "Meet the inspectors," Lacure "personally inspected"), a host not a search engine (concierge + named WhatsApp contact), and avoid the AI-default look (Inter-as-display, hero→features→cards, rounded shadowed cards). Signature page = **The Ledger** (FitScore as a visible inspection record — the page no OTA can copy). No search-hero / filter chips / card grid / map as primary UI.

### Built assets (still mockups — placeholder photos, non-functional links, not deployed)
- Wireframes (Phase 1): `wireframe-customer-homepage.html`, `wireframe-owner-page.html`, `wireframe-partner-page.html`, `wireframe-property-detail.html`.
- High-fidelity (Phase 1): `customer-homepage.html`, `owner-page.html`, `partner-page.html`, `property-detail.html` (Hippla).

---

## 8. Social media (Instagram — Phase 0)

Account launch uses a **graphics-first "Phase 0"** pack (brand-system graphics, not photos) because the Photography folder is empty. Deliberate, time-boxed bridge — real photos expected to interleave within 2-3 weeks.
- Handle preference: `@stayze.in` → `@stayzehomestays` → `@stayze.chikmagalur`. Display name: "Stayze | Homestays, Chikmagalur". Professional account, category "Property management company." Bio: *"Homestays that run like a brand. / Chikmagalur · Western Ghats / Owners + guests — DM us."* Link: stayze.in. Profile photo: `profile-avatar-512.png` (roofline icon only).
- Content: 6-slide carousel (intro / not-a-hotel-not-an-OTA / for owners / for guests / where we work / CTA) posted as ONE carousel; then a 19-sec brand-intro reel 1-2 days later (reels get more reach for a new account). Hashtags: #Chikmagalur #WesternGhats #HomestayChikmagalur #ChikmagaluriTourism #KarnatakaTourism #PlantationStay #HomestayIndia #ResponsibleTravel.
- Then hands off to the Influencer & Content Strategy v1.0 (Bengaluru micro-creators + WhatsApp travel groups).
- ⚠️ Same placeholder WhatsApp number (`910000000000`) is wired into the Instagram contact button — fix before launch.

---

## 9. Property registry & pipeline

**Property codes** (never reuse a code; assign sequentially):
- **P001 — Hippla Homestay** (Chikmagalur, ~3 rooms) — LIVE
- **P002 — CoffeeCharm** (Chikmagalur) — LIVE
- **P003 — Adamya** (Chikmagalur) — LIVE
- P004+ — available

**Trackers (`03 — Owner Acquisition`):**
- **Property Pipeline Tracker v2 (FitScore)** — the single live tracker. P001-P003 present but all FitScore/tier/payout/revenue fields are still `[placeholders]` — **not yet scored.** Stages: Prospect → Contacted → Discovery Call → Property Visit → Pitch Done → Agreed → Live.
- **Property Pipeline Tracker (v1)** — SUPERSEDED, moved to `08 — Archive`.
- **Weekly Acquisition KPI Dashboard** — empty template (Week 1-4 + 30-day total): properties identified, owners contacted, reply %, discovery calls, visits scheduled/completed, FitScores, rejections, proposals, agreements, referrals, commissions paid.
- **Referral Commission Tracker** — empty template (referrer name/type/phone, property, dates, gross earned, ₹30K trigger met, amount, payment date, bank provided).

### Target Property List — Round 1 (10 real leads, web-researched, NOT yet contacted or entered into the pipeline)
| Property | Area | Signal / angle |
|---|---|---|
| Hoovi Homestay | Mallandur | ~359 Justdial reviews, good — solid FitScore candidate (owner "Yogesh" named in reviews). Not a turnaround. |
| The Nest – Handi Homestay | Handi | ~243 reviews, mixed — food/indigestion + housekeeping complaints = exactly what Stayze fixes. Strong pitch angle. |
| Guddadamane Homestay | Chikmagalur town | ~779 reviews, mostly positive but cleanliness/add-on-pricing complaints. Likely Standard/Premium if visited. |
| Thotadhahalli Homestay | MG Road area | Low info — verify basics before contact. |
| Aakriti Homestay | Mallenahalli (near Deviramma Temple) | Pool + family amenities, real infra but generic copy. |
| Sriram Guesthouse | Chikmagalur town | Generic amenity-list listing — photography + copy upgrade candidate. |
| Honeyrock Homestay | Kanathi (22km) | Only 3 reviews, 4.67 — early-stage host, underexposed. Prime direct-outreach target. |
| Siderbhan Homestay | 25km out | 50-acre coffee estate, 110-yr-old heritage property — high revenue potential + strong guest story. |
| Elite Homestay Chikmagalur 4 | Chikmagalur | 2BHK, geysers + induction — functional infra; check reviews/pricing. |
| Foothills Home Stay | Chikmagalur | Generic Tripadvisor listing — direct lookup needed before scoring. |

---

## 10. Google Drive folder architecture

```
Stayze (root)
├── 00 — Foundation          brand doc, business model, decision log, naming conventions
├── 01 — Finance             booking tracker, owner P&L model, reconciliation sheet
├── 02 — Properties          one folder per property (P001…) + onboarding template
├── 03 — Owner Acquisition   FitScore, pitch one-pager, agreement template, playbooks, trackers
├── 04 — Operations          SOPs (check-in, checkout, escalation, caretaker, onboarding)
├── 05 — Marketing           photography (EMPTY), listing templates, influencer strategy
├── 06 — Legal               signed agreements
├── 07 — AI and Automation   Claude prompt library + addendum; Tech Leadership Handoff/CTO docs (Direction B)
├── 08 — Archive             superseded docs (Business Model v1, Pipeline Tracker v1)
└── 09 — Brand and Design    brand strategy, logo/visual identity, website, creatives, social
```

**Naming convention:** `YYYY-MM-DD — Description — Version.extension`. Property folders always prefixed with code (P001…) so they sort. SOPs: `SOP-00X — Action — vX.Y`. Logos are the exception — named by variant, not date. Versions: v1.0 first, v1.1 minor, v2.0 major rewrite. **Keep old versions; never permanently delete company files** — move superseded/offboarded items to `08 — Archive`.

**Access:** admin@stayze.in + ops@stayze.in = full access; future members get folder-specific access. Never share property folders with owners/caretakers via Drive — use WhatsApp/email for external docs. Workspace accounts: admin@, ops@, hello@, bookings@stayze.in.

---

## 11. Decisions already made (Decision Log)

Logged in `00 — Foundation / Stayze — Decision Log` (+ June 16-26 Addendum). Add every significant decision within 24 hrs (format: Date | Decision | Why | Who | Outcome). Key decisions:
- **2026-06-15:** Name **Stayze** (replaced working name "Nestora" — trademark conflicts: Nestora Brands, Nestora Ltd UK, Nestor Hotels Mumbai). stayze.in registered; trademark to be filed **Class 43** on IP India.
- Google Workspace set up on stayze.in.
- Revenue = booking margin only until property 7 (service fee adds friction before value is proven).
- Payout tiers 55/60/65; min Stayze take 30%, max owner 70%.
- All 3 existing properties to be FitScored + tiered **before** signing any new owner.
- Uplift Test mandatory before every agreement.
- Referral program informal until property 6.
- No direct-booking channel before property 6; collect guest WhatsApp contacts now.
- **No custom technology before property 10.**
- Business Model v2 adopted; v1 archived.
- **2026-06-24:** "Verification, not curation" positioning wedge confirmed (SaffronStays/StayVista own occasion-browsing). Directory tier flagged to Phase 2. `09 — Brand and Design` dept created. Logo system = 4 marks with roles. Website tech = static HTML only (Direction A). Full product/architecture foundation built before design.
- **2026-06-25/26:** Instagram launched with Phase-0 graphics. Tech Leadership Handoff / CTO / GitHub-repo docs produced (Direction B) — **created without reconciling against the ADR** → the conflict below.

---

## 12. ⚠️ OPEN ITEMS & UNRESOLVED CONFLICTS (act on these)

### CONFLICT 1 (biggest) — ✅ RESOLVED 2026-07-03: site pivots to Next.js
- **Decision:** the website will be built on **Next.js** (founder decision, Ashwin). This **supersedes** the Technical ADR v1.0 "static HTML, no framework" decision (Direction A) AND retires the React/Vite Direction B specifics. **Detailed plan pending from founder.** Full entry + addendum: `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`.
- **Still authoritative (unchanged):** PRD v1.0, IA Spec v1.0, Content & Data Model v1.0, Design System Spec v1.0 — all framework-agnostic. The Content & Data Model entities become the Next.js data layer; every website number must still trace to a source Drive doc.
- **Reference, not wasted:** the 4 existing high-fidelity HTML pages (customer homepage, owner, partner, property-detail) become the copy/IA/visual reference to port into Next.js.
- **Manual actions in Drive:** flag Technical ADR v1.0 Decision 1 as "Superseded 2026-07-03 (Next.js)"; treat Direction B docs (`07 — AI and Automation`) as reference only.
- **Open plan questions:** App Router vs Pages · hosting (Vercel?) · data source (JSON now vs Sheets/CMS/DB) · SSG vs SSR/ISR · backend/API routes · contact still WhatsApp-only (PRD Phase 1)? · who builds + timeline.

### Other open items
1. **Placeholder WhatsApp number `910000000000`** live on both website and Instagram contact button. Flagged in ≥3 docs. Single most-repeated open item. One real number = one source of truth. **Fix before treating either channel as live.**
2. **FitScore not formally run on P001-P003** — open since 2026-06-15; blocks finalizing their real tiers/payouts on paper (pipeline tracker still shows placeholders).
3. **No signed owner agreements** with any of the 3 existing owners — repeatedly flagged as top legal priority.
4. **Photography folder (`05 — Marketing`) is empty** — no real shots of P001-P003. Blocks website + Instagram moving past Phase-0 placeholders. Needs a shoot (even well-lit phone shots) before Instagram week 2-3.
5. **Website pages not deployed** — high-fidelity HTML are static mockups with placeholder photos/links, not wired to real data or live on stayze.in. Also: homepage header still needs the new horizontal lockup applied (currently text-only wordmark).
6. **10 Round-1 leads not yet entered into Pipeline Tracker v2 or contacted** — sitting as raw research.
7. **Directory tier (Phase 2) has no numerical trigger** for when it begins (e.g. "after property 9"). Worth defining so it doesn't defer indefinitely.
8. **SOP-005 uses a legacy 10-point FitScore** (min 7/10) — should be updated to reference the 100-point instrument (§3).
9. **Trademark** (Class 43) filing outcome not yet recorded.

---

## 13. How to work with this project (for agents & new chats)

- **This file is the baseline.** Tag/read it for full context. For anything operational or frequently changing (current bookings, live pipeline, latest SOP versions), read it **live from Drive** — this file is intentionally foundational-only.
- **Every number on any customer/owner/partner asset must trace to a source doc** (FitScore Instrument, Business Model v2, Referral Network Policy). Never invent a number for a website or graphic.
- **Check every asset against the Brand Document** — transparent, grounded, direct, warm; no banned words; numerics in JetBrains Mono; ends with a next step.
- **One asset per design request** — give the audience + the one job, reference what already exists, state the deliverable format.
- **Don't re-litigate settled decisions** (positioning, tiers, no-tech-before-10) without a new Decision Log entry.
- **When two documents disagree, surface it — don't let them disagree silently.**
- Update this file only when something **foundational** changes; log the change in the Decision Log too.

---

### Appendix — document index (where the detail lives)
- `00 — Foundation/` — Brand Document v1.0, Business Model v2.0, Decision Log v1.0 + Addendum (June 16-26), Naming Conventions & Access Guide, Ecosystem Map (SVG), Project Knowledge Master.
- `03 — Owner Acquisition/` — FitScore Instrument v1.0, Owner Acquisition Playbook v1.0, Market Acquisition & Manual Ops Playbook v1.0, Owner Churn Prevention System v1.0, Owner Pitch One-Pager v1.0, Referral Network Policy v1.0, Acquisition Handbook (reference note), Pipeline Tracker v2 + (v1 archived), Referral Commission Tracker, Weekly KPI Dashboard, Target Property List (Round 1).
- `04 — Operations/SOPs/` — SOP-001 to SOP-005.
- `09 — Brand and Design/` — Brand & Design Dept Strategy v1.0; Logo System Spec v1.0 + Logo File Index v1.0 + 12 SVGs + avatar PNG; Instagram Launch Pack v1.0; Website `00 — Product & Architecture Foundation` (Index, PRD, IA, Content/Data Model, Design System, Technical ADR) + `01 — Wireframes` + `02 — High-Fidelity Pages`.
- `07 — AI and Automation/` (referenced, not in this workspace snapshot) — Claude Prompt Library + Tech Leadership Handoff / CTO / GitHub-repo docs (Direction B).
