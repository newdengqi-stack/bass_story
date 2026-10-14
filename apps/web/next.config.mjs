/** @type {import('next').NextConfig} */
const nextConfig = {
  // 工作区内的源码包需要交给 Next 一起编译（见 packages/types）
  transpilePackages: ['@zhitu/types'],
  typescript: {
    // 保持关闭：构建阶段必须真的做类型检查。
    // 类型错误改由 `pnpm typecheck`（tsc --noEmit）与构建共同拦截。
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
