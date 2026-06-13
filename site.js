// BTM Carrosserie — Site interactions
(function () {
  // ---- Mode édition (?btm-edit dans l'URL) ----------------
  if (window.location.search.includes('btm-edit')) {
    document.body.classList.add('btm-edit-mode');
  }

  // ---- Nav toggle (mobile) ----------------------------
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Reveal on scroll (fallback si pas de scroll-driven CSS) ----
  const supportsScrollTimeline =
    typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
  const targets = document.querySelectorAll('.reveal');
  if (!supportsScrollTimeline && 'IntersectionObserver' in window && targets.length) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  }

  // ---- Contact form (light validation) ----------------
  const form = document.querySelector('#contact-form');
  if (form) {
    const success = document.querySelector('#form-success');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let ok = true;
      form.querySelectorAll('[data-required]').forEach((field) => {
        const wrap = field.closest('.field');
        const val = (field.value || '').trim();
        const isEmail = field.type === 'email';
        const valid =
          val.length > 0 && (!isEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val));
        if (!valid) {
          wrap.classList.add('has-err');
          field.classList.add('invalid');
          ok = false;
        } else {
          wrap.classList.remove('has-err');
          field.classList.remove('invalid');
        }
      });
      if (!ok) {
        const firstErr = form.querySelector('.has-err input, .has-err textarea, .has-err select');
        if (firstErr) firstErr.focus();
        return;
      }
      // Simulate submit
      form.style.display = 'none';
      if (success) success.classList.add('shown');
    });

    // Clear error on input
    form.querySelectorAll('[data-required]').forEach((field) => {
      field.addEventListener('input', () => {
        const wrap = field.closest('.field');
        if (wrap.classList.contains('has-err')) {
          wrap.classList.remove('has-err');
          field.classList.remove('invalid');
        }
      });
    });
  }

  // ---- Modal pré-ouverture (une fois par session) ----------
  const modal = document.querySelector('#preopen-modal');
  if (modal && !sessionStorage.getItem('btm-modal-seen')) {
    modal.classList.add('is-open');
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      modal.classList.remove('is-open');
      sessionStorage.setItem('btm-modal-seen', '1');
    });
    modal.querySelector('.modal-contact')?.addEventListener('click', () => {
      modal.classList.remove('is-open');
      sessionStorage.setItem('btm-modal-seen', '1');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
        sessionStorage.setItem('btm-modal-seen', '1');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        modal.classList.remove('is-open');
        sessionStorage.setItem('btm-modal-seen', '1');
      }
    });
  }
})();
