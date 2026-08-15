(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('count')) animateCount(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .section-title, .system-block, .depth-card, .loop, .count').forEach((el) => revealObserver.observe(el));

  requestAnimationFrame(() => body.classList.add('hero-ready'));

  function animateCount(el) {
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    if (reduceMotion) {
      el.textContent = el.dataset.format || el.dataset.value;
      return;
    }
    const target = Number(el.dataset.value || 0);
    const duration = 1200;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(target * ease(t));
      if (target >= 10000) el.textContent = `~${Math.round(value / 1000)}K`;
      else if (el.dataset.format?.endsWith('+')) el.textContent = `${value}+`;
      else if (el.dataset.format?.endsWith('M')) el.textContent = `${value}M`;
      else el.textContent = String(value);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = el.dataset.format || String(target);
    };
    requestAnimationFrame(frame);
  }

  const glow = document.querySelector('.cursor-glow');
  if (glow && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }

  document.querySelectorAll('.magnetic').forEach((el) => {
    if (reduceMotion) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.12;
      const y = (e.clientY - r.top - r.height / 2) * 0.12;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('.tilt').forEach((card) => {
    if (reduceMotion) return;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-py * 2.2}deg) rotateY(${px * 2.8}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  const stages = [...document.querySelectorAll('[data-stage]')];
  if (stages.length && !reduceMotion) {
    let stageIndex = 0;
    setInterval(() => {
      stages.forEach((s) => s.classList.remove('active', 'fault'));
      const current = stages[stageIndex % stages.length];
      current.classList.add('active');
      if (current.dataset.stage === 'verify' && Math.random() < 0.25) {
        current.classList.add('fault');
        setTimeout(() => {
          current.classList.remove('fault');
          document.querySelector('[data-stage="revise"]')?.classList.add('active');
        }, 380);
      }
      stageIndex += 1;
    }, 1150);
  }

  const loop = document.getElementById('loop');
  const loopNodes = loop ? [...loop.querySelectorAll('.node')] : [];
  if (loop && loopNodes.length && !reduceMotion) {
    let nodeIndex = 0;
    setInterval(() => {
      if (!loop.classList.contains('is-visible')) return;
      loopNodes.forEach((n) => n.classList.remove('active'));
      loopNodes[nodeIndex % loopNodes.length].classList.add('active');
      nodeIndex += 1;
    }, 1900);
  }

  const canvas = document.getElementById('signal-canvas');
  const visual = document.getElementById('reasoning-visual');
  if (canvas && visual && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    let particles = [];

    const resize = () => {
      const rect = visual.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.max(18, Math.floor(w / 18)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0.12 + Math.random() * 0.28,
        amp: 7 + Math.random() * 24,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.08 + Math.random() * 0.22
      }));
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.001;
      for (const p of particles) {
        p.x += p.vx;
        if (p.x > w + 8) p.x = -8;
        const y = p.y + Math.sin(t * 0.8 + p.phase) * p.amp;
        ctx.beginPath();
        ctx.fillStyle = `rgba(130,246,176,${p.alpha})`;
        ctx.arc(p.x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      const cy = h * 0.5;
      ctx.beginPath();
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 4) {
        const y = cy + Math.sin(x * 0.022 + t * 1.4) * 13 + Math.sin(x * 0.006 - t * 0.7) * 7;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(80,220,197,0)');
      grad.addColorStop(0.38, 'rgba(80,220,197,0.13)');
      grad.addColorStop(0.68, 'rgba(130,246,176,0.18)');
      grad.addColorStop(1, 'rgba(130,246,176,0)');
      ctx.strokeStyle = grad;
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !raf) raf = requestAnimationFrame(draw);
        else if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      });
    }, { threshold: 0.05 });

    resize();
    window.addEventListener('resize', resize, { passive: true });
    io.observe(visual);
  }

  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.style.transform = y > lastY && y > 180 ? 'translateY(-100%)' : 'translateY(0)';
      nav.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
      lastY = y;
    }, { passive: true });
  }
})();
