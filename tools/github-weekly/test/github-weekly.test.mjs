import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildIssue } from '../generate.mjs';
import { rankRepositories } from '../lib/rank.mjs';
import { fallbackSummary, parseJsonObject } from '../lib/summarize.mjs';
import { parseTrendingHtml } from '../lib/trending.mjs';
import { isoWeekId, uniqueByRepo } from '../lib/utils.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const config = {
  interests: ['AI', 'Developer Tools'],
  excludeTopics: ['gambling'],
  maxPerOwner: 1,
  maxProjects: 3,
  categories: ['人工智能', '开发者工具', 'Web 应用', '系统工具', '数据与科学', '开源学习', '其它'],
  timezone: 'Asia/Shanghai'
};

test('解析 GitHub Trending 的仓库、语言和本周 Star', async () => {
  const html = await readFile(path.join(testDirectory, 'fixtures', 'trending.html'), 'utf8');
  const projects = parseTrendingHtml(html);
  assert.equal(projects.length, 2);
  assert.deepEqual(projects[0], {
    repo: 'example/alpha',
    name: 'alpha',
    owner: 'example',
    url: 'https://github.com/example/alpha',
    description: 'A fast & local developer tool.',
    language: 'Rust',
    stars: 12345,
    weeklyStars: 1234,
    trendingRank: 1,
    source: 'trending',
    sources: ['trending']
  });
});

test('合并重复来源并保留最高的本周 Star', () => {
  const merged = uniqueByRepo([
    { repo: 'example/alpha', source: 'trending', sources: ['trending'], weeklyStars: 100 },
    { repo: 'Example/Alpha', source: 'new-repository', sources: ['new-repository'], weeklyStars: 0, stars: 200 }
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].weeklyStars, 100);
  assert.deepEqual(merged[0].sources.sort(), ['new-repository', 'trending']);
});

test('排序时过滤黑名单、归档仓库并限制同一所有者数量', () => {
  const ranked = rankRepositories([
    { repo: 'one/alpha', owner: 'one', description: 'AI tool', topics: [], stars: 500, weeklyStars: 300, sources: ['trending'] },
    { repo: 'one/beta', owner: 'one', description: 'AI tool', topics: [], stars: 400, weeklyStars: 200, sources: ['trending'] },
    { repo: 'two/bad', owner: 'two', description: 'bad', topics: ['gambling'], stars: 9999, sources: ['trending'] },
    { repo: 'three/old', owner: 'three', description: 'old', topics: [], stars: 9999, archived: true, sources: ['trending'] }
  ], config);
  assert.deepEqual(ranked.map((project) => project.repo), ['one/alpha']);
});

test('模型 JSON 可从代码围栏中安全提取', () => {
  assert.deepEqual(parseJsonObject('```json\n{"summary":"测试"}\n```'), { summary: '测试' });
});

test('构建可归档的周报期次', () => {
  const project = {
    repo: 'example/alpha', name: 'alpha', owner: 'example', url: 'https://github.com/example/alpha',
    description: 'Developer tool', language: 'Rust', stars: 123, forks: 4, weeklyStars: 30,
    sources: ['trending'], score: 100, editorial: fallbackSummary({
      repo: 'example/alpha', description: 'Developer tool', language: 'Rust', stars: 123, weeklyStars: 30, topics: []
    })
  };
  const now = new Date('2026-08-16T01:00:00Z');
  const issue = buildIssue([project], config, { issues: [] }, now);
  assert.equal(issue.issue, 1);
  assert.equal(issue.week, isoWeekId(now, 'Asia/Shanghai'));
  assert.equal(issue.projectCount, 1);
  assert.equal(issue.groups[0].projects[0].repo, 'example/alpha');
});

test('Hexo 生成器为历史期次创建独立路由', () => {
  let generator;
  globalThis.hexo = {
    extend: {
      generator: {
        register(name, callback) {
          assert.equal(name, 'github-weekly-archive-pages');
          generator = callback;
        }
      }
    }
  };
  const require = createRequire(import.meta.url);
  require('../../../scripts/github-weekly-pages.js');
  const edition = { issue: 1, week: '2026-W34', title: '第一期', projectCount: 1, groups: [] };
  const routes = generator({
    data: {
      github_weekly_archive: {
        issues: [{ issue: 1, week: '2026-W34' }],
        editions: { '2026-W34': edition }
      }
    }
  });
  assert.equal(routes[0].path, 'github-weekly/2026-W34/index.html');
  assert.equal(routes[0].data.weeklyData, edition);
  delete globalThis.hexo;
});
