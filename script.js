(() => {
  "use strict";
  const root = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = matchMedia("(max-width: 1024px)").matches;
  const pointerFine = matchMedia("(pointer: fine)").matches && !smallScreen;

  /* ======== THEME ======== */
  const themeBtn = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;

  const setIcon = (t) => {
    if (!themeBtn) return;
    const icon = themeBtn.querySelector(".theme-btn__icon");
    if (icon) icon.textContent = t === "dark" ? "\u{1F319}" : "\u2600\uFE0F";
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  };

  const applyTheme = (t) => {
    root.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    setIcon(t);
  };

  applyTheme(stored === "light" || stored === "dark" ? stored : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.classList.add("theme-switch");
      applyTheme(next);
      setTimeout(() => root.classList.remove("theme-switch"), 600);
    });
  }

  /* ======== MOBILE NAV ======== */
  const burger = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (burger && mobileNav) {
    const OPEN_CLASS = "nav-open";
    const OPEN_MS = 220;
    const CLOSE_MS = 200;

    const open = () => {
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add(OPEN_CLASS);

      // Unhide first so transitions can run.
      mobileNav.hidden = false;
      mobileNav.classList.add("is-animating");
      requestAnimationFrame(() => {
        mobileNav.classList.add("is-open");
        setTimeout(() => mobileNav.classList.remove("is-animating"), OPEN_MS);
      });
    };

    const close = () => {
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove(OPEN_CLASS);

      mobileNav.classList.add("is-animating");
      mobileNav.classList.remove("is-open");
      // Match CSS transition duration.
      setTimeout(() => {
        mobileNav.hidden = true;
        mobileNav.classList.remove("is-animating");
      }, CLOSE_MS);
    };

    burger.addEventListener("click", () => burger.getAttribute("aria-expanded") === "true" ? close() : open());

    // Close on any link click (hash links + route links).
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });

    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    const mq = matchMedia("(min-width: 820px)");
    try { mq.addEventListener("change", close); } catch { mq.addListener(close); }
  }

  /* ======== FOOTER YEAR ======== */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ======== IMAGE FALLBACK ======== */
  document.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    const fb = img.getAttribute("data-fallback-src");
    if (fb) img.addEventListener("error", () => { if (img.dataset.fallbackApplied) return; img.dataset.fallbackApplied = "1"; img.src = fb; }, { once: true });
  });

  /* ======== REVEAL ON SCROLL ======== */
  const reveals = [...document.querySelectorAll(".reveal")];
  const markAbove = () => {
    const fold = innerHeight * 1.05;
    reveals.forEach((el) => { const r = el.getBoundingClientRect(); if (r.bottom >= 0 && r.top <= fold) el.classList.add("active", "is-visible"); });
  };

  try {
    markAbove();
    root.classList.add("js");
    if (reducedMotion) {
      reveals.forEach((el) => el.classList.add("active", "is-visible"));
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("active", "is-visible"); io.unobserve(entry.target); } });
      }, { threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
      addEventListener("resize", markAbove, { passive: true });
    } else {
      reveals.forEach((el) => el.classList.add("active", "is-visible"));
    }
  } catch {
    root.classList.remove("js");
    reveals.forEach((el) => el.classList.add("active", "is-visible"));
  }

  /* ======== EXPERIENCE CARDS ======== */
  const expCards = [...document.querySelectorAll(".experience-card")];
  if (expCards.length) {
    if (reducedMotion) {
      expCards.forEach((c) => { c.classList.add("visible", "is-visible"); const d = c.querySelector(".timeline__dot"); if (d) d.classList.add("active"); });
    } else if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible", "is-visible");
            const d = e.target.querySelector(".timeline__dot");
            if (d) d.classList.add("active");
            o.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      expCards.forEach((c) => obs.observe(c));
    } else {
      expCards.forEach((c) => { c.classList.add("visible", "is-visible"); const d = c.querySelector(".timeline__dot"); if (d) d.classList.add("active"); });
    }
  }

  /* ======== TILT (glass depth) ======== */
  if (!reducedMotion && pointerFine) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = 5;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * max;
        const rx = -(py - 0.5) * max;
        el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.015)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "perspective(1200px) rotateX(0) rotateY(0) scale(1)";
      });
    });
  }

  /* ======== SMOOTH SCROLL ======== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      e.preventDefault();
      if (id === "#top") { scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }); return; }
      const t = document.querySelector(id);
      if (t) {
        t.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

        const glowSel = link.getAttribute("data-glow-target");
        if (glowSel) {
          const el = document.querySelector(glowSel);
          if (el) {
            // Reset if already active
            el.classList.remove("glow-focus");
            // Next tick so re-adding retriggers animation
            requestAnimationFrame(() => {
              el.classList.add("glow-focus");
              setTimeout(() => el.classList.remove("glow-focus"), 2000);
            });
          }
        }
      }
    });
  });

  /* ======== PARALLAX BG ======== */
  const heroBg = document.querySelector(".hero__bg");
  if (heroBg && !reducedMotion && pointerFine) {
    addEventListener("mousemove", (e) => {
      const x = ((e.clientX / innerWidth) - 0.5) * 20;
      const y = ((e.clientY / innerHeight) - 0.5) * 20;
      heroBg.style.setProperty("--px", x.toFixed(2) + "px");
      heroBg.style.setProperty("--py", y.toFixed(2) + "px");
    }, { passive: true });
  }

  /* ======== SKILLS ARROW TRACKER ======== */
  const skillsGrid  = document.getElementById('skillsGrid');
  const skillsArrow = document.getElementById('skillsArrow');
  if (skillsGrid && skillsArrow && pointerFine && !reducedMotion) {
    const items = [...skillsGrid.querySelectorAll('[data-skill]')];
    let currentItem = null;

    items.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        currentItem = item;
        const gridRect  = skillsGrid.getBoundingClientRect();
        const itemRect  = item.getBoundingClientRect();
        const top  = itemRect.top  - gridRect.top + (itemRect.height / 2) - 12;
        const left = itemRect.left - gridRect.left - 30;
        skillsArrow.style.setProperty('--arrow-y', top + 'px');
        skillsArrow.style.setProperty('--arrow-x', left + 'px');
        skillsArrow.classList.add('visible');
      });
    });

    skillsGrid.addEventListener('mouseleave', () => {
      currentItem = null;
      skillsArrow.classList.remove('visible');
    });
  }

  /* ======== HEADER SCROLL ======== */
  const header = document.querySelector(".header");
  if (header) {
    let ticking = false;
    addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle("scrolled", scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ======== NAV HIGHLIGHT ======== */
  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll('.nav__link[href^="#"]')];
  if (sections.length && navLinks.length) {
    let navTicking = false;
    addEventListener("scroll", () => {
      if (!navTicking) {
        requestAnimationFrame(() => {
          const pos = scrollY + 140;
          for (const s of sections) {
            const top = s.offsetTop;
            const h = s.offsetHeight;
            const id = s.getAttribute("id");
            if (pos >= top && pos < top + h) {
              navLinks.forEach((l) => l.classList.toggle("nav__link--active", l.getAttribute("href") === "#" + id));
            }
          }
          navTicking = false;
        });
        navTicking = true;
      }
    }, { passive: true });
  }

  /* ======== TYPING ANIMATION ======== */
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("typing-text");
    const cur = document.getElementById("typing-cursor");
    if (!el || !cur) return;
    const speed = innerWidth < 640 ? 30 : 42;
    const steps = [
      "Hello, I\u2019m Animesh!",
      "How can I help you?",
      "Security-First Software Engineer\nbuilding real-world solutions."
    ];
    let si = 0, ci = 0;
    function go() {
      if (si >= steps.length) { cur.remove(); return; }
      const txt = steps[si];
      function type() {
        if (ci < txt.length) { el.textContent += txt[ci++]; setTimeout(type, speed); }
        else { setTimeout(() => { ci = 0; si++; if (si < steps.length) { el.textContent = ""; setTimeout(go, 450); } else cur.remove(); }, 700); }
      }
      type();
    }
    el.textContent = "";
    go();
  });

  /* ======== CONTACT FORM ======== */
  const form = document.getElementById("contactForm");
  if (form) {
    const statusEl = document.getElementById("contactStatus");
    const messageErrorEl = document.getElementById("messageError");
    let inFlight = false;
    let lastSubmitAt = 0;

    const sanitizePlainText = (value, maxLen, opts) => {
      const options = opts || {};
      let s = String(value ?? "");
      // Normalize newlines, strip control chars (prevents header/format injection quirks).
      s = s.replace(/\r\n?/g, "\n");
      s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
      if (options.singleLine) s = s.replace(/\n+/g, " ");
      s = s.trim();
      if (Number.isFinite(maxLen) && maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
      return s;
    };

    const isHttpsUrl = (u) => {
      try { return new URL(u, location.href).protocol === "https:"; }
      catch { return false; }
    };

    const setStatus = (text, kind) => {
      if (!statusEl) return;
      statusEl.classList.remove("is-success", "is-error");
      if (kind) statusEl.classList.add(kind);
      statusEl.textContent = text || "";
    };

    const setMessageError = (text) => {
      if (!messageErrorEl) return;
      messageErrorEl.textContent = text || "";
    };

    const setSubmitting = (isSubmitting) => {
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      btn.disabled = Boolean(isSubmitting);
      btn.classList.toggle("is-loading", Boolean(isSubmitting));
    };

    form.addEventListener("submit", async (e) => {
      // Pure HTML fallback still works if JS is disabled.
      // With JS enabled, we submit via fetch to show inline success only after Formspree confirms.
      if (!form.action) return;
      if (!isHttpsUrl(form.action)) {
        e.preventDefault();
        setStatus("Secure submission is unavailable. Please try again later.", "is-error");
        return;
      }
      e.preventDefault();

      // Client-side throttling to block rapid re-submits (in addition to disabling button while sending).
      const now = Date.now();
      if (inFlight) return;
      if (now - lastSubmitAt < 6000) {
        setStatus("Please wait a few seconds before sending another message.", "is-error");
        return;
      }
      lastSubmitAt = now;
      inFlight = true;

      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');
      const gotchaInput = form.querySelector('input[name="_gotcha"]');

      // Honeypot: if filled, silently pretend success.
      if (gotchaInput && String(gotchaInput.value || "").trim().length) {
        setStatus("Message sent successfully!", "is-success");
        form.reset();
        inFlight = false;
        return;
      }

      if (nameInput) nameInput.value = sanitizePlainText(nameInput.value, 60, { singleLine: true });
      if (emailInput) emailInput.value = sanitizePlainText(emailInput.value, 100, { singleLine: true });
      if (messageInput) messageInput.value = sanitizePlainText(messageInput.value, 2000, { singleLine: false });

      setMessageError("");
      const msgLen = messageInput ? String(messageInput.value || "").trim().length : 0;
      if (messageInput && msgLen > 0 && msgLen < 10) {
        setMessageError("Message must be at least 10 characters.");
        messageInput.focus();
        inFlight = false;
        return;
      }

      if (!form.checkValidity()) {
        setStatus("Please fill out all fields correctly.", "is-error");
        form.reportValidity();
        inFlight = false;
        return;
      }

      setStatus("");
      setSubmitting(true);

      try {
        const resp = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        if (resp.ok) {
          setStatus("Message sent successfully!", "is-success");
          form.reset();
          return;
        }

        let message = "Something went wrong. Please try again.";
        try {
          const data = await resp.json();
          if (data && Array.isArray(data.errors) && data.errors.length && data.errors[0].message) {
            message = data.errors[0].message;
          }
        } catch {
          // ignore
        }
        setStatus(message, "is-error");
      } catch {
        // Network/CSP issue: fall back to native form POST navigation.
        form.submit();
      } finally {
        setSubmitting(false);
        inFlight = false;
      }
    });
  }

  /* ======== COPY BUTTONS ======== */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;
      const orig = btn.textContent || "Copy";
      try { await navigator.clipboard.writeText(text); btn.textContent = "\u2713 Copied"; }
      catch { btn.textContent = "Press Ctrl+C"; }
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });

  /* ======== AVAILABILITY (IST) ======== */
  const initAvailability = () => {
    const badge = document.getElementById("availabilityBadge");
    const label = document.getElementById("availabilityLabel");
    const sub = document.getElementById("availabilitySub");
    const wrap = badge ? badge.closest(".availability-status") : null;
    const rows = [...document.querySelectorAll('.schedule-row[data-day]')];
    if (!badge || !label || !sub || !wrap || !rows.length) return;

    const schedule = {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "18:00", close: "19:00" }
    };

    const order = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const istFmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    const getISTNow = () => {
      const parts = istFmt.formatToParts(new Date());
      const map = {};
      for (const p of parts) {
        if (p.type !== "literal") map[p.type] = p.value;
      }
      const weekday = String(map.weekday || "").toLowerCase();
      const hour = Number.parseInt(map.hour || "0", 10);
      const minute = Number.parseInt(map.minute || "0", 10);
      return { weekday, minutes: (hour * 60) + minute };
    };

    const toMins = (hhmm) => {
      const [hh, mm] = String(hhmm).split(":").map((v) => Number.parseInt(v, 10));
      return (hh * 60) + (mm || 0);
    };

    const fmtDuration = (mins) => {
      const m = Math.max(0, Math.round(mins));
      const h = Math.floor(m / 60);
      const r = m % 60;
      if (h <= 0) return `${r}m`;
      return `${h}h ${r}m`;
    };

    const fmtTime12 = (mins) => {
      const m = ((mins % 1440) + 1440) % 1440;
      let hh = Math.floor(m / 60);
      const mm = m % 60;
      const ampm = hh >= 12 ? "PM" : "AM";
      hh = hh % 12;
      if (hh === 0) hh = 12;
      return `${hh}:${String(mm).padStart(2, "0")} ${ampm}`;
    };

    const titleCase = (k) => k ? (k[0].toUpperCase() + k.slice(1)) : k;

    const setTodayRow = (weekdayKey) => {
      rows.forEach((r) => r.classList.toggle("is-today", r.getAttribute("data-day") === weekdayKey));
    };

    const setState = ({ state, icon, text, subtext }) => {
      wrap.classList.add("is-updating");
      badge.dataset.state = state;
      const iconEl = badge.querySelector(".availability-status__icon");
      if (iconEl) iconEl.textContent = icon;
      label.textContent = text;
      sub.textContent = subtext;
      setTimeout(() => wrap.classList.remove("is-updating"), 180);
    };

    const tick = () => {
      const now = getISTNow();
      const dayKey = order.includes(now.weekday) ? now.weekday : "monday";
      setTodayRow(dayKey);

      const todays = schedule[dayKey];
      if (!todays) return;
      const open = toMins(todays.open);
      const close = toMins(todays.close);
      const t = now.minutes;

      if (t >= open && t < close) {
        const remaining = close - t;
        setState({
          state: "available",
          icon: "🟢",
          text: "Available Now",
          subtext: `Closes in ${fmtDuration(remaining)}`
        });
        return;
      }

      // Offline: find next opening.
      if (t < open) {
        setState({
          state: "offline",
          icon: "🔴",
          text: "Currently Offline",
          subtext: `Opens in ${fmtDuration(open - t)}`
        });
        return;
      }

      const todayIdx = order.indexOf(dayKey);
      let daysUntil = 1;
      let nextKey = order[(todayIdx + 1) % 7];
      while (daysUntil <= 7) {
        const s = schedule[nextKey];
        if (s && s.open) break;
        daysUntil += 1;
        nextKey = order[(todayIdx + daysUntil) % 7];
      }

      const nextOpen = schedule[nextKey] ? toMins(schedule[nextKey].open) : 540;
      const when = daysUntil === 1
        ? `Opens tomorrow at ${fmtTime12(nextOpen)}`
        : `Opens ${titleCase(nextKey)} at ${fmtTime12(nextOpen)}`;

      setState({
        state: "offline",
        icon: "🔴",
        text: "Currently Offline",
        subtext: when
      });
    };

    tick();
    setInterval(tick, 60_000);
  };

  try { initAvailability(); } catch { /* avoid breaking page */ }
})();
