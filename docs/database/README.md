# docs/database

**未实现。**

放数据模型与迁移记录。按 `webdesigned.md §6.1`，典型业务域包括：

- 用户域：`users` `user_profiles` `roles` `permissions` `user_roles`
- 学习域：`courses` `course_chapters` `learning_progress` `learning_records`
- 求职域：`jobs` `job_categories` `job_tags` `applications` `application_status_history`
- 简历域：`resumes` `resume_versions` `resume_analysis` `resume_tags`
- 会员域：`membership_plans` `user_memberships` `orders` `payments`

设计时必须遵守 `.claude/rules/database-rules.md`（约束、索引、事务、迁移、敏感数据）。

触发条件：引入 PostgreSQL 时。
