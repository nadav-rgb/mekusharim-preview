// טיימליין דטרמיניסטי: כל track מקבל progress 0..1 לפי הזמן, וכל seek מחשב הכל מחדש.
// אין requestAnimationFrame ואין אנימציות CSS — כך כל פריים זהה בכל רינדור.
(function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = {
    linear: (p) => p,
    out: (p) => 1 - Math.pow(1 - p, 3),
    in: (p) => p * p * p,
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outBack: (p) => { const c = 1.5; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    outExpo: (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  };

  class Timeline {
    constructor() { this.tracks = []; this.duration = 0; }
    // fn(p, t) — p אחרי easing; נקרא בכל seek (גם לפני ההתחלה עם p=0 ואחרי הסוף עם p=1)
    add(start, dur, fn, easing = 'out') {
      const e = typeof easing === 'function' ? easing : ease[easing];
      this.tracks.push({ start, dur, fn, e });
      this.duration = Math.max(this.duration, start + dur);
      return this;
    }
    // קריאה רציפה עם הזמן היחסי — לגלילה, ספירה וכו'
    seek(t) {
      for (const k of this.tracks) {
        const raw = k.dur <= 0 ? (t >= k.start ? 1 : 0) : clamp((t - k.start) / k.dur);
        k.fn(k.e(raw), t, raw);
      }
    }
  }

  const $ = (sel, root = document) => (typeof sel === 'string' ? root.querySelector(sel) : sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // עזרים נפוצים -------------------------------------------------------------
  const fx = {
    // הופעה עם תזוזה
    rise(tl, sel, start, dur = 0.6, dy = 24, easing = 'out') {
      const el = $(sel);
      tl.add(start, dur, (p) => {
        el.style.opacity = p;
        el.style.transform = `translateY(${lerp(dy, 0, p)}px)`;
      }, easing);
    },
    fadeIn(tl, sel, start, dur = 0.5) {
      const el = $(sel);
      tl.add(start, dur, (p) => { el.style.opacity = p; });
    },
    fadeOut(tl, sel, start, dur = 0.5) {
      const el = $(sel);
      tl.add(start, dur, (p) => { el.style.opacity = 1 - p; });
    },
    pop(tl, sel, start, dur = 0.5) {
      const el = $(sel);
      tl.add(start, dur, (p) => {
        el.style.opacity = clamp(p * 2);
        el.style.transform = `scale(${lerp(0.85, 1, p)})`;
      }, 'outBack');
    },
    // הקלדה של טקסט
    type(tl, sel, text, start, cps = 22) {
      const el = $(sel);
      const dur = text.length / cps;
      tl.add(start, dur, (p, t, raw) => {
        const n = Math.round(raw * text.length);
        el.textContent = text.slice(0, n);
        el.classList.toggle('typing', raw > 0 && raw < 1);
      }, 'linear');
      return start + dur;
    },
    // ספירה של מספר
    count(tl, sel, to, start, dur = 1.2, fmt = (v) => Math.round(v).toLocaleString('he-IL')) {
      const el = $(sel);
      tl.add(start, dur, (p) => { el.textContent = fmt(to * p); }, 'outExpo');
    },
    // מספר "בורר" — מופיעים פריטים ברצף
    stagger(tl, sels, start, gap = 0.08, dur = 0.5, dy = 18) {
      const els = typeof sels === 'string' ? $$(sels) : sels;
      els.forEach((el, i) => fx.rise(tl, el, start + i * gap, dur, dy));
      return start + els.length * gap + dur;
    },
  };

  window.TL = { Timeline, ease, clamp, lerp, fx, $, $$ };
})();
