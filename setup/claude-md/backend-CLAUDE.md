# 后端项目 — Claude 上下文

## 技术栈

- Java 17 + Spring Boot 3.x + MyBatis-Plus + MySQL 8.0
- 构建工具：Maven
- 首次操作前先阅读 pom.xml 了解依赖版本和模块结构

## 分层架构

Controller → Service（接口） → ServiceImpl → Mapper → Entity

| 层 | 职责 | 命名规则 |
|----|------|----------|
| Controller | 参数校验、调用 Service、统一返回 | XxxController |
| Service | 业务接口定义 | XxxService |
| ServiceImpl | 业务逻辑实现 | XxxServiceImpl |
| Mapper | 数据库操作（MyBatis-Plus BaseMapper） | XxxMapper |
| Entity | 数据库实体，与表一一对应 | Xxx |
| DTO | 请求/响应数据传输对象 | XxxReqDTO / XxxRespDTO |
| VO | 视图对象（如需与 DTO 区分） | XxxVO |

## 包结构约定

```text
com.公司.项目
├── controller/
├── service/
│   └── impl/
├── mapper/
├── entity/
├── dto/
├── vo/
├── config/          # 配置类
├── common/          # 公共工具、常量、枚举
│   ├── result/      # 统一返回 Result<T>
│   ├── exception/   # 全局异常处理
│   └── enums/
└── interceptor/     # 拦截器
```

## 接口规范

- RESTful 风格，路径以 `/api/v1/` 开头
- 统一返回 `Result<T>`，包含 code、message、data 三个字段
- 成功：code=200，失败：业务错误码从 1000 起
- 分页查询统一使用 MyBatis-Plus 的 IPage<T>
- 请求参数：GET 用 @RequestParam，POST/PUT 用 @RequestBody
- 路径命名：小写中划线，如 `/api/v1/user-roles`

## 数据库规范

- 表名：小写下划线，如 `user_role`
- 字段名：小写下划线，如 `created_at`
- 每张表必须包含：id（主键，BIGINT AUTO_INCREMENT）、created_at、updated_at
- 逻辑删除字段：deleted（TINYINT，0 未删除 / 1 已删除）
- MyBatis-Plus 自动填充 created_at、updated_at

## 代码规范

- 禁止在 Controller 层写业务逻辑，只做参数校验和调用 Service
- Service 之间可以互相调用，但禁止循环依赖
- 所有数据库操作通过 Mapper 层，禁止在 Service 中直接写 SQL
- 异常统一通过全局异常处理器捕获，不在 Controller 中 try-catch
- 参数校验使用 @Valid + JSR 303 注解
- 日志使用 SLF4J，注入方式 `@Slf4j`（Lombok），禁止使用 `System.out.println`
