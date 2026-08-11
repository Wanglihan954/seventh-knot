(function () {
  const MOBILE_QUERY = '(max-width: 900px)';

  function initMobileNavigation() {
    const body = document.body;
    const menuButton = document.getElementById('mobile-menu-btn');
    const tocButton = document.getElementById('mobile-toc-btn');
    const overlay = document.getElementById('mobile-overlay');
    const sidebar = document.querySelector('.sidebar');
    const toc = document.querySelector('.right-sidebar');

    if (!body || !menuButton || !overlay || !sidebar) return;
    if (menuButton.dataset.mobileNavReady === 'true') return;
    menuButton.dataset.mobileNavReady = 'true';

    if (tocButton && !toc) tocButton.hidden = true;

    function syncState() {
      const sidebarOpen = body.classList.contains('sidebar-open');
      const tocOpen = body.classList.contains('toc-open');
      const drawerOpen = sidebarOpen || tocOpen;

      menuButton.setAttribute('aria-expanded', String(sidebarOpen));
      menuButton.setAttribute('aria-label', sidebarOpen ? '关闭站点菜单' : '打开站点菜单');
      if (tocButton) {
        tocButton.setAttribute('aria-expanded', String(tocOpen));
        tocButton.setAttribute('aria-label', tocOpen ? '关闭文章目录' : '打开文章目录');
      }
      overlay.setAttribute('aria-hidden', String(!drawerOpen));
      body.classList.toggle('mobile-drawer-open', drawerOpen);
    }

    function closeDrawers(options) {
      const hadOpenDrawer = body.classList.contains('sidebar-open') || body.classList.contains('toc-open');
      body.classList.remove('sidebar-open', 'toc-open');
      syncState();
      if (hadOpenDrawer && options && options.restoreFocus) {
        (options.restoreFocus === 'toc' ? tocButton : menuButton)?.focus();
      }
    }

    menuButton.addEventListener('click', function () {
      const shouldOpen = !body.classList.contains('sidebar-open');
      body.classList.remove('toc-open');
      body.classList.toggle('sidebar-open', shouldOpen);
      syncState();
    });

    tocButton?.addEventListener('click', function () {
      const shouldOpen = !body.classList.contains('toc-open');
      body.classList.remove('sidebar-open');
      body.classList.toggle('toc-open', shouldOpen);
      syncState();
    });

    overlay.addEventListener('click', function () {
      closeDrawers();
    });

    sidebar.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () { closeDrawers(); });
    });
    toc?.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () { closeDrawers(); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (body.classList.contains('toc-open')) closeDrawers({ restoreFocus: 'toc' });
      else if (body.classList.contains('sidebar-open')) closeDrawers({ restoreFocus: 'menu' });
    });

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleBreakpoint = function (event) {
      if (!event.matches) closeDrawers();
    };
    mediaQuery.addEventListener?.('change', handleBreakpoint);
    syncState();
  }

  document.addEventListener('DOMContentLoaded', initMobileNavigation);
  document.addEventListener('pjax:success', initMobileNavigation);
})();
