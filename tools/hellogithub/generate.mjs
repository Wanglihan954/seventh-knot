import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HELLOGITHUB_API = 'https://api.hellogithub.com/v1/periodical/volume/';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const dataPath = path.join(projectRoot, 'source', '_data', 'hellogithub.json');
const imageDirectory = path.join(projectRoot, 'source', 'images', 'hellogithub');

async function readJson(filePath, fallback) {
  try {
    return JSON.parse((await readFile(filePath, 'utf8')).replace(/^\uFEFF/, ''));
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

function escapeActionsMessage(value) {
  return String(value).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

export function imageFilenameFromUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'img.hellogithub.com') return null;
    const filename = path.posix.basename(url.pathname).split('!', 1)[0];
    return /^[a-zA-Z0-9_-]+\.(?:png|jpe?g|gif|webp)$/i.test(filename) ? filename : null;
  } catch {
    return null;
  }
}

export function shortDescription(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const sentence = text.match(/^.*?[。！？!?](?=\s|$|[^。！？!?])/u);
  return (sentence ? sentence[0] : text).slice(0, 120);
}

function toProject(item, volume) {
  if (!item?.name || !item?.full_name || !item?.github_url || !item?.description) {
    throw new Error(`HelloGitHub 第 ${volume} 期包含字段不完整的项目`);
  }
  const imageFilename = imageFilenameFromUrl(item.image_url);
  return {
    name: item.name,
    repo: item.full_name,
    desc: shortDescription(item.description),
    url: item.github_url,
    cover: imageFilename ? `/images/hellogithub/${imageFilename}` : null,
    stars: Number(item.stars || 0),
    forks: Number(item.forks || 0),
    slug: item.rid || item.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
}

export function buildFeed(payload) {
  if (!payload?.success || !Number.isInteger(payload.current_num) || !Array.isArray(payload.data)) {
    throw new Error('HelloGitHub API 未返回有效的最新月刊');
  }
  const volume = payload.current_num;
  const groups = payload.data.map((group) => ({
    key: `hg-${group.category_id}`,
    name: group.category_name,
    projects: (group.items || []).map((item) => toProject(item, volume))
  })).filter((group) => group.projects.length);
  const projectCount = groups.reduce((total, group) => total + group.projects.length, 0);
  if (!projectCount) throw new Error(`HelloGitHub 第 ${volume} 期没有可发布的项目`);
  return {
    issue: volume,
    published_at: payload.publish_at || new Date().toISOString(),
    source_url: `https://hellogithub.com/periodical/volume/${volume}`,
    groups
  };
}

function imageJobs(payload) {
  return payload.data.flatMap((group) => (group.items || []).flatMap((item) => {
    const filename = imageFilenameFromUrl(item.image_url);
    return filename ? [{ url: item.image_url, filename }] : [];
  }));
}

async function downloadImages(payload, fetchImpl) {
  await mkdir(imageDirectory, { recursive: true });
  for (const job of imageJobs(payload)) {
    const response = await fetchImpl(job.url, {
      headers: { 'User-Agent': 'seventh-knot-hellogithub-sync/1.0' },
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) throw new Error(`封面下载失败：${response.status} ${job.url}`);
    await writeFile(path.join(imageDirectory, job.filename), Buffer.from(await response.arrayBuffer()));
  }
}

export async function fetchLatestPayload(fetchImpl = fetch) {
  const response = await fetchImpl(HELLOGITHUB_API, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'seventh-knot-hellogithub-sync/1.0'
    },
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`HelloGitHub API 请求失败：${response.status} ${await response.text()}`);
  return response.json();
}

export async function syncLatest({ fetchImpl = fetch } = {}) {
  const current = await readJson(dataPath, null);
  const payload = await fetchLatestPayload(fetchImpl);
  const feed = buildFeed(payload);
  if (current?.issue === feed.issue) {
    console.log(`[hellogithub] 当前已是最新的第 ${feed.issue} 期，无需更新。`);
    return current;
  }
  await downloadImages(payload, fetchImpl);
  await writeJsonAtomic(dataPath, feed);
  const projectCount = feed.groups.reduce((total, group) => total + group.projects.length, 0);
  console.log(`[hellogithub] 已同步第 ${feed.issue} 期，共 ${projectCount} 个项目；未调用任何 AI 模型。`);
  return feed;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  syncLatest().catch((error) => {
    const detail = error.stack || error.message || String(error);
    console.error(`[hellogithub] 同步失败：${detail}`);
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.error(`::error title=HelloGitHub 同步失败::${escapeActionsMessage(detail)}`);
    }
    process.exitCode = 1;
  });
}
