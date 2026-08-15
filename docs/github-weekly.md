# HelloGitHub 最新月刊同步

页面保留原有 `/github-weekly/` 地址，但数据源已改为 HelloGitHub 官方月刊 API：

`https://api.hellogithub.com/v1/periodical/volume/`

同步过程不调用 AI，不使用 GitHub Trending 或 Search API，也不需要任何模型密钥。

## 本地运行

```powershell
npm run test:hellogithub
npm run hellogithub:update
npm run build
```

生成数据：

- `source/_data/github_weekly.json`：最新一期。
- `source/_data/github_weekly_archive.json`：已同步的 HelloGitHub 历史期次。

## 自动更新

GitHub Actions 每天北京时间 09:15 检查一次。HelloGitHub 通常每月发布一期；如果官方数据没有改变，Git 不会产生新提交。

`test` 分支只验证数据同步与 Hexo 构建。只有工作流位于 `main` 时才会执行定时任务和生产部署。

## 授权与归属

HelloGitHub 内容依 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans) 许可。页面保留 HelloGitHub 名称、原文链接和许可说明，同步时不对官方介绍做 AI 改写。
