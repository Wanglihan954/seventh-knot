const { slugize, escapeHTML } = require('hexo-util');

hexo.extend.generator.register('tag-alias-redirects', function (locals) {
  const tagAliases = require('../tools/tag-aliases.json');
  const activePaths = new Set(locals.tags.data.map(tag => tag.path.toLowerCase()));
  const routes = [];
  for (const [alias, canonical] of Object.entries(tagAliases)) {
    const tag = locals.tags.findOne({ name: canonical });
    if (!tag) continue;
    const oldName = (this.config.tag_map || {})[alias] || alias;
    const oldPath = `${this.config.tag_dir}/${slugize(oldName, { transform: this.config.filename_case })}/`;
    // Case-only aliases share a filesystem path on Windows; keep the real page.
    if (activePaths.has(oldPath.toLowerCase())) continue;
    const url = escapeHTML(this.extend.helper.get('url_for').call(this, tag.path));
    routes.push({ path: oldPath + 'index.html', data: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="${url}"><title>标签已合并</title></head><body><p>此标签已合并为 <a href="${url}">${escapeHTML(canonical)}</a>。</p></body></html>` });
  }
  return routes;
});
