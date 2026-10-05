(() => {
  let data = null;
  let request = null;
  let returnFocus = null;
  const modal = () => document.getElementById('my-search-modal');
  const input = () => document.getElementById('my-search-input');
  const results = () => document.getElementById('my-search-results');

  function message(text, retry = false) {
    const target = results();
    if (!target) return;
    target.replaceChildren();
    const status = document.createElement('p');
    status.className = 'search-status';
    status.textContent = text;
    target.append(status);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-retry';
      button.textContent = '重新加载';
      button.addEventListener('click', load);
      target.append(button);
    }
  }

  function highlight(element, text, keyword) {
    const lower = text.toLowerCase();
    let start = 0;
    let index = lower.indexOf(keyword);
    while (index !== -1) {
      element.append(document.createTextNode(text.slice(start, index)));
      const mark = document.createElement('mark');
      mark.className = 'search-keyword';
      mark.textContent = text.slice(index, index + keyword.length);
      element.append(mark);
      start = index + keyword.length;
      index = lower.indexOf(keyword, start);
    }
    element.append(document.createTextNode(text.slice(start)));
  }

  function render() {
    if (!data || !input() || !results()) return;
    const keyword = input().value.trim().toLowerCase();
    if (!keyword) return message('输入关键词，查找文章标题和正文。');
    const matches = data.filter(item => item.title.toLowerCase().includes(keyword) || item.content.toLowerCase().includes(keyword));
    if (!matches.length) return message('没有找到相关文章，试试其他关键词。');
    results().replaceChildren();
    const fragment = document.createDocumentFragment();
    matches.slice(0, 80).forEach(item => {
      const link = document.createElement('a');
      const url = new URL(item.url, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) return;
      link.href = url.href;
      link.className = 'search-result-item';
      const title = document.createElement('div');
      title.className = 'search-result-title';
      highlight(title, item.title, keyword);
      const content = document.createElement('div');
      content.className = 'search-result-content';
      const index = item.content.toLowerCase().indexOf(keyword);
      const start = Math.max(0, index - 30);
      const end = Math.min(item.content.length, start + Math.max(100, keyword.length + 60));
      highlight(content, (start ? '…' : '') + item.content.slice(start, end) + (end < item.content.length ? '…' : ''), keyword);
      link.append(title, content);
      fragment.append(link);
    });
    results().append(fragment);
  }

  async function load() {
    if (data) return render();
    message('正在加载文章索引…');
    if (!request) {
      request = (async () => {
        const response = await fetch(modal().dataset.searchUrl);
        if (!response.ok) throw new Error('Search index unavailable');
        const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
        if (xml.querySelector('parsererror')) throw new Error('Invalid search index');
        data = Array.from(xml.querySelectorAll('entry'), entry => ({
          title: entry.querySelector('title')?.textContent || '',
          content: (entry.querySelector('content')?.textContent || '').replace(/<[^>]+>/g, ''),
          url: entry.querySelector('url')?.textContent || '',
        }));
      })();
    }
    try {
      await request;
      render();
    } catch (_) {
      message('文章索引加载失败，请重试。', true);
    } finally {
      request = null;
    }
  }

  window.openMySearch = () => {
    if (!modal()) return;
    returnFocus = document.activeElement;
    modal().hidden = false;
    document.body.classList.add('search-open');
    input().focus();
    load();
  };
  window.closeMySearch = () => {
    if (!modal() || modal().hidden) return;
    modal().hidden = true;
    document.body.classList.remove('search-open');
    input().value = '';
    results().replaceChildren();
    if (returnFocus?.isConnected) returnFocus.focus();
  };
  document.addEventListener('input', event => {
    if (event.target.id === 'my-search-input') render();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-search-open], .popup-trigger')) {
      event.preventDefault();
      window.openMySearch();
    } else if (event.target.closest('[data-search-close], #my-search-results a')) {
      window.closeMySearch();
    }
  });
  document.addEventListener('keydown', event => {
    if (!modal() || modal().hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      window.closeMySearch();
    }
    if (event.key === 'Tab') {
      const controls = Array.from(modal().querySelectorAll('input, button, a[href]'));
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('pjax:send', window.closeMySearch);
})();
