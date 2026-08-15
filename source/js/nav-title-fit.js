(function () {
  function enhanceNavTitle() {
    const title = document.querySelector('.valaxy-nav .article-title');
    if (!title) return;

    const fullTitle = title.textContent.trim();
    if (!fullTitle) return;

    title.title = fullTitle;
    title.setAttribute('aria-label', `${fullTitle}，点击回到页面顶部`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceNavTitle, { once: true });
  } else {
    enhanceNavTitle();
  }

  document.addEventListener('pjax:success', enhanceNavTitle);
})();
