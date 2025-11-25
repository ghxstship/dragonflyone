# GHXSTSHIP Platform

> The complete live entertainment management ecosystem powering business operations, production management, and consumer experiences.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green.svg)](https://supabase.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-purple.svg)](https://turbo.build/)

## Overview

GHXSTSHIP is a tri-platform ecosystem designed specifically for the live entertainment industry:

| Platform | Purpose | URL |
|----------|---------|-----|
| **ATLVS** | Business Operations & Finance | `atlvs.ghxstship.com` |
| **COMPVSS** | Production & Crew Management | `compvss.ghxstship.com` |
| **GVTEWAY** | Consumer Ticketing & Experience | `gvteway.com` |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GHXSTSHIP Platform                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     ATLVS       │    COMPVSS      │         GVTEWAY             │
│  Business Ops   │   Production    │    Consumer Platform        │
├─────────────────┴─────────────────┴─────────────────────────────┤
│                    Shared Packages                              │
│  @ghxstship/ui  │  @ghxstship/config  │  @ghxstship/api-specs   │
├─────────────────────────────────────────────────────────────────┤
│                      Supabase                                   │
│  PostgreSQL  │  Auth  │  Storage  │  Edge Functions  │  Realtime│
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** >= 18.17.0
- **pnpm** >= 8.0.0
- **Supabase CLI** (for local development)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/ghxstship/dragonflyone.git
cd dragonflyone

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start Supabase locally (optional)
supabase start

# Run all apps in development
pnpm dev
```

### Development URLs

| App | URL |
|-----|-----|
| GVTEWAY | http://localhost:3000 |
| ATLVS | http://localhost:3001 |
| COMPVSS | http://localhost:3002 |

## Project Structure

```
dragonflyone/
├── apps/
│   ├── atlvs/          # Business operations app
│   ├── compvss/        # Production management app
│   └── gvteway/        # Consumer ticketing app
├── packages/
│   ├── ui/             # Shared UI component library
│   ├── config/         # Shared configuration & utilities
│   ├── api-specs/      # OpenAPI specifications
│   └── sdk/            # Generated SDK clients
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge functions
├── docs/               # Documentation
├── e2e/                # End-to-end tests
└── scripts/            # Build & deployment scripts
```

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:atlvs        # Start ATLVS only
pnpm dev:compvss      # Start COMPVSS only
pnpm dev:gvteway      # Start GVTEWAY only

# Building
pnpm build            # Build all apps
pnpm build:atlvs      # Build ATLVS only

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:unit        # Run unit tests

# Linting & Formatting
pnpm lint             # Lint all packages
pnpm format           # Format all files

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data
pnpm db:reset         # Reset database

# Type Generation
pnpm generate:types   # Generate Supabase TypeScript types
pnpm generate:sdk     # Generate API SDK clients
```

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |

See `.env.example` for the complete list of environment variables.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys to `.env.local`
3. Run migrations:

```bash
supabase db push
```

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Configure webhook endpoints for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.updated`

## Design System

GHXSTSHIP uses a custom design system with a **Contemporary Minimal Pop Art** aesthetic:

### Typography
- **Display/H1**: Anton (bold, uppercase)
- **H2-H6**: Bebas Neue (headers, navigation)
- **Body**: Share Tech (readable body text)
- **Mono**: Share Tech Mono (metadata, labels)

### Color Palette
- **Primary**: Pure Black `#000000` / Pure White `#FFFFFF`
- **Greys**: 9-step greyscale from `#F5F5F5` to `#171717`

### Components

Import from `@ghxstship/ui`:

```tsx
import {
  Button,
  Card,
  Input,
  Modal,
  DataTable,
  StatCard,
  EventCard,
  // ... 100+ components
} from '@ghxstship/ui';
```

## API Documentation

### REST API

All apps expose RESTful APIs under `/api/*`:

```
GET    /api/events          # List events
POST   /api/events          # Create event
GET    /api/events/:id      # Get event details
PATCH  /api/events/:id      # Update event
DELETE /api/events/:id      # Delete event
```

### OpenAPI Specs

API specifications are available at:
- `/packages/api-specs/atlvs/openapi.yaml`
- `/packages/api-specs/compvss/openapi.yaml`
- `/packages/api-specs/gvteway/openapi.yaml`

### Authentication

All protected endpoints require a valid JWT token:

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.ghxstship.com/events
```

## Role System

GHXSTSHIP implements a comprehensive role-based access control system:

### Platform Roles

| Role | Platform | Access Level |
|------|----------|--------------|
| `LEGEND_SUPER_ADMIN` | All | God mode |
| `ATLVS_ADMIN` | ATLVS | Full admin |
| `COMPVSS_ADMIN` | COMPVSS | Full admin |
| `GVTEWAY_ADMIN` | GVTEWAY | Full admin |

### Event Roles

| Role | Level | Access |
|------|-------|--------|
| `EXECUTIVE` | 1000 | All platforms, all permissions |
| `PRODUCTION` | 700 | Production areas |
| `CREW` | 500 | Crew-specific access |
| `VIP` | 200-400 | VIP areas |
| `GA` | 60-150 | General admission |

See `MASTER_ROADMAP.md` Section 4 for complete role documentation.

## Deployment

### Vercel (Recommended)

Each app is configured for Vercel deployment:

```bash
# Link apps to Vercel
cd apps/atlvs && vercel link
cd apps/compvss && vercel link
cd apps/gvteway && vercel link

# Deploy
vercel --prod
```

### Environment Variables on Vercel

1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.example`
3. Use Vercel's secret store for sensitive values

### Custom Domains

Configure in Vercel Dashboard:
- `atlvs.ghxstship.com` → ATLVS project
- `compvss.ghxstship.com` → COMPVSS project
- `gvteway.com` → GVTEWAY project

## Testing

### Unit Tests

```bash
pnpm test:unit
```

### End-to-End Tests

```bash
# Run all e2e tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e apps/gvteway/e2e/events.spec.ts
```

### Test Coverage

```bash
pnpm test:coverage
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
pnpm clean && pnpm install && pnpm build
```

**Supabase connection issues**
```bash
supabase status  # Check if Supabase is running
supabase db reset  # Reset local database
```

**Port already in use**
```bash
lsof -i :3000  # Find process using port
kill -9 <PID>  # Kill the process
```

## Support

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Email**: support@ghxstship.com

## License

Proprietary - GHXSTSHIP Industries © 2024

---

Built with ❤️ by GHXSTSHIP Industries
