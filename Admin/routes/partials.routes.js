const express = require('express');
const router = express.Router();

// Servir header parcial dinámico según la sesión y la página solicitante
router.get('/header', (req, res) => {
  const isLogged = !!(req.session && req.session.adminId);
  const referer = (req.get('referer') || '').toLowerCase();
  // Si la petición viene desde la página de login o register, ocultamos el botón de logout
  const hideOnAuthPages = referer.includes('/admin/login') || referer.includes('/admin/register');
  const showLogout = isLogged && !hideOnAuthPages;

  const logoutButtonHtml = showLogout
    ? '<button id="partialLogout" class="bg-red-600 text-white px-3 py-1 rounded">Cerrar sesión</button>'
    : '';

  const html = `
  <header class="bg-white border-b shadow-sm">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="logo" class="w-10 h-10 rounded" onerror="this.style.display='none'" />
        <h1 class="text-lg font-semibold">Real del Monte — Admin</h1>
      </div>
      <nav class="flex items-center gap-4 text-sm text-gray-600">
        <a href="/admin/dashboard" class="hover:text-gray-900">Dashboard</a>
        <a href="/admin/lugares" class="hover:text-gray-900">Lugares</a>
        <a href="/" class="hover:text-gray-900">Sitio público</a>
        ${logoutButtonHtml}
      </nav>
    </div>
  </header>
  `;

  res.send(html);
});

module.exports = router;
