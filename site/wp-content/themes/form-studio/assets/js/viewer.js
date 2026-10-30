(() => {
  const stage = document.querySelector('[data-model-stage]');
  const model = stage?.querySelector('model-viewer');
  if (!model) return;
  const launch = stage.querySelector('[data-viewer-launch]');
  const retry = stage.querySelector('[data-viewer-retry]');
  const errorPanel = stage.querySelector('[data-viewer-error]');
  const progress = stage.querySelector('[data-viewer-progress]');
  const meter = progress.querySelector('progress');
  const status = stage.querySelector('[data-viewer-status]');
  const reset = stage.querySelector('[data-viewer-reset]');
  const fullscreen = stage.querySelector('[data-viewer-fullscreen]');
  const recovering = new URLSearchParams(window.location.search).get('viewer_retry') === '1';
  let timeout;
  let loading = false;
  let focusAfterLoad = false;

  function showError() {
    clearTimeout(timeout);
    loading = false;
    stage.dataset.state = 'error';
    model.showPoster?.();
    errorPanel.hidden = false;
    progress.hidden = true;
    launch.disabled = false;
    reset.disabled = true;
    fullscreen.disabled = true;
    status.textContent = 'The product image is available. The interactive preview could not be loaded.';
  }

  model.addEventListener('progress', event => { meter.value = event.detail.totalProgress; });
  model.addEventListener('error', showError);
  model.addEventListener('load', () => {
    clearTimeout(timeout);
    loading = false;
    stage.dataset.state = 'ready';
    errorPanel.hidden = true;
    progress.hidden = true;
    reset.disabled = false;
    fullscreen.disabled = !stage.requestFullscreen;
    model.dismissPoster();
    status.textContent = 'Drag to rotate · Scroll or pinch to zoom. Arrow keys rotate the model.';
    // Focus model-viewer's own keyboard surface; the host is not an extra tab stop.
    if (focusAfterLoad) model.shadowRoot?.querySelector('[role="img"][tabindex]')?.focus({ preventScroll: true });
  });

  async function loadModel() {
    if (loading) return;
    focusAfterLoad = recovering || document.activeElement === launch || document.activeElement === retry;
    loading = true;
    stage.dataset.state = 'loading';
    errorPanel.hidden = true;
    progress.hidden = false;
    meter.value = 0;
    launch.disabled = true;
    status.textContent = 'Loading your interactive 3D preview…';
    try {
      await Promise.race([customElements.whenDefined('model-viewer'), new Promise((_, reject) => setTimeout(() => reject(new Error('Viewer unavailable')), 12000))]);
      model.src = '';
      requestAnimationFrame(() => { model.src = model.dataset.src; });
      timeout = setTimeout(showError, 35000);
    } catch { showError(); }
  }
  launch.addEventListener('click', loadModel);
  retry.addEventListener('click', () => {
    // A new document clears failed model caches while preserving the configured asset URL.
    const url = new URL(window.location.href);
    url.searchParams.set('viewer_retry', '1');
    window.location.replace(url);
  });
  reset.addEventListener('click', () => {
    model.cameraOrbit = stage.dataset.orbit;
    model.cameraTarget = 'auto auto auto';
    model.fieldOfView = '30deg';
    model.jumpCameraToGoal();
    status.textContent = 'View reset. Drag to rotate · Scroll or pinch to zoom.';
  });
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch { status.textContent = 'Fullscreen is unavailable. You can continue exploring the model here.'; }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === stage;
    fullscreen.querySelector('span').textContent = active ? 'Exit fullscreen' : 'Fullscreen';
    fullscreen.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  });
  if (recovering) {
    const url = new URL(window.location.href);
    url.searchParams.delete('viewer_retry');
    window.history.replaceState(null, '', url);
    stage.scrollIntoView({ block: 'center' });
    loadModel();
  }
})();
