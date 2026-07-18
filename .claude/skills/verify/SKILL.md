---
name: verify
description: Verify the Rastro static site (index.html / demo/index.html) by rendering it in headless Chrome and screenshotting. Use when confirming a visual/JS change to the landing page or demo actually works.
---

# Verifying Rastro (static site, no build step)

There is no build/test tooling — the site is vanilla HTML/CSS/JS served
as static files. Verify by **rendering in headless Google Chrome and
screenshotting**, then Read the PNG.

## Handle

Chrome is installed at:
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

Screenshot a page directly (relative `../assets/` refs resolve when
loaded via `file://` from its real location):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1440,880 \
  --virtual-time-budget=3500 \
  --screenshot=/path/out.png \
  "file:///Users/cristiancruz/WebstormProjects/rastro/demo/index.html"
```

## Driving interactive states (drawer open, customized, rep detail)

`--screenshot` can't click. To observe a post-interaction state, copy
the file to the scratchpad, rewrite `../assets/` to absolute
`file:///Users/.../rastro/assets/`, and append a `<script>` before
`</body>` that calls the page's OWN global functions (they're in the
classic-script global scope, callable by name):

- Customize demo: set `CONFIG.companyName`, `CONFIG.logo` (a
  `data:image/svg+xml,` URI), `CONFIG.tiers[i].rate`, then
  `setAccent('#3b82f6'); applyCobrand(); refreshData(); syncPanelInputs();`
- Open the panel: `openPanel();`
- Rep detail screen: `openDetail('tom');`

Then screenshot the copy. This exercises the real code paths.

## Gotchas

- `localStorage` is blocked on `file://` (all writes are try/caught, so
  no error) — persistence itself can't be observed locally; it works on
  the hosted https site (same pattern as the theme toggle).
- The `hidden` attribute is defeated by any author rule that sets
  `display` on the same element — the global `[hidden]{display:none
  !important}` rule guards this; watch for it if adding toggled elements.
- Fonts load from Google Fonts (network); offline just falls back.
