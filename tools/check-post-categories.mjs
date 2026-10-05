import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import frontMatter from 'hexo-front-matter';
import { categoryForNote } from './post-taxonomy.mjs';

const allowed = new Set(['视觉目标跟踪', '视频目标分割', '目标重识别', '跨视角与三维视觉', 'Mamba 与状态空间模型', '现代 C++', 'AI 推理工程', 'Linux 系统与桌面', '网络与远程开发', '开发工具与协作', '博客开发']);
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(path.join(directory, entry.name)) : entry.name.endsWith('.md') ? [path.join(directory, entry.name)] : []);
}
const posts = files(path.resolve(import.meta.dirname, '../source/_posts'));
for (const file of posts) {
  const data = frontMatter.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
  const categories = [data.categories].flat(Infinity).filter(Boolean);
  assert.equal(categories.length, 1, `${file}: expected one category`);
  assert.ok(allowed.has(categories[0]), `${file}: unknown category ${categories[0]}`);
}
assert.equal(categoryForNote({ task: '视频目标分割', tags: ['跨视角', 'SAM2'] }), '视频目标分割');
assert.equal(categoryForNote({ task: '跨视角目标对应' }), '跨视角与三维视觉');
assert.equal(categoryForNote({ task: '视频目标跟踪' }), '视觉目标跟踪');
assert.equal(categoryForNote({ collection: 'IR_VIS_Reg' }), '跨视角与三维视觉');
console.log(`PASS: ${posts.length} posts each belong to one of the 11 categories; importer task mapping verified.`);
