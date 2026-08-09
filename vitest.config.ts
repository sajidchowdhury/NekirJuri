import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'prisma'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'],
      exclude: [
        'src/lib/**/sample-data.ts',
        'src/lib/design-tokens.ts',
        'src/lib/animations.ts',
        'src/lib/utils.ts',
        'src/lib/types.ts',
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
