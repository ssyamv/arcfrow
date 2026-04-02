# ArcFlow

AI 研发运营一体化平台 — 以 Markdown + Git 为数据底座、AI 为执行引擎，串联从 PRD 到代码生成的全流程。

## 项目目标

1. **流程标准化** — PRD 到技术文档到代码的流程规范化，减少人工传递损耗
2. **研发效率** — AI 自动生成文档和代码，减少中间环节
3. **知识管理** — 文档统一存储，语义检索，降低信息查找成本

## 架构总览

```mermaid
block-beta
  columns 1
  block:interaction["🤖 交互层"]
    NanoClaw["NanoClaw — 飞书 AI 工作台"]
  end
  block:notification["📢 通知层"]
    Feishu["飞书 — 消息卡片 + 审批按钮"]
  end
  block:orchestration["⚙️ 编排层"]
    Dify["Dify — Prompt 链 · RAG 检索 · 模型调用"]
  end
  block:gateway["🔗 衔接层"]
    GW["胶水服务 — Webhook · Git 读写 · Claude Code 调度"]
  end
  block:collab["👥 协作层"]
    WikiJS["Wiki.js（文档）"]
    Plane["Plane（任务）"]
  end
  block:data["💾 数据层"]
    Git["docs Git"]
    Code["代码仓库"]
    Weaviate["Weaviate"]
  end

  interaction --> notification --> orchestration --> gateway --> collab --> data

  style interaction fill:#1a1a2e,color:#7ecfff
  style notification fill:#1a1a2e,color:#a8e6a1
  style orchestration fill:#1a1a2e,color:#f0a050
  style gateway fill:#1a1a2e,color:#c9b1ff
  style collab fill:#1a1a2e,color:#7ecfff
  style data fill:#1a1a2e,color:#c2c2c2
```

## 核心数据流

```mermaid
flowchart TD
  A["📝 PM 写 PRD<br/><i>Wiki.js</i>"] --> B["✅ Plane Issue<br/>标记 Approved"]
  B --> C["🤖 AI 生成技术设计文档<br/>+ OpenAPI 规范<br/><i>Claude Opus → Sonnet</i>"]
  C --> D{"📋 飞书通知<br/>研发 Review"}
  D -->|通过| E["⚙️ 第一轮：后端代码生成<br/><i>Claude Code headless</i>"]
  D -->|打回| A
  E --> F["👀 研发 Review MR → 合并"]
  F --> G{"🎨 Figma 设计稿<br/>是否已交付？"}
  G -->|是| H["⚙️ 第二轮：UI 代码生成<br/><i>Claude Code + Figma MCP</i>"]
  G -->|否| W["⏳ 等待设计师交付"]
  W --> G
  H --> I["👀 研发 Review / 微调"]
  I --> J["🧪 CI/CD 测试"]
  J -->|通过| K["📦 交付归档"]
  J -->|失败| L{"🔄 自动修复<br/>≤ 2 次？"}
  L -->|是| M["🤖 Claude Code<br/>自动修复"] --> J
  L -->|否| N["👨‍💻 转人工处理"]

  style A fill:#1d3557,color:#fff
  style C fill:#2a4a3a,color:#a8e6a1
  style E fill:#2a4a3a,color:#a8e6a1
  style H fill:#2a4a3a,color:#a8e6a1
  style K fill:#0e8a16,color:#fff
  style N fill:#b60205,color:#fff
```

## 技术栈

| 层 | 技术选型 |
|----|---------|
| 后端 | Java 17 + Spring Boot 3.x + MyBatis-Plus + MySQL 8.0 |
| Web 前端 | Vue3 + Element Plus / shadcn-vue + Pinia + Vite |
| 移动端 | Flutter 3.x + GetX + Dio |
| 客户端 | Kotlin Android（Jetpack Compose + XML） |
| 胶水服务 | Bun + Hono + bun:sqlite |
| AI 编排 | Dify（工作流 + RAG） |
| AI 引擎 | Claude API（Opus / Sonnet）+ Claude Code（headless） |
| 文档 | Wiki.js 2.x（Git 双向同步） |
| 任务管理 | Plane CE（原生 MCP） |
| AI 工作台 | NanoClaw（Claude Agent SDK） |
| 向量数据库 | Weaviate |

## 仓库结构

```
arcfrow/
├── CLAUDE.md                          # Claude Code 项目上下文
├── README.md
├── .github/
│   ├── CONTRIBUTING.md                # 团队协作工作流
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── task.md
│       └── bug.md
└── docs/
    ├── AI研发运营一体化平台_技术架构方案.md  # v1.0 原始架构方案
    ├── images/                         # 架构图
    └── superpowers/specs/              # 详细设计规格文档
        ├── 2026-04-02-ai-devops-platform-design.md       # 整体平台设计（v2.1）
        ├── 2026-04-02-document-templates-design.md       # PRD + 技术文档模板
        ├── 2026-04-02-claude-md-specs-design.md          # 各端 CLAUDE.md 规范
        ├── 2026-04-02-dify-workflow-prompts-design.md    # Dify 工作流 Prompt
        ├── 2026-04-02-gateway-service-design.md          # 胶水服务详细设计
        ├── 2026-04-02-feishu-approval-design.md          # 飞书消息卡片 + 审批协议
        ├── 2026-04-02-multi-platform-codegen-design.md   # 多端代码生成策略
        └── 2026-04-02-nanoclaw-routing-design.md         # NanoClaw 意图路由
```

## 实施计划

| Phase | 内容 | 周期 | 状态 |
|-------|------|------|------|
| Phase 1 | Wiki.js + docs 仓库 + CLAUDE.md | Week 1-2 | 进行中 |
| Phase 2 | Plane CE + MCP 接入 | Week 3-4 | 待启动 |
| Phase 3 | Dify + 工作流 + 胶水服务 | Week 5-7 | 待启动 |
| Phase 4 | Dify RAG 知识库 | Week 8-9 | 待启动 |
| Phase 5 | NanoClaw + 飞书接入 | Week 10-12 | 待启动 |
| Phase 6 | CI/CD Bug 回流 | Week 13-15 | 待启动 |

## 参与开发

请阅读 [CONTRIBUTING.md](.github/CONTRIBUTING.md) 了解：

- 分支策略与命名规范
- Issue / PR 工作流
- Commit Message 规范
- Code Review 流程

当前开发任务见 [Phase 1 Milestone](https://github.com/ssyamv/arcfrow/milestone/1)。

## License

待定
