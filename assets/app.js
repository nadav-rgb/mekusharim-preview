/* ============================================================================
   מקושרים — שכבת ההתנהגות של הפרוטוטייפים
   סקריפט קלאסי (לא module) כדי שהעמודים ייפתחו בדאבל-קליק על file://
   ============================================================================ */
;(function () {
  'use strict'

  /* ---- טוסט: משוב על כל פעולה ------------------------------------------ */
  const host = function () { return document.querySelector('.screen') || document.body }

  let toastEl = null
  let toastTimer = null

  function toast(message, iconName) {
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.className = 'toast'
      toastEl.setAttribute('role', 'status')
      toastEl.setAttribute('aria-live', 'polite')
      host().appendChild(toastEl)
    }
    const icon = window.Icons ? window.Icons.svg(iconName || 'check-circle', 17) : ''
    toastEl.innerHTML = icon + '<span>' + message + '</span>'
    // כפיית reflow כדי שהמעבר ירוץ גם בהצגה רצופה
    void toastEl.offsetWidth
    toastEl.classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show')
    }, 2100)
  }

  /* ---- גיליון תחתון ------------------------------------------------------ */
  function openSheet(id) {
    const sheet = document.getElementById(id)
    if (!sheet) return
    let backdrop = document.querySelector('.sheet-backdrop')
    if (!backdrop) {
      backdrop = document.createElement('div')
      backdrop.className = 'sheet-backdrop'
      host().appendChild(backdrop)
      backdrop.addEventListener('click', closeSheets)
    }
    backdrop.classList.add('show')
    sheet.classList.add('show')
    host().style.overflow = 'hidden'
  }

  function closeSheets() {
    document.querySelectorAll('.sheet.show').forEach(function (s) {
      s.classList.remove('show')
    })
    const b = document.querySelector('.sheet-backdrop')
    if (b) b.classList.remove('show')
    host().style.overflow = ''
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSheets()
  })

  /* ---- דלגציית אירועים: כל ההתנהגות מוצהרת ב-HTML ----------------------- */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]')
    if (!el) return
    const action = el.dataset.action

    if (action === 'toast') {
      e.preventDefault()
      toast(el.dataset.toast || 'בוצע', el.dataset.toastIcon)
      return
    }

    if (action === 'sheet') {
      e.preventDefault()
      openSheet(el.dataset.sheet)
      return
    }

    // פנייה לאיש קשר — פותח גיליון 4 ערוצים (חיוג/SMS/וואטסאפ/הודעה), מותאם לשם
    if (action === 'contact') {
      e.preventDefault()
      var name = el.dataset.name || ''
      var sheet = document.getElementById('contact-sheet')
      if (sheet) {
        var ttl = sheet.querySelector('[data-contact-name]')
        if (ttl) ttl.textContent = name ? 'פנייה אל ' + name : 'פנייה'
        var msgs = {
          call: 'מתקשר' + (name ? ' אל ' + name : ''),
          sms: 'הודעת SMS' + (name ? ' אל ' + name : ''),
          wa: 'פותח וואטסאפ' + (name ? ' עם ' + name : ''),
          app: 'הודעה באפליקציה' + (name ? ' אל ' + name : ''),
        }
        sheet.querySelectorAll('[data-ch]').forEach(function (b) {
          b.setAttribute('data-toast', msgs[b.dataset.ch] || 'פנייה')
        })
        openSheet('contact-sheet')
      }
      return
    }

    if (action === 'close-sheet') {
      e.preventDefault()
      closeSheets()
      return
    }

    // תיבת סימון של משימה — מסמנת, מדווחת, ומרפה את השורה
    if (action === 'check') {
      e.preventDefault()
      const done = el.getAttribute('aria-checked') === 'true'
      el.setAttribute('aria-checked', done ? 'false' : 'true')
      const row = el.closest('[data-checkrow]')
      if (row) row.classList.toggle('done', !done)
      if (!done) toast(el.dataset.toast || 'סומן כבוצע', 'check-circle')
      return
    }

    // לשוניות
    if (action === 'tab') {
      e.preventDefault()
      const group = el.closest('[data-tabs]')
      if (!group) return
      group.querySelectorAll('[data-action="tab"]').forEach(function (t) {
        t.setAttribute('aria-selected', String(t === el))
      })
      const panelName = el.dataset.tab
      const scope = document.querySelector(group.dataset.tabs) || document
      scope.querySelectorAll('[data-panel]').forEach(function (p) {
        p.hidden = p.dataset.panel !== panelName
      })
      return
    }

    // מתג דו-מצבי (למשל "נשמר"/"הוסר")
    if (action === 'toggle') {
      e.preventDefault()
      const on = el.getAttribute('aria-pressed') === 'true'
      el.setAttribute('aria-pressed', on ? 'false' : 'true')
      toast(on ? el.dataset.toastOff || 'הוסר' : el.dataset.toastOn || 'נשמר', on ? 'x' : 'check-circle')
      return
    }

    // הרחבה/כיווץ
    if (action === 'expand') {
      e.preventDefault()
      const target = document.getElementById(el.dataset.target)
      if (!target) return
      const open = !target.hidden
      target.hidden = open
      el.setAttribute('aria-expanded', String(!open))
      return
    }
  })

  /* ---- קישורים שעדיין אין להם מסך: לא מתים, אלא מסבירים ---------------- */
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href')
    if (href === '#' || href === '') {
      e.preventDefault()
      toast('המסך הזה עוד לא נבנה בפרוטוטייפ', 'info')
    }
  })

  /* ---- טופס: לא שולח, אלא מדגים ---------------------------------------- */
  document.addEventListener('submit', function (e) {
    e.preventDefault()
    const f = e.target
    toast(f.dataset.toast || 'נשלח', 'send')
  })

  window.App = { toast: toast, openSheet: openSheet, closeSheets: closeSheets }
})()
