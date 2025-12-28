(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // Theme (default to dark)
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  if (storedTheme === 'light' || storedTheme === 'dark') {
    applyTheme(storedTheme);
  } else {
    applyTheme(prefersDark ? 'dark' : 'dark');
  }

  if (themeToggle instanceof HTMLButtonElement) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Mobile nav
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (menuToggle instanceof HTMLButtonElement && mobileNav instanceof HTMLElement) {
    const close = () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
      mobileNav.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
    };

    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) close(); else open();
    });

    mobileNav.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.closest('a[href^="#"]')) close();
    });

    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    const mq = window.matchMedia('(min-width: 820px)');
    if (mq.addEventListener) mq.addEventListener('change', () => close());
    else if (mq.addListener) mq.addListener(() => close());
  }

  const logo = document.querySelector('.logo');
  if (logo instanceof HTMLAnchorElement) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'auto' });
      window.location.reload();
    });
  }

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Image fallback (CSP-safe replacement for inline onerror)
  const imgsWithFallback = Array.from(document.querySelectorAll('img[data-fallback-src]'));
  imgsWithFallback.forEach((img) => {
    const fallbackSrc = img.getAttribute('data-fallback-src');
    if (!fallbackSrc) return;
    img.addEventListener('error', () => {
      if (img.getAttribute('data-fallback-applied') === 'true') return;
      img.setAttribute('data-fallback-applied', 'true');
      img.src = fallbackSrc;
    }, { once: true });
  });

  // Reveal on scroll (smooth, one-time)
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  const markVisibleAboveFold = () => {
    const fold = window.innerHeight * 1.05;
    for (const el of revealEls) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= fold) el.classList.add('active', 'is-visible');
    }
  };

  try {
    markVisibleAboveFold();
    root.classList.add('js');

    if (reducedMotion) {
      for (const el of revealEls) el.classList.add('active', 'is-visible');
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active', 'is-visible');
            io.unobserve(entry.target);
          }
        }
      }, { threshold: 0.25 });
      for (const el of revealEls) io.observe(el);
      window.addEventListener('resize', () => markVisibleAboveFold(), { passive: true });
    } else {
      for (const el of revealEls) el.classList.add('active', 'is-visible');
    }
  } catch (err) {
    root.classList.remove('js');
    for (const el of revealEls) el.classList.add('active', 'is-visible');
  }

  // Experience cards: scroll reveal + active dots
  const experienceCards = Array.from(document.querySelectorAll('.experience-card'));
  if (experienceCards.length) {
    if (reducedMotion) {
      for (const card of experienceCards) {
        card.classList.add('visible', 'is-visible');
        const dot = card.querySelector('.timeline__dot');
        if (dot) dot.classList.add('active');
      }
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible', 'is-visible');
            const dot = entry.target.querySelector('.timeline__dot');
            if (dot) dot.classList.add('active');
            obs.unobserve(entry.target);
          }
        }
      }, { threshold: 0.35 });

      for (const card of experienceCards) observer.observe(card);
    } else {
      for (const card of experienceCards) {
        card.classList.add('visible', 'is-visible');
        const dot = card.querySelector('.timeline__dot');
        if (dot) dot.classList.add('active');
      }
    }
  }

  // Tilt interactions
  if (!reducedMotion && pointerFine) {
    const tiltTargets = Array.from(document.querySelectorAll('[data-tilt]'));
    tiltTargets.forEach((el) => {
      const max = 8;
      const handleMove = (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const tiltY = (px - 0.5) * max;
        const tiltX = -(py - 0.5) * max;
        el.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      };

      const handleLeave = () => { el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'; };
      el.addEventListener('mousemove', handleMove);
      el.addEventListener('mouseleave', handleLeave);
    });
  }

  // Smooth scroll for in-page anchors (back-to-top, nav links)
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      e.preventDefault();
      if (targetId === '#top') {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      if (!targetEl) return;
      targetEl.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Parallax background (hero)
  const heroBg = document.querySelector('.bg-layer');
  if (heroBg && !reducedMotion) {
    const updateParallax = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = ((e.clientX / w) - 0.5) * 14;
      const y = ((e.clientY / h) - 0.5) * 14;
      heroBg.style.setProperty('--px', `${x.toFixed(2)}px`);
      heroBg.style.setProperty('--py', `${y.toFixed(2)}px`);
    };
    window.addEventListener('mousemove', updateParallax);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const textEl = document.getElementById("typing-text");
    const cursor = document.getElementById("typing-cursor");

    const isMobile = window.innerWidth < 640;
    const TYPE_SPEED = isMobile ? 28 : 40;

    const steps = [
      "Hello, I’m Animesh.",
      "How can I help you?",
      "Software engineer · security-first thinker\nI build secure software and real-world tools."
    ];

    let stepIndex = 0;
    let charIndex = 0;

    function typeStep() {
      if (stepIndex >= steps.length) {
        cursor.remove(); // remove cursor at end
        return;
      }

      const text = steps[stepIndex];

      function typeChar() {
        if (charIndex < text.length) {
          textEl.textContent += text[charIndex++];
          setTimeout(typeChar, TYPE_SPEED);
        } else {
          // line finished
          setTimeout(() => {
            charIndex = 0;
            stepIndex++;

            // Clear text ONLY if next step exists
            if (stepIndex < steps.length) {
              textEl.textContent = "";
              setTimeout(typeStep, 400);
            } else {
              // last line → keep text, remove cursor
              cursor.remove();
            }
          }, 600);
        }
      }

      typeChar();
    }

    // start fresh every reload
    textEl.textContent = "";
    typeStep();
  });

  // Contact mailto
  const form = document.getElementById('contactForm');
  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const clamp = (s, max) => s.length > max ? s.slice(0, max) : s;
      const normalize = (s) => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      const name = clamp(normalize(String(data.get('name') || '').trim()), 80);
      const email = clamp(normalize(String(data.get('email') || '').trim()), 120);
      const message = clamp(normalize(String(data.get('message') || '').trim()), 2000);

      const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'Someone'}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);

      window.location.href = `mailto:animeshpatra7908@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  const copyButtons = Array.from(document.querySelectorAll('[data-copy]'));
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      const original = btn.textContent || 'Copy';
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
      } catch (err) {
        btn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => { btn.textContent = original; }, 1400);
    });
  });
})();
