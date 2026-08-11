'use strict';

// Hexo does not reliably copy dotfiles from source/ on every platform.
// Register the marker as a generated route so every build contains it.
hexo.extend.generator.register('nojekyll', () => ({
  path: '.nojekyll',
  data: ''
}));
