/* ==========================================================================
   Eleanor Marcotte — Live What Is Yours
   --------------------------------------------------------------------------
   CONFIGURE ME — see README.md
   ========================================================================== */

/**
 * Where subscribe submissions are sent.
 *
 * Leave as "" and the form will tell you (and only you, in the console) that
 * it is not connected yet. Paste one of these in to go live:
 *
 *   Formspree   https://formspree.io/f/xxxxxxxx
 *   Buttondown  https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME
 *   ConvertKit  https://app.convertkit.com/forms/XXXXXXX/subscriptions
 *   Formsubmit  https://formsubmit.co/ajax/you@example.com
 */
const SUBSCRIBE_ENDPOINT = "";

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
