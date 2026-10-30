(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const mobile = window.matchMedia('(max-width: 900px)');
  function setNavigation(open, restoreFocus = false) {
    document.body.classList.toggle('nav-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (!open && restoreFocus) toggle?.focus();
  }
  toggle?.addEventListener('click', () => setNavigation(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation?.addEventListener('click', event => { if (event.target.closest('a') && mobile.matches) setNavigation(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.body.classList.contains('nav-open')) setNavigation(false, true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header') && document.body.classList.contains('nav-open')) setNavigation(false); });
  mobile.addEventListener('change', () => setNavigation(false));

  document.querySelectorAll('img[data-fallback-src]').forEach(image => {
    let attempts = 0;
    function useFallback() {
      if (attempts >= 2) return;
      const fallback = attempts++ === 0 ? image.dataset.fallbackSrc : image.dataset.placeholderSrc;
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      if (fallback.endsWith('/preview.svg')) image.alt = 'Product image preview is currently unavailable.';
      image.src = fallback;
    }
    image.addEventListener('error', useFallback);
    if (image.complete && image.naturalWidth === 0) useFallback();
  });

  const form = document.querySelector('[data-inquiry-form]');
  if (!form || !window.fetch) return;
  const status = form.querySelector('[data-inquiry-status]');
  const submit = form.querySelector('[data-inquiry-submit]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;
    submit.disabled = true;
    status.textContent = 'Sending your project brief…';
    status.classList.remove('error');
    const body = new FormData(form);
    body.set('form_async', '1');
    try {
      // The hidden WordPress action field shadows the form.action property.
      const response = await fetch(form.getAttribute('action'), { method: 'POST', body, credentials: 'same-origin', headers: { Accept: 'application/json' } });
      let result;
      try { result = await response.json(); }
      catch { throw new Error('Your brief could not be received. Please refresh the page and try again.'); }
      if (!response.ok || !result.success) throw new Error(result.data?.message || 'Your brief could not be received. Please try again.');
      status.textContent = result.data.message;
      form.reset();
    } catch (error) {
      status.textContent = error.message === 'Failed to fetch' ? 'Your brief could not be received. Please check your connection and try again.' : error.message;
      status.classList.add('error');
    } finally {
      submit.disabled = false;
    }
  });
})();
