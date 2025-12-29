# COMPVSS - Crew & Production Management Platform

COMPVSS is a comprehensive crew and production management platform within the GHXSTSHIP ecosystem. It enables production companies to manage crew members, equipment, projects, schedules, and safety compliance for live events and productions.

## Features

- **Crew Management**: Directory of vetted production professionals with skills, certifications, and availability tracking
- **Equipment Inventory**: Track and manage production equipment with check-out/check-in workflows
- **Project Management**: Manage productions from intake through post-production phases
- **Schedule Management**: Coordinate crew schedules, call sheets, and shift assignments
- **Safety & Compliance**: Safety documentation, incident reporting, and certification tracking
- **Credentials Management**: Track crew certifications, licenses, and compliance documents
- **Vendor Portal**: Manage vendor relationships and equipment rentals

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with GHXSTSHIP Design System
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth (Google, Apple)
- **State Management**: React Query (TanStack Query)
- **Validation**: Zod
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account (for database and auth)

### Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_URL` - Application URL (e.g., http://localhost:3001)

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# Run COMPVSS development server
pnpm dev --filter=compvss

# Or from this directory
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

### Building

```bash
pnpm build --filter=compvss
```

### Testing

```bash
# Unit tests
pnpm test --filter=compvss

# E2E tests
pnpm test:e2e --filter=compvss

# Type checking
pnpm typecheck --filter=compvss

# Linting
pnpm lint --filter=compvss
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/    # Protected routes (require auth)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── crew/           # Crew management
│   │   ├── equipment/      # Equipment inventory
│   │   ├── projects/       # Project management
│   │   ├── schedule/       # Scheduling
│   │   └── safety/         # Safety & compliance
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── crew/           # Crew CRUD operations
│   │   ├── equipment/      # Equipment operations
│   │   └── projects/       # Project operations
│   └── auth/               # Public auth pages
├── components/             # App-specific components
├── hooks/                  # React Query hooks for data fetching
├── lib/                    # Utilities and helpers
└── providers/              # Context providers
```

## RBAC (Role-Based Access Control)

COMPVSS uses platform roles for access control:

- **COMPVSS_ADMIN**: Full access to all features
- **COMPVSS_TEAM_MEMBER**: Can manage crew, equipment, and projects
- **COMPVSS_VIEWER**: Read-only access to data

Legend roles (LEGEND_ADMIN, LEGEND_SUPER_ADMIN) have full access across all platforms.

## API Documentation

API routes follow RESTful conventions with:
- Zod validation for request bodies
- RBAC enforcement via middleware
- Rate limiting (100 requests/minute for API, 10/minute for auth)
- Audit logging for sensitive operations

See `/docs/api/API_DOCUMENTATION.md` for detailed API documentation.

## Deployment

COMPVSS is deployed to Vercel with the following configuration:

- **Region**: US East (iad1)
- **Framework**: Next.js
- **Build Command**: `pnpm turbo run build --filter=compvss`
- **Output Directory**: `.next`

Cron jobs are configured for:
- Equipment sync: Daily at midnight
- Crew notifications: Every 6 hours

## Related Documentation

- [Architecture Overview](/docs/architecture/ARCHITECTURE.md)
- [Data Flow Architecture](/docs/architecture/DATA_FLOW_ARCHITECTURE.md)
- [API Documentation](/docs/api/API_DOCUMENTATION.md)
- [Deployment Readiness Audit](/apps/compvss/DEPLOYMENT_READINESS_AUDIT.md)

## License

Proprietary - GHXSTSHIP Platform
