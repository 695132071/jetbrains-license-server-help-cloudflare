# 更新日志

本文件记录 **jetbrains-license-server-help-cloudflare** 的重要变更。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Changed

- 前端“赞助”页面改为“支持”页面：移除个人收款码，二维码统一指向本仓库；
- 新增 JVM 版（[jetbrains-helper](https://github.com/Blduu/jetbrains-helper)）入口卡片与文档跳转；
- README 增加 Cloudflare Workers 徽章、JVM 版链接与仓库二维码；
- README 中的上游项目链接更新为 `Blduu/jetbrains-helper`。

### Added

- `CHANGELOG.md`、Issue 模板与 PR 模板等社区规范文件；
- `public/images/repo-qr.png`：指向本仓库的二维码资源。

## [1.0.0]

### Added

- JetBrains 许可证服务协议（`/rpc/*.action`，RSA 签名 XML）；
- 激活码生成接口（`/license-code/generate`、`/api/generateLicense` 等）；
- JRebel 风格接口（`/jrebel/*`、`/agent/*`、`/guid`）；
- 工作于 Cloudflare Workers 的静态 Vue 3 控制台；
- ja-netfilter 下载、健康检查与安全响应头；
- 中英文文档：部署、接口、开发、架构。

[Unreleased]: https://github.com/Blduu/jetbrains-license-server-help-cloudflare/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Blduu/jetbrains-license-server-help-cloudflare/releases/tag/v1.0.0
