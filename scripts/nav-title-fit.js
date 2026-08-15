'use strict';

const root = String(hexo.config.root || '/').replace(/\/?$/, '/');

hexo.extend.injector.register(
  'head_end',
  `<link rel="stylesheet" href="${root}css/nav-title-fit.css">`,
  'default'
);

hexo.extend.injector.register(
  'body_end',
  `<script src="${root}js/nav-title-fit.js" defer></script>`,
  'default'
);
