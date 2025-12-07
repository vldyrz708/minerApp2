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

  function getNavPieces() {
    return {
      toggle: document.querySelector('[data-nav-toggle]'),
      nav: document.querySelector('[data-nav]'),
      backdrop: document.querySelector('[data-nav-backdrop]'),
    };
  }

  function setNavState(isOpen) {
    const { toggle, nav, backdrop } = getNavPieces();
    if (!nav || !toggle) return;
    nav.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (backdrop) backdrop.classList.toggle('active', isOpen);
  }

  function toggleNavDrawer() {
    const { nav } = getNavPieces();
    const shouldOpen = !(nav && nav.classList.contains('open'));
    setNavState(shouldOpen);
  }

  function closeNavDrawer() { setNavState(false); }

  // Exponer algunas utilidades globales que las vistas usan
  window.userUtils = { ensureSwal, swalToast, markActiveNav, fetchJSON };

  async function loadPartial(selector, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const html = await res.text();
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = html;
        closeNavDrawer();
      }
    } catch (e) { /* ignore */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // marcar nav
    markActiveNav();
    // cargar partials si existen
    loadPartial('#user-header-container', '/partials/user-header.html');
    loadPartial('#user-footer-container', '/partials/user-footer.html');
    closeNavDrawer();
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-nav-toggle]');
    if (toggle) {
      event.preventDefault();
      toggleNavDrawer();
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-nav-backdrop]')) {
      closeNavDrawer();
    }
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-nav] a[href]');
    if (link) setTimeout(closeNavDrawer, 120);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeNavDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavDrawer();
  });
  
  // --- Modal carousel & accessibility enhancements ---
  function usesNativeCarousel(gallery) {
    return Boolean(gallery && gallery.hasAttribute('data-native-carousel'));
  }

  function trapFocus(modalEl) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(modalEl.querySelectorAll(focusableSelectors)).filter(n => n.offsetParent !== null);
    if (!nodes.length) return null;
    let first = nodes[0], last = nodes[nodes.length-1];
    function handleKey(e){
      if (e.key === 'Tab'){
        if (e.shiftKey){ if (document.activeElement === first){ e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last){ e.preventDefault(); first.focus(); } }
      }
      if (e.key === 'Escape') {
        closeModal();
      }
      if (e.key === 'ArrowLeft') {
        prevSlide();
      }
      if (e.key === 'ArrowRight') {
        nextSlide();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }

  let currentIndex = 0;
  let slides = [];
  function showSlide(idx){
    if (!slides || !slides.length) return;
    currentIndex = (idx + slides.length) % slides.length;
    slides.forEach((s,i)=>{ s.style.display = (i===currentIndex)?'block':'none'; });
    // update indicators
    const indicators = document.querySelectorAll('.carousel-indicators button');
    indicators.forEach((b,i)=> b.classList.toggle('active', i===currentIndex));
  }
  function prevSlide(){ showSlide(currentIndex-1); }
  function nextSlide(){ showSlide(currentIndex+1); }

  function setupCarouselWithin(gallery){
    if (!gallery || usesNativeCarousel(gallery)) return;
    // gallery contains img nodes; convert to slides
    slides = [];
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if (!imgs.length) return;
    // wrap images in slide containers
    gallery.innerHTML = '';
    const carousel = document.createElement('div'); carousel.className = 'carousel w-full h-72';
    imgs.forEach((img, i) => {
      const wrap = document.createElement('div'); wrap.className = 'carousel-slide w-full h-full'; wrap.style.display = 'none'; wrap.appendChild(img);
      img.classList.add('carousel-img'); img.style.width = '100%'; img.style.height = '100%';
      carousel.appendChild(wrap); slides.push(wrap);
    });
    // controls
    const left = document.createElement('button'); left.className = 'ctrl left'; left.setAttribute('aria-label','Anterior'); left.innerHTML = '&larr;'; left.addEventListener('click', prevSlide);
    const right = document.createElement('button'); right.className = 'ctrl right'; right.setAttribute('aria-label','Siguiente'); right.innerHTML = '&rarr;'; right.addEventListener('click', nextSlide);
    carousel.appendChild(left); carousel.appendChild(right);
    // indicators
    const indicators = document.createElement('div'); indicators.className = 'carousel-indicators';
    imgs.forEach((_, i) => {
      const b = document.createElement('button'); b.setAttribute('aria-label', 'Ir a la imagen ' + (i+1)); b.addEventListener('click', ()=> showSlide(i));
      indicators.appendChild(b);
    });
    gallery.appendChild(carousel);
    gallery.appendChild(indicators);
    showSlide(0);
  }

  function closeModal(){
    const b = document.getElementById('lugarModalBackdrop'); if (!b) return;
    b.style.display = 'none'; b.setAttribute('aria-hidden','true');
    // remove slides
    const gallery = document.getElementById('modalGallery');
    if (gallery && !usesNativeCarousel(gallery)) {
      gallery.innerHTML = '';
    }
    // remove any existing key handlers by reloading page-level handlers via MutationObserver cleanup (no-op here)
  }

  // Observe changes on backdrop to initialize carousel & focus trap when opened
  document.addEventListener('DOMContentLoaded', ()=>{
    const backdrop = document.getElementById('lugarModalBackdrop');
    if (!backdrop) return;
    const observer = new MutationObserver((mutations)=>{
      for (const m of mutations){
        if (m.attributeName === 'aria-hidden'){
          const hidden = backdrop.getAttribute('aria-hidden');
          if (hidden === 'false'){
            const gallery = document.getElementById('modalGallery');
            if (gallery) setupCarouselWithin(gallery);
            // trap focus inside modal
            const modal = backdrop.querySelector('.modal');
            const release = modal ? trapFocus(modal) : null;
            // ensure close button works
            const closeBtn = document.getElementById('modalCloseBtn'); if (closeBtn) closeBtn.addEventListener('click', ()=>{ if (release) release(); closeModal(); });
          }
        }
      }
    });
    observer.observe(backdrop, { attributes: true });
  });
})();
