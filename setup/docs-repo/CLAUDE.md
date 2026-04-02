# 项目知识库 — Claude 上下文

## 项目概况

ArcFlow AI 研发运营一体化平台的文档仓库。所有文档以 Markdown 存储，与 Wiki.js 双向同步。

- 后端：Java 17 + Spring Boot 3.x + MyBatis-Plus + MySQL 8.0
- Web 前端：Vue3 + Element Plus + shadcn-vue + Pinia + Vue Router + Vite
- 移动端：Flutter 3.x + GetX + Dio
- 客户端：Kotlin（支持 Jetpack Compose 和传统 XML）
- 接口规范：RESTful，统一返回 Result<T>

## 文档目录说明

| 目录 | 内容 | 负责方 | AI 权限 |
|------|------|--------|---------|
| /prd | PRD 产品需求文档 | 产品 PM | 只读，不得修改 |
| /tech-design | 技术设计文档 | AI 生成，研发 Review | 可写 |
| /api | OpenAPI yaml 规范 | AI 生成 | 可写 |
| /arch | 系统架构文档 | 研发维护 | 只读 |
| /ops | 运营 SOP | 运营维护 | 只读 |
| /market | 市场材料 | 市场维护 | 只读 |

## AI 操作规范

- 生成技术设计文档时，保存至 `/tech-design/{yyyy-MM}/{功能名}.md`
- 生成 OpenAPI 规范时，保存至 `/api/{yyyy-MM}/{功能名}.yaml`
- 所有生成的文档必须包含 frontmatter（参见 /prd/_template-feature.md 和 /prd/_template-module.md）
- 不得修改 /prd、/arch、/ops、/market 目录下的文件
- 文档内容使用中文

## 文档 Frontmatter 规范

所有 .md 文件必须包含：

- title、status（draft/active/deprecated）、owner、last_updated
- PRD 额外需要：type（module/feature）、created、sprint
- 技术设计文档额外需要：source_prd、generated_by、generated_at、reviewer
