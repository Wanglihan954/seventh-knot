import { createHash } from 'node:crypto';

export function decodeHtml(value = '') {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

export function stripHtml(value = '') {
  return decodeHtml(String(value).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function parseCompactNumber(value = '') {
  const normalized = String(value).replace(/,/g, '').trim().toLowerCase();
  const match = normalized.match(/([\d.]+)\s*([km])?/);
  if (!match) return 0;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return 0;
  if (match[2] === 'k') return Math.round(number * 1000);
  if (match[2] === 'm') return Math.round(number * 1000000);
  return Math.round(number);
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, run));
  return results;
}

export function uniqueByRepo(projects) {
  const byRepo = new Map();
  for (const project of projects) {
    const key = String(project.repo || '').toLowerCase();
    if (!key) continue;
    const previous = byRepo.get(key);
    if (!previous) {
      byRepo.set(key, project);
      continue;
    }
    byRepo.set(key, {
      ...previous,
      ...project,
      sources: [...new Set([...(previous.sources || [previous.source]), ...(project.sources || [project.source])].filter(Boolean))],
      weeklyStars: Math.max(previous.weeklyStars || 0, project.weeklyStars || 0)
    });
  }
  return [...byRepo.values()];
}

export function stableSlug(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

export function cleanReadme(markdown = '', maxCharacters = 12000) {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, '\n[代码块已省略]\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxCharacters);
}

export function zonedDateParts(date = new Date(), timeZone = 'Asia/Shanghai') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

export function isoWeekId(date = new Date(), timeZone = 'Asia/Shanghai') {
  const { year, month, day } = zonedDateParts(date, timeZone);
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const weekYear = utcDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}

export function dateDaysAgo(days, date = new Date()) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - days);
  return copy.toISOString().slice(0, 10);
}
