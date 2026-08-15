import { dateDaysAgo, fetchWithTimeout, mapLimit } from './utils.mjs';

const API_ROOT = 'https://api.github.com';
const API_VERSION = '2022-11-28';

function headers(token, accept = 'application/vnd.github+json') {
  return {
    Accept: accept,
    'User-Agent': 'seventh-knot-github-weekly/1.0',
    'X-GitHub-Api-Version': API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function githubRequest(path, token, accept) {
  const response = await fetchWithTimeout(`${API_ROOT}${path}`, { headers: headers(token, accept) });
  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    throw new Error(`GitHub API 请求失败：${response.status} ${path}${remaining === '0' ? '（速率额度已用尽）' : ''}`);
  }
  return response;
}

export async function searchNewRepositories({ token, minStars = 20, now = new Date() }) {
  const query = `created:>=${dateDaysAgo(7, now)} stars:>=${minStars} archived:false fork:false`;
  const params = new URLSearchParams({ q: query, sort: 'stars', order: 'desc', per_page: '50' });
  const response = await githubRequest(`/search/repositories?${params}`, token);
  const data = await response.json();

  return (data.items || []).map((repo, index) => ({
    repo: repo.full_name,
    name: repo.name,
    owner: repo.owner?.login,
    url: repo.html_url,
    description: repo.description || '',
    language: repo.language,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    topics: repo.topics || [],
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    newRepositoryRank: index + 1,
    source: 'new-repository',
    sources: ['new-repository']
  }));
}

async function enrichOne(candidate, token, readmeMaxCharacters) {
  try {
    const response = await githubRequest(`/repos/${candidate.repo}`, token);
    const repo = await response.json();
    let readme = '';
    try {
      const readmeResponse = await githubRequest(`/repos/${candidate.repo}/readme`, token, 'application/vnd.github.raw+json');
      readme = (await readmeResponse.text()).slice(0, readmeMaxCharacters * 2);
    } catch (error) {
      console.warn(`[github-weekly] README 获取失败 ${candidate.repo}: ${error.message}`);
    }

    return {
      ...candidate,
      name: repo.name || candidate.name,
      owner: repo.owner?.login || candidate.owner,
      url: repo.html_url || candidate.url,
      description: repo.description || candidate.description || '',
      homepage: repo.homepage || null,
      language: repo.language || candidate.language || null,
      topics: repo.topics || candidate.topics || [],
      license: repo.license?.spdx_id || null,
      stars: repo.stargazers_count ?? candidate.stars ?? 0,
      forks: repo.forks_count ?? candidate.forks ?? 0,
      openIssues: repo.open_issues_count || 0,
      createdAt: repo.created_at || candidate.createdAt,
      updatedAt: repo.updated_at || candidate.updatedAt,
      pushedAt: repo.pushed_at || null,
      archived: Boolean(repo.archived),
      disabled: Boolean(repo.disabled),
      fork: Boolean(repo.fork),
      ownerAvatar: repo.owner?.avatar_url || null,
      readme
    };
  } catch (error) {
    console.warn(`[github-weekly] 仓库资料补全失败 ${candidate.repo}: ${error.message}`);
    return candidate;
  }
}

export function enrichRepositories(candidates, { token, concurrency = 4, readmeMaxCharacters = 12000 }) {
  return mapLimit(candidates, concurrency, (candidate) => enrichOne(candidate, token, readmeMaxCharacters));
}
