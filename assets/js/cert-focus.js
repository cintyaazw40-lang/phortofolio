/* Sertifikat: kartu di tengah membesar, kartu di pinggir mengecil dan memudar.
   Awalnya sertifikat tengah (ke-2 dari 3) yang berada di tengah layar.
   Hanya mengatur posisi awal dan tampilan; geser, panah, titik, dan lightbox tetap dari main.js. */
(function () {
  var track = document.querySelector('.cert-track');
  if (!track) return;
  var stage = document.querySelector('.cert-stage');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.cert-card'));
  var ticking = false;
  var touched = false;          // true kalau pengunjung sudah menggeser sendiri

  function update() {
    ticking = false;
    var r = track.getBoundingClientRect();
    var mid = r.left + r.width / 2;
    cards.forEach(function (card) {
      var c = card.getBoundingClientRect();
      var d = Math.min(Math.abs(c.left + c.width / 2 - mid) / (c.width * 0.9), 1);
      var s = 1 - 0.24 * d;      // ukuran: 1 di tengah, 0.76 di pinggir
      var o = 1 - 0.5 * d;       // keburaman: 1 di tengah, 0.5 di pinggir
      card.style.setProperty('--s', s.toFixed(3));
      card.style.setProperty('--o', o.toFixed(3));
      card.style.zIndex = Math.round(10 * s);
    });
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  // geser sertifikat tengah ke tengah layar, tanpa animasi
  function centerMiddle() {
    if (touched) return;
    var mid = cards[Math.floor((cards.length - 1) / 2)];
    if (!mid) return;
    var t = track.getBoundingClientRect(), c = mid.getBoundingClientRect();
    if (!t.width) return;
    var left = track.scrollLeft + (c.left + c.width / 2) - (t.left + t.width / 2);
    if (Math.abs(left - track.scrollLeft) < 1) { update(); return; }
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    requestAnimationFrame(function () { track.style.scrollSnapType = ''; update(); });
  }

  // skrip lain bisa mengembalikan posisi ke awal saat halaman muncul, jadi pusatkan ulang beberapa kali
  function recenterBurst() {
    touched = false;
    [0, 120, 400, 900, 1600].forEach(function (ms) { setTimeout(centerMiddle, ms); });
  }

  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    track.addEventListener(ev, function () { touched = true; }, { passive: true });
  });
  document.querySelectorAll('.cert-nav').forEach(function (b) {
    b.addEventListener('click', function () { touched = true; });
  });

  track.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', function () { request(); });
  window.addEventListener('load', recenterBurst);

  // saat halaman Certificates muncul (kelas is-playing ditambahkan), pusatkan lagi
  if (stage && 'MutationObserver' in window) {
    var was = stage.classList.contains('is-playing');
    new MutationObserver(function () {
      var now = stage.classList.contains('is-playing');
      if (now && !was) recenterBurst();
      was = now;
    }).observe(stage, { attributes: true, attributeFilter: ['class'] });
  }

  update();
  recenterBurst();
})();