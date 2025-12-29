# ATLVS

**Executive Control Surface for GHXSTSHIP Industries**

ATLVS is the enterprise production management platform for event producers, production companies, and entertainment industry professionals. It provides comprehensive tools for project management, financial tracking, team coordination, and client relations.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Features

### Core Modules

- **Dashboard** - Real-time overview of projects, tasks, and KPIs
- **Projects** - Full project lifecycle management with Gantt charts and milestones
- **Finance** - Budgeting, invoicing, expense tracking, and financial reporting
- **CRM** - Client and lead management with pipeline visualization
- **Team** - Workforce management, scheduling, and time tracking
- **Vendors** - Vendor database, contracts, and performance tracking
- **Advancing** - Event advancing workflows and rider management
- **Calendar** - Integrated scheduling with resource allocation

### Enterprise Features

- **RBAC** - Role-based access control with granular permissions
- **Multi-tenancy** - Organization-level data isolation
- **Audit Logging** - Complete audit trail for compliance
- **SSO** - Single sign-on with OAuth providers
- **API** - RESTful API for integrations

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | @ghxstship/ui (Design System) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| State Management | React Query (TanStack Query) |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |
| Monitoring | Vercel Analytics + Speed Insights |

## Getting Started

### Prerequisites

- Node.js 18.18+
- pnpm 8+
- Supabase account (for database)

### Installation

```bash
# Clone the monorepo
git clone https://github.com/ghxstship/dragonflyone.git
cd dragonflyone

# Install dependencies
pnpm install

# Navigate to ATLVS
cd apps/atlvs

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payments (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Communications (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

See `.env.example` for the complete list of environment variables.

## Project Structure

```
apps/atlvs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (authenticated)/    # Protected routes
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   └── ...                 # Public pages
│   ├── components/             # App-specific components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # Test files
```

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run type checker
pnpm typecheck

# Run tests
pnpm test
```

### Code Style

This project uses:
- **ESLint** - Linting with custom rules for design system enforcement
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking

The design system enforces:
- Use of `@ghxstship/ui` components (no raw HTML elements)
- Design system tokens for colors, spacing, typography
- Accessibility best practices

### Database Migrations

```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset
```

## Testing

### Unit Tests

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### E2E Tests

```bash
# Run Playwright tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/auth.spec.ts

# Open Playwright UI
pnpm test:e2e --ui
```

## Deployment

### Production Deployment

ATLVS is deployed to Vercel via GitHub Actions:

1. Push to `main` branch triggers CI pipeline
2. Lint, typecheck, and tests must pass
3. Automatic deployment to production

### Manual Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Setup

Ensure all environment variables are configured in Vercel:
- Project Settings > Environment Variables
- Add variables for Production, Preview, and Development

## Architecture

### Authentication Flow

```
User → Supabase Auth → JWT Token → Middleware → Protected Routes
```

### Data Flow

```
UI Component → React Query Hook → API Route → Supabase → PostgreSQL
```

### RBAC System

Roles are defined in `packages/config/roles.ts`:
- `ATLVS_SUPER_ADMIN` - Full system access
- `ATLVS_ADMIN` - Administrative access
- `ATLVS_TEAM_MEMBER` - Standard user access
- `ATLVS_VIEWER` - Read-only access

### Security

- **CSRF Protection** - Double Submit Cookie pattern
- **XSS Prevention** - DOMPurify sanitization
- **RLS** - Row-Level Security on all tables
- **Rate Limiting** - API rate limiting in middleware
- **Security Headers** - CSP, HSTS, X-Frame-Options

## Contributing

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new dashboard widget
fix: resolve authentication redirect issue
docs: update API documentation
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Run `pnpm lint` and `pnpm typecheck`
4. Create PR with description
5. Wait for CI to pass
6. Request review

## Documentation

- [API Documentation](./docs/api/)
- [Architecture Guide](../../docs/architecture/)
- [Incident Runbook](./docs/INCIDENT_RUNBOOK.md)
- [Backup Verification](./docs/BACKUP_VERIFICATION.md)
- [Deployment Audit](./DEPLOYMENT_READINESS_AUDIT.md)

## Support

- **Issues:** [GitHub Issues](https://github.com/ghxstship/dragonflyone/issues)
- **Documentation:** [Help Center](/help)
- **Email:** support@ghxstship.com

## License

Proprietary - GHXSTSHIP Industries

---

Built with care by the GHXSTSHIP team.
