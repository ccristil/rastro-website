/*
 * Hero pay stub.
 *
 * Plays a looping set of example events against the pay statement in the
 * hero: sales add to "Initial sales", cancels add to "Clawbacks", the total
 * and housing bar follow. After two passes the period is stamped "Paid" and
 * the statement resets. The card tilts toward the pointer.
 *
 * The HTML already holds the starting numbers, so the card reads correctly
 * with JS off or reduced motion on; this script only animates from there.
 */
(() => {
  const stack = document.getElementById("stubStack");
  if (!stack) return;
  const $ = (id) => document.getElementById(id);
  const hero = stack.closest(".hero") || document.body;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- data ----------------------------------------------------------------
  const GOAL = 10000; // full width of the housing bar
  const THRESH = 7500;
  const BACKEND = 1120;
  const INITIAL = { sales: 7130, salesCount: 42, claw: -705, clawCount: 3 };
  // Deltas net to zero over one pass, so the total returns to $7,545.
  const SCRIPT = [
    { d: 80, what: "76 Willow Way", tag: "sold" },
    { d: -165, what: "1190 Maple Ave", tag: "clawback" },
    { d: 120, what: "905 Aspen Dr", tag: "sold" },
    { d: 75, what: "33 Birch Ct", tag: "sold" },
    { d: 60, what: "1407 Pine St", tag: "sold" },
    { d: -375, what: "2210 Oak St", tag: "backend clawback" },
    { d: 95, what: "2318 Cedar Ln", tag: "sold" },
    { d: 110, what: "412 Elm St", tag: "sold" },
  ];
  const EVENT_EVERY = 2600;
  const FIRST_EVENT = 2200;
  const ROLLOVER_HOLD = 3400; // stamp + reset, before the next event
  const PASSES_PER_PERIOD = 2;

  let st = { ...INITIAL };
  let step = 0; // position in SCRIPT
  let sinceReset = 0; // events played this period
  let lastSync = Date.now();

  const total = () => st.sales + BACKEND + st.claw;
  const money = (n) => (n < 0 ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // ---- pay period dates (the two weeks ending today) ------------------------
  (function setDates() {
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 13);
    $("stubDates").textContent = `${fmt(start)} – ${fmt(end)}`;
  })();

  // ---- rendering -------------------------------------------------------------
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function tween(el, to, dur = 650) {
    const from = el._v ?? to;
    el._v = to;
    cancelAnimationFrame(el._raf);
    if (reduceMQ.matches || from === to) {
      el.textContent = money(to);
      return;
    }
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = money(from + (to - from) * easeOut(k));
      if (k < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  function flash(el, cls, ms = 450) {
    el.classList.remove("flash-up", "flash-down", "is-up", "is-down");
    void el.offsetWidth; // restart the transition
    el.classList.add(cls);
    clearTimeout(el._flash);
    el._flash = setTimeout(() => el.classList.remove(cls), ms);
  }

  function render() {
    const t = total();
    tween($("stubSales"), st.sales);
    tween($("stubClaw"), st.claw);
    tween($("stubTotal"), t);
    $("stubSalesCount").textContent = plural(st.salesCount, "account", "accounts");
    $("stubClawCount").textContent = plural(st.clawCount, "cancel", "cancels");

    const below = t < THRESH;
    const bar = $("stubBar");
    bar.style.width = Math.min(100, (t / GOAL) * 100) + "%";
    bar.classList.toggle("is-below", below);
    const hs = $("stubHousing");
    hs.className = below ? "short" : "ok";
    hs.textContent = below ? `${money(THRESH - t)} short` : "Qualified";
  }

  function addActivity(e) {
    const list = $("stubActivity");
    const li = document.createElement("li");
    li.className = (e.d > 0 ? "up" : "down") + " is-new";
    li.innerHTML =
      `<span class="what">${e.what}</span>` +
      `<span class="tag">${e.tag}</span>` +
      `<span class="amt">${e.d > 0 ? "+" : ""}${money(e.d)}</span>`;
    list.prepend(li);
    while (list.children.length > 3) list.lastElementChild.remove();
  }

  // ---- story -----------------------------------------------------------------
  // Returns how long to wait before the next event.
  function playEvent() {
    if (sinceReset === SCRIPT.length * PASSES_PER_PERIOD) {
      sinceReset = 0;
      rollOver();
      return ROLLOVER_HOLD;
    }
    const e = SCRIPT[step++ % SCRIPT.length];
    sinceReset++;
    if (e.d > 0) {
      st.sales += e.d;
      st.salesCount++;
      flash($("stubLineSales"), "flash-up");
    } else {
      st.claw += e.d;
      st.clawCount++;
      flash($("stubLineClaw"), "flash-down");
    }
    flash($("stubTotal"), e.d > 0 ? "is-up" : "is-down", 700);
    addActivity(e);
    lastSync = Date.now();
    updateSynced();
    render();
    return EVENT_EVERY;
  }

  // Stamp the period paid, then reset the statement to its starting numbers.
  function rollOver() {
    $("stubStampAmt").textContent = money(total());
    $("stubStamp").classList.add("is-on");
    setTimeout(() => $("stubNumbers").classList.add("is-resetting"), 1500);
    setTimeout(() => {
      st = { ...INITIAL };
      ["stubSales", "stubClaw", "stubTotal"].forEach((id) => ($(id)._v = undefined));
      render();
      $("stubNumbers").classList.remove("is-resetting");
      $("stubStamp").classList.remove("is-on");
    }, 1900);
  }

  function updateSynced() {
    const s = Math.round((Date.now() - lastSync) / 1000);
    $("stubSynced").textContent = s < 3 ? "just now" : `${s}s ago`;
  }

  // ---- timing: only run while the hero is on screen and the tab is visible ----
  let timer = 0;
  let syncTimer = 0;
  let visible = false;
  let started = false;

  function run() {
    if (timer) return;
    timer = setTimeout(function next() {
      timer = setTimeout(next, playEvent());
    }, started ? 1200 : FIRST_EVENT);
    started = true;
    syncTimer = setInterval(updateSynced, 1000);
  }
  function pause() {
    clearTimeout(timer);
    clearInterval(syncTimer);
    timer = 0;
  }
  function update() {
    if (visible && !document.hidden && !reduceMQ.matches) run();
    else pause();
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    }).observe(stack);
  } else {
    visible = true;
    update();
  }
  document.addEventListener("visibilitychange", update);
  reduceMQ.addEventListener?.("change", update);

  // ---- tilt toward the pointer (mouse and pen only) ---------------------------
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" || reduceMQ.matches) return;
    const r = stack.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.2)));
    const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.2)));
    stack.style.setProperty("--stub-ry", `${-15 + x * 12}deg`);
    stack.style.setProperty("--stub-rx", `${9 - y * 9}deg`);
    stack.style.setProperty("--stub-sx", `${x * 25}%`);
  });
  hero.addEventListener("pointerleave", () => {
    stack.style.removeProperty("--stub-ry");
    stack.style.removeProperty("--stub-rx");
    stack.style.removeProperty("--stub-sx");
  });

  // Seed tween state from the numbers already in the HTML.
  $("stubSales")._v = st.sales;
  $("stubClaw")._v = st.claw;
  $("stubTotal")._v = total();
})();
