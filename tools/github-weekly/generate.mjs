import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichRepositories, searchNewRepositories } from './lib/github.mjs';
import { rankRepositories } from './lib/rank.mjs';
import { summarizeRepositories } from './lib/summarize.mjs';
import { fetchAllTrending } from './lib/trending.mjs';
import { isoWeekId, stableSlug, uniqueByRepo, zonedDateParts } from './lib/utils.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const configPath = path.join(scriptDirectory, 'config.json');
const latestPath = path.join(projectRoot, 'source', '_data', 'github_weekly.json');
const archivePath = path.join(projectRoot, 'source', '_data', 'github_weekly_archive.json');

function escapeGitHubActionsMessage(value) {
  return String(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A');
}

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

function publishedAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(date).replace(' ', 'T');
  return `${parts}+08:00`;
}

function toPublishedProject(project) {
  return {
    name: project.name,
    repo: project.repo,
    url: project.url,
    homepage: project.homepage || null,
    desc: project.editorial.summary,
    highlights: project.editorial.highlights,
    reason: project.editorial.reason,
    maturity: project.editorial.maturity,
    category: project.editorial.category,
    tags: project.editorial.tags,
    language: project.language || null,
    stars: project.stars || 0,
    forks: project.forks || 0,
    weeklyStars: project.weeklyStars || null,
    license: project.license || null,
    avatar: project.ownerAvatar || null,
    cover: null,
    score: project.score,
    sources: project.sources || [project.source].filter(Boolean),
    aiGenerated: project.editorial.aiGenerated,
    slug: stableSlug(project.repo)
  };
}

export function buildIssue(projects, config, archive, now = new Date()) {
  const week = isoWeekId(now, config.timezone);
  const existing = (archive.issues || []).find((issue) => issue.week === week);
  const nextIssue = existing?.issue || Math.max(0, ...(archive.issues || []).map((issue) => issue.issue || 0)) + 1;
  const publishedProjects = projects.map(toPublishedProject);
  const groups = config.categories.map((category) => ({
    key: `weekly-${stableSlug(category).slice(0, 8)}`,
    name: category,
    projects: publishedProjects.filter((project) => project.category === category)
  })).filter((group) => group.projects.length);
  const dateParts = zonedDateParts(now, config.timezone);

  return {
    issue: nextIssue,
    week,
    title: `GitHub 开源周报 · 第 ${nextIssue} 期`,
    publishedAt: publishedAt(now, config.timezone),
    date: `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
    status: 'published',
    method: 'GitHub Trending Weekly + GitHub Search API',
    projectCount: publishedProjects.length,
    groups
  };
}

function updateArchive(archive, issue) {
  const issues = (archive.issues || []).filter((item) => item.week !== issue.week);
  issues.push({
    issue: issue.issue,
    week: issue.week,
    title: issue.title,
    date: issue.date,
    projectCount: issue.projectCount,
    path: `/github-weekly/${issue.week}/`
  });
  issues.sort((a, b) => b.week.localeCompare(a.week));

  const editions = { ...(archive.editions || {}), [issue.week]: issue };
  const repositories = [...new Set([
    ...(archive.repositories || []),
    ...issue.groups.flatMap((group) => group.projects.map((project) => project.repo))
  ])].slice(-1000);

  return { version: 1, updatedAt: issue.publishedAt, issues, editions, repositories };
}

async function collectCandidates(config, token) {
  const results = await Promise.allSettled([
    fetchAllTrending(config.languages),
    searchNewRepositories({ token, minStars: config.minStarsForNewRepositories })
  ]);
  const candidates = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason?.message || String(result.reason));
  if (!candidates.length) throw new Error(`GitHub 候选项目采集全部失败：\n${errors.join('\n')}`);
  if (errors.length) console.warn(`[github-weekly] 一个候选来源失败：${errors.join(' | ')}`);

  return uniqueByRepo(candidates)
    .sort((a, b) => (b.weeklyStars || 0) - (a.weeklyStars || 0) || (b.stars || 0) - (a.stars || 0))
    .slice(0, config.maxCandidates);
}

export async function generateWeekly({ env = process.env, now = new Date() } = {}) {
  const config = await readJson(configPath, null);
  const archive = await readJson(archivePath, { version: 1, issues: [], editions: {}, repositories: [] });
  const candidates = await collectCandidates(config, env.GH_TOKEN || env.GITHUB_TOKEN);
  console.log(`[github-weekly] 采集到 ${candidates.length} 个去重候选项目。`);
  const enriched = await enrichRepositories(candidates, {
    token: env.GH_TOKEN || env.GITHUB_TOKEN,
    concurrency: config.requestConcurrency,
    readmeMaxCharacters: config.readmeMaxCharacters
  });
  const ranked = rankRepositories(enriched, config, archive.repositories);
  if (!ranked.length) throw new Error('过滤和排序后没有可发布的项目');
  const summarized = await summarizeRepositories(ranked, config, env);
  const issue = buildIssue(summarized, config, archive, now);
  const nextArchive = updateArchive(archive, issue);
  await writeJsonAtomic(latestPath, issue);
  await writeJsonAtomic(archivePath, nextArchive);
  console.log(`[github-weekly] 已生成 ${issue.title}，共 ${issue.projectCount} 个项目。`);
  return issue;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  generateWeekly().catch((error) => {
    const detail = error.stack || error.message || String(error);
    console.error(`[github-weekly] 生成失败：${detail}`);
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.error(`::error title=GitHub Weekly 生成失败::${escapeGitHubActionsMessage(detail)}`);
    }
    process.exitCode = 1;
  });
}
