// במה משותפת: פורמט, מצלמה, סמן/מגע, כתוביות, פתיח וסגיר.
// סדר ה-tracks חשוב: גלילה ומצלמה נוספים לפני הסמן, כי הסמן מודד מיקום של אלמנטים.
(function () {
  const { clamp, lerp, ease, $, $$ } = TL;
  const params = new URLSearchParams(location.search);
  const format = params.get('format') === 'mobile' ? 'mobile' : 'web';
  document.documentElement.classList.add('fmt-' + format);
  const isMobile = format === 'mobile';

  // בוחר ערך לפי פורמט
  const pick = (web, mobile) => (isMobile ? mobile : web);

  // ---- מצלמה: רשימת keyframes {t, scale, x, y, dur} — x,y הם נקודת המוקד בפיקסלים של המסך
  function camera(tl, keys) {
    const cam = $('.camera');
    const W = innerWidth, H = innerHeight;
    let cur = { scale: 1, x: W / 2, y: H / 2 };
    const segs = keys.map((k) => {
      const from = { ...cur };
      let to = { scale: k.scale ?? 1, x: k.x ?? W / 2, y: k.y ?? H / 2 };
      if (k.el) {
        const r = $(k.el).getBoundingClientRect();
        to.x = r.left + r.width / 2; to.y = r.top + r.height / 2;
      }
      cur = to;
      return { t: k.t, dur: k.dur ?? 0.9, from, to };
    });
    tl.add(0, 0, (p, t) => {
      let s = { scale: 1, x: W / 2, y: H / 2 };
      for (const g of segs) {
        if (t < g.t) break;
        const q = ease.inOut(clamp((t - g.t) / g.dur));
        s = { scale: lerp(g.from.scale, g.to.scale, q), x: lerp(g.from.x, g.to.x, q), y: lerp(g.from.y, g.to.y, q) };
      }
      // מזיז כך שנקודת המוקד תהיה במרכז, מוגבל כדי לא לחשוף קצוות מעבר לצורך
      const tx = (W / 2 - s.x) * (s.scale > 1 ? 1 : 0);
      const ty = (H / 2 - s.y) * (s.scale > 1 ? 1 : 0);
      cam.style.transform = `translate(${tx * s.scale}px, ${ty * s.scale}px) scale(${s.scale})`;
      cam.style.transformOrigin = `${W / 2}px ${H / 2}px`;
    }, 'linear');
  }

  // ---- סמן: waypoints [{t, el|x,y, dur, tap}] — המיקום נמדד בזמן ה-seek (אחרי מצלמה וגלילה)
  function cursor(tl, points, { show = 0, hide = 1e9 } = {}) {
    const c = $('.cursor');
    const rip = $('.ripple');
    const posOf = (pt) => {
      if (pt.el) {
        const r = $(pt.el).getBoundingClientRect();
        return { x: r.left + r.width * (pt.ax ?? 0.5), y: r.top + r.height * (pt.ay ?? 0.5) };
      }
      return { x: pt.x, y: pt.y };
    };
    tl.add(0, 0, (p, t) => {
      c.style.opacity = t >= show && t < hide ? clamp(Math.min((t - show) / 0.3, (hide - t) / 0.3)) : 0;
      let pos = posOf(points[0]);
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        const dur = pt.dur ?? 0.7;
        if (t < pt.t - dur) break;
        const q = ease.inOut(clamp((t - (pt.t - dur)) / dur));
        const a = posOf(points[i - 1]), b = posOf(pt);
        pos = { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q) };
      }
      // לחיצה: הסמן מתכווץ והגל מתפשט
      let tapScale = 1, ripO = 0, ripS = 0.4;
      for (const pt of points) {
        if (!pt.tap) continue;
        const d = t - pt.t;
        if (d >= 0 && d < 0.18) tapScale = 1 - 0.18 * Math.sin((d / 0.18) * Math.PI);
        if (d >= 0 && d < 0.6) { ripO = 1 - d / 0.6; ripS = lerp(0.4, 1.6, ease.out(d / 0.6)); rip.style.left = posOf(pt).x + 'px'; rip.style.top = posOf(pt).y + 'px'; }
      }
      c.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${tapScale})`;
      if (!isMobile) c.style.transform = `translate(${pos.x - 6}px, ${pos.y - 4}px) scale(${tapScale})`;
      rip.style.opacity = ripO;
      rip.style.transform = `scale(${ripS})`;
    }, 'linear');
  }

  // ---- כתוביות: [{t, dur, html}] — כל כיתוב נכנס ויוצא
  function captions(tl, list) {
    const host = $('.captions');
    list.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'caption';
      el.innerHTML = c.html;
      host.appendChild(el);
      tl.add(0, 0, (p, t) => {
        const a = clamp((t - c.t) / 0.45), b = clamp((c.t + c.dur - t) / 0.35);
        const v = Math.min(a, b);
        el.style.opacity = v;
        el.style.transform = `translateY(${lerp(a < 1 ? 30 : -20, 0, a < 1 ? ease.out(a) : ease.out(b))}px)`;
      }, 'linear');
    });
  }

  // ---- גלילה של אלמנט: [{t, to, dur}] — to בפיקסלים של האפליקציה
  function scroll(tl, sel, keys) {
    const el = $(sel);
    let cur = 0;
    const segs = keys.map((k) => { const s = { t: k.t, dur: k.dur ?? 1.2, from: cur, to: k.to }; cur = k.to; return s; });
    tl.add(0, 0, (p, t) => {
      let y = 0;
      for (const g of segs) { if (t < g.t) break; y = lerp(g.from, g.to, ease.inOut(clamp((t - g.t) / g.dur))); }
      el.scrollTop = y;
    }, 'linear');
  }

  // ---- החלפת מסכים באפליקציה: [{t, show: '#screen-id'}] עם מעבר החלקה
  function screens(tl, keys, dur = 0.5) {
    const all = $$('.screen');
    tl.add(0, 0, (p, t) => {
      let idx = 0;
      keys.forEach((k, i) => { if (t >= k.t) idx = i; });
      const k = keys[idx], prev = keys[idx - 1];
      const q = ease.inOut(clamp((t - k.t) / dur));
      all.forEach((s) => { s.style.opacity = 0; s.style.transform = ''; s.style.zIndex = 0; });
      const curEl = $(k.show);
      curEl.style.opacity = prev ? q : 1; curEl.style.zIndex = 2;
      curEl.style.transform = prev && q < 1 ? `translateX(${lerp(-40, 0, q)}px)` : '';
      if (prev && q < 1) { const pe = $(prev.show); pe.style.opacity = 1 - q; pe.style.zIndex = 1; }
    }, 'linear');
  }

  // ---- כרטיס פתיח/סגיר
  function card(tl, sel, start, end) {
    const el = $(sel);
    const kids = Array.from(el.children);
    tl.add(0, 0, (p, t) => {
      const a = clamp((t - start) / 0.5), b = end ? clamp((end - t) / 0.5) : 1;
      el.style.opacity = start === 0 ? (end ? b : 1) : Math.min(a, b);
      kids.forEach((k, i) => {
        const q = ease.out(clamp((t - start - 0.15 - i * 0.18) / 0.7));
        k.style.opacity = q;
        k.style.transform = `translateY(${lerp(40, 0, q)}px)`;
      });
    }, 'linear');
  }

  window.STAGE = { format, isMobile, pick, camera, cursor, captions, scroll, screens, card };
})();
