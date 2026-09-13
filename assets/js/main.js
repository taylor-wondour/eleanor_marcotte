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

  /* ── The dot wave ─────────────────────────────────────────────────── */
  /* A field of dots standing in fixed columns. A travelling swell — three
     sine components at different wavelengths and speeds, so it never settles
     into a visible rhythm — lifts and drops each column in turn. Nothing
     slides sideways; the dots only ever move up and down. */
  (function landWave() {
    const canvas = $(".land-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const STEP = 8; // dot grid spacing, px

    let w = 0,
      h = 0,
      hill = [39, 64, 31],
      sand = [168, 150, 117],
      raf = 0,
      onScreen = true,
      start = 0;

    const toRGB = (v) => {
      v = (v || "").trim();
      return /^#[0-9a-f]{6}$/i.test(v)
        ? [1, 3, 5].map((i) => parseInt(v.substr(i, 2), 16))
        : null;
    };

    function readColours() {
      const cs = getComputedStyle(document.documentElement);
      hill = toRGB(cs.getPropertyValue("--hill")) || hill;
      sand = toRGB(cs.getPropertyValue("--sand")) || sand;
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);

      const amp = h * 0.13;
      const base = h * 0.36; // mean height of the crest line
      const ceiling = h * 0.1; // keep the crests clear of the horizon line
      const dr = hill[0] - sand[0],
        dg = hill[1] - sand[1],
        db = hill[2] - sand[2];

      for (let x = STEP / 2; x < w; x += STEP) {
        const surface = Math.max(
          ceiling,
          base +
            amp * Math.sin(x / 168 + t * 0.42) +
            amp * 0.58 * Math.sin(x / 79 - t * 0.29) +
            amp * 0.34 * Math.sin(x / 312 + t * 0.17)
        );

        const depth = Math.max(h - surface, 1);

        for (let y = surface; y < h; y += STEP) {
          const d = (y - surface) / depth; // 0 at the crest, 1 at the base
          const a = (1 - d) * (1 - d) * 0.8;
          if (a < 0.015) break;
          ctx.fillStyle =
            "rgba(" +
            Math.round(sand[0] + dr * (1 - d)) + "," +
            Math.round(sand[1] + dg * (1 - d)) + "," +
            Math.round(sand[2] + db * (1 - d)) + "," +
            a.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, 1.5 - d * 0.6, 0, 6.2832);
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

    readColours();
    resize();
    draw(0); // a still wave is on screen before the first frame runs

    if (reduced) return; // reduced motion: the range simply stands still

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

    const dark = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => readColours();
    dark.addEventListener
      ? dark.addEventListener("change", onScheme)
      : dark.addListener(onScheme);

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
          source: "eleanormarcotte.com",
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
