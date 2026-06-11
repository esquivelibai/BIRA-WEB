/* ============================================================
   BIRA — landing interactions (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  "use strict";

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector(".header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav toggle ---- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Language switch (EU / ES) ---- */
  var STORAGE_KEY = "bira-lang";
  var translatable = document.querySelectorAll("[data-eu], [data-es]");
  var phEls = document.querySelectorAll("[data-eu-ph], [data-es-ph]");
  var langButtons = document.querySelectorAll(".lang button");

  function applyLang(lang) {
    if (lang !== "eu" && lang !== "es") lang = "eu";
    document.documentElement.lang = lang;
    translatable.forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.textContent = val;
    });
    phEls.forEach(function (el) {
      var val = el.getAttribute("data-" + lang + "-ph");
      if (val !== null) el.setAttribute("placeholder", val);
    });
    langButtons.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var saved = "eu";
  try { saved = localStorage.getItem(STORAGE_KEY) || "eu"; } catch (e) {}
  applyLang(saved);

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      applyLang(b.getAttribute("data-lang"));
    });
  });

  /* ---- Seamless marquee ---- */
  var track = document.getElementById("marquee");
  if (track) track.innerHTML += track.innerHTML;

  /* ---- Count-up for stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal + counter trigger ---- */
  var reveals = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.querySelectorAll("[data-count]").forEach(countUp);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + el.getAttribute("data-count") + suffix;
    });
  }

  /* ---- Hero bar follows the cursor (3D tilt + parallax) ---- */
  var heroVisual = document.querySelector(".hero__visual");
  var heroBar = document.getElementById("heroBar");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (heroVisual && heroBar && finePointer) {
    var MAX_ROT = 18;   // degrees
    var MAX_SHIFT = 18; // px
    var hero = document.querySelector(".hero") || heroVisual;

    function applyTilt(ry, rx, tx, ty) {
      heroBar.style.setProperty("--ry", ry.toFixed(2) + "deg");
      heroBar.style.setProperty("--rx", rx.toFixed(2) + "deg");
      heroBar.style.setProperty("--tx", tx.toFixed(2) + "px");
      heroBar.style.setProperty("--ty", ty.toFixed(2) + "px");
    }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var ny = (e.clientY - r.top) / r.height - 0.5;
      heroVisual.classList.add("is-tracking");
      // CSS transition smooths these values toward the cursor
      applyTilt(nx * MAX_ROT * 2, -ny * MAX_ROT * 1.4, nx * MAX_SHIFT, ny * MAX_SHIFT);
    });
    hero.addEventListener("pointerleave", function () {
      heroVisual.classList.remove("is-tracking");
      applyTilt(-3, 0, 0, 0); // gentle resting pose
    });
  }

  /* ---- Newsletter demo (no backend) ---- */
  var form = document.getElementById("newsletter");
  var note = document.getElementById("formNote");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var value = (input && input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      var lang = document.documentElement.lang === "es" ? "es" : "eu";
      if (!valid) {
        note.textContent = lang === "es"
          ? "Introduce un email válido, por favor."
          : "Sartu baliozko helbide elektroniko bat, mesedez.";
        note.style.color = "#5B1E25";
        if (input) input.focus();
        return;
      }
      form.reset();
      note.textContent = lang === "es"
        ? "¡Gracias! Pronto tendrás noticias nuestras. ✦"
        : "Eskerrik asko — laster jakingo duzu gure berri. ✦";
      note.style.color = "#6F7A5C";
      note.removeAttribute("data-eu");
      note.removeAttribute("data-es");
      showToast(
        lang === "es" ? "¡Tu registro se ha completado!" : "Zure erregistroa osatu da!",
        lang === "es" ? "Pronto tendrás noticias de BIRA." : "Laster jakingo duzu BIRA-ren berri."
      );
    });
  }

  /* ---- Toast notification ---- */
  function showToast(title, desc) {
    var wrap = document.getElementById("toastWrap");
    if (!wrap) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML =
      '<span class="toast__icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>' +
      '<div class="toast__body"><div class="toast__title"></div><div class="toast__desc"></div></div>' +
      '<button class="toast__close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    t.querySelector(".toast__title").textContent = title;
    t.querySelector(".toast__desc").textContent = desc;
    wrap.appendChild(t);
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 350);
    }
    t.querySelector(".toast__close").addEventListener("click", close);
    setTimeout(close, 4800);
  }

  /* ---- Erronka carousel ---- */
  var carousel = document.getElementById("erronkaCarousel");
  if (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var slides = carousel.querySelectorAll(".carousel__slide");
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var prevBtn = carousel.querySelector(".carousel__nav--prev");
    var nextBtn = carousel.querySelector(".carousel__nav--next");
    var total = slides.length;
    var index = 0;
    var timer = null;
    var DELAY = 6500;

    var dots = [];
    for (var i = 0; i < total; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot";
      dot.setAttribute("aria-label", "Diapositiba " + (i + 1));
      (function (n) {
        dot.addEventListener("click", function () { goTo(n); restart(); });
      })(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    function goTo(n) {
      index = (n + total) % total;
      track.style.transform = "translateX(-" + (index * 100) + "%)";
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle("is-active", d === index);
      }
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    function start() { timer = setInterval(next, DELAY); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    goTo(0);
    start();
  }

  /* ---- Garapena gallery (gallery6) ---- */
  var gallery = document.getElementById("garapenaGallery");
  if (gallery) {
    var vp = gallery.querySelector(".gallery6__viewport");
    var gPrev = gallery.querySelector(".gallery6__btn--prev");
    var gNext = gallery.querySelector(".gallery6__btn--next");

    function gStep() {
      var card = gallery.querySelector(".gallery6__card");
      return card ? card.offsetWidth + 19 : vp.clientWidth * 0.8;
    }
    function gUpdate() {
      var max = vp.scrollWidth - vp.clientWidth;
      gPrev.disabled = vp.scrollLeft <= 2;
      gNext.disabled = vp.scrollLeft >= max - 2;
    }
    gNext.addEventListener("click", function () {
      vp.scrollBy({ left: gStep(), behavior: "smooth" });
    });
    gPrev.addEventListener("click", function () {
      vp.scrollBy({ left: -gStep(), behavior: "smooth" });
    });
    vp.addEventListener("scroll", gUpdate, { passive: true });
    window.addEventListener("resize", gUpdate);
    gUpdate();
  }

  /* ---- Bento gallery + lightbox ---- */
  var bento = document.getElementById("garapenaBento");
  var lb = document.getElementById("bentoLightbox");
  if (bento && lb) {
    var lbImg = lb.querySelector(".lightbox__img");
    var lbClose = lb.querySelector(".lightbox__close");

    function openLb(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb.hidden = true;
      lbImg.removeAttribute("src");
      document.body.style.overflow = "";
    }

    var down = false, dragged = false, startX = 0, startScroll = 0;
    bento.addEventListener("pointerdown", function (e) {
      down = true; dragged = false; startX = e.clientX; startScroll = bento.scrollLeft;
      bento.classList.add("is-grabbing");
    });
    bento.addEventListener("pointermove", function (e) {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 6) dragged = true;
      bento.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      down = false; bento.classList.remove("is-grabbing");
    });

    bento.querySelectorAll(".bento__item").forEach(function (item) {
      item.addEventListener("click", function () {
        if (dragged) return;
        var img = item.querySelector("img");
        openLb(item.getAttribute("data-full"), img ? img.alt : "");
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          var img = item.querySelector("img");
          openLb(item.getAttribute("data-full"), img ? img.alt : "");
        }
      });
    });

    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hidden) closeLb();
    });
  }
})();
