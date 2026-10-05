import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const tagAliases = require('./tag-aliases.json');
const vocabulary = new Set(require('./tag-vocabulary.json'));

// These source notes explicitly describe RGB or near-infrared single-modal tasks.
const singleModalNotes = new Set(['ctdt', 'latot-mkdnet', 'mlps', 'siamuf', 'sthft', 'transist']);
const lessonTags = {
  'modern-cpp-day-02-const-lifetime-memory': ['C++', 'CS106L', 'const', '内存管理', 'RAII'],
  'modern-cpp-day-03-containers-iterator': ['C++', 'CS106L', 'STL', 'vector', 'Iterator'],
  'modern-cpp-day-07-lambda-algorithms-containers': ['C++', 'CS106L', 'Lambda', 'Algorithm', 'STL'],
  'modern-cpp-day-08-copy-semantics': ['C++', 'CS106L', 'Copy', 'Rule of Five', 'Rule of Three', 'Rule of Zero'],
  'modern-cpp-day-09-move-semantics': ['C++', 'CS106L', 'Move', 'Rvalue Reference', 'noexcept'],
  'modern-cpp-day-10-raii-unique-ptr': ['C++', 'CS106L', 'RAII', 'unique_ptr', 'Exception-Safety'],
  'modern-cpp-day-11-smart-pointer-ownership': ['C++', 'CS106L', 'shared_ptr', 'weak_ptr', 'Ownership', 'RAII'],
  'modern-cpp-day-13-kuiperinfer-source-reading': ['C++', 'KuiperInfer', '源码阅读', 'Tensor', 'Ownership'],
  'modern-cpp-day-14-mini-infer-final-review': ['C++', 'MiniInfer', 'CMake', 'RAII', '学习笔记'],
};
export function normalizeTags(tags, { category = '', slug = '' } = {}) {
  if (lessonTags[slug]) tags = lessonTags[slug];
  let result = [...new Set(tags.filter(Boolean).map(tag => {
    const name = String(tag).trim();
    return tagAliases[name] || name;
  }).filter(Boolean))];
  if (singleModalNotes.has(slug.toLowerCase().replace(/^论文阅读-rgbt-/, ''))) {
    result = result.filter(tag => tag !== 'RGBT');
  }
  if (result.includes('学习笔记')) result = result.filter(tag => tag !== '课程');
  result = result.filter(tag => tag !== category && tag !== '视觉目标跟踪 / 视频目标分割' && tag !== '视频目标跟踪与分割');
  result = result.filter(tag => vocabulary.has(tag));
  if (result.includes('DRGBT')) result = result.filter(tag => tag !== 'RGBT');
  if (result.includes('C++')) result = result.filter(tag => tag !== 'Modern C++');
  if (result.includes('CMake')) result = result.filter(tag => tag !== '构建系统');
  if (result.some(tag => ['Codex', 'Claude Code', 'CC Switch', 'DeepSeek'].includes(tag))) result = result.filter(tag => tag !== 'AI工具');
  return result;
}
