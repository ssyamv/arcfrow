# Vue3 前端项目 — Claude 上下文

## 技术栈

- Vue 3 + TypeScript + Vite
- 组件库：Element Plus + shadcn-vue
- 状态管理：Pinia
- 路由：Vue Router
- HTTP 请求：Axios
- 首次操作前先阅读 package.json 了解依赖版本，阅读 src/ 目录结构了解项目组织

## 目录结构约定

```text
src/
├── api/              # 接口请求（按模块拆分文件）
├── assets/           # 静态资源
├── components/       # 全局公共组件
├── composables/      # 组合式函数（useXxx）
├── layouts/          # 布局组件
├── pages/            # 页面组件（按模块分目录）
│   └── user/
│       ├── index.vue
│       └── components/   # 页面级私有组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理（按模块拆分）
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

## 组件规范

- 使用 `<script setup lang="ts">` + Composition API，不使用 Options API
- 组件文件名：PascalCase，如 `UserProfile.vue`
- 全局公共组件放 `src/components/`，页面私有组件放在页面目录下的 `components/`
- Element Plus 用于表单、表格、弹窗等后台管理类组件
- shadcn-vue 用于需要高度定制样式的组件
- 两套组件库的使用边界：Element Plus 优先，shadcn-vue 仅在 Element Plus 无法满足定制需求时使用

## 接口请求规范

- 按模块拆分文件，如 `src/api/user.ts`
- 每个接口函数返回类型明确定义
- 统一使用封装后的 Axios 实例（含 token 注入、错误拦截、Result<T> 解包）
- 接口函数命名：`getXxx` / `createXxx` / `updateXxx` / `deleteXxx`

## 状态管理规范

- 一个模块一个 store 文件，如 `src/stores/user.ts`
- 使用 `defineStore` + Setup Store 风格（组合式写法）
- 只有跨组件共享的状态才放 store，组件内部状态用 `ref` / `reactive`

## 样式规范

- 组件样式使用 `<style scoped>`，避免全局污染
- 全局样式变量定义在 `src/styles/` 中
- 如果 package.json 中包含 tailwindcss 依赖，则优先使用 Tailwind CSS 工具类；否则使用 scoped CSS

## 代码规范

- 所有变量和函数使用 TypeScript 类型标注
- 组合式函数命名以 `use` 开头，如 `useUserList`
- 页面组件负责组装和布局，业务逻辑抽到 composables 中
- 路由使用懒加载：`() => import('@/pages/xxx/index.vue')`

## Figma MCP 使用规范

- Claude Code 通过 Figma MCP Server 读取设计稿生成 UI 代码
- Figma 组件优先映射到 Element Plus 组件，Element Plus 无法满足时映射到 shadcn-vue
- 从 Figma 提取的颜色和间距应映射到项目已有的 CSS 变量 / Tailwind token，不使用硬编码值
- 生成的代码必须遵守本文档中的组件规范和样式规范
