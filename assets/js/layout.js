/* Scroll berhenti tepat di tiap halaman:
   1) mengukur tinggi header yang sebenarnya, lalu mengatur
      --hdr : tinggi header (titik awal halaman saat berhenti)
      --pg  : tinggi satu halaman = tinggi layar - tinggi header
   2) setelah scroll berhenti, kalau halaman masih bergeser sedikit dari bawah header,
      posisinya dirapikan sampai tepat, jadi tidak ada sisa halaman lain yang terlihat. */
(function () {
  var header = document.getElementById('site-header');
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  if (!header) return;
  var root = document.documentElement;
  var desktop = window.matchMedia('(min-width: 769px)');

  function hdrH() { return Math.floor(header.getBoundingClientRect().height); }

  function set() {
    var h = hdrH();
    var vh = root.clientHeight || window.innerHeight;
    root.style.setProperty('--hdr', h + 'px');
    root.style.setProperty('--pg', Math.max(vh - h, 320) + 'px');
  }

  set();
  window.addEventListener('resize', set);
  window.addEventListener('load', set);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(header);

  /* ---------- rapikan posisi setelah scroll berhenti ---------- */
  var timer = null;
  function align() {
    if (!desktop.matches || !pages.length) return;
    var h = hdrH(), best = null, bestAbs = Infinity;
    pages.forEach(function (p) {
      var d = p.getBoundingClientRect().top - h;       // jarak puncak halaman ke bawah header
      if (Math.abs(d) < bestAbs) { bestAbs = Math.abs(d); best = d; }
    });
    // hanya merapikan selisih kecil (sisa snap), bukan loncat ke halaman lain
    if (best !== null && Math.abs(best) >= 1 && Math.abs(best) <= 120) {
      window.scrollBy({ top: best, left: 0, behavior: 'auto' });
    }
  }
  window.addEventListener('scroll', function () {
    clearTimeout(timer);
    timer = setTimeout(align, 140);
  }, { passive: true });
  window.addEventListener('load', function () { setTimeout(align, 300); });
})();