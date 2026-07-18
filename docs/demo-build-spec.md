# Rastro Demo — Build Spec for Claude Code

## Context

Rastro is a commission-tracking SaaS for FieldRoutes-native pest control companies
with door-to-door (D2D) sales teams. This demo exists purely for sales outreach —
it needs to look and feel like a real, working app on a screen-share call, but it
has **no backend, no auth, no database.** All data lives in the front-end.

There is an existing `demo.html` (a slide-style presentation version of this concept)
in this project — use it as a starting reference for visual direction and layout
ideas, but this build should feel like a real app you can click around in, not a
slideshow. Do not preserve any slide/deck navigation patterns from it.

## Goal

Two screens, stateless, that a prospect can click through live on a call or that
get screenshotted for a print mailer:

1. **Dashboard** — commission summary across all reps for a pay period, at a glance
2. **Rep Detail / Configuration** — click into one rep, see their full payout
   breakdown, and see the commission rules that produced it

## Tech requirements

- Plain HTML + Tailwind CSS (via CDN is fine) + vanilla JS, OR a single-file React
  component if that's easier to wire up interactivity — your call, whichever is
  faster to get working cleanly.
- **Stateless**: all rep/company data lives in a JS object/array at the top of the
  file (see "Data" section below). No fetch calls, no persistence, no backend.
- **Light/dark mode toggle**: a visible toggle (sun/moon icon or switch) in the top
  corner that switches the whole UI between light and dark themes. Persist the
  choice in a JS variable only (no localStorage — not supported in this environment,
  and not needed since this is a single session demo).
- Fully clickable: clicking a rep row on the Dashboard navigates to that rep's
  Detail/Configuration screen. A back button returns to the Dashboard.
- Responsive isn't critical (this will be shown on a laptop screen or printed),
  but don't let it break badly on a smaller browser window.

## Design direction

- Dark mode: near-black background (`#0a0a0a` / `#0d0d0d`), off-white text
  (`#e5e5e5`), a single green accent (`#22c55e` — this is Rastro's existing brand
  green from the landing page) used sparingly for positive numbers, live/status
  badges, and the accent line above eyebrow labels. Monospace or semi-monospace
  font for numbers and data labels (like the reference screenshots), a clean sans
  for headings/body (e.g. Inter, or system-ui).
- Light mode: this is the version that will get printed for the physical mailer,
  so it needs to hold up on paper — off-white background (`#fafafa` or white,
  not stark `#ffffff` if possible), dark near-black text, same green accent used
  sparingly (green reads fine in print). Avoid relying on any effect that doesn't
  survive print (heavy shadows, glow effects, etc.) — keep it clean and flat in
  light mode specifically.
- Keep the existing visual language from the two reference screenshots:
  eyebrow labels in small caps with a short accent dash (e.g. "— OWNER VIEW"),
  bold large headline per screen, one-line subhead under it, card-based layout
  with subtle borders, no heavy shadows or gradients.
- Status/positive numbers in green, negative numbers (clawbacks) in red, warning
  states (not-yet-qualified housing progress) in amber/orange — same convention
  as the reference screenshots.

## Screen 1 — Dashboard

Eyebrow: `— OWNER VIEW`
Headline: `Your commission dashboard.`
Subhead: `See every rep's numbers at a glance — updated automatically as accounts close or cancel.`

A card titled `Commission Summary — Pay Period: July 1–15, 2026` with a `LIVE`
badge (green pill, top right of card).

Table columns: **REP | ACCOUNTS | RATE | EARNED | CLAWBACKS | NET PAYOUT | HOUSING**

Housing column shows either a green `✓ Qualified` badge (accounts sold ≥ 35) or
an amber progress indicator showing `{accounts}/35` for reps who haven't hit
the threshold yet. **Housing is always accounts-based (a count of signed accounts
needed to hit 35), never a dollar figure — do not introduce a dollar-based housing
threshold anywhere in this build.**

Each row is clickable → navigates to that rep's Detail screen.

### Exact data (use these numbers exactly — they're pre-reconciled with Screen 2, don't recompute or "improve" them)

| Rep            | Accounts | Rate | Earned | Clawbacks | Net Payout | Housing     |
| -------------- | -------- | ---- | ------ | --------- | ---------- | ----------- |
| Tom Brady      | 42       | 10%  | $6,720 | -$160     | $6,560     | ✓ Qualified |
| Jerry Rice     | 38       | 9%   | $5,472 | -$288     | $5,184     | ✓ Qualified |
| Ray Lewis      | 31       | 9%   | $4,464 | -$144     | $4,320     | 31/35       |
| Peyton Manning | 27       | 8%   | $3,456 | $0        | $3,456     | 27/35       |
| Randy Moss     | 19       | 7%   | $2,128 | -$112     | $2,016     | 19/35       |

(These all derive from a shared assumption of $1,600 average contract value per
account, if you want to sanity check the math — but just hardcode the table
above as-is rather than deriving it live.)

## Screen 2 — Rep Detail / Configuration

Default view when navigating here: **Tom Brady** (top rep, used as the flagship
example — this is also the screen most likely to get screenshotted for the print
mailer, so it should look especially clean).

Eyebrow: `— CONFIGURATION`
Headline: `Your rules. Automatically enforced.`
Subhead: `Set it once — Rastro handles the math from there.`

Back button/link to return to Dashboard.

Three-column layout (matches reference screenshot 2):

**Column 1 — Commission Settings** (card)

- Commission rate tiers (this replaces the single "default rate" slider from the
  old deck — the real product uses tiers, so show it that way):
  - Under 20 accounts: 7%
  - 20–29 accounts: 8%
  - 30–39 accounts: 9%
  - 40+ accounts: 10%
- Clawback window: 60 days
- Manager override: 3%
- Housing threshold: 35 accounts

**Column 2 — Payout Schedule** (card)

- Initial payout: 50%
- Backend 1 (Oct): 20%
- Backend 2 (Jan): 30%
- Total allocation: 100%
- Auto-clawback enabled: toggle (show as ON)

**Column 3 — Live Preview — Tom Brady** (card, this is the one that must reconcile
exactly with the Dashboard row above)

| Field                      | Value                        |
| -------------------------- | ---------------------------- |
| Accounts sold              | 42                           |
| Total contract value       | $67,200                      |
| Commission rate            | 10%                          |
| Total commission (earned)  | $6,720                       |
| Initial payout (50%)       | $3,360                       |
| Backend 1 – Oct (20%)      | $1,344                       |
| Backend 2 – Jan (30%)      | $2,016                       |
| Clawbacks (1 cancellation) | -$160                        |
| **Net rep payout**         | **$6,560**                   |
| Housing status             | ✓ Qualified (42/35 accounts) |

Below or beside the main table, show one small informational line (not subtracted
from the rep's own net payout — this is separate money paid to whoever manages
this rep, shown for context only):
`Manager override generated: 3% × $67,200 = $2,016 (paid to this rep's manager, not deducted from Tom Brady's payout above)`

**Important: Net rep payout ($6,560) must equal Dashboard's Net Payout for Tom
Brady exactly.** This was a real inconsistency in the earlier mockup version —
double check this reconciles before considering the build done.

### Interactivity for this screen

- Clicking a different rep name (could be a small dropdown/selector at the top
  of this screen, or just support navigating here from any Dashboard row) swaps
  the Live Preview panel to that rep's numbers, using the Screen 1 data table
  above run through the same tier/schedule logic. The Commission Settings and
  Payout Schedule columns stay the same (they're company-wide rules) — only the
  Live Preview column changes per rep.

## Out of scope for this build

- No login/auth screens
- No settings/admin beyond the Commission Settings card already specified
- No real FieldRoutes API integration or data import
- No persistence beyond the current browser session/in-memory state
