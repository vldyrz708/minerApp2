// Helpers para la interfaz de usuario pública
(function(){
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

  async function swalToast(type = 'success', title = '') {
    const Swal = await ensureSwal();
    return Swal.fire({ position: 'top-end', icon: type, title, showConfirmButton: false, timer: 1500 });
  }

  // Marca el nav activo en la vista pública (usa .nav-link en los enlaces)
  function markActiveNav() {
    try {
      const links = document.querySelectorAll('.nav-link');
      const path = window.location.pathname;
      links.forEach(a => {
        a.classList.remove('text-indigo-600', 'font-semibold');
        const href = a.getAttribute('href');
        if (!href) return;
        if (href === path || (href !== '/' && path.startsWith(href))) {
          a.classList.add('text-indigo-600', 'font-semibold');
        }
      });
    } catch (e) { /* ignore */ }
  }

  // Pequena utilidad para fetch JSON con manejo de errores
  async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch(e){}
      const err = new Error(body || res.statusText);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // Exponer algunas utilidades globales que las vistas usan
  window.userUtils = { ensureSwal, swalToast, markActiveNav, fetchJSON };

  async function loadPartial(selector, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) container.innerHTML = html;
    } catch (e) { /* ignore */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // marcar nav
    markActiveNav();
    // cargar partials si existen
    loadPartial('#user-header-container', '/partials/user-header.html');
    loadPartial('#user-footer-container', '/partials/user-footer.html');
  });
})();
