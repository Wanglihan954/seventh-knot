'use strict';

hexo.extend.generator.register('github-weekly-archive-pages', function generateGithubWeeklyPages(locals) {
  const archive = locals.data && locals.data.github_weekly_archive;
  if (!archive || !Array.isArray(archive.issues) || !archive.editions) return [];

  return archive.issues.flatMap((item) => {
    const edition = archive.editions[item.week];
    if (!edition) return [];
    return [{
      path: `github-weekly/${item.week}/index.html`,
      layout: ['github-weekly'],
      data: {
        title: edition.title,
        description: `${edition.week} GitHub 开源项目周报，共收录 ${edition.projectCount} 个项目。`,
        weeklyData: edition,
        comments: false,
        toc: false
      }
    }];
  });
});
