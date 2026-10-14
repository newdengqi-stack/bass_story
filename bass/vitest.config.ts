import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const rootDir = process.cwd()

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@/lib/navigation',
        replacement: resolve(rootDir, 'test/mocks/navigation.ts'),
      },
      { find: '@', replacement: rootDir },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
})
