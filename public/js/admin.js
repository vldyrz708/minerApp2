// Utilidades comunes para Admin
async function loadAdminHeader() {
  try {
    const res = await fetch('/admin/partials/header');
    if (res && res.ok) {
      const html = await res.text();
      const container = document.getElementById('header-container');
      if (container) container.innerHTML = html;
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
