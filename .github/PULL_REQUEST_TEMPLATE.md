## 变更说明

<!-- 简要说明这个 PR 做了什么，解决了什么问题 -->

## 变更类型

- [ ] 新增功能（feat）
- [ ] 问题修复（fix）
- [ ] 文档更新（docs）
- [ ] 重构（refactor）
- [ ] 构建 / CI（ci / chore）
- [ ] 其他：

## 关联 Issue

<!-- 例如：Closes #123 -->

## 验证方式

<!-- 说明你如何验证改动，例如执行过的命令、访问过的接口、截图 -->

```bash
npm ci
npm run build
npm test
```

## 检查清单

- [ ] 已在本地执行 `npm run build` 与 `npm test` 并通过
- [ ] 涉及接口变更时已同步更新 `docs/zh-CN/API.md` 与 `docs/en-US/API.md`
- [ ] 已更新 `CHANGELOG.md` 的 `Unreleased` 段落
- [ ] 未提交 `node_modules/`、`.wrangler/`、`private/certs/` 等本地产物
- [ ] 未包含真实证书、私钥或个人敏感信息
