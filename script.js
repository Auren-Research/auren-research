(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const dotsEl = document.getElementById("dots");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const progressBar = document.getElementById("progress-bar");
  const counter = document.getElementById("counter");

  let current = 0;
  let locked = false;
  const TRANSITION_MS = 560;
  const chartAnimated = new Set();

  /* ── Dots ──────────────────────────────────── */

  function buildDots() {
    dotsEl.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(btn);
    }
  }

  function updateChrome() {
    const dots = dotsEl.querySelectorAll(".dot");
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === current);
      d.setAttribute("aria-selected", i === current ? "true" : "false");
    });
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;
    progressBar.style.width = `${((current + 1) / total) * 100}%`;
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    if (window.location.hash !== `#${current + 1}`) {
      history.replaceState(null, "", `#${current + 1}`);
    }
  }

  /* ── Navigation ────────────────────────────── */

  function goTo(index, dir) {
    if (locked) return;
    if (index < 0 || index >= total || index === current) return;

    const direction = dir ?? (index > current ? 1 : -1);
    const prev = current;
    locked = true;

    const leaving = slides[prev];
    const entering = slides[index];

    leaving.classList.remove("is-active");
    leaving.classList.add("is-exit");

    entering.classList.remove("is-exit");
    entering.classList.add(direction > 0 ? "is-enter-from-next" : "is-enter-from-prev");
    void entering.offsetWidth;
    entering.classList.remove("is-enter-from-next", "is-enter-from-prev");
    entering.classList.add("is-active");

    current = index;
    updateChrome();
    onSlideEnter(entering);

    window.setTimeout(() => {
      leaving.classList.remove("is-exit");
      locked = false;
    }, TRANSITION_MS);
  }

  function next() {
    goTo(current + 1, 1);
  }

  function prev() {
    goTo(current - 1, -1);
  }

  /* ── Keyboard ──────────────────────────────── */

  function onKey(e) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "PageDown":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goTo(0, -1);
        break;
      case "End":
        e.preventDefault();
        goTo(total - 1, 1);
        break;
      default:
        break;
    }
  }

  /* ── Touch / wheel ─────────────────────────── */

  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartT = 0;

  function onTouchStart(e) {
    if (!e.touches || !e.touches[0]) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchStartT = Date.now();
  }

  function onTouchEnd(e) {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dt = Date.now() - touchStartT;
    if (dt > 600) return;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    } else if (Math.abs(dy) > 60) {
      if (dy < 0) next();
      else prev();
    }
  }

  let wheelLock = false;
  function onWheel(e) {
    if (wheelLock) return;
    const threshold = 40;
    if (Math.abs(e.deltaY) < threshold && Math.abs(e.deltaX) < threshold) return;
    wheelLock = true;
    if (e.deltaY > 0 || e.deltaX > 0) next();
    else prev();
    window.setTimeout(() => {
      wheelLock = false;
    }, 700);
  }

  /* ── Glyph texture fields ──────────────────── */

  const GLYPH_POOL = [
    "0", "1", "0x", "#", "@", ">", "CVE-", "0xA3", "FF", "00",
    "||", "//", "0x", "1", "0", "#", "@", "AF", "3E", "B2",
    ">>", "0x", "1", "0", "CVE", "##", "0x4F", "01", "10",
  ];

  function fillGlyphFields() {
    document.querySelectorAll("[data-glyphs]").forEach((el) => {
      const pieces = [];
      const count = el.classList.contains("glyph-field--sparse") ? 180 : 320;
      for (let i = 0; i < count; i++) {
        pieces.push(GLYPH_POOL[(Math.random() * GLYPH_POOL.length) | 0]);
      }
      el.textContent = pieces.join(" ");
    });
  }

  /* ── Charts ────────────────────────────────── */

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el, target, decimals, duration) {
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = target * easeOutCubic(t);
      el.textContent = v.toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }

    requestAnimationFrame(frame);
  }

  function barWidthPercent(value, min, max) {
    const lo = Number.isFinite(min) ? min : 0;
    const hi = Number.isFinite(max) ? max : 1;
    const span = hi - lo || 1;
    // For tight ranges (perplexity), expand small deltas into a readable band
    if (lo > 0) {
      const normalized = (value - lo) / span;
      return 35 + normalized * 65;
    }
    return Math.max(4, (value / hi) * 100);
  }

  function animateChart(card) {
    const id = card.getAttribute("data-chart") || "chart";

    if (chartAnimated.has(id)) {
      card.querySelectorAll(".chart__bar").forEach((bar) => {
        const value = parseFloat(bar.dataset.value);
        const min = parseFloat(bar.dataset.min);
        const max = parseFloat(bar.dataset.max);
        bar.style.width = `${barWidthPercent(value, min, max)}%`;
        bar.classList.add("is-animated");
      });
      card.querySelectorAll("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "2", 10);
        el.textContent = target.toFixed(decimals);
      });
      return;
    }

    chartAnimated.add(id);

    card.querySelectorAll(".chart__bar").forEach((bar, i) => {
      const value = parseFloat(bar.dataset.value);
      const min = parseFloat(bar.dataset.min);
      const max = parseFloat(bar.dataset.max);
      const width = barWidthPercent(value, min, max);
      window.setTimeout(() => {
        bar.style.width = `${width}%`;
        bar.classList.add("is-animated");
      }, 120 + i * 90);
    });

    card.querySelectorAll("[data-count]").forEach((el, i) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "2", 10);
      window.setTimeout(() => {
        animateCount(el, target, decimals, 900);
      }, 100 + i * 90);
    });
  }

  function onSlideEnter(slide) {
    const card = slide.querySelector("[data-chart]");
    if (card) {
      window.setTimeout(() => animateChart(card), 280);
    }
  }

  /* ── Init ──────────────────────────────────── */

  function init() {
    buildDots();
    fillGlyphFields();

    btnPrev.addEventListener("click", prev);
    btnNext.addEventListener("click", next);
    document.addEventListener("keydown", onKey);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("wheel", onWheel, { passive: true });

    // Deep-link: #3 (1-indexed)
    const hash = window.location.hash.replace("#", "");
    const fromHash = parseInt(hash, 10);
    if (!Number.isNaN(fromHash) && fromHash >= 1 && fromHash <= total) {
      slides[0].classList.remove("is-active");
      current = fromHash - 1;
      slides[current].classList.add("is-active");
    }

    updateChrome();
    onSlideEnter(slides[current]);
  }

  init();
})();
