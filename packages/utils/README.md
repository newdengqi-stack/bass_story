# @zhitu/utils

**当前为空。** 这是有意的，不是遗漏。

## 为什么不把 `cn()` 搬进来

`apps/web/lib/utils.ts` 里只有一个 6 行的 `cn()`（`clsx` + `tailwind-merge`）。抽成独立包需要：

- 让 27 个文件改 import（其中包含 `components/landing/`、`components/dashboard/` 等**已验证、本轮承诺不改动**的组件）
- 为 6 行代码引入两个传递依赖与一层工作区解析

唯一消费方是 `@zhitu/web`，收益为零。这正是 `webdesigned.md §18`「不得因为'以后可能需要'提前拆分」的情形。

## 什么时候才该填进来

出现**第二个**消费方时，例如：

- `packages/ui` 抽出去成为独立设计系统包，需要 `cn()`
- `apps/worker` 需要同一套格式化/解析工具

届时把 `cn()` 与真正的共享工具一起搬入，并一次性改完所有 import。
