/* ============================================================================
   מקור אמת יחיד לכל הניווט באפליקציה (מראה את src/lib/navigation.ts באמת).
   כל מסך מצהיר על ה-.screen איזה צד + איזו לשונית פעילה:
       <div class="screen" data-nav="consumer" data-current="home">
   מכאן נבנים אוטומטית, בלי שכפול בין מסכים:
     • סרגל תחתון — 5 יעדים כלליים (הכרעת נדב 24.07)
     • כפתור חזרה  (#2) — בכל מסך שאינו הבית
     • מגירת ניווט (#5/#6) — כל היעדים, כולל המסכים העמוקים ("מכתב לרבי" וכו')
     • גיליון פנייה (#7) — 4 ערוצים בצבע ולוגו
     • החלקה ימינה/שמאלה בין 5 היעדים (#8)

   סקריפט קלאסי בכוונה — כרום חוסם מודולים על file://.
   הסדר במערכים = סדר קריאה עברי: הראשון = הימני ביותר ב-RTL.
   ============================================================================ */
;(function () {
  /* ---- סרגל תחתון: 5 יעדים כלליים. האמצעי (index 2) = הבית, עיגול מוגבה ---- */
  var NAVS = {
    shaliach: {
      accent: 'dark',
      items: [
        { key: 'contacts', label: 'קשרים', icon: 'users', href: '02-contact.html' },
        { key: 'reports', label: 'דוחות', icon: 'chart-column', href: '06-rebbe-report.html' },
        { key: 'home', label: 'מרכז השליח', icon: 'home', href: '01-shaliach-home.html' },
        { key: 'events', label: 'אירועים', icon: 'calendar', href: '05-events-campaigns.html' },
        { key: 'settings', label: 'הגדרות', icon: 'settings', href: '#' },
      ],
    },
    consumer: {
      accent: 'gold',
      items: [
        { key: 'houses', label: 'בתי חב״ד', icon: 'building', href: '09-find-chabad.html' },
        { key: 'calendar', label: 'לוח שנה', icon: 'calendar', href: '15-event.html' },
        { key: 'home', label: 'בית', icon: 'home', href: '08-consumer-home.html' },
        { key: 'life', label: 'החיים שלי', icon: 'heart', href: '11-my-jewish-life.html' },
        { key: 'more', label: 'עוד', icon: 'more-horizontal', href: '#', drawer: true },
      ],
    },
  }

  /* ---- מגירה: כל היעדים, מקובצים. כאן "נפתח כל מה שהיה חבוי" (#6) ---------- */
  var DRAWER = {
    shaliach: {
      title: 'בית חב״ד במארסיי',
      sub: 'מרכז השליח · הרב שניאור',
      groups: [
        {
          items: [
            { label: 'מרכז השליח', icon: 'home', href: '01-shaliach-home.html', key: 'home' },
            { label: 'קשרים ומעקב', icon: 'users', href: '03-followup.html' },
            { label: 'כרטיס איש קשר', icon: 'user', href: '02-contact.html' },
            { label: 'הכנה אישית לשיחה', icon: 'sparkles', href: '04-call-prep.html' },
          ],
        },
        {
          title: 'קהילה, תוכן ודיווח',
          items: [
            { label: 'אירועים וקמפיינים', icon: 'calendar', href: '05-events-campaigns.html' },
            { label: 'דוח לרבי', icon: 'scroll-text', href: '06-rebbe-report.html' },
            { label: 'רישות בתי חב״ד', icon: 'globe', href: '07-network.html' },
          ],
        },
        {
          items: [
            { label: 'כל המסכים', icon: 'layout-grid', href: 'index.html' },
            { label: 'הגדרות', icon: 'settings', href: '#' },
            { label: 'יציאה', icon: 'log-out', href: 'index.html', exit: true },
          ],
        },
      ],
    },
    consumer: {
      title: 'קהילת מקושרים',
      sub: 'האפליקציה שלי',
      groups: [
        {
          items: [
            { label: 'בית', icon: 'home', href: '08-consumer-home.html', key: 'home' },
            { label: 'מצא בית חב״ד', icon: 'building', href: '09-find-chabad.html' },
            { label: 'בית חב״ד שלי', icon: 'map-pin', href: '10-chabad-house.html' },
          ],
        },
        {
          title: 'החיים היהודיים שלי',
          items: [
            { label: 'החיים היהודיים שלי', icon: 'heart', href: '11-my-jewish-life.html' },
            { label: 'לימוד יומי', icon: 'book-open', href: '12-daily-study.html' },
            { label: 'מכתב לרבי', icon: 'mail', href: '13-letter-to-rebbe.html' },
          ],
        },
        {
          title: 'אירועים',
          items: [
            { label: 'סעודת שבת', icon: 'utensils', href: '14-shabbat-meal.html' },
            { label: 'לוח שנה ואירועים', icon: 'calendar', href: '15-event.html' },
          ],
        },
        {
          items: [
            { label: 'כל המסכים', icon: 'layout-grid', href: 'index.html' },
            { label: 'הגדרות ועוד', icon: 'settings', href: '#' },
          ],
        },
      ],
    },
  }

  /* לוגו וואטסאפ אמיתי — נתיב מלא (fill), לא stroke */
  var WA_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" width="21" height="21" aria-hidden="true">' +
    '<path d="M12.04 2.02c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.34 4.96L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.49 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04a9.9 9.9 0 0 0-7.05-2.86zm0 1.67c2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.27-8.28 8.27a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.4c0-4.56 3.72-8.28 8.27-8.28zm4.53 9.94c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.28.37-.43.13-.14.17-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42l-.48-.01c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>'

  function icon(name, size) {
    return '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'
  }

  /* כיוון המעבר חי ב-assets/vt.js (נטען ב-head — חייב לרוץ לפני שהמעבר נלכד).
     כאן רק מסמנים כיוון לפני ניווט יזום. */
  function markDir(d) {
    if (window.VT) window.VT.mark(d)
  }

  /* ---------- סרגל תחתון ---------- */
  function buildBottomNav(screen, kind, def, current) {
    var nav = document.createElement('nav')
    nav.className = 'nav nav--' + kind
    nav.setAttribute('aria-label', 'ניווט ראשי')
    def.items.forEach(function (it, i) {
      var isCenter = i === 2
      var isCur = it.key === current
      var el
      if (it.drawer) {
        el = document.createElement('button')
        el.type = 'button'
        el.setAttribute('data-open-drawer', '')
      } else {
        el = document.createElement('a')
        el.href = it.href
      }
      el.className = 'nav-item' + (isCenter ? ' nav-center' : '')
      if (isCur) el.setAttribute('aria-current', 'page')
      if (isCenter) {
        el.innerHTML =
          '<span class="puck puck-' + (def.accent === 'gold' ? 'gold' : 'dark') + '">' +
          '<i data-icon="' + it.icon + '" data-size="19"' + (isCur ? ' data-fill="currentColor"' : '') + '></i></span>' +
          '<span class="nav-label">' + it.label + '</span>'
      } else {
        el.innerHTML = '<i data-icon="' + it.icon + '" data-size="20"></i><span>' + it.label + '</span>'
      }
      nav.appendChild(el)
    })
    screen.appendChild(nav)
    return nav
  }

  /* ---------- FAB (פעולה צפה, אופציונלי) ---------- */
  function buildFab(screen, kind) {
    var fabIcon = screen.getAttribute('data-fab-icon')
    if (!fabIcon) return null
    var fab = document.createElement('button')
    fab.className = 'fab press' + (kind === 'shaliach' ? ' fab-dark' : '')
    fab.setAttribute('data-action', 'toast')
    fab.setAttribute('data-toast', screen.getAttribute('data-fab-toast') || 'פעולה')
    fab.setAttribute('data-toast-icon', fabIcon)
    fab.setAttribute('aria-label', screen.getAttribute('data-fab-label') || 'פעולה')
    fab.innerHTML = '<i data-icon="' + fabIcon + '" data-size="24" data-stroke="2.2"></i>'
    screen.appendChild(fab)
    return fab
  }

  /* ---------- כפתור חזרה (#2) — לא על מסכי הבית ---------- */
  function buildBack(screen, kind, current) {
    if (current === 'home') return null
    // סרגל עליון עקבי: חזרה מימין (RTL) + תפריט משמאל. מנקים את כפתור-החזרה
    // של המוקאפ (יושב בשמאל ומצביע שמאלה — סגנון LTR) ואת ה-ב״ה הפינתי,
    // שמתנגשים עם הסרגל החדש. ה-ב״ה נשאר בולט בראש המגירה ובמסך הבית.
    screen.querySelectorAll('.back').forEach(function (o) { o.style.display = 'none' })
    screen.querySelectorAll('.brand').forEach(function (o) { o.style.display = 'none' })
    var b = document.createElement('button')
    b.type = 'button'
    b.className = 'navbtn navbtn-back'
    b.setAttribute('aria-label', 'חזרה')
    b.innerHTML = icon('chevron-right', 22)
    b.addEventListener('click', function () {
      markDir('back')
      if (window.history.length > 1 && document.referrer) window.history.back()
      else window.location.href = kind === 'consumer' ? '08-consumer-home.html' : '01-shaliach-home.html'
    })
    screen.appendChild(b)
    return b
  }

  /* ---------- מגירה (#5/#6) ---------- */
  function buildDrawer(screen, kind, current) {
    var def = DRAWER[kind]
    if (!def) return null
    var d = document.createElement('aside')
    d.className = 'drawer'
    d.setAttribute('role', 'dialog')
    d.setAttribute('aria-label', 'תפריט ניווט')
    d.setAttribute('aria-modal', 'true')
    var html =
      '<div class="drawer-head"><div class="bh">ב״ה</div><h2>' + def.title + '</h2><p>' + def.sub + '</p></div>'
    html += '<div class="drawer-body">'
    def.groups.forEach(function (g) {
      html += '<div class="drawer-group">'
      if (g.title) html += '<h3>' + g.title + '</h3>'
      g.items.forEach(function (it) {
        var cur = it.key && it.key === current ? ' aria-current="page"' : ''
        var exit = it.exit ? ' is-exit' : ''
        html +=
          '<a class="drawer-item press-soft' + exit + '" href="' + it.href + '"' + cur + '>' +
          '<span class="ic">' + icon(it.icon, 19) + '</span>' + it.label + '</a>'
      })
      html += '</div>'
    })
    html += '</div>'
    d.innerHTML = html
    screen.appendChild(d)
    return d
  }

  /* ---------- גיליון פנייה (#7) ---------- */
  function buildContactSheet(screen) {
    if (screen.querySelector('#contact-sheet')) return
    var s = document.createElement('div')
    s.className = 'sheet'
    s.id = 'contact-sheet'
    s.setAttribute('role', 'dialog')
    s.setAttribute('aria-label', 'פנייה לאיש קשר')
    s.innerHTML =
      '<div class="sheet-grab"></div>' +
      '<h3 data-contact-name style="font-size:18px;margin-bottom:2px">פנייה</h3>' +
      '<p style="font-size:13.5px;color:var(--ink-3);margin-bottom:2px">איך תרצה ליצור קשר?</p>' +
      '<div class="contact-grid">' +
      '<button class="contact-tile c-call press" data-action="toast" data-ch="call" data-toast-icon="phone"><span class="ci">' + icon('phone', 21) + '</span>חיוג</button>' +
      '<button class="contact-tile c-sms press" data-action="toast" data-ch="sms" data-toast-icon="message-square"><span class="ci">' + icon('message-square', 21) + '</span>הודעת SMS</button>' +
      '<button class="contact-tile c-wa press" data-action="toast" data-ch="wa" data-toast-icon="check-circle"><span class="ci">' + WA_SVG + '</span>וואטסאפ</button>' +
      '<button class="contact-tile c-app press" data-action="toast" data-ch="app" data-toast-icon="send"><span class="ci">' + icon('send', 21) + '</span>הודעה באפליקציה</button>' +
      '</div>'
    screen.appendChild(s)
  }

  /* ---------- פתיחה/סגירה של המגירה + backdrop משותף ---------- */
  function getBackdrop(screen) {
    var b = screen.querySelector('.sheet-backdrop')
    if (!b) {
      b = document.createElement('div')
      b.className = 'sheet-backdrop'
      screen.appendChild(b)
    }
    return b
  }

  function wireDrawer(screen, drawer) {
    if (!drawer) return
    var backdrop = getBackdrop(screen)
    function open() {
      // סגור כל גיליון פתוח קודם
      screen.querySelectorAll('.sheet.show').forEach(function (s) { s.classList.remove('show') })
      backdrop.classList.add('show')
      drawer.classList.add('show')
      document.body.style.overflow = 'hidden'
    }
    function close() {
      drawer.classList.remove('show')
      if (!screen.querySelector('.sheet.show')) backdrop.classList.remove('show')
      document.body.style.overflow = ''
    }
    backdrop.addEventListener('click', close)
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close() })
    // כפתורי פתיחה: המבורגרים קיימים + כל [data-open-drawer]
    screen.querySelectorAll('.burger, [data-open-drawer]').forEach(function (btn) {
      btn.removeAttribute('data-action') // ננתק גיליון-מסך ישן
      btn.removeAttribute('data-sheet')
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); open() })
    })
    // אם אין המבורגר במסך — נזריק כפתור תפריט צף
    if (!screen.querySelector('.burger')) {
      var m = document.createElement('button')
      m.type = 'button'
      m.className = 'navbtn navbtn-menu'
      m.setAttribute('aria-label', 'תפריט')
      m.innerHTML = icon('menu', 22)
      m.addEventListener('click', function (e) { e.preventDefault(); open() })
      screen.appendChild(m)
    }
    screen.__closeDrawer = close
  }

  /* ---------- החלקה ימינה/שמאלה בין 5 היעדים (#8) ---------- */
  function wireSwipe(screen, def, current) {
    var idx = -1
    def.items.forEach(function (it, i) { if (it.key === current) idx = i })

    /* "מסך עמוק" = מסך שמתויג ללשונית אך אינו המסך הראשי שלה
       (03/04 מתויגים "קשרים" אך הראשי הוא 02). שם החלקה ימינה = חזרה בהיסטוריה,
       כמו בכל אפליקציה נייטיב — ולא קפיצה ללשונית שכנה, שזה מבלבל. */
    var here = location.pathname.split('/').pop() || ''
    var root = idx >= 0 ? String(def.items[idx].href).split('/').pop() : ''
    var isDeep = idx < 0 || (!!root && root !== here)

    var x0 = 0, y0 = 0, t0 = 0, on = false

    function inHScroll(node) {
      while (node && node !== screen) {
        if (node.scrollWidth - node.clientWidth > 6) {
          var ov = getComputedStyle(node).overflowX
          if (ov === 'auto' || ov === 'scroll') return true
        }
        node = node.parentElement
      }
      return false
    }

    screen.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { on = false; return }
      if (screen.querySelector('.drawer.show, .sheet.show')) { on = false; return }
      if (inHScroll(e.target)) { on = false; return }
      var t = e.touches[0]
      x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); on = true
    }, { passive: true })

    screen.addEventListener('touchend', function (e) {
      if (!on) return
      on = false
      var t = e.changedTouches[0]
      var dx = t.clientX - x0, dy = t.clientY - y0, dt = Date.now() - t0
      if (dt > 550 || Math.abs(dx) < 66) return
      if (Math.abs(dx) < Math.abs(dy) * 1.7) return // בעיקר אנכי = גלילה, לא החלקה

      // RTL: ימינה = חזרה, שמאלה = קדימה
      if (dx > 0) {
        if (isDeep) {
          // חזרה אמיתית בהיסטוריה; אם אין לאן — נופלים למסך הראשי של הלשונית
          markDir('back')
          if (window.history.length > 1 && document.referrer) window.history.back()
          else if (root) go(def.items[idx].href, 'back')
          return
        }
        if (idx - 1 < 0) return
        go(def.items[idx - 1].href, 'back')
      } else {
        // במסך עמוק אין "קדימה" משמעותי — לא קופצים ללשונית שכנה
        if (isDeep || idx < 0 || idx + 1 > def.items.length - 1) return
        go(def.items[idx + 1].href, 'forward')
      }
    }, { passive: true })

    function go(href, dir) {
      if (!href || href === '#') return
      markDir(dir)
      window.location.href = href
    }
  }

  /* ---------- בנייה למסך ---------- */
  function build(screen) {
    var kind = screen.getAttribute('data-nav')
    var def = NAVS[kind]
    if (!def) return
    var current = screen.getAttribute('data-current') || ''

    var nav = buildBottomNav(screen, kind, def, current)
    var fab = buildFab(screen, kind)
    var back = buildBack(screen, kind, current)
    var drawer = buildDrawer(screen, kind, current)
    buildContactSheet(screen)
    wireDrawer(screen, drawer)
    wireSwipe(screen, def, current)

    if (window.Icons) {
      window.Icons.mount(nav)
      if (fab) window.Icons.mount(fab)
      if (back) window.Icons.mount(back)
      if (drawer) window.Icons.mount(drawer)
      var cs = screen.querySelector('#contact-sheet')
      if (cs) window.Icons.mount(cs)
      var menu = screen.querySelector('.navbtn-menu')
      if (menu) window.Icons.mount(menu)
    }
  }

  function init() {
    document.querySelectorAll('.screen[data-nav]').forEach(build)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
