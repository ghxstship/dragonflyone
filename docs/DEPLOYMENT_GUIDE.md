# Deployment Guide - Dragonflyone Platform

**Last Updated:** November 24, 2025  
**Status:** Production Ready

---

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm installed
- Supabase CLI installed
- Vercel CLI (optional, for deployment)
- Docker (for local Supabase)

### Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Install testing dependencies
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test

# 3. Start Supabase
npx supabase start

# 4. Apply migrations
npx supabase db reset

# 5. Get Supabase credentials
npx supabase status

# 6. Create environment files
cp .env.example apps/atlvs/.env.local
cp .env.example apps/compvss/.env.local
cp .env.example apps/gvteway/.env.local

# 7. Start development servers
pnpm dev
```

---

## Environment Variables

### Required for Each App

**apps/atlvs/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**apps/compvss/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

**apps/gvteway/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3003
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

---

## Testing

### Run Unit Tests
```bash
pnpm test
```

### Run E2E Tests
```bash
pnpm playwright test
```

### Generate Coverage
```bash
pnpm test:coverage
```

---

## Deployment

### Staging Deployment

1. **Deploy Supabase**
```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

2. **Deploy Applications**
```bash
# Using Vercel
vercel --env production

# Or using custom deployment
pnpm build
pnpm start
```

### Production Deployment

See CI/CD workflows in `.github/workflows/` for automated deployment.

---

## Monitoring

- Health checks run every 5 minutes
- Performance metrics collected via Lighthouse
- Error tracking via Sentry (configure in production)
- Database monitoring via Supabase dashboard

---

## Rollback Procedures

```bash
# Database rollback
./scripts/rollback.sh

# Application rollback
# Use Vercel dashboard or redeploy previous version
```

---

**For full documentation, see individual README files in each app directory.**
