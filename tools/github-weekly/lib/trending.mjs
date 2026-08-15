import { decodeHtml, fetchWithTimeout, parseCompactNumber, stripHtml } from './utils.mjs';

const USER_AGENT = 'seventh-knot-github-weekly/1.0';

function matchText(html, pattern) {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : '';
}

export function parseTrendingHtml(html, language = '') {
  const articles = [...String(html).matchAll(/<article\b[^>]*class=["'][^"']*\bBox-row\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)];

  return articles.flatMap((articleMatch, index) => {
    const article = articleMatch[1];
    const repositoryMatch = article.match(/<h2\b[\s\S]*?<a\b[^>]*href=["']\/([^/"'\s]+\/[^/"'#?\s]+)["'][^>]*>/i);
    if (!repositoryMatch) return [];

    const repo = decodeHtml(repositoryMatch[1]).trim();
    const escapedRepo = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const description = matchText(article, /<p\b[^>]*class=["'][^"']*color-fg-muted[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    const detectedLanguage = matchText(article, /<span\b[^>]*itemprop=["']programmingLanguage["'][^>]*>([\s\S]*?)<\/span>/i);
    const weeklyStarsText = matchText(article, /<span\b[^>]*class=["'][^"']*float-sm-right[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
    const totalStarsMatch = article.match(new RegExp(`<a\\b[^>]*href=["']\\/${escapedRepo}\\/stargazers["'][^>]*>([\\s\\S]*?)<\\/a>`, 'i'));

    return [{
      repo,
      name: repo.split('/')[1],
      owner: repo.split('/')[0],
      url: `https://github.com/${repo}`,
      description,
      language: detectedLanguage || language || null,
      stars: totalStarsMatch ? parseCompactNumber(stripHtml(totalStarsMatch[1])) : 0,
      weeklyStars: parseCompactNumber(weeklyStarsText),
      trendingRank: index + 1,
      source: 'trending',
      sources: ['trending']
    }];
  });
}

export async function fetchTrending(language = '') {
  const path = language ? `/${encodeURIComponent(language)}` : '';
  const url = `https://github.com/trending${path}?since=weekly`;
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html'
    }
  }, 45000);

  if (!response.ok) throw new Error(`GitHub Trending 请求失败：${response.status} ${url}`);
  const projects = parseTrendingHtml(await response.text(), language);
  if (!projects.length) throw new Error(`GitHub Trending 页面未解析出项目：${url}`);
  return projects;
}

export async function fetchAllTrending(languages) {
  const settled = await Promise.allSettled(languages.map(fetchTrending));
  const projects = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const errors = settled.filter((result) => result.status === 'rejected').map((result) => result.reason?.message || String(result.reason));

  if (!projects.length) throw new Error(`所有 GitHub Trending 来源均失败：\n${errors.join('\n')}`);
  if (errors.length) console.warn(`[github-weekly] ${errors.length} 个 Trending 来源失败，继续使用其余来源。`);
  return projects;
}
