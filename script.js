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
    });
  }
})();
