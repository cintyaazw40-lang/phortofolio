/* Halaman Contributions
   - foto berjalan otomatis ke kiri, berulang tanpa putus
   - berhenti saat disorot mouse, disentuh, digeser, atau lightbox terbuka
   - bisa digeser dengan mouse (drag), sentuhan, atau trackpad
   - klik foto untuk memperbesar (panah kiri/kanan untuk pindah, Esc untuk menutup) */
(function () {
  var page = document.getElementById('contributions');
  var gallery = document.getElementById('contribGallery');
  if (!page || !gallery) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var originals = Array.prototype.slice.call(gallery.querySelectorAll('.polaroid-item'));
  page.classList.add('cjs');

  /* ---------- gandakan foto supaya putarannya tidak putus ---------- */
  var loopW = 0;
  function measure() {
    var firstClone = gallery.querySelector('.is-clone');
    if (firstClone) loopW = firstClone.offsetLeft - originals[0].offsetLeft;
  }
  function addSet() {
    originals.forEach(function (el) {
      var c = el.cloneNode(true);
      c.classList.add('is-clone');
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('tabindex', '-1');
      gallery.appendChild(c);
    });
  }
  if (!reduce) {
    addSet(); measure();
    for (var n = 0; n < 3 && gallery.scrollWidth < loopW + gallery.clientWidth + 80; n++) addSet();
    gallery.scrollLeft = 1;
  }

  /* ---------- jalan otomatis ---------- */
  var SPEED = 38;                       // piksel per detik
  var pos = gallery.scrollLeft, last = 0;
  var hovering = false, dragging = false, lbOpen = false, visible = false, resumeAt = 0;

  function tick(t) {
    if (!last) last = t;
    var dt = Math.min(t - last, 50) / 1000;
    last = t;
    hovering = overItem && (t - lastMove < 1200);
    var moving = !reduce && loopW && visible && !hovering && !dragging && !lbOpen && t > resumeAt;
    if (moving) {
      pos += SPEED * dt;
      if (pos >= loopW + 1) pos -= loopW;
      gallery.scrollLeft = pos;
    } else {
      pos = gallery.scrollLeft;
    }
    requestAnimationFrame(tick);
  }
  if (!reduce) requestAnimationFrame(tick);

  // geser manual melewati ujung: lompat ke salinan yang sama (tidak terlihat)
  gallery.addEventListener('scroll', function () {
    if (!loopW) return;
    var s = gallery.scrollLeft;
    if (s >= loopW + 1) gallery.scrollLeft = s - loopW;
    else if (s < 1) gallery.scrollLeft = s + loopW;
  }, { passive: true });

  // jeda hanya saat mouse sedang digerakkan di atas foto (supaya mudah diklik).
  // Mouse yang diam di atas galeri tidak menghentikan gerakan, jadi saat halaman dibuka foto langsung berjalan.
  var mx = -1, my = -1, lastMove = 0, overItem = false;
  gallery.addEventListener('mousemove', function (e) {
    if (Math.abs(e.clientX - mx) >= 3 || Math.abs(e.clientY - my) >= 3) {
      mx = e.clientX; my = e.clientY;
      lastMove = performance.now();
    }
    overItem = !!e.target.closest('.polaroid-item');
  });
  gallery.addEventListener('mouseleave', function () { overItem = false; });
  gallery.addEventListener('touchstart', function () { resumeAt = Infinity; }, { passive: true });
  gallery.addEventListener('touchend', function () { resumeAt = performance.now() + 2000; }, { passive: true });
  // roda mouse vertikal = pindah halaman (tidak menjeda); geser horizontal = pengunjung sedang menggeser
  gallery.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) resumeAt = performance.now() + 2000;
  }, { passive: true });

  /* ---------- geser dengan mouse ---------- */
  var startX = 0, startLeft = 0, moved = false;
  gallery.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; moved = false;
    startX = e.clientX; startLeft = gallery.scrollLeft;
    gallery.classList.add('is-dragging');
    function move(ev) {
      var dx = ev.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      gallery.scrollLeft = startLeft - dx;
    }
    function up() {
      dragging = false;
      gallery.classList.remove('is-dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });

  /* ---------- muncul saat halaman terlihat ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.intersectionRatio >= 0.15) {
          if (!visible) { resumeAt = 0; lastMove = 0; overItem = false; }   // mulai bersih: langsung jalan
          visible = true; page.classList.add('is-in');
        } else if (en.intersectionRatio === 0) { visible = false; page.classList.remove('is-in'); }
      });
    }, { threshold: [0, 0.15] }).observe(page);
  } else { visible = true; page.classList.add('is-in'); }

  window.addEventListener('resize', function () { measure(); });
  window.addEventListener('load', measure);

  /* ---------- lightbox ---------- */
  var lb = document.createElement('div');
  lb.className = 'clb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML =
    '<button class="clb-close" type="button" aria-label="Tutup">&#10005;</button>' +
    '<button class="clb-nav clb-prev" type="button" aria-label="Sebelumnya">&#10094;</button>' +
    '<figure class="clb-figure"><img class="clb-img" src="" alt=""><figcaption class="clb-caption"></figcaption></figure>' +
    '<button class="clb-nav clb-next" type="button" aria-label="Berikutnya">&#10095;</button>';
  document.body.appendChild(lb);
  var img = lb.querySelector('.clb-img'), cap = lb.querySelector('.clb-caption');
  var cur = 0;

  function show(i) {
    cur = (i + originals.length) % originals.length;
    var el = originals[cur];
    img.src = el.getAttribute('data-full');
    img.alt = el.getAttribute('data-caption') || '';
    cap.textContent = el.getAttribute('data-caption') || '';
  }
  function open(i) {
    show(i); lbOpen = true;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lb-open');
  }
  function close() {
    lbOpen = false;
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lb-open');
  }

  gallery.addEventListener('click', function (e) {
    if (moved) { moved = false; return; }
    var it = e.target.closest('.polaroid-item');
    if (it) open(parseInt(it.getAttribute('data-i'), 10) || 0);
  });
  gallery.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var it = e.target.closest('.polaroid-item');
    if (it) { e.preventDefault(); open(parseInt(it.getAttribute('data-i'), 10) || 0); }
  });
  lb.querySelector('.clb-close').addEventListener('click', close);
  lb.querySelector('.clb-prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.clb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lbOpen) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
})();