(function () {
  function initPapers() {
    const page = document.querySelector('.ik-papers');
    if (!page || page.dataset.papersReady === 'true') return;

    const grid = page.querySelector('#papers-grid');
    const cards = Array.from(page.querySelectorAll('.ik-paper-card'));
    const categoryButtons = Array.from(page.querySelectorAll('[data-paper-category]'));
    const search = page.querySelector('#papers-search');
    const year = page.querySelector('#papers-year');
    const conference = page.querySelector('#papers-conference');
    const code = page.querySelector('#papers-code');
    const sort = page.querySelector('#papers-sort');
    const reset = page.querySelector('#papers-reset');
    const count = page.querySelector('#papers-result-count');
    const empty = page.querySelector('.ik-papers-empty');
    let selectedCategory = 'all';

    if (!grid || !cards.length) return;
    page.dataset.papersReady = 'true';

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function updateUrl() {
      if (!window.history || !window.history.replaceState) return;
      const params = new URLSearchParams();
      if (search.value.trim()) params.set('q', search.value.trim());
      if (selectedCategory !== 'all') params.set('area', selectedCategory);
      if (year.value !== 'all') params.set('year', year.value);
      if (conference.value !== 'all') params.set('conference', conference.value);
      if (code.value !== 'all') params.set('code', code.value);
      if (sort.value !== 'updated') params.set('sort', sort.value);
      const query = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
    }

    function render(shouldUpdateUrl) {
      const query = normalized(search.value);
      let visible = 0;

      categoryButtons.forEach(function (button) {
        const active = button.dataset.paperCategory === selectedCategory;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      cards.forEach(function (card) {
        const matches =
          (selectedCategory === 'all' || card.dataset.paperCategory === selectedCategory) &&
          (year.value === 'all' || card.dataset.paperYear === year.value) &&
          (conference.value === 'all' || card.dataset.paperConference === conference.value) &&
          (code.value === 'all' || card.dataset.paperCode === code.value) &&
          (!query || normalized(card.dataset.paperSearch).includes(query));
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      const ordered = cards.slice().sort(function (left, right) {
        if (sort.value === 'title') return left.dataset.paperTitle.localeCompare(right.dataset.paperTitle, 'zh-CN');
        if (sort.value === 'year') return Number(right.dataset.paperYear || 0) - Number(left.dataset.paperYear || 0);
        return Number(right.dataset.paperUpdated || 0) - Number(left.dataset.paperUpdated || 0);
      });
      ordered.forEach(function (card) { grid.appendChild(card); });

      count.textContent = query ? '找到 ' + visible + ' 篇相关论文' : '正在显示 ' + visible + ' 篇论文';
      empty.hidden = visible !== 0;
      if (shouldUpdateUrl) updateUrl();
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedCategory = button.dataset.paperCategory;
        render(true);
      });
    });
    search.addEventListener('input', function () { render(true); });
    year.addEventListener('change', function () { render(true); });
    conference.addEventListener('change', function () { render(true); });
    code.addEventListener('change', function () { render(true); });
    sort.addEventListener('change', function () { render(true); });
    reset.addEventListener('click', function () {
      selectedCategory = 'all';
      search.value = '';
      year.value = 'all';
      conference.value = 'all';
      code.value = 'all';
      sort.value = 'updated';
      render(true);
      search.focus();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === '/' && !/input|select|textarea/i.test(document.activeElement.tagName)) {
        event.preventDefault();
        search.focus();
      }
    });

    const params = new URLSearchParams(window.location.search);
    const requestedArea = params.get('area');
    if (requestedArea && categoryButtons.some(function (button) { return button.dataset.paperCategory === requestedArea; })) selectedCategory = requestedArea;
    if (params.get('q')) search.value = params.get('q');
    if (params.get('year') && Array.from(year.options).some(function (option) { return option.value === params.get('year'); })) year.value = params.get('year');
    if (params.get('conference') && Array.from(conference.options).some(function (option) { return option.value === params.get('conference'); })) conference.value = params.get('conference');
    if (params.get('code') === 'yes' || params.get('code') === 'no') code.value = params.get('code');
    if (params.get('sort') === 'year' || params.get('sort') === 'title') sort.value = params.get('sort');
    render(false);
  }

  document.addEventListener('DOMContentLoaded', initPapers);
  document.addEventListener('pjax:complete', initPapers);
})();
