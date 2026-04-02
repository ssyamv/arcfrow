# Android 客户端项目 — Claude 上下文

## 技术栈

- Kotlin + Android SDK
- UI：支持 Jetpack Compose 和传统 XML 两种方式（新页面优先 Compose，维护旧页面保持 XML）
- 架构：MVVM
- 网络请求：Retrofit + OkHttp + Kotlin Coroutines
- 依赖注入：Hilt
- 图片加载：Coil
- 本地存储：DataStore（轻量）/ Room（结构化）
- 首次操作前先阅读 build.gradle.kts 了解依赖版本，阅读模块和包结构了解项目组织

## 目录结构约定

```text
app/src/main/java/com/公司/项目/
├── ui/                   # UI 层
│   └── user/
│       ├── UserActivity.kt 或 UserScreen.kt（Compose）
│       ├── UserViewModel.kt
│       └── components/   # 页面级私有组件
├── data/                 # 数据层
│   ├── api/              # Retrofit 接口定义（按模块拆分）
│   ├── model/            # 数据模型（DTO / Entity）
│   ├── repository/       # 数据仓库（协调远程和本地）
│   └── local/            # 本地数据源（Room DAO、DataStore）
├── di/                   # Hilt 依赖注入模块
├── common/               # 公共工具、扩展函数、常量
│   ├── base/             # 基类（BaseActivity、BaseViewModel）
│   ├── ext/              # Kotlin 扩展函数
│   └── constants/
└── widget/               # 全局公共 UI 组件
```

## 分层规范

View（Activity/Fragment/Compose Screen） → ViewModel → Repository → API / Local

| 层 | 职责 | 命名规则 |
|----|------|----------|
| View | UI 渲染，观察 ViewModel 状态 | XxxActivity / XxxFragment / XxxScreen（Compose） |
| ViewModel | 业务逻辑、UI 状态管理 | XxxViewModel（@HiltViewModel） |
| Repository | 协调远程和本地数据源 | XxxRepository |
| API | Retrofit 接口定义 | XxxApi（interface） |
| Model | 数据模型 | XxxDTO（网络）/ XxxEntity（本地）/ XxxUiState（UI） |

## MVVM + Compose 规范

- UI 状态使用 `StateFlow`，ViewModel 中暴露为 `val uiState: StateFlow<XxxUiState>`
- Compose 页面通过 `collectAsStateWithLifecycle()` 收集状态
- 事件从 View → ViewModel 通过函数调用，不用 Event Channel（简单场景）
- 一次性事件（Toast、导航）使用 `SharedFlow` 或 `Channel`
- Compose 组件拆分原则：单个 Composable 函数不超过 60 行

## MVVM + XML 规范（维护旧页面）

- UI 状态使用 `LiveData` 或 `StateFlow` + `lifecycleScope.launch { flow.collect {} }`
- ViewBinding 替代 findViewById，禁止使用 kotlin-android-extensions
- 布局文件命名：`activity_xxx.xml` / `fragment_xxx.xml` / `item_xxx.xml`

## 网络请求规范

- Retrofit 接口按模块拆分，如 `data/api/UserApi.kt`
- 统一 OkHttp 拦截器处理 Token 注入、日志、错误转换
- 接口返回统一包装类 `Result<T>`（与后端 code/message/data 对应）
- 所有网络请求在 Repository 层通过 Coroutines 调用，ViewModel 中使用 `viewModelScope.launch`
- Retrofit BaseUrl 配置读取自 BuildConfig，所有接口路径遵循 `/api/v1/` 前缀 + 小写中划线约定

## 代码规范

- 文件名与类名一致：PascalCase
- 函数名 / 变量名：camelCase
- 常量：UPPER_SNAKE_CASE，定义在 `companion object` 或 `constants/` 中
- Hilt 注入：Repository 和 API 通过 `@Module` + `@Provides` 或 `@Binds` 提供
- 禁止在 View 层直接调用 API，必须通过 ViewModel → Repository

## Figma MCP 使用规范

- Claude Code 通过 Figma MCP Server 读取设计稿生成 Android UI 代码
- Figma 组件优先映射到 Material 3 Compose 组件，其次映射到项目 `widget/` 中的自定义组件
- 从 Figma 提取的颜色和间距应映射到 MaterialTheme 主题变量，不使用硬编码值
- 生成的代码必须遵守本文档中的 MVVM + Compose 规范
