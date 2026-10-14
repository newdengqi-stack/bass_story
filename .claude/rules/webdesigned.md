# Web 平台技术架构设计规范

> 文档定位：项目级技术架构总规范
> 适用范围：Web 前端、业务后端、数据库、缓存、异步任务、AI 服务、部署与扩展
> 核心目标：支持中大型网站持续扩展，同时避免早期过度工程化
> 架构原则：**模块化单体优先、职责清晰、可独立扩展、AI 友好、渐进式演进**

---

# 目录

1. [架构目标](#1-架构目标)
2. [总体架构](#2-总体架构)
3. [核心技术栈](#3-核心技术栈)
4. [前端架构](#4-前端架构)
5. [后端架构](#5-后端架构)
6. [数据库架构](#6-数据库架构)
7. [缓存与异步任务](#7-缓存与异步任务)
8. [AI 服务架构](#8-ai-服务架构)
9. [文件与对象存储](#9-文件与对象存储)
10. [搜索架构](#10-搜索架构)
11. [API 设计规范](#11-api-设计规范)
12. [项目目录规范](#12-项目目录规范)
13. [模块化设计原则](#13-模块化设计原则)
14. [安全设计](#14-安全设计)
15. [测试规范](#15-测试规范)
16. [日志与可观测性](#16-日志与可观测性)
17. [部署架构](#17-部署架构)
18. [系统扩展策略](#18-系统扩展策略)
19. [禁止事项](#19-禁止事项)
20. [AI Coding 工作规则](#20-ai-coding-工作规则)

---

# 1. 架构目标

本项目不是一次性 Demo，而是按照可持续运营和持续扩展的 Web 平台进行设计。

系统需要支持：

* 用户注册、登录、认证
* 用户资料与权限
* 学习内容
* 课程体系
* 学习进度
* 求职岗位
* 简历管理
* 简历分析
* 投递记录
* AI 能力
* 会员体系
* 订单与支付
* 消息与通知
* 后台管理
* 数据统计
* 后续推荐系统
* 后续搜索系统
* 后续第三方服务接入

架构目标：

1. 第一阶段能够快速开发 MVP。
2. 第二阶段能够支持业务规模增长。
3. 第三阶段能够针对高负载模块独立扩展。
4. 不因为追求“大型架构”而增加早期开发复杂度。
5. 不允许不同开发者或 AI Agent 随意改变技术体系。
6. 所有核心业务必须保持模块化和低耦合。
7. 架构必须适合 AI Coding。

---

# 2. 总体架构

初期采用：

> **模块化单体 + 独立 AI 服务 + Redis + PostgreSQL + 对象存储**

总体结构：

```text
                         Internet
                            │
                            ▼
                    ┌──────────────┐
                    │ CDN / Proxy  │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌────────────────┐       ┌────────────────┐
      │    Next.js     │       │     NestJS     │
      │      Web       │       │      API       │
      └────────────────┘       └───────┬────────┘
                                       │
                   ┌───────────────────┼───────────────────┐
                   │                   │                   │
                   ▼                   ▼                   ▼
             PostgreSQL             Redis             Object Storage
                   │                   │
                   │                   ▼
                   │               Queue
                   │                   │
                   │                   ▼
                   │             Worker Service
                   │                   │
                   │                   ▼
                   │             Python AI Service
                   │
                   └───────────────────────────────────────
```

---

# 3. 核心技术栈

## 3.1 Web 前端

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Zustand
* Zod

## 3.2 核心后端

* NestJS
* TypeScript
* REST API
* OpenAPI

## 3.3 数据层

* PostgreSQL
* Prisma 或 Drizzle ORM
* pgvector

## 3.4 基础设施

* Redis
* BullMQ
* S3 兼容对象存储
* Docker

## 3.5 AI

* Python
* FastAPI
* 独立 AI Service

## 3.6 后续可选组件

仅在业务需要时增加：

* OpenSearch / Elasticsearch
* Kafka
* Kubernetes
* 独立微服务
* 独立推荐服务
* 独立搜索服务

---

# 4. 前端架构

## 4.1 前端职责

Next.js 负责：

* 页面
* 路由
* SSR / SSG / CSR
* SEO
* 页面布局
* UI 组件
* 用户交互
* API 调用

前端不负责：

* 核心业务规则
* 数据库操作
* 核心权限判断
* 支付逻辑
* AI 核心逻辑

---

## 4.2 前端状态划分

### Server State

统一使用 TanStack Query 管理：

* 用户信息
* 课程
* 岗位
* 简历
* 投递记录
* 学习进度
* 会员信息

### Client State

使用 Zustand 管理：

* Sidebar 状态
* UI 偏好
* 临时编辑状态
* 页面级交互状态

禁止将所有 API 数据无差别存入 Zustand。

---

# 5. 后端架构

采用：

> **NestJS 模块化单体**

核心模块示例：

```text
Auth
User
Role
Learning
Course
Job
Resume
Application
Membership
Payment
Notification
Message
AI
Admin
File
Search
Analytics
```

每个业务模块应该保持独立。

示例：

```text
modules/
├── auth/
├── user/
├── learning/
├── course/
├── job/
├── resume/
├── application/
├── membership/
├── payment/
├── notification/
├── ai/
└── admin/
```

模块之间不得随意访问其他模块内部实现。

只能通过：

* Service
* Interface
* Event
* API

进行交互。

---

# 6. 数据库架构

核心数据库使用：

> PostgreSQL

原则：

1. 数据库是核心业务事实来源。
2. Redis 不能代替 PostgreSQL 成为核心业务数据库。
3. 所有重要业务数据必须具有明确的数据模型。
4. 数据库迁移必须可追踪。
5. 不允许直接手工修改生产数据库。
6. 数据结构修改必须通过 Migration。

---

## 6.1 典型业务域

### 用户域

```text
users
user_profiles
roles
permissions
user_roles
```

### 学习域

```text
courses
course_chapters
learning_progress
learning_records
```

### 求职域

```text
jobs
job_categories
job_tags
applications
application_status_history
```

### 简历域

```text
resumes
resume_versions
resume_analysis
resume_tags
```

### 会员域

```text
membership_plans
user_memberships
orders
payments
```

---

# 7. 缓存与异步任务

## 7.1 Redis

Redis 用于：

* Cache
* Session
* 验证码
* 限流
* 短期状态
* 分布式锁
* Queue

Redis 不作为核心业务数据库。

---

## 7.2 Queue

采用 BullMQ。

用于：

```text
resume-analysis
ai-analysis
email
notification
report-generation
recommendation
file-processing
```

例如：

```text
用户上传简历
       ↓
创建任务
       ↓
Redis Queue
       ↓
Worker
       ↓
AI 服务
       ↓
保存分析结果
       ↓
通知用户
```

不能让长时间 AI 任务阻塞普通 HTTP 请求。

---

# 8. AI 服务架构

AI 不直接与前端通信。

推荐：

```text
Next.js
   ↓
NestJS
   ↓
Queue
   ↓
AI Worker
   ↓
Python FastAPI
```

Python AI Service 负责：

* LLM
* Embedding
* RAG
* NLP
* 文档解析
* AI 推荐
* AI 分析
* 数据分析
* 模型推理

核心业务规则仍由 NestJS 管理。

例如：

```text
NestJS：
“用户是否有权限使用简历分析？”

Python：
“分析这份简历。”
```

两者职责不能混淆。

---

# 9. 文件与对象存储

用户文件不得长期依赖应用服务器本地磁盘。

文件类型包括：

* 简历 PDF
* 用户头像
* 课程图片
* 证书
* 附件
* 视频
* 作品集

推荐：

```text
Object Storage
├── avatars/
├── resumes/
├── certificates/
├── course-assets/
├── videos/
└── attachments/
```

数据库只保存：

* 文件 ID
* 文件路径
* 文件类型
* 文件大小
* 上传者
* 创建时间
* 业务关联关系

---

# 10. 搜索架构

第一阶段优先使用：

> PostgreSQL

不要项目初期强行引入搜索集群。

当出现以下情况时再引入 OpenSearch / Elasticsearch：

* 数据量明显增长
* 全文搜索复杂
* 多条件搜索复杂
* 搜索排序需求增加
* 搜索推荐需求增加

形成：

```text
PostgreSQL
    ↓
核心业务数据

OpenSearch
    ↓
搜索索引
```

搜索系统不是核心业务事实来源。

---

# 11. API 设计规范

采用：

> REST API + OpenAPI

接口统一使用：

```text
/api/v1/
```

示例：

```text
GET    /api/v1/users/me
GET    /api/v1/courses
GET    /api/v1/courses/:id

GET    /api/v1/jobs
POST   /api/v1/jobs/:id/apply

GET    /api/v1/resumes
POST   /api/v1/resumes
POST   /api/v1/resumes/:id/analyze
```

---

## 11.1 API 返回格式

统一：

```json
{
  "success": true,
  "data": {},
  "message": "",
  "requestId": ""
}
```

错误：

```json
{
  "success": false,
  "data": null,
  "message": "错误信息",
  "code": "ERROR_CODE",
  "requestId": "request-id"
}
```

---

# 12. 项目目录规范

推荐：

```text
project/
│
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── ai/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── utils/
│
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── decisions/
│
├── docker/
├── scripts/
│
├── AGENTS.md
├── CLAUDE.md
├── package.json
└── README.md
```

---

# 13. 模块化设计原则

必须遵循：

> 高内聚、低耦合、单一职责、明确边界。

禁止：

```text
UserService
    ↓
直接访问 CourseRepository
```

应该：

```text
User Module
      ↓
公开接口
      ↓
Course Module
```

---

## 13.1 不允许形成循环依赖

错误：

```text
User → Course
Course → User
```

需要通过：

* Domain Service
* Event
* Shared Service

解决。

---

# 14. 安全设计

必须考虑：

* 身份认证
* RBAC
* 输入校验
* SQL 注入防护
* XSS
* CSRF
* CORS
* API 限流
* 文件上传安全
* 密码安全存储
* Token 安全
* 敏感数据保护
* 权限检查
* 审计日志

核心原则：

> 前端权限控制只负责体验，后端必须再次进行权限验证。

---

# 15. 测试规范

至少建立：

```text
Unit Test
Integration Test
API Test
E2E Test
```

重要业务必须测试：

* 注册
* 登录
* 权限
* 课程购买
* 会员
* 支付
* 投递
* 简历分析
* AI 任务
* 文件上传

---

# 16. 日志与可观测性

系统必须具备基础：

```text
Application Log
Error Log
Request ID
Audit Log
Performance Monitoring
```

后续逐步增加：

```text
Metrics
Tracing
Centralized Logging
```

不要依赖 `console.log()` 作为正式日志体系。

---

# 17. 部署架构

## 第一阶段

使用 Docker Compose：

```text
Nginx / Caddy
      │
      ├── Next.js
      └── NestJS
             │
       ┌─────┼─────┐
       ↓     ↓     ↓
     PG    Redis  Worker
                    │
                    ↓
                   AI
```

---

## 第二阶段

当访问量提升后：

```text
Load Balancer
      │
 ┌────┼────┐
 ↓    ↓    ↓
Web  Web  Web

 ┌────┼────┐
 ↓    ↓    ↓
API  API  API

Worker × N

PostgreSQL
Redis
Object Storage
```

---

## 第三阶段

只有在确有需求后才考虑：

* Kubernetes
* Service Discovery
* Message Broker
* 独立微服务
* 搜索集群
* 推荐集群

---

# 18. 系统扩展策略

本项目采用：

> **模块化单体 → 独立服务 → 微服务**

渐进式演进策略。

不得因为“以后可能需要”提前拆分。

---

## 18.1 AI 服务独立

当 AI 负载提升：

```text
NestJS AI Module
        ↓
Python AI Service
        ↓
GPU Worker
```

---

## 18.2 搜索独立

当搜索复杂：

```text
Search Module
      ↓
OpenSearch
```

---

## 18.3 推荐系统独立

当推荐系统复杂：

```text
Recommendation Service
        ↓
Feature / Embedding
        ↓
Model
```

---

## 18.4 支付独立

当支付业务复杂：

```text
Payment Module
       ↓
Payment Service
```

---

# 19. 禁止事项

以下行为未经架构修改审批不得进行：

### 禁止 1：随意更换核心技术

例如：

```text
Next.js → Vue
NestJS → Django
PostgreSQL → MongoDB
```

不能因为某个功能实现起来更方便就直接切换。

---

### 禁止 2：无需求增加基础设施

禁止为了“看起来高级”直接增加：

```text
Kafka
Kubernetes
Elasticsearch
微服务
Service Mesh
```

必须有明确业务需求。

---

### 禁止 3：业务代码直接访问数据库

必须经过对应模块的数据访问层。

---

### 禁止 4：跨模块随意调用内部实现

只能访问公开接口。

---

### 禁止 5：核心业务逻辑放在 Controller

Controller 只负责：

```text
请求解析
参数验证
调用 Service
返回结果
```

核心业务逻辑必须位于 Service / Domain 层。

---

### 禁止 6：将 Redis 当主数据库

Redis 只承担缓存、队列和短期状态等职责。

---

### 禁止 7：AI 服务直接修改核心业务数据

AI 服务只能通过明确接口或任务协议访问业务数据。

---

# 20. AI Coding 工作规则

Claude Code、Codex 等 AI Agent 在修改项目之前必须：

1. 阅读 `AGENTS.md` / `CLAUDE.md`
2. 阅读本架构规范
3. 阅读相关模块文档
4. 检查现有目录
5. 检查已有组件和服务
6. 检查数据库模型
7. 检查已有 API
8. 判断是否可以复用现有能力

不得：

* 重复创建已有组件
* 重复创建已有 Service
* 随意修改公共 API
* 随意修改数据库结构
* 随意更换技术栈
* 为一个小功能引入大型依赖
* 未检查现有代码就重新实现功能

---

## 20.1 开发前

AI 必须先回答：

```text
1. 当前需求属于哪个业务模块？
2. 是否已有类似实现？
3. 是否需要修改数据库？
4. 是否需要修改 API？
5. 是否需要前端页面？
6. 是否需要异步任务？
7. 是否需要 AI 服务？
8. 是否涉及权限？
9. 是否涉及公共组件？
10. 是否影响其他模块？
```

---

## 20.2 开发过程中

优先：

```text
复用 > 扩展 > 新建
```

而不是：

```text
新建 > 新建 > 新建
```

---

## 20.3 开发完成后

必须检查：

```text
功能是否实现
API 是否正常
数据库是否正常
权限是否正常
异常处理是否完整
Loading 是否完整
Empty State 是否完整
Error State 是否完整
测试是否通过
是否引入不必要依赖
是否破坏原有功能
```

---

# 最终架构原则

本项目始终遵循：

```text
简单优先
模块化优先
复用优先
明确边界
渐进扩展
按真实业务规模演进
```

核心思想：

> **第一版不是“小型架构”，而是“中大型架构的正确骨架”。**

> **不提前承担中大型基础设施的复杂度，但从第一天开始保留未来拆分和扩展的边界。**
