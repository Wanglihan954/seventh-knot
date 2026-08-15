(function () {
  function initProjects() {
    const page = document.querySelector('.ik-projects');
    if (!page || page.dataset.projectsReady === 'true') return;

    const buttons = Array.from(page.querySelectorAll('[data-project-filter]'));
    const cards = Array.from(page.querySelectorAll('[data-project-category]'));
    const search = page.querySelector('#projects-search');
    const status = page.querySelector('#projects-filter-status');
    const empty = page.querySelector('.projects-empty');
    const dialog = page.querySelector('#project-discussion-dialog');
    const dialogTitle = page.querySelector('#project-dialog-title');
    const dialogAvatar = page.querySelector('#project-dialog-avatar');
    const dialogAvatarFallback = page.querySelector('.ik-project-dialog__avatar-fallback');
    const dialogCover = page.querySelector('.ik-project-dialog__cover img');
    const dialogChannel = page.querySelector('.ik-project-dialog__channel');
    const dialogName = page.querySelector('.ik-project-dialog__copy h2');
    const dialogDesc = page.querySelector('.ik-project-dialog__copy p');
    const dialogTags = page.querySelector('.ik-project-dialog__tags');
    const dialogVisit = page.querySelector('.ik-project-dialog__visit');
    const dialogPath = page.querySelector('.ik-project-dialog__comment-path');
    const walineRoot = page.querySelector('#projects-waline');
    const loading = page.querySelector('.ik-project-dialog__loading');
    const error = page.querySelector('.ik-project-dialog__error');
    let selectedCategory = 'all';
    let searchQuery = '';
    let lastFocusedElement = null;
    let walineLoader = null;
    let walineInstance = null;
    let commentRequestId = 0;

    if (!buttons.length || !cards.length) return;
    page.dataset.projectsReady = 'true';
    if (dialog && dialog.parentElement !== document.body) document.body.appendChild(dialog);

    function render(updateHash) {
      let visibleCount = 0;

      buttons.forEach(function (button) {
        const active = button.dataset.projectFilter === selectedCategory;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      cards.forEach(function (card) {
        const categoryMatched = selectedCategory === 'all' || card.dataset.projectCategory === selectedCategory;
        const searchable = (card.dataset.projectSearch || '').toLowerCase();
        const queryMatched = !searchQuery || searchable.includes(searchQuery);
        const visible = categoryMatched && queryMatched;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      const channelButton = page.querySelector('.ik-projects-channels [data-project-filter="' + selectedCategory + '"]');
      const label = channelButton ? channelButton.textContent.trim() : '全部';
      if (status) {
        status.textContent = searchQuery
          ? '在“' + label + '”频道找到 ' + visibleCount + ' 个相关项目'
          : '正在显示“' + label + '”频道的 ' + visibleCount + ' 个项目';
      }
      if (empty) empty.hidden = visibleCount !== 0;

      if (updateHash && window.history && window.history.replaceState) {
        const nextHash = selectedCategory === 'all' ? '' : '#channel-' + encodeURIComponent(selectedCategory);
        window.history.replaceState(null, '', window.location.pathname + window.location.search + nextHash);
      }
    }

    function loadWaline() {
      if (window.Waline && typeof window.Waline.init === 'function') return Promise.resolve(window.Waline);
      if (walineLoader) return walineLoader;

      walineLoader = new Promise(function (resolve, reject) {
        const config = window.CONFIG && window.CONFIG.waline;
        if (!config || !config.cdn) {
          reject(new Error('Waline is not configured.'));
          return;
        }

        const existing = document.querySelector('script[data-project-waline]');
        if (existing) {
          existing.addEventListener('load', function () { resolve(window.Waline); }, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = config.cdn;
        script.async = true;
        script.dataset.projectWaline = 'true';
        script.onload = function () {
          if (window.Waline && typeof window.Waline.init === 'function') resolve(window.Waline);
          else reject(new Error('Waline failed to expose its browser client.'));
        };
        script.onerror = function () { reject(new Error('Waline client failed to load.')); };
        document.head.appendChild(script);
      });

      return walineLoader;
    }

    async function mountComments(discussionKey) {
      if (!walineRoot || !loading || !error) return;
      const requestId = ++commentRequestId;
      const discussionPath = '/projects/discussions/' + discussionKey + '/';

      loading.hidden = false;
      error.hidden = true;
      walineRoot.innerHTML = '';
      if (dialogPath) dialogPath.textContent = discussionPath;

      try {
        const Waline = await loadWaline();
        if (requestId !== commentRequestId || dialog.hidden) return;

        if (walineInstance && typeof walineInstance.destroy === 'function') walineInstance.destroy();
        const baseConfig = (window.CONFIG && window.CONFIG.waline && window.CONFIG.waline.config) || {};
        walineInstance = Waline.init(Object.assign({}, baseConfig, {
          el: '#projects-waline',
          path: discussionPath,
          dark: 'html.dark',
          locale: Object.assign({}, baseConfig.locale || {}, {
            placeholder: '说点什么…',
            sofa: '啥都木有 \(°_o)/'
          })
        }));
        loading.hidden = true;
      } catch (commentError) {
        if (requestId !== commentRequestId) return;
        loading.hidden = true;
        error.hidden = false;
        console.warn('[projects] comment terminal unavailable:', commentError);
      }
    }

    function openDialog(trigger) {
      if (!dialog || !trigger) return;
      const tags = JSON.parse(trigger.dataset.projectTags || '[]');
      const name = trigger.dataset.projectName || '项目讨论';
      const discussionKey = trigger.dataset.projectDiscussion || encodeURIComponent(name);
      const avatar = trigger.dataset.projectAvatar || '';

      lastFocusedElement = trigger;
      dialogTitle.textContent = name;
      if (dialogAvatar && dialogAvatarFallback) {
        dialogAvatar.hidden = !avatar;
        dialogAvatarFallback.hidden = Boolean(avatar);
        if (avatar) {
          dialogAvatar.src = avatar;
          dialogAvatar.alt = name + ' 项目作者头像';
        } else {
          dialogAvatar.removeAttribute('src');
          dialogAvatar.alt = '';
        }
      }
      dialogCover.src = trigger.dataset.projectCover || '/images/interknot/default-cover.webp';
      dialogCover.alt = name + ' 项目封面';
      dialogChannel.textContent = trigger.dataset.projectCategoryName || '项目';
      dialogName.textContent = name;
      dialogDesc.textContent = trigger.dataset.projectFullDesc || trigger.dataset.projectDesc || '';
      dialogVisit.href = trigger.dataset.projectUrl || trigger.href;
      dialogTags.replaceChildren();
      tags.forEach(function (tag) {
        const tagNode = document.createElement('span');
        tagNode.textContent = tag;
        dialogTags.appendChild(tagNode);
      });

      dialog.hidden = false;
      document.body.classList.add('is-project-dialog-open');
      page.setAttribute('aria-hidden', 'false');
      window.requestAnimationFrame(function () {
        const closeButton = dialog.querySelector('.ik-project-dialog__close');
        if (closeButton) closeButton.focus({ preventScroll: true });
      });
      mountComments(discussionKey);
    }

    function closeDialog() {
      if (!dialog || dialog.hidden) return;
      commentRequestId += 1;
      dialog.hidden = true;
      document.body.classList.remove('is-project-dialog-open');
      if (lastFocusedElement && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus({ preventScroll: true });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedCategory = button.dataset.projectFilter;
        render(true);
      });
    });

    if (search) {
      search.addEventListener('input', function () {
        searchQuery = search.value.trim().toLowerCase();
        render(false);
      });
    }

    page.querySelectorAll('[data-project-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openDialog(trigger);
      });
    });

    if (dialog) dialog.querySelectorAll('[data-project-close]').forEach(function (button) {
      button.addEventListener('click', closeDialog);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && dialog && !dialog.hidden) closeDialog();
    });

    const hashCategory = window.location.hash.indexOf('#channel-') === 0
      ? decodeURIComponent(window.location.hash.slice(9))
      : 'all';
    selectedCategory = buttons.some(function (button) {
      return button.dataset.projectFilter === hashCategory;
    }) ? hashCategory : 'all';
    render(false);
  }

  document.addEventListener('DOMContentLoaded', initProjects);
  document.addEventListener('pjax:complete', initProjects);
})();
