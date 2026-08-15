import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed, imageFilenameFromUrl, shortDescription } from '../generate.mjs';

const payload = {
  success: true,
  current_num: 125,
  publish_at: '2026-08-28T08:00:00',
  data: [{
    category_id: 1,
    category_name: 'Python 项目',
    items: [{
      rid: 'demo-id',
      name: 'demo',
      full_name: 'owner/demo',
      github_url: 'https://github.com/owner/demo',
      description: '第一句介绍。第二句不会进入卡片摘要。',
      image_url: 'https://img.hellogithub.com/demo_123.png!small',
      stars: 1234,
      forks: 56
    }]
  }]
};

test('buildFeed creates the data shape used by the projects page', () => {
  const feed = buildFeed(payload);
  assert.equal(feed.issue, 125);
  assert.equal(feed.source_url, 'https://hellogithub.com/periodical/volume/125');
  assert.equal(feed.groups[0].key, 'hg-1');
  assert.deepEqual(feed.groups[0].projects[0], {
    name: 'demo',
    repo: 'owner/demo',
    desc: '第一句介绍。',
    url: 'https://github.com/owner/demo',
    cover: '/images/hellogithub/demo_123.png',
    stars: 1234,
    forks: 56,
    slug: 'demo-id'
  });
});

test('imageFilenameFromUrl only accepts safe HelloGitHub image names', () => {
  assert.equal(imageFilenameFromUrl('https://img.hellogithub.com/a-b_1.webp!small'), 'a-b_1.webp');
  assert.equal(imageFilenameFromUrl('https://example.com/a.png'), null);
  assert.equal(imageFilenameFromUrl('https://img.hellogithub.com/not-a-picture.svg'), null);
});

test('shortDescription keeps a compact first sentence', () => {
  assert.equal(shortDescription('  简短介绍。 后续细节。 '), '简短介绍。');
  assert.equal(shortDescription('No punctuation'), 'No punctuation');
});

test('invalid payload is rejected', () => {
  assert.throws(() => buildFeed({ success: false }), /未返回有效/);
});
