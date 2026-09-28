/* ==========================================================================
   Eleanor Marcotte — Live What Is Yours
   --------------------------------------------------------------------------
   CONFIGURE ME — see README.md
   ========================================================================== */

/**
 * Where subscribe submissions are sent.
 *
 * Currently FormSubmit, which simply emails each new subscriber to
 * authoreleanormarcotte@gmail.com. No account needed, but it must be
 * ACTIVATED ONCE: the first time someone subscribes on the live site,
 * FormSubmit emails that inbox asking to confirm. Click the link in that
 * email and every submission after it is delivered. Until then, nothing
 * arrives — so subscribe once yourself after publishing and confirm it.
 *
 * After activating, FormSubmit shows a hashed endpoint in that same email
 * (https://formsubmit.co/ajax/<random-string>). Swapping it in here keeps
 * the address out of the page source, where scrapers can read it.
 *
 * Other services drop in the same way:
 *   Formspree   https://formspree.io/f/xxxxxxxx
 *   Buttondown  https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME
 *   ConvertKit  https://app.convertkit.com/forms/XXXXXXX/subscriptions
 *
 * Set it to "" and the form says it isn't connected rather than pretending.
 */
const SUBSCRIBE_ENDPOINT =
  "https://formsubmit.co/ajax/authoreleanormarcotte@gmail.com";

/* ========================================================================== */

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── Current year ─────────────────────────────────────────────────── */
  $$("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ── Header hairline on scroll ────────────────────────────────────── */
  const header = $("#siteHeader");
  if (header) {
    let ticking = false;
    const sync = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 6);
      ticking = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(sync);
        }
      },
      { passive: true }
    );
    sync();
  }

  /* ── Reveal on scroll ─────────────────────────────────────────────── */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = $$(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
    // Anything already on screen at load reveals immediately.
    requestAnimationFrame(() => {
      reveals.forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * 0.92) {
          el.classList.add("is-in");
        }
      });
    });
  }

  /* ── Smooth anchor scroll with sticky-header offset ───────────────── */
  $$('a[href^="#"]:not(.skip)').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        (header ? header.offsetHeight + 18 : 0);
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ── The cover's halftone ─────────────────────────────────────────── */
  /* The white dot field across the crown of the book, with a slow swell
     passing through it. Dots hold their column and rise and fall in place —
     nothing travels sideways, which is what separates a wave from a scroll.
     Spacing, size taper and per-dot size variation are all measured off the
     printed cover, and scale with the sun so the field keeps the book's
     proportions at any width. */
  (function coverDots() {
    const canvas = $(".cover-dots");
    const sunEl = $(".cover-sun");
    if (!canvas || !canvas.getContext || !sunEl) return;

    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, step = 28, raf = 0, onScreen = true, start = 0;

    // A stable per-dot size wobble — the print's halftone is not uniform.
    const jitter = (i, j) => {
      const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return 0.72 + (n - Math.floor(n)) * 0.56; // 0.72 – 1.28
    };

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 28px at the cover's own scale, tied to the sun so the field keeps the
      // book's proportions at any width. offsetWidth, not the bounding rect —
      // the sun is mid scale-in when this first runs and a rect includes the
      // transform, which would lock the spacing a few percent small.
      const sun = sunEl.offsetWidth || 500;
      step = Math.min(34, Math.max(13, sun * 0.0555));
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);

      const fadeEnd = h * 0.58;        // the print's dots are gone by here
      const fadeFrom = h * 0.24;
      const rTop = step * 0.128;       // 3.6px at print scale
      const rEnd = step * 0.055;
      const amp = step * 0.34;

      let j = 0;
      for (let y0 = step * 0.5; y0 < fadeEnd + step * 2; y0 += step, j++) {
        const d = Math.min(1, y0 / fadeEnd);
        let alpha =
          y0 <= fadeFrom ? 1 : 1 - (y0 - fadeFrom) / (fadeEnd - fadeFrom);
        alpha = Math.max(0, alpha);
        if (alpha <= 0.02) break;

        const baseR = rTop + (rEnd - rTop) * d;

        let i = 0;
        for (let x = step * 0.5; x < w + step; x += step, i++) {
          const phase = x / (step * 7.4) + y0 / (step * 21);
          const swell =
            Math.sin(phase + t * 0.36) + 0.55 * Math.sin(x / (step * 3.1) - t * 0.25);
          const y = y0 + amp * swell;
          const r = baseR * jitter(i, j) * (1 + 0.16 * Math.sin(phase + t * 0.36));
          if (r <= 0.2) continue;
          ctx.fillStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function frame(now) {
      if (!start) start = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (raf || reduced || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    draw(0); // a still field is on screen before the first frame runs
    if (reduced) return;

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        resize();
        draw(raf ? (performance.now() - start) / 1000 : 0);
      }).observe(canvas);
    } else {
      addEventListener("resize", () => {
        resize();
        draw(0);
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        onScreen = e[0].isIntersecting;
        onScreen ? play() : pause();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", () =>
      document.hidden ? pause() : play()
    );

    play();
  })();

  /* ── Subscribe dialog ─────────────────────────────────────────────── */
  const modal = $("#subscribeModal");
  const form = $("#subForm");
  const email = $("#subEmail");
  const submit = $("#subSubmit");
  const msg = $("#subMsg");
  const paneForm = $('[data-state="form"]', modal || document);
  const paneDone = $('[data-state="done"]', modal || document);

  if (!modal || !form) return;

  const supportsDialog = typeof modal.showModal === "function";
  let lastFocused = null;

  function lockScroll(on) {
    if (on) {
      const gap = innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (gap > 0) document.body.style.paddingRight = gap + "px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }

  function openModal() {
    lastFocused = document.activeElement;
    resetPanes();
    if (supportsDialog) {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    lockScroll(true);
    setTimeout(() => email && email.focus({ preventScroll: true }), 120);
  }

  function closeModal() {
    modal.classList.add("is-closing");
    const finish = () => {
      modal.classList.remove("is-closing");
      if (supportsDialog) modal.close();
      else modal.removeAttribute("open");
      lockScroll(false);
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    };
    if (reduced) finish();
    else setTimeout(finish, 180);
  }

  function resetPanes() {
    if (paneForm) paneForm.hidden = false;
    if (paneDone) paneDone.hidden = true;
    setMsg("");
    if (email) {
      email.value = "";
      email.removeAttribute("aria-invalid");
    }
    setBusy(false);
  }

  function setMsg(text, kind) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = "form-msg" + (kind ? " is-" + kind : "");
  }

  function setBusy(on) {
    if (!submit) return;
    if (on) submit.setAttribute("aria-busy", "true");
    else submit.removeAttribute("aria-busy");
    submit.textContent = on ? "Subscribing…" : "Subscribe";
  }

  function showDone() {
    if (paneForm) paneForm.hidden = true;
    if (paneDone) paneDone.hidden = false;
    const btn = paneDone && paneDone.querySelector("button");
    if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 60);
  }

  $$("[data-subscribe-open]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    })
  );
  $$("[data-subscribe-close]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    })
  );

  // Click on the backdrop (the dialog element itself) closes.
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape: run our close animation instead of the browser's instant close.
  modal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeModal();
  });
  modal.addEventListener("close", () => lockScroll(false));

  if (!supportsDialog) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.hasAttribute("open")) closeModal();
    });
  }

  /* ── Submission ───────────────────────────────────────────────────── */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!SUBSCRIBE_ENDPOINT) {
    console.warn(
      "[Live What Is Yours] The subscribe form has no endpoint yet. " +
        "Set SUBSCRIBE_ENDPOINT at the top of assets/js/main.js — see README.md."
    );
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot — bots fill hidden fields, people don't.
    const trap = form.querySelector('input[name="_gotcha"]');
    if (trap && trap.value) {
      showDone();
      return;
    }

    const value = (email.value || "").trim();
    if (!EMAIL_RE.test(value)) {
      email.setAttribute("aria-invalid", "true");
      setMsg("Please enter a valid email address.", "error");
      email.focus();
      return;
    }
    email.removeAttribute("aria-invalid");

    if (!SUBSCRIBE_ENDPOINT) {
      setMsg(
        "Setup needed: add your email service endpoint to SUBSCRIBE_ENDPOINT in assets/js/main.js.",
        "setup"
      );
      return;
    }

    setBusy(true);
    setMsg("");

    let res;
    try {
      res = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          email_address: value, // ConvertKit / Mailchimp style
          source: location.hostname, // whatever domain the site is on that day
          _subject: "New subscriber — Live What Is Yours",
          _captcha: "false", // FormSubmit: skip its captcha page for AJAX posts
          _template: "table",
        }),
      });
    } catch (networkErr) {
      // The request never completed — usually a CORS preflight the provider
      // doesn't answer. Retry as an opaque classic form POST, which most
      // embed endpoints (Buttondown, ConvertKit, Mailchimp) do accept.
      try {
        const fd = new FormData();
        fd.append("email", value);
        fd.append("email_address", value);
        await fetch(SUBSCRIBE_ENDPOINT, { method: "POST", mode: "no-cors", body: fd });
        showDone();
      } catch (fallbackErr) {
        setBusy(false);
        setMsg("Something went wrong. Please try again in a moment.", "error");
      }
      return;
    }

    if (res && (res.ok || res.type === "opaque")) {
      showDone();
    } else {
      setBusy(false);
      setMsg("Something went wrong. Please try again in a moment.", "error");
    }
  });
})();
