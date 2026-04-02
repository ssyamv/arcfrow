# Flutter 移动端项目 — Claude 上下文

## 技术栈

- Flutter 3.x + Dart
- 状态管理 + 路由 + 依赖注入：GetX
- 网络请求：Dio
- 本地存储：shared_preferences（轻量）/ hive（结构化）
- 首次操作前先阅读 pubspec.yaml 了解依赖版本，阅读 lib/ 目录结构了解项目组织

## 目录结构约定

```text
lib/
├── main.dart
├── app/
│   ├── routes/          # GetX 路由定义
│   ├── bindings/        # GetX 依赖绑定
│   └── theme/           # 主题配置
├── modules/             # 按业务模块划分
│   └── user/
│       ├── views/       # 页面 Widget
│       ├── controllers/ # GetX Controller
│       ├── models/      # 数据模型
│       ├── widgets/     # 模块私有组件
│       └── bindings.dart
├── api/                 # 接口请求（按模块拆分）
├── models/              # 全局共享数据模型
├── widgets/             # 全局公共组件
├── utils/               # 工具函数
└── constants/           # 常量定义
```

## 分层规范

View → Controller → API / Repository

| 层 | 职责 | 命名规则 |
|----|------|----------|
| View | UI 渲染，监听 Controller 状态 | XxxPage / XxxView |
| Controller | 业务逻辑、状态管理 | XxxController（extends GetxController） |
| API | 网络请求封装 | XxxApi |
| Model | 数据模型，含 fromJson / toJson | XxxModel |
| Binding | 依赖注入声明 | XxxBinding |

## GetX 使用规范

- 状态管理使用 `.obs` + `Obx()` 响应式方式
- 路由使用 GetX 命名路由，统一在 `app/routes/` 中定义
- 依赖注入使用 Binding 模式，不在页面内直接 `Get.put()`
- Controller 生命周期：`onInit()` 初始化数据，`onClose()` 释放资源
- 页面间传参通过 `Get.arguments` 或 `Get.parameters`

## 网络请求规范

- 统一 Dio 实例封装（含 BaseUrl、Token 拦截器、错误处理、Result<T> 解包）
- 按模块拆分 API 文件，如 `api/user_api.dart`
- 接口函数命名：`getXxx` / `createXxx` / `updateXxx` / `deleteXxx`
- Model 类必须实现 `fromJson` 工厂构造函数和 `toJson` 方法

## 代码规范

- 文件名：小写下划线，如 `user_controller.dart`
- 类名：PascalCase，如 `UserController`
- Widget 拆分原则：超过 80 行的 build 方法必须拆分子 Widget
- 页面级 Widget 放 `views/`，可复用组件放 `widgets/`
- 常量统一定义在 `constants/` 中，禁止硬编码字符串和数字

## 错误处理规范

- 网络异常统一在 Dio 拦截器中转换为业务错误对象
- Controller 中使用 try-catch 捕获异常，更新错误状态（如 `isError.value = true`）
- 用户提示统一使用 `Get.snackbar()` 展示错误信息
- loading 状态在 Controller 中通过 `isLoading.obs` 管理，View 层 `Obx()` 响应

## Figma MCP 使用规范

- Claude Code 通过 Figma MCP Server 读取设计稿生成 Flutter UI 代码
- Figma 组件映射到 Flutter 原生 Widget 或项目 `widgets/` 中的自定义组件
- 从 Figma 提取的颜色和间距应映射到 `app/theme/` 中定义的主题变量，不使用硬编码值
- 生成的代码必须遵守本文档中的分层规范和代码规范
