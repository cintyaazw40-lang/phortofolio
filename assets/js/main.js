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
})();