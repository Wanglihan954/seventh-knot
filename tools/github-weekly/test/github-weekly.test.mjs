import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { buildIssue, fetchLatestIssue, updateArchive } from '../generate.mjs';

const fixture = {
  success: true,
  current_num: 125,
  publish_at: '2026-08-28T08:10:00',
  data: [
    {
      category_id: 1,
      category_name: 'Python 项目',
      items: [
        {
          rid: 'repo-1',
          name: 'demo',
          full_name: 'owner/demo',
          description: '来自 HelloGitHub 的完整中文介绍。',
          github_url: 'https://github.com/owner/demo',
          stars: 123,
          forks: 12,
          image_url: 'https://img.hellogithub.com/i/demo.png'
        }
      ]
    }
  ]
};

test('把 HelloGitHub 官方数据转换成博客月刊', () => {
  const issue = buildIssue(fixture);
  assert.equal(issue.issue, 125);
  assert.equal(issue.week, 'HG-125');
  assert.equal(issue.projectCount, 1);
  assert.equal(issue.source, 'hellogithub');
  assert.equal(issue.groups[0].projects[0].desc, '来自 HelloGitHub 的完整中文介绍。');
  assert.equal(issue.groups[0].projects[0].language, 'Python');
  assert.equal(issue.groups[0].projects[0].aiGenerated, false);
});

test('拒绝字段不完整的 HelloGitHub 项目', () => {
  const invalid = structuredClone(fixture);
  delete invalid.data[0].items[0].description;
  assert.throws(() => buildIssue(invalid), /字段不完整/);
});

test('归档只保留 HelloGitHub 月刊并按期号倒序排列', () => {
  const issue = buildIssue(fixture);
  const archive = updateArchive({
    issues: [{ issue: 1, week: '2026-W33', source: 'ai' }],
    editions: { '2026-W33': { source: 'ai' } }
  }, issue);
  assert.deepEqual(archive.issues.map((item) => item.volume), [125]);
  assert.equal(archive.editions['HG-125'].source, 'hellogithub');
  assert.equal(archive.editions['2026-W33'], undefined);
});

test('通过官方 API 获取最新一期', async () => {
  const issue = await fetchLatestIssue(async (url, options) => {
    assert.equal(url, 'https://api.hellogithub.com/v1/periodical/volume/');
    assert.equal(options.headers.Accept, 'application/json');
    return { ok: true, json: async () => fixture };
  });
  assert.equal(issue.title, 'HelloGitHub 第 125 期');
});

test('Hexo 生成器为历史月刊创建独立路由', () => {
  const originalHexo = globalThis.hexo;
  let generator;
  globalThis.hexo = {
    extend: {
      generator: {
        register(name, fn) {
          assert.equal(name, 'github-weekly-archive-pages');
          generator = fn;
        }
      }
    }
  };

  const require = createRequire(import.meta.url);
  delete require.cache[require.resolve('../../../scripts/github-weekly-pages.js')];
  require('../../../scripts/github-weekly-pages.js');
  const issue = buildIssue(fixture);
  const routes = generator({
    data: {
      github_weekly_archive: {
        issues: [{ week: issue.week, path: '/github-weekly/HG-125/' }],
        editions: { [issue.week]: issue }
      }
    }
  });
  globalThis.hexo = originalHexo;

  assert.equal(routes[0].path, 'github-weekly/HG-125/index.html');
  assert.match(routes[0].data.description, /HelloGitHub/);
});
