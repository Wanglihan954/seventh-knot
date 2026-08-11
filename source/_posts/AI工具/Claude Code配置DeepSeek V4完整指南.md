---
title: Claude Code 配置 DeepSeek V4 完整指南
categories:
  - AI工具
tags:
  - Claude Code
  - DeepSeek
  - AI Coding
  - API
readmore: true
hideTime: true
abbrlink: 51b59eff
date: 2026-08-10 22:46:00
updated: 2026-08-10 22:46:00
---

# Claude Code 配置 DeepSeek V4 完整指南

> **摘要 · 配置结论**
> Claude Code 可以通过 DeepSeek 官方的 Anthropic 兼容接口调用 DeepSeek V4。核心是把 `ANTHROPIC_BASE_URL` 指向 `https://api.deepseek.com/anthropic`，再配置 DeepSeek API Key 与模型名称。

> **时效说明**
> 本文按 **2026-08-10** 的官方文档编写。DeepSeek 已推荐使用 `deepseek-v4-pro` 与 `deepseek-v4-flash`；旧名称 `deepseek-chat`、`deepseek-reasoner` 已到淘汰节点，不建议继续写入新配置。

<!-- more -->

## 一、工作原理

Claude Code 默认连接 Anthropic API。DeepSeek 官方提供了兼容 Anthropic Messages API 的入口，因此无需额外安装中转程序，只需修改 Claude Code 使用的接口地址、认证令牌和模型名称。

推荐分工如下：

| 用途 | 模型 |
| --- | --- |
| 主任务、复杂代码修改 | `deepseek-v4-pro[1m]` |
| Haiku 类快速任务 | `deepseek-v4-flash` |
| 子代理任务 | `deepseek-v4-flash` |
| 推理强度 | `max` |

`[1m]` 表示使用官方 Claude Code 接入文档推荐的 1M 上下文模型配置。

> **重要**
> 这是 DeepSeek 提供的兼容方案。Anthropic 官方不负责支持 Claude Code 连接非 Claude 模型；Claude Code 大版本更新后如果出现兼容问题，应优先检查 DeepSeek 的接入文档和更新日志。

## 二、准备工作

### 1. 获取 DeepSeek API Key

登录 [DeepSeek 开放平台](https://platform.deepseek.com/)，创建 API Key，并确认账户余额充足。

API Key 通常以 `sk-` 开头。后文统一使用占位符：

```text
<你的 DeepSeek API Key>
```

> **安全警告**
> 不要把真实 API Key 写进公开博客、截图、Git 仓库或项目内的 `.env` 示例文件。密钥一旦泄露，应立即在 DeepSeek 平台撤销并重新创建。

### 2. 安装 Claude Code

Claude Code 当前提供原生安装和 npm 安装。若使用 npm，Anthropic 当前文档建议准备 **Node.js 22 或更高版本**：

```bash
npm install -g @anthropic-ai/claude-code@latest
```

Windows 原生环境还需要安装 Git for Windows。安装完成后检查：

```bash
claude --version
claude doctor
```

> **提示**
> 不要在 Linux/macOS 上使用 `sudo npm install -g`，否则可能产生全局目录权限问题。

## 三、Linux、macOS 与 WSL 配置

在 Bash、Zsh 或 WSL 终端中执行：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN='<你的 DeepSeek API Key>'
export ANTHROPIC_MODEL='deepseek-v4-pro[1m]'
export ANTHROPIC_DEFAULT_OPUS_MODEL='deepseek-v4-pro[1m]'
export ANTHROPIC_DEFAULT_SONNET_MODEL='deepseek-v4-pro[1m]'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='deepseek-v4-flash'
export CLAUDE_CODE_SUBAGENT_MODEL='deepseek-v4-flash'
export CLAUDE_CODE_EFFORT_LEVEL='max'
```

这些变量只对当前终端会话生效。进入项目后启动：

```bash
cd /path/to/your-project
claude
```

如果需要长期使用，可以把配置写入 `~/.bashrc` 或 `~/.zshrc`，然后执行：

```bash
source ~/.bashrc
```

> **谨慎操作**
> Shell 配置文件会以明文保存 API Key。个人电脑至少应限制文件权限；团队环境建议使用密码管理器、密钥助手或企业网关，不要共享同一个 Key。

## 四、Windows PowerShell 配置

在 PowerShell 中执行：

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

进入项目并启动：

```powershell
Set-Location "D:\path\to\your-project"
claude
```

以上配置也只对当前 PowerShell 窗口有效。需要长期使用时，可以写入 PowerShell Profile：

```powershell
notepad $PROFILE
```

将环境变量配置粘贴进去，保存后重新打开 PowerShell。

> **警告**
> PowerShell Profile 同样会明文保存 Key。不要在录屏、截图或远程协助时展示包含 Key 的配置文件。

## 五、验证是否生效

### 1. 检查必要变量

Linux、macOS、WSL：

```bash
printf '%s\n' "$ANTHROPIC_BASE_URL" "$ANTHROPIC_MODEL"
test -n "$ANTHROPIC_AUTH_TOKEN" && echo 'API Key 已设置'
```

Windows PowerShell：

```powershell
$env:ANTHROPIC_BASE_URL
$env:ANTHROPIC_MODEL
if ($env:ANTHROPIC_AUTH_TOKEN) { "API Key 已设置" }
```

不要直接打印完整的 `ANTHROPIC_AUTH_TOKEN`。

### 2. 发送最小测试请求

```bash
claude -p "只回复：DeepSeek Claude Code 配置成功"
```

也可以运行交互界面：

```bash
claude
```

进入后使用 `/status` 查看当前会话状态和模型配置。

## 六、配置项说明

| 变量 | 作用 |
| --- | --- |
| `ANTHROPIC_BASE_URL` | 将 Claude Code 请求指向 DeepSeek Anthropic 兼容接口 |
| `ANTHROPIC_AUTH_TOKEN` | DeepSeek API Key，Claude Code 会作为认证令牌发送 |
| `ANTHROPIC_MODEL` | 当前会话的主要模型 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Claude Code 请求 Opus 档位时使用的模型 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Claude Code 请求 Sonnet 档位时使用的模型 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 快速、小型任务使用的模型 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 子代理使用的模型 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 推理强度；复杂 Agent 任务推荐 `max` |

显式配置所有模型映射可以避免 Claude Code 传入 Claude 模型名后被服务端自动映射，从而让主模型与快速模型的用途更加明确。

## 七、兼容性限制

DeepSeek 的 Anthropic 接口支持流式输出、系统提示词、工具定义、工具调用、工具结果和 Thinking 等 Claude Code 核心能力，但并非完整实现所有 Anthropic 字段。

需要特别注意：

- 图片消息当前不受支持。
- Document、Citation、Redacted Thinking 等字段不完整或不受支持。
- `anthropic-beta`、`anthropic-version` 等部分头部会被忽略。
- Claude Code 新增协议字段后，DeepSeek 兼容层可能需要时间跟进。

因此它适合终端代码分析、文本修改和工具调用，但不要默认认为所有 Claude 原生多模态功能都能正常工作。

## 八、常见问题

### 1. `401 Authentication Fails`

- 检查 Key 是否复制完整。
- 确认使用的是 `ANTHROPIC_AUTH_TOKEN`。
- 删除 Key 前后的空格和换行。
- 确认 Base URL 末尾包含 `/anthropic`。

### 2. `402 Insufficient Balance`

DeepSeek API 账户余额不足，需要充值后再试。

### 3. `429 Rate Limit Reached`

请求过于频繁。等待一段时间后重试，避免同时开启过多 Claude Code 会话或子代理。

### 4. `500` 或 `503`

通常是服务端临时错误或过载，可以稍后重试并查看 DeepSeek 服务状态。

### 5. 仍然要求登录 Claude

关闭当前终端，重新打开终端并确认 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN` 已生效。只设置 Base URL 而没有设置认证令牌，不足以替代原有 Claude 登录凭据。

### 6. 配置后模型不符合预期

检查是否遗漏 `ANTHROPIC_MODEL` 和三个 `ANTHROPIC_DEFAULT_*_MODEL`。不支持的 Claude 模型名可能被 DeepSeek 自动映射到 `deepseek-v4-flash`。

## 九、恢复 Claude 官方 API

Linux、macOS、WSL：

```bash
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_MODEL
unset ANTHROPIC_DEFAULT_OPUS_MODEL
unset ANTHROPIC_DEFAULT_SONNET_MODEL
unset ANTHROPIC_DEFAULT_HAIKU_MODEL
unset CLAUDE_CODE_SUBAGENT_MODEL
unset CLAUDE_CODE_EFFORT_LEVEL
```

Windows PowerShell：

```powershell
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_OPUS_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_SONNET_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_DEFAULT_HAIKU_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_SUBAGENT_MODEL -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_EFFORT_LEVEL -ErrorAction SilentlyContinue
```

如果配置写入了 Shell Profile，还需要从对应文件中删除相关行。

## 十、参考资料

- [DeepSeek：接入 Claude Code](https://api-docs.deepseek.com/zh-cn/guides/agent_integrations/claude_code)
- [DeepSeek：Anthropic API 兼容说明](https://api-docs.deepseek.com/guides/anthropic_api)
- [DeepSeek：错误码](https://api-docs.deepseek.com/quick_start/error_codes/)
- [Claude Code：安装与更新](https://code.claude.com/docs/en/getting-started)
- [Claude Code：连接其他 LLM Gateway](https://code.claude.com/docs/en/llm-gateway)

