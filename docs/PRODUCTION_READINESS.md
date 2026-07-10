# Production Deployment & Security Guide

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**: Copy `.env.example` to `.env` and fill in production values
- [ ] **Supabase URL**: Set `VITE_SUPABASE_URL` to your production Supabase project URL
- [ ] **Supabase Anon Key**: Set `VITE_SUPABASE_ANON_KEY` to your production anon key
- [ ] **No secrets in repo**: Verify `.env` is in `.gitignore` and not committed
- [ ] **TypeScript**: Run `npm run type-check` — must pass with 0 errors
- [ ] **Lint**: Run `npm run lint` — must pass with 0 errors
- [ ] **Tests**: Run `npm run test` — all tests must pass
- [ ] **Coverage**: Run `npm run test:coverage` — all thresholds must be met (85%/80%/85%/85%)
- [ ] **Build**: Run `npm run build` — must produce `dist/` without errors
- [ ] **Security audit**: Run `npm run audit:prod` — 0 critical vulnerabilities

### Database Security

- [ ] **RLS enabled**: Row Level Security is enabled on all 6 tables
- [ ] **Public read policies**: Only active/published content is publicly readable
- [ ] **Admin write policies**: INSERT/UPDATE/DELETE require authentication
- [ ] **Input validation**: Contact form validates email format and message length at DB level
- [ ] **Newsletter validation**: Email format validated at DB policy level
- [ ] **No anonymous modifications**: Anon role cannot UPDATE or DELETE any table

### Storage Security

- [ ] **Bucket**: `media` bucket exists for file uploads
- [ ] **Allowed types**: Only `image/jpeg`, `image/jpg`, `image/png`, `image/webp` accepted
- [ ] **Max file size**: 5MB limit enforced at application level
- [ ] **Extension validation**: File extension must match allowed MIME types
- [ ] **Admin-only uploads**: Upload operations require authentication

### Authentication Security

- [ ] **Session persistence**: Sessions persist across page reloads via Supabase
- [ ] **Token refresh**: Supabase auto-refreshes expired tokens
- [ ] **Logout flow**: `signOut()` clears session and redirects to login
- [ ] **Expired session handling**: AuthContext detects expired sessions and signs out
- [ ] **Inactivity timeout**: 30-minute inactivity timeout enforced
- [ ] **Session warning**: 5-minute warning before session expiry
- [ ] **Role validation**: RBAC checks role on every protected route
- [ ] **Permission validation**: Granular permission checks via `hasPermission()`
- [ ] **Unauthorized redirects**: Unauthenticated users redirected to login page

### Security Headers

Configure these headers at your hosting platform or reverse proxy:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | See `src/config/security-headers.ts` |

### Input Security

- [ ] **XSS prevention**: React auto-escapes all interpolated content
- [ ] **HTML injection**: No `dangerouslySetInnerHTML` usage in components
- [ ] **URL validation**: All URLs are relative or from trusted domains (Supabase, Pexels)
- [ ] **MIME validation**: Upload validation checks both MIME type and file extension
- [ ] **Size validation**: 5MB max file size enforced before upload
- [ ] **Email validation**: Regex validation on all email inputs (client + DB policy)
- [ ] **Contact form**: Name (min 2 chars), email (valid format), message (min 10 chars)

### Error Handling

- [ ] **Error Boundary**: Global ErrorBoundary catches all unhandled React errors
- [ ] **Service errors**: All services use `createServiceError()` with safe error codes
- [ ] **No stack traces**: Error messages are user-safe, no stack traces exposed
- [ ] **Production logging**: Logger stores errors in localStorage, respects environment
- [ ] **Graceful fallbacks**: ErrorBoundary shows retry button and error ID

---

## Security Checklist

### Database (Supabase)

| Item | Status | Details |
|---|---|---|
| RLS enabled on all tables | PASS | 6/6 tables have RLS enabled |
| SELECT policies (public) | PASS | Only active/published/public rows visible |
| INSERT policies (public) | PASS | Only newsletter + contact (with validation) |
| INSERT policies (admin) | PASS | Authenticated users can insert on all tables |
| UPDATE policies (admin) | PASS | Authenticated users can update on all tables |
| DELETE policies (admin) | PASS | Authenticated users can delete on all tables |
| Anonymous modification blocked | PASS | No UPDATE/DELETE policies for anon role |
| Email validation at DB level | PASS | Regex check in INSERT policies |
| Message length validation | PASS | Min 10 chars enforced in contact policy |

### Authentication

| Item | Status | Details |
|---|---|---|
| Session persistence | PASS | Supabase manages session storage |
| Token refresh | PASS | Supabase auto-refreshes tokens |
| Logout flow | PASS | `signOut()` clears all session state |
| Expired session handling | PASS | AuthContext detects and handles expiry |
| Inactivity timeout | PASS | 30-minute timeout with 5-min warning |
| Role validation | PASS | RBAC with 5 roles: super_admin → viewer |
| Permission validation | PASS | 20 granular permissions enforced |
| Unauthorized redirect | PASS | ProtectedRoute redirects to login |

### Environment

| Item | Status | Details |
|---|---|---|
| No secrets in repo | PASS | `.env` in `.gitignore`, never committed |
| No production keys committed | PASS | Only anon key (public by design) |
| Safe environment loading | PASS | `isSupabaseConfigured()` guard in services |
| Example env template | PASS | `.env.example` with placeholder values |

### Dependencies

| Item | Status | Details |
|---|---|---|
| Critical vulnerabilities | PASS | 0 vulnerabilities found |
| Production audit | PASS | `npm audit --omit=dev` clean |
| All packages used | PASS | No unused dependencies detected |

---

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups for all projects:

- **Daily backup**: Full database snapshot stored for 7 days
- **Point-in-time recovery**: Available up to 7 days back
- **Manual backup**: Use Supabase Dashboard → Database → Backups

### Recommended backup procedure:

1. **Weekly export**: Export critical tables via Supabase Dashboard
2. **Before migrations**: Always export full schema + data before schema changes
3. **Content backup**: Export gallery_items, journal_entries, site_settings monthly

### Restore Procedure

1. Go to Supabase Dashboard → Database → Backups
2. Select the backup date to restore
3. Click "Restore" — this creates a new project from the backup
4. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
5. Redeploy the application

### Emergency rollback:

```bash
# Rollback to previous deployment
# Bolt: Use the deployment history to rollback
# Manual: Re-deploy previous build from dist/
```

---

## Production Maintenance Notes

### Regular Tasks

| Task | Frequency | How |
|---|---|---|
| Security audit | Weekly | `npm audit --omit=dev` |
| Dependency update | Monthly | `npm update`, test, deploy |
| Database backup check | Weekly | Verify Supabase backups exist |
| Log review | Weekly | Check ErrorBoundary logs in browser console |
| SSL certificate | Auto | Managed by hosting platform |
| Sitemap update | On content change | Update `public/sitemap.xml` dates |

### Performance Monitoring

- **Bundle size**: Run `npm run build` and check chunk sizes
  - vendor: ~264KB (86KB gzipped) — acceptable
  - supabase: ~204KB (52KB gzipped) — acceptable
  - animations: ~133KB (43KB gzipped) — consider lazy loading
  - All route chunks: <22KB (5KB gzipped) — excellent

- **Lighthouse audit**: Run in Chrome DevTools → Lighthouse tab
  - Target: 90+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO

### Performance Optimizations In Place

- **Code splitting**: Routes lazy-loaded, vendor/supabase/i18n/animations split
- **Source maps**: Disabled in production (no code exposure)
- **Asset hashing**: All filenames content-hashed for cache busting
- **Tree shaking**: Vite/rolldown eliminates dead code automatically
- **Minification**: Oxc minifier reduces bundle size
- **Chunk size warning**: Build warns if any chunk exceeds 600KB

### SEO Configuration

- **Meta tags**: Per-page title, description via `react-helmet-async`
- **Canonical URLs**: Set in `src/config/site.ts`
- **OpenGraph**: Configured in `src/config/seo.ts`
- **Twitter Cards**: Summary large image card configured
- **JSON-LD**: WebSite schema with SearchAction
- **Sitemap**: `public/sitemap.xml` with all public routes
- **Robots**: `public/robots.txt` blocks admin, allows public content
- **Language tags**: hreflang alternates for en/ar in sitemap
- **Alternate URLs**: en and ar variants specified for each page

### Accessibility (WCAG AA)

- **Keyboard navigation**: All interactive elements are keyboard accessible
- **Focus order**: Logical tab order maintained via React Router
- **Screen readers**: ARIA labels on all interactive elements
- **ARIA**: `role`, `aria-label`, `aria-invalid`, `aria-required` used throughout
- **Contrast**: Color system designed for WCAG AA contrast ratios
- **RTL/LTR**: Direction set dynamically based on i18n language
- **Focus visible**: `:focus-visible` outlines on all focusable elements

---

## Troubleshooting

### Build fails with "manualChunks is not a function"
This is a Vite 8 / rolldown issue. The `manualChunks` config must be a function, not an object. See `vite.config.ts` for the correct function-based implementation.

### Build fails with "Failed to load transformWithEsbuild"
Vite 8 deprecated esbuild minification. The `minify: 'esbuild'` option was removed. Vite 8 uses oxc minifier by default — no explicit `minify` setting needed.

### Tests fail with "act() warning"
This is expected in async test scenarios. Use `act()` from `@testing-library/react` to wrap async operations.

### Coverage below threshold
Run `npm run test:coverage` and check `coverage/index.html` for uncovered lines. Add tests for uncovered branches.

### Supabase connection fails
Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. The `isSupabaseConfigured()` function guards all service calls.
