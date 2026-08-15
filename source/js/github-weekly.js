(function () {
  function initGithubWeekly() {
    const page = document.querySelector('.github-weekly');
    if (!page || page.dataset.ready === 'true') return;
    const cards = Array.from(page.querySelectorAll('[data-weekly-category]'));
    const buttons = Array.from(page.querySelectorAll('[data-weekly-filter]'));
    const search = page.querySelector('#github-weekly-search');
    const status = page.querySelector('#github-weekly-status');
    const empty = page.querySelector('#github-weekly-empty');
    if (!cards.length) return;

    page.dataset.ready = 'true';
    let category = 'all';
    let query = '';

    function render() {
      let visible = 0;
      cards.forEach(function (card) {
        const categoryMatched = category === 'all' || card.dataset.weeklyCategory === category;
        const queryMatched = !query || (card.dataset.weeklySearch || '').toLowerCase().includes(query);
        card.hidden = !(categoryMatched && queryMatched);
        if (!card.hidden) visible += 1;
      });
      buttons.forEach(function (button) {
        const active = button.dataset.weeklyFilter === category;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const activeButton = buttons.find(function (button) { return button.dataset.weeklyFilter === category; });
      const label = activeButton ? activeButton.textContent.trim() : '全部';
      if (status) status.textContent = query
        ? '在“' + label + '”中找到 ' + visible + ' 个匹配项目'
        : '正在显示“' + label + '”的 ' + visible + ' 个项目';
      if (empty) empty.hidden = visible !== 0;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        category = button.dataset.weeklyFilter || 'all';
        render();
      });
    });
    if (search) search.addEventListener('input', function () {
      query = search.value.trim().toLowerCase();
      render();
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', initGithubWeekly);
  document.addEventListener('pjax:complete', initGithubWeekly);
})();
