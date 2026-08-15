# GitHub 开源周报

该功能每周从 GitHub Trending 和 GitHub Search API 发现候选仓库，补全公开 README 与仓库元数据，经过规则排序后调用 OpenAI 兼容的聊天补全接口生成中文导读。实现位于 `tools/github-weekly/`，不读取或转载 HelloGitHub 的项目数据。

## 本地验证

```powershell
npm run test:github-weekly
npm run build
```

本地生成真实周报前，设置以下环境变量：

```powershell
$env:GH_TOKEN = "GitHub token"
$env:LLM_API_KEY = "模型服务密钥"
$env:LLM_BASE_URL = "https://你的服务地址/v1"
$env:LLM_MODEL = "模型名称"
npm run github-weekly
```

本地没有配置模型变量时，生成器会使用仓库原始 description 作为安全回退。GitHub Actions 中默认要求模型配置完整，避免自动发布非中文或低质量内容。

## GitHub 仓库配置

在 `seventh-knot` 的 Settings → Secrets and variables → Actions 中添加：

| 类型 | 名称 | 用途 |
| --- | --- | --- |
| Secret | `LLM_API_KEY` | 调用模型服务 |
| Variable | `LLM_BASE_URL` | OpenAI 兼容 API 根地址，通常以 `/v1` 结尾 |
| Variable | `LLM_MODEL` | 模型名称 |
| Secret | `WEBLOG_DEPLOY_TOKEN` | 可选，仅授权写入 `Wanglihan954/Wanglihan954.github.io` |

`WEBLOG_DEPLOY_TOKEN` 应使用 fine-grained personal access token，只选择 `Wanglihan954.github.io`，仅授予 Contents: Read and write。未配置该令牌时，工作流仍会生成、测试并提交周报数据，但不会发布生产站。

## 分支安全

- 首次将相关文件推送到 `test` 分支时会自动运行，确保新工作流尚未进入默认分支也能接受验证。
- 工作流进入默认分支后，也可以在 Actions 页面通过 `workflow_dispatch` 手动验证指定分支。
- `test` 分支不会执行生产站发布步骤。
- 定时任务只有进入默认分支 `main` 后才会自动运行。
- 合并前至少确认单元测试和 Hexo 完整构建通过。

## 内容和历史

- 最新一期：`source/_data/github_weekly.json`
- 历史与去重记录：`source/_data/github_weekly_archive.json`
- 页面入口：`/github-weekly/`
- 历史页面：`/github-weekly/YYYY-Www/`

`scripts/github-weekly-menu.js` 会在 Hexo 构建时注入“开源周报”导航入口，不需要修改 `_config.yun.yml`。

同一周重复运行会更新当前期次，不会增加新期号。历史仓库会降低排序优先级；当候选池全部由历史项目组成时仍允许选入，避免生成空周报。

## 采集失败策略

- 单个语言 Trending 失败：记录警告，继续使用其余语言。
- Trending 或 Search 其中一个来源失败：继续使用另一个来源。
- 所有来源失败：任务失败，不覆盖上一期数据。
- GitHub 页面无法解析：任务失败，不发布空周报。
- 单个 README 获取失败：保留项目元数据并继续。
- CI 中 AI 缺少配置或返回非法内容：任务失败，不提交数据。
