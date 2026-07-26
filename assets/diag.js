/* ============================================================================
   כלי אבחון גלילה — רץ על המכשיר האמיתי ומדווח מה באמת קורה.
   נטען רק בעמוד _diag.html. לא נכנס לאף מסך אמיתי.
   ============================================================================ */
;(function () {
  var el = {}
  var counts = { touchstart: 0, touchmove: 0, scroll: 0, prevented: 0 }
  var scrollSeen = { min: Infinity, max: -Infinity }
  var cssVersion = 'בודק...'

  function panel() {
    var p = document.createElement('div')
    p.id = 'diagpanel'
    p.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
      'background:rgba(8,10,14,0.95)', 'color:#7CFFB2', 'font:11px/1.45 ui-monospace,Menlo,Consolas,monospace',
      'padding:8px 10px', 'max-height:40vh', 'overflow:auto', 'direction:ltr', 'text-align:left',
      '-webkit-overflow-scrolling:touch', 'border-bottom:2px solid #7CFFB2'
    ].join(';')
    document.body.appendChild(p)
    return p
  }

  function css(node, prop) {
    try { return getComputedStyle(node)[prop] } catch (e) { return '?' }
  }

  function measure() {
    var de = document.documentElement
    var body = document.body
    var scr = document.querySelector('.screen')
    var maxScroll = de.scrollHeight - window.innerHeight
    var screenClips = scr ? (scr.scrollHeight - scr.clientHeight) : 0

    var m = {
      ua: navigator.userAgent,
      viewport: window.innerWidth + ' x ' + window.innerHeight,
      visualVP: window.visualViewport ? Math.round(window.visualViewport.width) + ' x ' + Math.round(window.visualViewport.height) : 'n/a',
      dpr: window.devicePixelRatio,
      viewportMeta: (document.querySelector('meta[name=viewport]') || {}).content || 'MISSING',
      CSS_VERSION: cssVersion,
      doc_scrollHeight: de.scrollHeight,
      doc_clientHeight: de.clientHeight,
      MAX_SCROLL: maxScroll,
      scrollingElement: document.scrollingElement === de ? 'html' : (document.scrollingElement === body ? 'body' : 'other'),
      html_overflowY: css(de, 'overflowY'),
      html_overscroll: css(de, 'overscrollBehaviorY'),
      html_touchAction: css(de, 'touchAction'),
      html_height: css(de, 'height'),
      body_overflowX: css(body, 'overflowX'),
      body_overflowY: css(body, 'overflowY'),
      body_inlineOverflow: body.style.overflow || '(none)',
      body_touchAction: css(body, 'touchAction'),
      body_position: css(body, 'position'),
      body_height: Math.round(body.getBoundingClientRect().height),
      body_scrollHeight: body.scrollHeight
    }
    if (scr) {
      m.screen_overflow = css(scr, 'overflow')
      m.screen_inlineOverflow = scr.style.overflow || '(none)'
      m.screen_position = css(scr, 'position')
      m.screen_height = Math.round(scr.getBoundingClientRect().height)
      m.screen_clientHeight = scr.clientHeight
      m.screen_scrollHeight = scr.scrollHeight
      m.SCREEN_CLIPPED_PX = screenClips
      m.screen_touchAction = css(scr, 'touchAction')
    } else {
      m.screen = 'NOT FOUND'
    }
    // מעטפות שעלולות לחסום מגע
    var drawer = document.querySelector('.drawer')
    var bd = document.querySelector('.sheet-backdrop')
    if (drawer) {
      var dr = drawer.getBoundingClientRect()
      m.drawer_open = drawer.classList.contains('show')
      m.drawer_rect = Math.round(dr.left) + ',' + Math.round(dr.top) + ' ' + Math.round(dr.width) + 'x' + Math.round(dr.height)
      m.drawer_pointerEvents = css(drawer, 'pointerEvents')
    }
    if (bd) {
      m.backdrop_show = bd.classList.contains('show')
      m.backdrop_pointerEvents = css(bd, 'pointerEvents')
      m.backdrop_opacity = css(bd, 'opacity')
    }
    // מה נמצא בפועל תחת האצבע? נקודה נמוכה — מתחת לפאנל האבחון עצמו
    try {
      var hit = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.round(window.innerHeight * 0.8))
      m.ELEMENT_AT_CENTER = hit ? (hit.tagName.toLowerCase() + '.' + (String(hit.className || '').slice(0, 40))) : 'none'
      m.center_touchAction = hit ? css(hit, 'touchAction') : '?'
    } catch (e) { m.ELEMENT_AT_CENTER = 'err' }

    m.EVENTS = 'touchstart=' + counts.touchstart + ' touchmove=' + counts.touchmove +
      ' scroll=' + counts.scroll + ' preventDefault=' + counts.prevented
    m.SCROLL_OBSERVED = (scrollSeen.max === -Infinity) ? 'none yet' : (Math.round(scrollSeen.min) + ' → ' + Math.round(scrollSeen.max))
    return m
  }

  function verdict(m) {
    var lines = []
    if (m.CSS_VERSION.indexOf('ישן') === 0) {
      lines.push('⚠ CACHE: הדפדפן טוען CSS ישן — התיקון לא מגיע אליך.')
    }
    if (m.SCREEN_CLIPPED_PX > 3) {
      lines.push('🔴 SCREEN מחתך ' + m.SCREEN_CLIPPED_PX + 'px מהתוכן (overflow:hidden) — תוכן בלתי-נגיש.')
    }
    if (m.MAX_SCROLL <= 2) {
      lines.push('🔴 אין מה לגלול: גובה התוכן ≤ גובה המסך (MAX_SCROLL=' + m.MAX_SCROLL + ').')
    } else {
      lines.push('✔ יש ' + m.MAX_SCROLL + 'px לגלול.')
    }
    if (m.body_inlineOverflow !== '(none)' || m.screen_inlineOverflow !== '(none)') {
      lines.push('🔴 נעילת-גלילה פעילה בקוד (inline overflow) — sheet/drawer לא נסגר.')
    }
    if (counts.touchmove > 0 && counts.prevented > 0) {
      lines.push('🔴 JS מבטל את המגע (preventDefault) — זה חוסם גלילה.')
    }
    if (counts.touchmove > 3 && counts.scroll === 0 && m.MAX_SCROLL > 2) {
      lines.push('🔴 המגע נקלט אבל הדפדפן לא גולל — חסימת CSS/מעטפת.')
    }
    if (counts.scroll > 0) {
      lines.push('✔ אירועי גלילה נקלטים — הדף כן גולל.')
    }
    return lines.join('\n')
  }

  function render() {
    var m = measure()
    var txt = 'ROOT-CAUSE DIAG — מקושרים\n' + verdict(m) + '\n' + '─'.repeat(34) + '\n'
    for (var k in m) txt += k + ': ' + m[k] + '\n'
    el.pre.textContent = txt
    el.copy.setAttribute('data-txt', txt)
  }

  function init() {
    var p = panel()
    p.innerHTML =
      '<div style="display:flex;gap:6px;margin-bottom:6px">' +
      '<button id="dgcopy" style="flex:1;background:#7CFFB2;color:#08101a;border:0;padding:7px;font:700 12px system-ui;border-radius:5px">העתק הכל</button>' +
      '<button id="dghide" style="background:#333;color:#eee;border:0;padding:7px 10px;font:700 12px system-ui;border-radius:5px">הסתר</button>' +
      '</div><pre id="dgpre" style="margin:0;white-space:pre-wrap;word-break:break-word"></pre>'
    el.pre = p.querySelector('#dgpre')
    el.copy = p.querySelector('#dgcopy')
    p.querySelector('#dghide').addEventListener('click', function () {
      p.style.display = 'none'
      var s = document.createElement('button')
      s.textContent = 'אבחון'
      s.style.cssText = 'position:fixed;top:6px;left:6px;z-index:2147483647;background:#7CFFB2;color:#08101a;border:0;padding:8px 12px;font:700 12px system-ui;border-radius:6px'
      s.addEventListener('click', function () { p.style.display = ''; s.remove() })
      document.body.appendChild(s)
    })
    el.copy.addEventListener('click', function () {
      var t = el.copy.getAttribute('data-txt') || ''
      if (navigator.clipboard) navigator.clipboard.writeText(t)
      el.copy.textContent = 'הועתק! שלח לקלוד'
      setTimeout(function () { el.copy.textContent = 'העתק הכל' }, 2500)
    })

    // האזנה פסיבית בלבד — לא משנה התנהגות, רק מודדת
    window.addEventListener('touchstart', function () { counts.touchstart++ }, { passive: true })
    window.addEventListener('touchmove', function (e) {
      counts.touchmove++
      if (e.defaultPrevented) counts.prevented++
    }, { passive: true })
    window.addEventListener('scroll', function () {
      counts.scroll++
      var y = window.scrollY
      if (y < scrollSeen.min) scrollSeen.min = y
      if (y > scrollSeen.max) scrollSeen.max = y
    }, { passive: true })

    // בדיקת cache: האם ה-CSS שנטען הוא הגרסה עם clip?
    fetch('assets/base.css?ts=' + Date.now()).then(function (r) { return r.text() }).then(function (t) {
      cssVersion = t.indexOf('overflow-x: clip') > -1 ? 'חדש (clip) ✔' : 'ישן (hidden) ✘'
    }).catch(function () { cssVersion = 'fetch failed' })

    render()
    setInterval(render, 700)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
