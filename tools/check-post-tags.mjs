import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import frontMatter from 'hexo-front-matter';
import { normalizeTags } from './post-tags.mjs';
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : entry.name.endsWith('.md') ? [path.join(directory, entry.name)] : []);
}
const posts = files(path.resolve(import.meta.dirname, '../source/_posts'));
for (const file of posts) {
  const data = frontMatter.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
  const tags = [data.tags].flat().filter(Boolean);
  assert.deepEqual(tags, normalizeTags(tags, { category: [data.categories].flat()[0], slug: path.basename(file, '.md') }), file);
}
assert.deepEqual(normalizeTags(['RGB-T', 'RGBT', '文献笔记', 'AI论文']), ['RGBT']);
assert.deepEqual(normalizeTags(['RGBT', '近红外'], { slug: 'TransIST' }), ['近红外']);
assert.deepEqual(normalizeTags(['RGBT', 'Mamba'], { slug: 'CADTrack' }), ['RGBT', 'Mamba']);
assert.deepEqual(normalizeTags(['Template', 'Class Template', 'C++', 'CS106L', '学习笔记']), ['泛型编程', 'C++', 'CS106L']);
console.log(`PASS: ${posts.length} posts have normalized, unique tags; single-modal exclusions verified.`);
