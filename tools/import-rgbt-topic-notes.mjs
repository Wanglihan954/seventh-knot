import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2];
const requested = new Set(process.argv.slice(3));
if (!sourceDir) {
  console.error('Usage: node tools/import-rgbt-topic-notes.mjs <note-directory> [note-stem ...]');
  process.exit(1);
}

const postsDir = path.resolve(import.meta.dirname, '../source/_posts');
const sourceNames = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md') &&
  !['README.md', 'MaCNet-原文表格.md'].includes(name) &&
  (requested.size === 0 || requested.has(path.basename(name, '.md'))));
const slugFor = (stem) => stem === 'CMRL：基于因果的模态与平台不变动态RGBT跟踪' ? 'cmrl' :
  stem === 'DRGBT动态RGBT跟踪方向综述' ? 'drgbt-survey' : stem.toLowerCase();
const outputFor = (stem) => `论文阅读-rgbt-${slugFor(stem)}.md`;
const quote = (value) => JSON.stringify(String(value));
const dayCounts = new Map();

function split(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/);
  return match ? { front: match[1], body: normalized.slice(match[0].length) } : { front: '', body: normalized };
}
function scalar(front, key) {
  return front.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^"|"$/g, '') ?? '';
}
function tags(front) {
  const inline = scalar(front, 'tags');
  if (inline.startsWith('[')) return inline.slice(1, -1).split(',').map((tag) => tag.trim()).filter(Boolean);
  const block = front.match(/^tags:\s*\n((?:\s+-\s+[^\n]+\n?)+)/m)?.[1] ?? '';
  return [...block.matchAll(/^\s+-\s+(.+)$/gm)].map((match) => match[1].trim());
}
function plain(markdown) {
  return markdown.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, ' ').replace(/\s+/g, ' ').trim();
}
function abstract(body) {
  const callout = body.match(/^> \[!abstract\][^\n]*\n((?:>[^\n]*\n?)+)/m);
  const section = body.match(/^## Abstract\s*\n([\s\S]*?)(?=\n(?:#|---|$))/m);
  const text = plain(callout?.[1] ?? section?.[1] ?? body.slice(0, 400));
  return text.length <= 210 ? text : `${text.slice(0, 207).trimEnd()}…`;
}
function resources(front, body) {
  const images = [...body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
  const links = [...body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map((match) => ({
    label: match[1],
    url: match[2],
  }));
  const bareUrls = [...body.matchAll(/<(https?:\/\/[^>]+)>/g)].map((match) => match[1]);
  const allUrls = [...new Set([...links.map((link) => link.url), ...bareUrls])]
    .filter((url) => !/cdn\.jsdelivr\.net\/gh\/Wanglihan954\/Picture-bed/i.test(url));
  const doi = scalar(front, 'doi');
  const arxiv = body.match(/arXiv:(\d{4}\.\d{4,5})/i)?.[1];
  const paperLink = links.find((link) => /(论文|paper|出版社|期刊|springer|aaai|cvpr|预印本|doi)/i.test(link.label));
  const paperUrl = paperLink?.url || allUrls.find((url) => !/github\.com/i.test(url)) ||
    (doi ? `https://doi.org/${doi}` : arxiv ? `https://arxiv.org/abs/${arxiv}` : '');
  const codeUrl = allUrls.find((url) => /github\.com/i.test(url)) || '';
  return { cover: images[0] || '', paperUrl, codeUrl };
}
const tableFile = fs.readFileSync(path.join(sourceDir, 'MaCNet-原文表格.md'), 'utf8').replace(/\r\n/g, '\n');
const tables = new Map([...tableFile.matchAll(/^## (Table \d+\.[^\n]+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
  .map((match) => [match[1], match[2].trim()]));

function convertBody(body, stem) {
  body = body.replace(/^<!-- 统一模板版 -->\s*\n/m, '');
  body = body.replace(/^# [^\n]+\n+/, '');
  body = body.replace(/\[Zotero 条目\]\(zotero:\/\/[^)]+\)\s*·?\s*/g, '');
  body = body.replace(/^[-*] \[专题导航\]\(README\.md\)\s*·?\s*/gm, '- ');
  body = body.replace(/!\[\[MaCNet-原文表格#([^\]]+)\]\]/g, (_match, heading) => {
    const table = tables.get(heading);
    if (!table) throw new Error(`Missing MaCNet table: ${heading}`);
    return `**原文 ${heading}**\n\n${table}`;
  });
  body = body.replace(/\[\[([^\]#]+)(?:#[^\]]+)?\]\]/g, (_match, target) => {
    if (!sourceNames.includes(`${target}.md`)) return target;
    if (target === 'DRGBT动态RGBT跟踪方向综述') return `[${target}](/posts/3340bff1/)`;
    if (target === 'DRGBT-1K') return `[${target}](/posts/147fa31e/)`;
    return `{% post_link ${path.basename(outputFor(target), '.md')} "${target}" %}`;
  });
  body = body.replace(/^> \[!(\w+)\](?:\s+([^\n]+))?/gm, (_match, type, title) =>
    `> **${type.toLowerCase() === 'abstract' ? '摘要' : type.toLowerCase() === 'warning' ? '注意' : '说明'}${title ? `｜${title}` : ''}**`);
  let inFence = false;
  body = body.split('\n').map((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    const heading = line.match(/^(#{1,5})\s+(.+)$/);
    if (!heading) return line;
    const level = Math.min(heading[1].length + 1, 6);
    return `${'#'.repeat(level)} ${heading[2].replace(/^[🚀🧠💡🏗️🧪🔬🤔📝🎯]\s*/u, '')}`;
  }).join('\n');
  body = body.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => `$$${formula.replace(/\s*\n\s*/g, ' ').trim()}$$`);
  const firstBreak = body.search(/\n(?:##|###) /);
  if (firstBreak >= 0) body = `${body.slice(0, firstBreak)}\n\n<!-- more -->\n${body.slice(firstBreak)}`;
  return body.replace(/\n{4,}/g, '\n\n\n').trim();
}

for (const name of sourceNames) {
  const stem = path.basename(name, '.md');
  const { front, body } = split(fs.readFileSync(path.join(sourceDir, name), 'utf8'));
  const heading = body.match(/^# (.+)$/m)?.[1] ?? stem;
  const survey = stem === 'DRGBT动态RGBT跟踪方向综述';
  const title = survey ? heading : `论文阅读｜${heading}`;
  const date = scalar(front, 'updated') || scalar(front, 'created') ||
    (['CMRL：基于因果的模态与平台不变动态RGBT跟踪', 'DRGBT-1K'].includes(stem) ? '2026-10-03' : '2026-10-01');
  const minute = dayCounts.get(date) ?? 0;
  dayCounts.set(date, minute + 3);
  const category = survey ? '方向综述' : '文献阅读';
  const noteTags = [...new Set(['RGBT', ...tags(front).filter((tag) => tag !== '论文笔记')])];
  const venue = scalar(front, 'venue') || (stem === 'DRGBT-1K' ? 'arXiv 2026' : '');
  const resource = resources(front, body);
  if (stem === 'DRGBT-1K') {
    resource.cover = 'https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/DRGBT-1K/fig6-7-derived-benchmarks-clean.png';
  }
  const outputPath = path.join(postsDir, outputFor(stem));
  const previousFront = fs.existsSync(outputPath) ? split(fs.readFileSync(outputPath, 'utf8')).front : '';
  const abbrlink = scalar(previousFront, 'abbrlink') ||
    (survey ? '3340bff1' : stem === 'CADTrack' ? '84cae140' : '');
  const resourceLines = [
    ...(venue ? [`**Venue:** ${venue}  `] : []),
    ...(resource.paperUrl ? [`**Paper:** [原文访问](${resource.paperUrl})  `] : []),
    ...(resource.codeUrl ? [`**GitHub:** [代码与数据](${resource.codeUrl})  `] : []),
  ];
  const output = [
    '---', `title: ${quote(title)}`, 'categories:', `  - ${quote(category)}`,
    '  - "RGBT 跟踪"', 'tags:', ...noteTags.map((tag) => `  - ${quote(tag)}`),
    `description: ${quote(abstract(body))}`, 'readmore: true', 'mathjax: true',
    ...(venue ? [`venue: ${quote(venue)}`] : []),
    ...(resource.cover ? [`cover: ${quote(resource.cover)}`] : []),
    ...(resource.paperUrl ? [`paper_url: ${quote(resource.paperUrl)}`] : []),
    ...(resource.codeUrl ? [`code_url: ${quote(resource.codeUrl)}`] : []),
    `date: ${date} 20:${String(minute).padStart(2, '0')}:00`, `updated: ${date} 23:00:00`,
    ...(abbrlink ? [`abbrlink: ${quote(abbrlink)}`] : []), '---',
    '> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。',
    '', ...resourceLines, ...(resourceLines.length ? [''] : []), convertBody(body, stem), '',
  ].join('\n');
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`${outputFor(stem)} <= ${name}`);
}
