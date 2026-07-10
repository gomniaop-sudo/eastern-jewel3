import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
      include: [
        'src/lib/rbac.ts',
        'src/lib/supabase.ts',
        'src/utils/errors.ts',
        'src/utils/logger.ts',
        'src/components/ui/Button.tsx',
        'src/components/ui/Input.tsx',
        'src/components/common/ErrorBoundary.tsx',
        'src/components/auth/ProtectedRoute.tsx',
        'src/hooks/useSafeAsync.ts',
        'src/hooks/useAuthorization.ts',
        'src/services/gallery.service.ts',
        'src/services/auth.service.ts',
        'src/services/newsletter.service.ts',
        'src/services/settings.service.ts',
      ],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
})
