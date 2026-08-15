'use strict';

hexo.extend.filter.register('before_generate', function registerGithubWeeklyMenu() {
  const theme = hexo.theme.config;
  theme.menu = theme.menu || {};
  theme.menu.list = Array.isArray(theme.menu.list) ? theme.menu.list : [];
  if (!theme.menu.list.some((item) => item && item.path === '/github-weekly/')) {
    theme.menu.list.push({
      title: '开源周报',
      path: '/github-weekly/',
      icon: 'ri:radar-line'
    });
  }

  theme.pages = Array.isArray(theme.pages) ? theme.pages : [];
  if (!theme.pages.some((item) => item && item.url === '/github-weekly/')) {
    theme.pages.push({
      name: '开源周报',
      url: '/github-weekly/',
      icon: 'ri:radar-line',
      color: '#c8ff39'
    });
  }
});
