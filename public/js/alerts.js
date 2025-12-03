(function(){
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm4.95 6.95l-5.657 5.657a1 1 0 01-1.414 0L7.05 11.778a1 1 0 111.414-1.414l2.121 2.121 4.95-4.95a1 1 0 111.414 1.414z"/></svg>',
    error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 14a1 1 0 01-2 0v-2a1 1 0 012 0zm0-4a1 1 0 01-2 0V7a1 1 0 012 0z"/></svg>',
    warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.05 3.576l-8.3 14.36A1 1 0 003.6 19.99h16.8a1 1 0 00.853-1.538l-8.3-14.36a1 1 0 00-1.903.484zm.95 11.424a1 1 0 112 0v1a1 1 0 11-2 0zm0-6a1 1 0 112 0v4a1 1 0 11-2 0z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 15a1 1 0 01-2 0v-4a1 1 0 012 0zm-1-7.25a1.25 1.25 0 111.25-1.25A1.25 1.25 0 0112 9.75z"/></svg>'
  };

  function ensureContainer(){
    let container = document.querySelector('[data-alert-center]');
    if (!container){
      container = document.createElement('section');
      container.className = 'alert-center';
      container.dataset.alertCenter = 'true';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
    }
    return container;
  }

  function removeAlert(alertEl){
    if (!alertEl) return;
    alertEl.classList.remove('show');
    alertEl.classList.add('hide');
    const cleanup = () => alertEl.remove();
    alertEl.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 400);
  }

  function buildActionButton(label, onAction){
    if (!label || typeof onAction !== 'function') return null;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'alert-action focus-ring';
    btn.textContent = label;
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      onAction();
    });
    return btn;
  }

  function showAlert(message, opts = {}){
    const payload = typeof message === 'string' ? { message } : (message || {});
    const config = { ...payload, ...opts };
    const type = config.type || config.status || 'info';
    const title = config.title || '';
    const body = config.message || config.body || '';
    const timeout = typeof config.timeout === 'number' ? config.timeout : 5000;
    const dismissible = config.dismissible !== false;

    const container = ensureContainer();
    const alertEl = document.createElement('article');
    alertEl.className = `alert-toast alert-${type}`;
    alertEl.setAttribute('role', (type === 'error' || type === 'warning') ? 'alert' : 'status');

    const icon = document.createElement('div');
    icon.className = 'alert-icon';
    icon.innerHTML = ICONS[type] || ICONS.info;
    alertEl.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'alert-content';
    if (title){
      const titleEl = document.createElement('p');
      titleEl.className = 'alert-title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }
    if (body){
      const msgEl = document.createElement('p');
      msgEl.className = 'alert-message';
      msgEl.textContent = body;
      content.appendChild(msgEl);
    }
    alertEl.appendChild(content);

    const meta = document.createElement('div');
    meta.className = 'alert-meta';

    const actionBtn = buildActionButton(config.actionLabel, config.onAction);
    if (actionBtn) meta.appendChild(actionBtn);

    if (dismissible){
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'alert-close';
      closeBtn.setAttribute('aria-label', 'Cerrar notificación');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => removeAlert(alertEl));
      meta.appendChild(closeBtn);
    }

    if (meta.childNodes.length) alertEl.appendChild(meta);

    container.appendChild(alertEl);
    requestAnimationFrame(() => alertEl.classList.add('show'));

    let timerId = null;
    const startTimer = () => {
      if (timeout > 0){
        timerId = window.setTimeout(() => removeAlert(alertEl), timeout);
      }
    };
    const stopTimer = () => { if (timerId) { clearTimeout(timerId); timerId = null; } };
    alertEl.addEventListener('mouseenter', stopTimer);
    alertEl.addEventListener('mouseleave', startTimer);
    startTimer();

    return alertEl;
  }

  const api = {
    show: showAlert,
    success: (message, opts) => showAlert(message, { ...opts, type: 'success' }),
    error: (message, opts) => showAlert(message, { ...opts, type: 'error' }),
    warning: (message, opts) => showAlert(message, { ...opts, type: 'warning' }),
    info: (message, opts) => showAlert(message, { ...opts, type: 'info' }),
    dismiss: removeAlert,
    dismissAll: () => document.querySelectorAll('.alert-toast').forEach(removeAlert)
  };

  window.alertCenter = api;
})();
