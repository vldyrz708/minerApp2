// Utilidades comunes para Admin
async function loadAdminHeader() {
  try {
    const res = await fetch('/admin/partials/header');
    if (res && res.ok) {
      const html = await res.text();
      const container = document.getElementById('header-container');
      if (container) container.innerHTML = html;
          // After injecting the header partial, ensure nav helpers run
          try {
            // mark active link now that links exist
            if (typeof markActiveNav === 'function') markActiveNav();
            // enable mobile toggle behavior for the newly added elements
            if (typeof setupMobileNavToggle === 'function') setupMobileNavToggle();
            if (typeof applyAdminNavVisibility === 'function') applyAdminNavVisibility();
            // notify any other listeners that header is ready
            document.dispatchEvent(new Event('admin:headerLoaded'));
          } catch (e) {
            // ignore errors here to avoid breaking header load
          }
    }
  } catch (err) {
    console.warn('No se pudo cargar el header partial', err);
  }
}

function setupAdminLogoutHandler() {
  // Listener global: el botón de logout está dentro del partial y tiene id partialLogout
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'partialLogout') {
      window.location.href = '/admin/logout';
    }
  });
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(txt || res.statusText);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadAdminHeader();
  setupAdminLogoutHandler();
});

// --- Responsive helpers ---
function markActiveNav() {
  try {
    const links = document.querySelectorAll('.nav-link');
    const path = window.location.pathname;
    links.forEach(a => {
      a.classList.remove('text-indigo-600', 'font-semibold', 'active');
      // consider startsWith for routes
      if (path === a.getAttribute('href') || path.startsWith(a.getAttribute('href'))) {
        a.classList.add('text-indigo-600', 'font-semibold', 'active');
      }
    });
  } catch (e) { /* ignore */ }
}

function setupMobileNavToggle() {
  const toggle = document.getElementById('mobileNavToggle');
  const nav = document.getElementById('adminNavLinks');
  if (!toggle || !nav) return;
  const toggleNav = () => {
    nav.classList.toggle('admin-nav--open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('admin-nav--open'));
  };
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleNav();
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && event.target !== toggle) {
      nav.classList.remove('admin-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function applyAdminNavVisibility() {
  const isGuest = document.body && document.body.dataset && document.body.dataset.adminGuest === 'true';
  const protectedEls = document.querySelectorAll('[data-nav-protected]');
  protectedEls.forEach((el) => {
    if (isGuest) {
      el.setAttribute('hidden', 'hidden');
    } else {
      el.removeAttribute('hidden');
    }
  });
}

// Fix mobile viewport unit issues and adapt layout
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function setupIframeAutoResize() {
  const f = document.getElementById('previewFrame') || document.getElementById('adminPreviewFrame');
  if (!f) return;
  const adjust = () => {
    const containerH = (window.innerHeight - 220); // approx header + margins
    f.style.height = Math.max(320, containerH) + 'px';
  };
  adjust();
  window.addEventListener('resize', adjust);
  window.addEventListener('orientationchange', adjust);
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  setupMobileNavToggle();
  setVh();
  window.addEventListener('resize', setVh);
  setupIframeAutoResize();
});

// --- SweetAlert + UX helpers (centralizados) ---
async function ensureSwal() {
  if (window.Swal) return window.Swal;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    s.onload = () => resolve(window.Swal);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function swalConfirm(options = {}) {
  const Swal = await ensureSwal();
  return Swal.fire(Object.assign({ position: 'center', icon: 'warning', showCancelButton: true, confirmButtonText: 'Continuar', cancelButtonText: 'Cancelar' }, options));
}

async function swalToast(type = 'success', title = '') {
  const Swal = await ensureSwal();
  // position: 'top' centers at the top horizontally
  return Swal.fire({ position: 'top', icon: type, title, showConfirmButton: false, timer: 1500 });
}

// Modal genérico centrado (errores, info, etc.)
async function swalModal(icon = 'info', title = '', text = '', options = {}) {
  const Swal = await ensureSwal();
  return Swal.fire(Object.assign({ position: 'center', icon, title, text, showConfirmButton: true }, options));
}

window.swalModal = swalModal;

/* Reusable preview overlay component
   Usage:
     AdminPreview.open({ src: '/', sizes: { mobile: '375x812', desktop: '1366x768' } })
*/
const AdminPreview = (function(){
  let overlay = null;
  function create() {
    overlay = document.createElement('div');
    overlay.id = 'adminPreviewOverlay';
    Object.assign(overlay.style, { position: 'fixed', top: '24px', left: '24px', right: '24px', bottom: '24px', background: 'rgba(0,0,0,0.6)', zIndex: '9999', display: 'none', alignItems: 'center', justifyContent: 'center' });
    overlay.innerHTML = `<div id="adminPreviewInner" style="width:100%;height:100%;max-width:1200px;max-height:860px;background:#fff;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #eee">
        <div style="font-weight:600">Vista previa</div>
        <div style="display:flex;gap:8px;align-items:center">
          <select id="previewSize" style="padding:6px;border:1px solid #ddd;border-radius:6px;background:#fff">
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </select>
          <button id="adminPreviewOpenNew" style="padding:6px 10px;background:#2563eb;color:#fff;border-radius:6px;border:0">Abrir</button>
          <button id="adminPreviewClose" style="padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff">Cerrar</button>
        </div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#f9fafb">
        <iframe id="adminPreviewFrame" src="/" style="width:100%;height:100%;border:0"></iframe>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    document.getElementById('adminPreviewClose').addEventListener('click', () => overlay.style.display = 'none');
    document.getElementById('adminPreviewOpenNew').addEventListener('click', () => window.open(document.getElementById('adminPreviewFrame').src, '_blank'));
    document.getElementById('previewSize').addEventListener('change', (e) => {
      const f = document.getElementById('adminPreviewFrame');
      const v = e.target.value;
      if (v === 'mobile') { f.style.width = '375px'; f.style.height = '812px'; }
      else if (v === 'tablet') { f.style.width = '768px'; f.style.height = '1024px'; }
      else { f.style.width = '100%'; f.style.height = '100%'; }
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.style.display = 'none'; });
  }
  function open(options = {}) {
    if (!overlay) create();
    const frame = document.getElementById('adminPreviewFrame');
    const src = options.src || '/';
    frame.src = src + (options.nocache ? '?t=' + Date.now() : '');
    overlay.style.display = 'flex';
    if (options.size) document.getElementById('previewSize').value = options.size;
  }
  return { open };
})();

// export helpers globally
window.AdminPreview = AdminPreview;
window.swalConfirm = swalConfirm;
window.swalToast = swalToast;

// Abrir modal para crear categoría y notificar actualización
async function openCategoriaModal() {
  try {
    const Swal = await ensureSwal();
    const { value: nombre } = await Swal.fire({
      title: 'Nueva categoría',
      input: 'text',
      inputLabel: 'Nombre de la categoría',
      inputPlaceholder: 'Ej. Gastronomía',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      inputValidator: (val) => (!val || !val.trim()) ? 'El nombre no puede estar vacío' : null
    });
    if (!nombre) return null;
    const res = await fetch('/admin/categorias/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim() }),
      credentials: 'same-origin'
    });
    if (res.ok) {
      if (window.swalToast) window.swalToast('success', 'Categoría creada');
      // Notificar a otras vistas que pueden necesitar recargar
      document.dispatchEvent(new CustomEvent('categorias:updated'));
      return true;
    } else {
      const txt = await res.text();
      if (window.swalToast) window.swalToast('error', txt || 'Error creando categoría');
      return false;
    }
  } catch (err) {
    if (window.swalToast) window.swalToast('error', 'Error de conexión');
    return false;
  }
}
window.openCategoriaModal = openCategoriaModal;
