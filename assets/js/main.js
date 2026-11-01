// Menyesuaikan tinggi header, menandai menu navbar sesuai halaman yang tampil,
// dan memberi latar header setelah halaman di-scroll.
(function () {
  document.documentElement.classList.add("js");
  var header = document.getElementById("site-header");
  var links = document.querySelectorAll(".nav-links a");
  var pages = document.querySelectorAll(".page");

  // Tinggi tiap halaman = tinggi layar dikurangi tinggi header
  function fitPages() {
    var headerH = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty("--page-h", (window.innerHeight - headerH) + "px");
  }

  function setHeaderHeight() {
    if (header) {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
    fitPages();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setHeaderHeight);
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);
  window.addEventListener("load", setHeaderHeight);

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Grafik skill: terisi dari kosong (dan angkanya naik) saat Home muncul
  var skillBox = document.querySelector(".skills-progress");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var countTimer = null;

  function countUp(duration) {
    var nums = skillBox.querySelectorAll(".skill-bar");
    var start = null;
    cancelAnimationFrame(countTimer);
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (bar) {
        bar.querySelector(".skill-num").textContent = Math.round(eased * Number(bar.dataset.value));
      });
      if (p < 1) countTimer = requestAnimationFrame(tick);
    }
    countTimer = requestAnimationFrame(tick);
  }
  function resetSkills() {
    cancelAnimationFrame(countTimer);
    skillBox.classList.remove("is-filled");
    skillBox.querySelectorAll(".skill-bar").forEach(function (bar) {
      bar.querySelector(".skill-num").textContent = "0";
    });
  }
  function fillSkills() {
    skillBox.classList.add("is-filled");
    if (reduceMotion) {
      skillBox.querySelectorAll(".skill-bar").forEach(function (bar) {
        bar.querySelector(".skill-num").textContent = bar.dataset.value;
      });
    } else {
      countUp(1700);
    }
  }
  if (skillBox) {
    resetSkills();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? fillSkills() : resetSkills(); });
      }, { threshold: 0.6 }).observe(skillBox);
    } else {
      fillSkills();
    }
  }

  if (!("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        var key = entry.target.getAttribute("data-nav") || entry.target.id;
        a.classList.toggle("active", a.getAttribute("href") === "#" + key);
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });

  pages.forEach(function (p) { observer.observe(p); });

  // Animasi gerbang project: membuka saat masuk layar, menutup lagi saat keluar
  var cards = document.querySelectorAll(".project-card");
  if (cards.length) {
    var gateObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-open", entry.isIntersecting);
      });
    }, { threshold: 0.6 });
    cards.forEach(function (c) { gateObserver.observe(c); });
  }

  // Animasi Award: mulai saat halaman muncul, diulang dari awal saat kembali
  var awardStages = document.querySelectorAll(".award-stage");
  if (awardStages.length) {
    var awardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-playing", entry.isIntersecting);
      });
    }, { threshold: 0.6 });
    awardStages.forEach(function (st) { awardObserver.observe(st); });
  }

  // Lightbox umum (dipakai Certificates dan Contributions): membesar, latar belakang blur
  var lightbox = document.getElementById("lightbox");
  var galleryItems = [];
  var galleryIndex = 0;
  var lastFocus = null;
  var openGallery = function () {};

  if (lightbox) {
    var lbImg = lightbox.querySelector(".lb-img");
    var lbTitle = lightbox.querySelector(".lb-title");
    var lbMeta = lightbox.querySelector(".lb-meta");
    var lbPrev = lightbox.querySelector(".lb-prev");
    var lbNext = lightbox.querySelector(".lb-next");

    var showGallery = function (i) {
      galleryIndex = (i + galleryItems.length) % galleryItems.length;
      var it = galleryItems[galleryIndex];
      lbImg.src = it.src;
      lbImg.alt = it.alt || "";
      lbTitle.textContent = it.title || "";
      lbMeta.textContent = it.meta || "";
    };
    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("lb-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    openGallery = function (items, i) {
      galleryItems = items;
      lastFocus = document.activeElement;
      showGallery(i);
      var many = items.length > 1;
      lbPrev.style.display = many ? "" : "none";
      lbNext.style.display = many ? "" : "none";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("lb-open");
      lightbox.querySelector(".lb-close").focus();
    };

    lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", function () { showGallery(galleryIndex - 1); });
    lbNext.addEventListener("click", function () { showGallery(galleryIndex + 1); });
    // klik di area gelap/blur (bukan gambar atau tombol) = tutup
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showGallery(galleryIndex - 1);
      else if (e.key === "ArrowRight") showGallery(galleryIndex + 1);
    });
  }

  // Contributions: foto polaroid terbang masuk saat halaman muncul, klik untuk membesar
  var contribStages = document.querySelectorAll(".contrib-stage");
  if (contribStages.length) {
    var contribObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-playing", entry.isIntersecting);
      });
    }, { threshold: 0.6 });
    contribStages.forEach(function (stage) {
      contribObserver.observe(stage);
      var orgName = stage.querySelector(".contrib-title").textContent;
      var shots = stage.querySelectorAll(".polaroid");
      var items = Array.prototype.map.call(shots, function (fig) {
        var img = fig.querySelector("img");
        return { src: img.src, alt: img.alt, title: fig.querySelector("figcaption").textContent, meta: orgName };
      });
      shots.forEach(function (fig, i) {
        fig.addEventListener("click", function () { openGallery(items, i); });
      });
    });
  }

  // Certificates: muncul dari bawah, bisa digeser (geser/drag, panah, titik)
  var certStage = document.querySelector(".cert-stage");
  if (certStage) {
    var track = certStage.querySelector(".cert-track");
    var certCards = track.querySelectorAll(".cert-card");
    var prevBtn = certStage.querySelector(".cert-prev");
    var nextBtn = certStage.querySelector(".cert-next");
    var dotsBox = certStage.querySelector(".cert-dots");

    certCards.forEach(function () { dotsBox.appendChild(document.createElement("span")); });
    var dots = dotsBox.querySelectorAll("span");

    function certStep() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      return certCards[0].offsetWidth + gap;
    }
    function updateCert() {
      var max = track.scrollWidth - track.clientWidth;
      var idx = max > 2 ? Math.round(track.scrollLeft / (max / (certCards.length - 1 || 1))) : 0;
      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max - 2;
    }
    prevBtn.addEventListener("click", function () { track.scrollBy({ left: -certStep(), behavior: "smooth" }); });
    nextBtn.addEventListener("click", function () { track.scrollBy({ left: certStep(), behavior: "smooth" }); });
    dots.forEach(function (d, i) {
      d.style.cursor = "pointer";
      d.parentNode.style.pointerEvents = "auto";
      d.addEventListener("click", function () { certCards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); });
    });
    track.addEventListener("scroll", updateCert, { passive: true });
    window.addEventListener("resize", updateCert);

    // geser dengan mouse (di layar sentuh sudah otomatis bisa digeser)
    var drag = null;
    var moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      drag = { x: e.clientX, left: track.scrollLeft };
      moved = false;
      track.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.x) > 6) moved = true;
      track.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      drag = null;
      track.classList.remove("is-dragging");
      track.scrollBy({ left: 0.5, behavior: "smooth" }); // memicu snap ke kartu terdekat
    });


    // klik sertifikat -> buka lightbox
    var certItems = Array.prototype.map.call(certCards, function (card) {
      var img = card.querySelector("img");
      return {
        src: img.src, alt: img.alt,
        title: card.querySelector(".cert-title").textContent,
        meta: card.querySelector(".cert-meta").textContent
      };
    });
    certCards.forEach(function (card, i) {
      card.querySelector(".cert-image").addEventListener("click", function () {
        if (moved) { moved = false; return; }
        openGallery(certItems, i);
      });
    });

    updateCert();
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-playing", entry.isIntersecting);
        if (!entry.isIntersecting) { track.scrollLeft = 0; updateCert(); }
      });
    }, { threshold: 0.6 }).observe(certStage);
  }
})();
// Fungsi Lightbox Sederhana
function openLightbox(imgSrc) {
    // Cek jika lightbox belum ada, buat elemennya
    let lightbox = document.getElementById('lightbox-overlay');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox-overlay';
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
            cursor: zoom-out;
        `;
        lightbox.innerHTML = `
            <img id="lightbox-img" style="max-width: 90%; max-height: 90%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: transform 0.3s ease;">
        `;
        
        // Tutup saat klik di luar gambar
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        document.body.appendChild(lightbox);
        
        // Tutup dengan Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }
    
    const img = document.getElementById('lightbox-img');
    // Jika gambar kosong (SVG dummy), beri peringatan di console atau gunakan placeholder
    img.src = imgSrc; 
    
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.style.opacity = '1', 10);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox-overlay');
    if (lightbox) {
        lightbox.style.opacity = '0';
        setTimeout(() => lightbox.style.display = 'none', 300);
    }
}
// --- FITUR DRAG TO SCROLL PADA GALERI CONTRIBUTIONS ---
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector('.clothesline-gallery');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Angka 2 = kecepatan geser
        slider.scrollLeft = scrollLeft - walk;
    });
});