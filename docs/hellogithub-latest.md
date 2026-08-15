# HelloGitHub 最新一期同步

站点只保留 `/projects/` 项目终端。它每天检查一次 HelloGitHub 官方月刊 API；仅在期号变化时更新数据和下载新封面，不调用 AI，也不生成独立周报或历史归档页面。

## 本地命令

```bash
npm run test:hellogithub
npm run hellogithub:update
npm run build
```

数据写入 `source/_data/hellogithub.json`，封面写入 `source/images/hellogithub/`，项目作者头像写入 `source/images/github-avatars/`。页面只引用这些本地资源；封面下载会携带 HelloGitHub 防盗链所需的 `Referer`，并校验响应类型和文件大小。

项目卡片使用第一句摘要以控制高度，详情弹窗显示 HelloGitHub 官方完整描述，并显示已本地化的作者头像；没有可用头像时显示 `GH` 占位符。

GitHub Actions 每天北京时间 09:15 检查新一期。同一期会直接跳过，因此不会每天制造无意义提交。
