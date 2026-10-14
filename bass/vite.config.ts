import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8000'
const target = new URL(apiTarget)
if (target.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(target.hostname))
  throw new Error('开发 API 代理只允许本机 HTTP 服务')
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  build: { emptyOutDir: false },
  server: { proxy: { '/api': apiTarget } },
})
