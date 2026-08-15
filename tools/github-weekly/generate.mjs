import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HELLOGITHUB_API = 'https://api.hellogithub.com/v1/periodical/volume/';
const HELLOGITHUB_LICENSE = 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const latestPath = path.join(projectRoot, 'source', '_data', 'github_weekly.json');
const archivePath = path.join(projectRoot, 'source', '_data', 'github_weekly_archive.json');

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJsonAtomic(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
}

function escapeGitHubActionsMessage(value) {
  return String(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

function languageFromCategory(category) {
  return category.endsWith(' 项目') ? category.slice(0, -3) : null;
}

function toProject(item, category, volume) {
  if (!item?.name || !item?.full_name || !item?.github_url || !item?.description) {
    throw new Error(`HelloGitHub 第 ${volume} 期包含字段不完整的项目`);
  }

  return {
    name: item.name,
    repo: item.full_name,
    url: item.github_url,
    homepage: null,
    desc: item.description,
    highlights: [],
    reason: null,
    maturity: null,
    category,
    tags: [],
    language: languageFromCategory(category),
    stars: Number(item.stars || 0),
    forks: Number(item.forks || 0),
    weeklyStars: null,
    license: null,
    avatar: item.image_url || null,
    cover: item.image_url || null,
    score: 0,
    sources: ['hellogithub'],
    aiGenerated: false,
    slug: item.rid || item.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
}

export function buildIssue(payload) {
  if (!payload?.success || !Number.isInteger(payload.current_num) || !Array.isArray(payload.data)) {
    throw new Error('HelloGitHub API 未返回有效的最新月刊');
  }

  const volume = payload.current_num;
  const groups = payload.data.map((group) => ({
    key: `hg-${group.category_id}`,
    name: group.category_name,
    projects: (group.items || []).map((item) => toProject(item, group.category_name, volume))
  })).filter((group) => group.projects.length);
  const projectCount = groups.reduce((total, group) => total + group.projects.length, 0);
  if (!projectCount) throw new Error(`HelloGitHub 第 ${volume} 期没有可发布的项目`);

  const publishedAt = payload.publish_at || new Date().toISOString();
  return {
    issue: volume,
    volume,
    week: `HG-${volume}`,
    title: `HelloGitHub 第 ${volume} 期`,
    publishedAt,
    date: publishedAt.slice(0, 10),
    status: 'published',
    source: 'hellogithub',
    sourceUrl: `https://hellogithub.com/periodical/volume/${volume}`,
    license: 'CC BY-NC-ND 4.0',
    licenseUrl: HELLOGITHUB_LICENSE,
    method: 'HelloGitHub 官方月刊 API',
    projectCount,
    groups
  };
}

export function updateArchive(archive, issue) {
  const issues = (archive.issues || []).filter((item) => item.source === 'hellogithub' && item.volume !== issue.volume);
  issues.push({
    issue: issue.issue,
    volume: issue.volume,
    week: issue.week,
    title: issue.title,
    date: issue.date,
    projectCount: issue.projectCount,
    source: issue.source,
    path: `/github-weekly/${issue.week}/`
  });
  issues.sort((a, b) => b.volume - a.volume);

  const editions = Object.fromEntries(
    Object.entries(archive.editions || {}).filter(([, edition]) => edition?.source === 'hellogithub')
  );
  editions[issue.week] = issue;

  return {
    version: 2,
    source: 'hellogithub',
    updatedAt: issue.publishedAt,
    issues,
    editions
  };
}

export async function fetchLatestIssue(fetchImpl = fetch) {
  const response = await fetchImpl(HELLOGITHUB_API, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'seventh-knot-hellogithub-sync/1.0'
    },
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`HelloGitHub API 请求失败：${response.status} ${await response.text()}`);
  return buildIssue(await response.json());
}

export async function generateWeekly({ fetchImpl = fetch } = {}) {
  const current = await readJson(latestPath, null);
  const archive = await readJson(archivePath, { version: 2, issues: [], editions: {} });
  const issue = await fetchLatestIssue(fetchImpl);
  if (current?.source === 'hellogithub' && current.volume === issue.volume) {
    console.log(`[hellogithub] 当前已是最新的第 ${issue.volume} 期，无需更新。`);
    return current;
  }
  const nextArchive = updateArchive(archive, issue);
  await writeJsonAtomic(latestPath, issue);
  await writeJsonAtomic(archivePath, nextArchive);
  console.log(`[hellogithub] 已同步 ${issue.title}，共 ${issue.projectCount} 个项目；未调用任何 AI 模型。`);
  return issue;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  generateWeekly().catch((error) => {
    const detail = error.stack || error.message || String(error);
    console.error(`[hellogithub] 同步失败：${detail}`);
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.error(`::error title=HelloGitHub 同步失败::${escapeGitHubActionsMessage(detail)}`);
    }
    process.exitCode = 1;
  });
}
