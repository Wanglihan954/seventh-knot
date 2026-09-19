import fs from 'node:fs';
import path from 'node:path';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) {
  console.error('Usage: node tools/sync-person-reid-note.mjs <source-note> <target-post>');
  process.exit(1);
}

const source = fs.readFileSync(path.resolve(sourcePath), 'utf8').replace(/\r\n/g, '\n');
const target = fs.readFileSync(path.resolve(targetPath), 'utf8').replace(/\r\n/g, '\n');

function splitFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { frontMatter: '', body: markdown };
  return { frontMatter: match[1], body: markdown.slice(match[0].length) };
}

const sourceParts = splitFrontMatter(source);
const targetParts = splitFrontMatter(target);
const updatedDate = sourceParts.frontMatter.match(/^updated:\s*(.+?)\s*$/m)?.[1] ?? '2026-09-19';
const authors = sourceParts.frontMatter.match(/^authors:\s*(.+?)\s*$/m)?.[1];
const venue = sourceParts.frontMatter.match(/^venue:\s*(.+?)\s*$/m)?.[1];

let body = sourceParts.body;
body = body.replace(/^# 📥 增量导入记录[\s\S]*$/m, '');
body = body
  .split('\n')
  .filter((line) => !/zotero:\/\//i.test(line))
  .filter((line) => !/chatgpt-conversation:\/\//i.test(line))
  .join('\n');
body = body.replace(
  /^(\*\*Title:\*\*\s*.+)$/m,
  (_match, titleLine) => [
    titleLine,
    authors ? `**Authors:** ${authors}  ` : '',
    venue ? `**Venue:** ${venue}  ` : '',
  ].filter(Boolean).join('\n'),
);

const calloutLabels = {
  abstract: '摘要',
  info: '补充说明',
  important: '阅读说明',
  note: '补充说明',
  warning: '注意',
  tip: '提示',
  success: '实验结果',
};
body = body.replace(/^> \[!(\w+)\](?:\s+(.+))?\s*$/gm, (_match, type, title) => {
  const label = calloutLabels[type.toLowerCase()] ?? '说明';
  const cleanTitle = title?.trim();
  if (!cleanTitle || cleanTitle.toLowerCase() === '**abstract**') return `> **${label}**`;
  return `> **${label}｜${cleanTitle.replace(/^\*\*|\*\*$/g, '')}**`;
});

let inFence = false;
body = body
  .split('\n')
  .map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    const heading = line.match(/^(#{1,5})\s+(.+?)\s*$/);
    if (!heading) return line;
    const level = Math.min(heading[1].length + 1, 6);
    const title = heading[2]
      .replace(/^📖\s*/, '')
      .replace(/^🚀\s*/, '')
      .replace(/^🧠\s*/, '')
      .replace(/^🔬\s*/, '')
      .replace(/^📝\s*/, '')
      .replace(/^🔴\s*/, '')
      .replace(/^🟡\s*/, '')
      .replace(/^🟢\s*/, '')
      .replace(/^🔵\s*/, '')
      .replace(/^🟣\s*/, '')
      .replace(/^⚪\s*/, '');
    return `${'#'.repeat(level)} ${title}`;
  })
  .join('\n');

body = body.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) =>
  `$$${formula.replace(/\s*\n\s*/g, ' ').trim()}$$`,
);
body = body.replace(/=operatorname\{/g, '=\\operatorname{');
body = body.replace(/^- \*\*URL\*\*:\s*(https?:\/\/\S+)\s*$/gm, '- **Paper:** <$1>');
body = body.replace(/(> \*\*摘要\*\*[\s\S]*?)(\n---\s*\n)/, '$1\n\n<!-- more -->$2');
body = body.replace(/\n{4,}/g, '\n\n\n').trim();

let frontMatter = targetParts.frontMatter.replace(
  /^updated:\s*.+$/m,
  `updated: ${updatedDate} 22:16:27`,
);
const editorialNote = '> 本文基于论文、公开代码与本地阅读笔记整理；论文插图仅用于学习与讨论。';
const output = `---\n${frontMatter}\n---\n${editorialNote}\n\n${body}\n`;
fs.writeFileSync(path.resolve(targetPath), output, 'utf8');

console.log(JSON.stringify({ source: sourcePath, target: targetPath, updated: updatedDate, lines: output.split('\n').length - 1 }, null, 2));
