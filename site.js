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

  // ---- Contact form ------------------------------------------
  const form = document.querySelector('#contact-form');
  if (form) {
    const success = document.querySelector('#form-success');
    const serverErr = document.querySelector('#form-server-err');
    const submitBtn = form.querySelector('button[type="submit"]');
    const params = new URLSearchParams(window.location.search);

    const showSuccess = () => {
      form.hidden = true;
      if (success) success.classList.add('shown');
    };
    const setFieldError = (name, on) => {
      const field = form.querySelector(`[name="${name}"]`);
      const wrap = field ? field.closest('.field') : null;
      if (!wrap) return;
      wrap.classList.toggle('has-err', on);
      if (field) field.classList.toggle('invalid', on);
    };

    // Retour d'un envoi sans JS (redirection 303 du Worker)
    if (params.get('envoye') === '1') showSuccess();
    if (params.get('erreur') === '1' && serverErr) {
      serverErr.textContent = "L'envoi a échoué. Vérifiez les champs ou écrivez-nous à contact@btm-carrosserie.fr.";
      serverErr.classList.add('shown');
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (serverErr) { serverErr.textContent = ''; serverErr.classList.remove('shown'); }
      document.querySelector('#turnstile-err')?.closest('.field')?.classList.remove('has-err');

      let ok = true;
      form.querySelectorAll('[data-required]').forEach((field) => {
        const val = (field.value || '').trim();
        const isEmail = field.type === 'email';
        const valid = val.length > 0 && (!isEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) && (field.tagName !== 'TEXTAREA' || val.length >= 10);
        setFieldError(field.name, !valid);
        if (!valid) ok = false;
      });
      const consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) { setFieldError('consent', true); ok = false; }
      if (!ok) {
        const firstErr = form.querySelector('.has-err input, .has-err textarea, .has-err select');
        if (firstErr) firstErr.focus();
        return;
      }

      const label = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        const json = await res.json().catch(() => ({ ok: false, errors: { _: 'Réponse illisible' } }));
        if (res.ok && json.ok) { showSuccess(); return; }
        const errors = json.errors || {};
        Object.keys(errors).forEach((name) => {
          if (name === 'turnstile') { document.querySelector('#turnstile-err')?.closest('.field')?.classList.add('has-err'); return; }
          if (name !== '_') setFieldError(name, true);
        });
        if (serverErr) {
          serverErr.textContent = errors._ || 'Certains champs sont à corriger.';
          serverErr.classList.add('shown');
        }
        if (window.turnstile) window.turnstile.reset();
      } catch {
        if (serverErr) {
          serverErr.innerHTML = 'Connexion impossible. Écrivez-nous à <a href="mailto:contact@btm-carrosserie.fr" class="text-link">contact@btm-carrosserie.fr</a>.';
          serverErr.classList.add('shown');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
      }
    });

    form.addEventListener('reset', () => {
      form.querySelectorAll('.has-err').forEach((w) => w.classList.remove('has-err'));
      form.querySelectorAll('.invalid').forEach((f) => f.classList.remove('invalid'));
      if (serverErr) { serverErr.textContent = ''; serverErr.classList.remove('shown'); }
    });

    // Clear error on input
    form.querySelectorAll('[data-required], [name="consent"]').forEach((field) => {
      field.addEventListener('input', () => setFieldError(field.name, false));
      field.addEventListener('change', () => setFieldError(field.name, false));
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
