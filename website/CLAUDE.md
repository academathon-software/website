# Academathon — Project Context for Claude

## What this is
**Academathon** (academathon.ca) is a full-stack online tutoring marketplace
connecting Grades 1–12 students across Canada with vetted university tutors.

**Status: pre-launch.** The platform itself has not gone live yet — the
redesign is happening before launch so the first impression is right.

Background: the business previously operated as a manual tutoring service
(coordinated by hand) that served 200+ students and generated $60K+ in
revenue. That validated the demand. The platform is the productized version
of that proven model, and it's launching soon.

What this means for design:
- Treat this as a real launch, not an MVP — design quality has to inspire
  trust from the very first visitor
- No current users are tied to existing UI patterns, so we have full
  freedom to redesign anything
- The first wave of users will likely include returning families from the
  manual service, so the brand should feel familiar in spirit (warm,
  trustworthy, Canadian) even though the product is new

## Current Phase: Frontend Redesign
The backend is complete and stable.
**Do not modify backend logic, API contracts, database schemas, Flyway migrations,
Spring Boot code, or Stripe payment flow logic.** This phase is purely about
improving the visual design, layout, and UX of the React frontend.

If a backend change appears necessary, stop and ask first.

## Stack
- **Frontend:** React (Vite) + React Router + Axios + CSS Modules + FontAwesome
- **Payments UI:** Stripe.js / Stripe Elements (embedded)
- **Backend (do not touch):** Spring Boot 3.5, PostgreSQL/Supabase, JWT auth
- **Hosting:** Vercel (frontend), Render (backend)

Styling is currently **CSS Modules** — preserve this approach unless we
explicitly decide to migrate. Do not introduce Tailwind, styled-components,
or other styling libraries without discussion.

## Three User Roles — design each surface for its audience

### 1. Students / Parents (highest future volume, least technical)
Grades 1–12. For younger grades, a parent is typically the decision-maker
and the cardholder. Design must work for both audiences.
- Must feel welcoming, trustworthy, and clearly explain pricing in CAD
- Booking flow (subject → tutor → time slot) must feel effortless
- Stripe payment UI must look secure and reassuring — this is the moment
  of highest friction; first-time users have never paid Academathon before
- Dashboards: upcoming lessons, past lessons, messaging, reviews

### 2. Tutors (university students)
Invite-only, so they arrive with some pre-existing trust from being invited.
- Surface should feel professional — they're effectively running a small
  business through this dashboard
- Information density is OK; they manage availability, bookings, earnings
- 4-step onboarding (account → academic info → grades → subjects) needs polish
- Dashboards: schedule, booking requests, earnings, students, content uploads

### 3. Admins (internal)
Function over form, but still consistent with the rest of the brand.
- Tabs: Users, Tutors, Bookings, Statistics
- Dense data tables are fine here — readability is the priority

## Design Direction

Aesthetic goal: **warm and friendly, with editorial elegance and a touch of
clean minimalism.** Trustworthy enough that a first-time parent feels
comfortable entering credit card details for their kid's tutoring, while
still feeling human and approachable rather than corporate.

Since this is a launch, first-impression polish matters more than usual —
a visitor's confidence in the platform is built entirely from the visual
quality of the site itself, with no existing reputation in the product to
lean on yet.

Reference points:
- **Stripe** — warmth, generous whitespace, confident typography, tasteful gradients
- **Notion** — friendly approachability, clear information hierarchy
- **Apple / editorial sites** — elegant typography, restraint, sense of craft
- **Linear** — clean structure and polish in dashboard/app surfaces
- **Wealthsimple** — Canadian fintech that nailed "warm + trustworthy + premium"
  (worth studying as a peer in tone — they also sell trust to Canadians)

What this means in practice:
- Generous whitespace, never cramped
- Larger, more confident headline typography (editorial feel on marketing pages)
- Softer, warmer neutral palette — not stark white/black
- One restrained accent color used intentionally, not everywhere
- Subtle motion and hover states — never flashy
- Rounded corners, medium radius (not overly playful, not corporate-square)
- Real photography or warm illustration where it fits — avoid generic SaaS vectors
- Currency must display as CAD (`$25 CAD` not ambiguous `$25`)

Things to avoid:
- Harsh pure black on pure white
- Generic SaaS blue / "AI-generated landing page" look
- Heavy drop shadows, neon glows, maximalist gradients
- Cluttered dashboards — favor breathing room over information density
  (except admin tables, where density is OK)
- Anything that screams "MVP" or "side project" — this is a real launch
  and visitors will judge trustworthiness by visual polish

## Design System — LOCKED IN (homepage redesign complete)

All decisions below are final and must be carried forward consistently to
every subsequent page. Do not deviate without explicit approval.

### Typography ✅

**Font stack** (already loaded via Google Fonts in `index.html`):
- `--font-sans`: `'Outfit'` — brand font for all UI, body copy, buttons, labels, nav.
  Chosen because its geometric rounded style matches the "at" logomark.
- `--font-serif`: `'Instrument Serif'` — **italic accent only**, used exclusively
  for the hero headline `<em>a great tutor.</em>` and similar hero-level editorial moments.
  Do not use it for body copy or UI elements anywhere.

**Type scale & weight system:**

| Role | Size | Weight | Notes |
|---|---|---|---|
| Eyebrow label | 0.875rem | 600 | uppercase, letter-spacing: 0.11em, accent color |
| Hero headline | clamp(2.75rem, 5vw, 4.25rem) | 300 | letter-spacing: -0.03em, line-height: 1.08 |
| Hero headline italic accent | inherited | 400 | Instrument Serif italic, color: accent |
| Section headline (h2) | clamp(2.125rem, 4vw, 3.25rem) | 300 | letter-spacing: -0.025em, line-height: 1.12 |
| Section headline (smaller) | clamp(1.875rem, 3vw, 2.625rem) | 300 | letter-spacing: -0.02em |
| Stat number | clamp(2.75rem, 4vw, 4rem) | 300 | letter-spacing: -0.03em — Stripe-style thin numerals |
| Body / subhead | 1.0625–1.125rem | 300–400 | line-height: 1.65–1.7 |
| Card body / labels | 0.875–0.9375rem | 400–500 | |
| Primary button | 0.9375rem | 600 | letter-spacing: -0.01em |
| Small label / badge | 0.75–0.8125rem | 500–600 | often uppercase with letter-spacing |
| Section overline | 0.8125rem | 600 | uppercase, letter-spacing: 0.06–0.08em |

**Key rule:** font-weight 300 ("thin") is the default for all headlines and large
display text. This gives the site its editorial lightness. Only UI elements
(buttons, labels, nav links) use 500–700.

### Color Palette ✅

All tokens live in `Frontend/src/tokens.css` and must be used via CSS variables —
never hard-code hex values in component CSS files.

```css
/* Backgrounds */
--color-bg:              #FAFAF8   /* warm off-white — page background */
--color-surface:         #F5F4F0   /* slightly darker — section backgrounds */
--color-surface-raised:  #FFFFFF   /* cards, modals, elevated surfaces */
--color-border:          #EAE7E2   /* standard dividers */
--color-border-subtle:   #F0EDE8   /* very light dividers */

/* Text */
--color-text-primary:    #1C1917   /* near-black, warm undertone */
--color-text-secondary:  #57534E   /* muted body text */
--color-text-tertiary:   #A8A29E   /* placeholders, timestamps */

/* Accent — deep forest green (the ONLY brand accent color) */
--color-accent:          #2D6A4F   /* buttons, links, highlights */
--color-accent-hover:    #1B4332   /* hover/active state */
--color-accent-subtle:   #ECFDF5   /* tinted backgrounds */
--color-accent-border:   #A7F3D0   /* tinted borders */
--color-accent-light:    #52B788   /* lighter green for gradients */
```

**Stats section gradient** (lighter green → near-white, used on the canvas section):
```css
background: radial-gradient(
  ellipse 110% 85% at 50% 110%,
  #2D6A4F 0%, #3D8B62 12%, #52B788 26%, #80C9A4 40%,
  #A8DCBF 54%, #C8EDD9 67%, #DFF5EA 79%, #EDF8F2 100%
);
```

No dark mode — **decision is final**. Do not add dark mode variables or
`prefers-color-scheme` media queries.

### Spacing & Layout ✅

- **Base scale:** 4px. All spacing in multiples of 4.
- **Max content width:** 1120px (centered with `margin: 0 auto`)
- **Section horizontal padding:** 24px (mobile) → handled by inner containers
- **Hero padding:** `128px 24px 88px`
- **Section vertical padding:** typically 80–96px top/bottom
- **Whitespace philosophy:** generous — when in doubt, add more space, not less

### Border Radius ✅

```css
--radius-sm:   6px    /* inputs, small chips */
--radius-md:   10px   /* buttons, small cards */
--radius-lg:   14px   /* medium cards */
--radius-xl:   18px   /* large cards (tutor cards, modals) */
--radius-full: 9999px /* pill buttons, avatars, tags */
```

### Shadows ✅

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)
```

Keep shadows subtle — they should add depth, not drama.

### Component Patterns ✅

**Buttons:**
- Primary: `background: var(--color-accent)`, white text, `border-radius: var(--radius-full)`,
  padding `14px 28px`, font-weight 600, hover → `var(--color-accent-hover)` + `translateY(-1px)`
- Ghost/outline: transparent bg, `1px solid var(--color-border)`, dark text,
  same radius/padding, hover → `var(--color-surface)`
- Never use pure black or generic blue for any button

**Section overlines** (above h2s):
- Small uppercase label, 0.8125rem, font-weight 600, letter-spacing 0.06–0.08em
- Color: `var(--color-text-tertiary)` or `var(--color-accent)` depending on context

**Eyebrow (hero brand label):**
- "ACADEMATHON INC." above the hero headline
- 0.875rem, font-weight 600, uppercase, letter-spacing 0.11em, `var(--color-accent)`

**Cards:**
- Background: `var(--color-surface-raised)`, border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-xl)` for large cards, `var(--radius-lg)` for medium
- Shadow: `var(--shadow-lg)` for primary cards, `var(--shadow-md)` for secondary

**Dividers / horizontal rules:**
- Use `1px solid var(--color-border)` — never a heavier line

### Icons ✅

FontAwesome free-solid — already installed. Rules:
- Use sparingly and consistently — same visual weight throughout
- Standard sizes: 16px (inline), 20px (UI), 24px (feature icons)
- The Talk to ACE floating button uses `faWaveSquare`
- Never mix emoji and FontAwesome icons in the same context

## Key Surfaces to Redesign (rough priority order)

Marketing / pre-auth (most important for launch — first impressions):
1. ~~Landing page (homepage)~~ ✅ **DONE** — `HomeV2.jsx` is now live at `/`
2. Tutor profile pages (public) — what convinces a parent to book a specific tutor
3. Pricing / how-it-works pages — must clearly answer "what does this cost"
4. Login / signup
5. Tutor invite landing page (when a tutor clicks an invite link)

Student app:
6. Student dashboard
7. Browse/search tutors
8. 3-step booking flow (subject → tutor → time slot)
9. Stripe payment / SetupIntent screen
10. Messaging
11. Reschedule / cancel flows
12. Review submission

Tutor app:
13. 4-step tutor onboarding
14. Tutor dashboard (schedule + booking requests)
15. Availability editor (recurring + exceptions)
16. Earnings view
17. Subjects & content upload

Admin:
18. Admin dashboard (Users / Tutors / Bookings / Statistics tabs)
19. Invitation sender

## Brand & Copy

- Brand name: **Academathon**
- Domain: academathon.ca (note: `.ca`, not `.com` — Canadian)
- Tone: human, warm, never corporate, never childish
- Future audiences: students Grades 1–12, parents, university tutors
- Currency: always show **CAD**
- Pricing (do not change — backend is source of truth):
  - Grades 1–8: $25 CAD
  - Grades 9–10: $30 CAD
  - Grades 11–12 / College / Adult: $35 CAD

## Workflow Preferences

- Work **component-by-component**, not page-by-page
- Always test responsive at 375px (mobile), 768px (tablet), 1280px (desktop)
- Mobile is critical — many parents will book from their phone
- Prefer semantic HTML and accessible patterns (focus rings, ARIA, contrast)
- When unsure about a design choice, build 2–3 variants on `/styleguide`
  so I can pick visually rather than describing in words
- **No dark mode** — this decision is final and was made during the homepage redesign.
  Do not add `prefers-color-scheme` queries or dark mode token variants.
- Use CSS variables for all design tokens (colors, spacing, radius, type scale) —
  all tokens are defined in `Frontend/src/tokens.css`

## Booking Status Visual System (need consistent treatment)
Booking statuses appear throughout the app — must be a unified visual language:
- `PENDING` (waiting on tutor) — neutral, slightly attention-getting
- `CONFIRMED` (tutor accepted, payment captured) — positive
- `SCHEDULED` (locked in, lesson upcoming) — strong positive
- `COMPLETED` — calm, finished
- `CANCELLED` — muted, neutral-negative (not alarming)
- `REJECTED` — clear but not punishing
- Reschedule states — visually distinct from cancellations

## Out of Scope (do not touch)
- Backend code (Java, Spring Boot, JPA, Flyway migrations)
- Database schemas
- API contracts / endpoints / response shapes
- Stripe SetupIntent / off-session charging flow logic
- JWT auth logic (visual styling of login is fine; auth logic is not)
- Email template logic (Resend) — visual redesign of the HTML emails is
  in scope, but only if explicitly requested
- Pricing values ($25/$30/$35 CAD — these live on the backend)

## Roadmap Awareness (future, but worth designing flexibly for)
- Voice AI agent "Ace" ✅ **BUILT** — floating `Talk to ACE` button (LiveKit-powered),
  fixed bottom-right, uses `faWaveSquare` icon + pulsing green ring animation.
  Styles live in `Frontend/src/components/VoiceAgent/VoiceAgent.css`.
- Native iPad app — visual language should translate well to native iOS aesthetics
- Tutor earnings/payout dashboard — design earnings view extensibly
- In-app video calling — lesson UI may grow to include a video surface