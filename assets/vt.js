/* ============================================================================
   כיוון המעבר בין מסכים (#8) — נטען ב-<head> בכוונה.
   המעבר החוצה-מסמכים מתחיל לפני שסקריפטים בתחתית ה-body רצים, ולכן הסימון
   חייב להיקבע כאן: קודם סינכרונית מ-sessionStorage, ואז חידוד ב-pagereveal.
   RTL: קדימה = שמאלה. base.css מריץ לפי [data-vt].
   ============================================================================ */
;(function () {
  var KEY = 'vtdir'

  function read() {
    try {
      var nav = performance.getEntriesByType('navigation')[0]
      // כפתור החזרה של הטלפון/דפדפן — תמיד "חזרה", גם בלי סימון מוקדם
      if (nav && nav.type === 'back_forward') return 'back'
      return sessionStorage.getItem(KEY) || 'forward'
    } catch (e) { return 'forward' }
  }

  function apply() {
    document.documentElement.setAttribute('data-vt', read())
  }

  // 1) סינכרוני — הכי מוקדם שאפשר, לפני שהמעבר נלכד
  apply()

  // 2) חידוד: pagereveal רץ ממש לפני הפריים הראשון של המסמך החדש
  window.addEventListener('pagereveal', function () {
    apply()
    try { sessionStorage.removeItem(KEY) } catch (e) {}
  })

  // 3) ניקוי אחרי שהעמוד נטען, כדי שרענון ידני לא יירש כיוון ישן
  window.addEventListener('pageshow', function () {
    try { sessionStorage.removeItem(KEY) } catch (e) {}
  })

  // כל לחיצה על קישור אמיתי = תנועה קדימה (capture, כדי להקדים מטפלים אחרים)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a) return
    var h = a.getAttribute('href')
    if (h && h.charAt(0) !== '#') mark('forward')
  }, true)

  function mark(d) {
    try { sessionStorage.setItem(KEY, d) } catch (e) {}
  }

  window.VT = { mark: mark }
})()
