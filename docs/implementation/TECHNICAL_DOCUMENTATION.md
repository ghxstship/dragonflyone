# GHXSTSHIP Platform - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Procedures](#deployment-procedures)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Security](#security)
10. [Monitoring & Logging](#monitoring--logging)

## Architecture Overview

### System Architecture

GHXSTSHIP is a monorepo-based platform ecosystem consisting of three primary applications:

```
┌──────────────────────────────────────────────────────────────┐
│                    GHXSTSHIP Platform                         │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   ATLVS     │  │  COMPVSS    │  │  GVTEWAY    │          │
│  │  Business   │  │ Production  │  │  Consumer   │          │
│  │    Ops      │  │  Operations │  │  Platform   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                 │                  │
│         └────────────────┴─────────────────┘                 │
│                          │                                    │
│         ┌────────────────┴────────────────┐                  │
│         │      Shared Packages            │                  │
│         │  • @ghxstship/ui (Design System)│                  │
│         │  • @ghxstship/config (Utilities)│                  │
│         │  • @ghxstship/types (Types)     │                  │
│         └─────────────────────────────────┘                  │
│                          │                                    │
│         ┌────────────────┴────────────────┐                  │
│         │     Infrastructure Layer         │                  │
│         │  • Supabase (Database, Auth)     │                  │
│         │  • Stripe (Payments)             │                  │
│         │  • Vercel (Hosting)              │                  │
│         └──────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom Design System (@ghxstship/ui)
- **State Management:** React Context + Hooks
- **Forms:** Zod validation
- **API Client:** Native Fetch with TypeScript

**Backend:**
- **API:** Next.js API Routes (Serverless Functions)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth with JWT
- **Real-time:** Supabase Realtime Subscriptions
- **File Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions

**Payment Processing:**
- **Provider:** Stripe
- **Integration:** Stripe Checkout, Payment Intents, Webhooks
- **Reconciliation:** Automated daily reconciliation

**Infrastructure:**
- **Hosting:** Vercel
- **Database:** Supabase (Managed PostgreSQL)
- **CI/CD:** GitHub Actions
- **Monorepo:** Turborepo + pnpm

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Supabase CLI
- Git

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Dragonflyone
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   
   Create `.env.local` files in each app directory:
   
   **apps/atlvs/.env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

   **apps/compvss/.env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3002
   ```

   **apps/gvteway/.env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   NEXT_PUBLIC_APP_URL=http://localhost:3003
   ```

4. **Start Supabase Local Development**
   ```bash
   supabase start
   supabase db reset # Apply all migrations
   ```

5. **Run Development Servers**
   ```bash
   # Run all apps
   pnpm dev

   # Or run individual apps
   pnpm dev --filter=atlvs
   pnpm dev --filter=compvss
   pnpm dev --filter=gvteway
   ```

6. **Access Applications**
   - ATLVS: http://localhost:3001
   - COMPVSS: http://localhost:3002
   - GVTEWAY: http://localhost:3003

## Database Schema

### Core Tables

**Platform Users & Authentication**
- `platform_users` - User accounts across all platforms
- `user_roles` - Role assignments (platform and event-level)
- `user_permissions` - Custom permission grants

**ATLVS (Business Operations)**
- `projects` - Executive project management
- `deals` - CRM deal pipeline
- `contacts` - Contact management
- `organizations` - Organization/company profiles
- `departments` - Organizational departments
- `assets` - Asset registry and tracking
- `ledger_accounts` - Chart of accounts
- `ledger_entries` - Financial transactions
- `purchase_orders` - Procurement management
- `purchase_order_items` - PO line items
- `employees` - Workforce management
- `vendors` - Vendor database

**COMPVSS (Production Operations)**
- `production_projects` - Production-specific projects
- `crew_members` - Crew database
- `crew_assignments` - Project crew assignments
- `run_of_shows` - Event timelines
- `run_of_show_cues` - Timeline cues
- `advancing_requests` - Production advancing
- `equipment` - Equipment inventory
- `safety_incidents` - Safety tracking

**GVTEWAY (Consumer Platform)**
- `events` - Event listings
- `ticket_types` - Ticket configurations
- `orders` - Order management
- `order_items` - Order line items
- `venues` - Venue directory
- `memberships` - Membership tiers
- `gvteway_stripe_events` - Stripe webhook events

**Integration & Sync**
- `integration_sync_jobs` - Cross-platform sync jobs
- `integration_events` - Integration event log
- `reconciliation_logs` - Financial reconciliation

### Row Level Security (RLS)

All tables implement RLS policies based on:
- Platform roles (ATLVS_ADMIN, COMPVSS_TEAM_MEMBER, etc.)
- Event roles (EXECUTIVE, CREW, VIP, etc.)
- Legend roles (god-mode access)
- Resource ownership

Example policy:
```sql
CREATE POLICY "Users can view their assigned projects"
ON projects FOR SELECT
USING (
  auth.uid() = created_by OR
  auth.uid() IN (
    SELECT user_id FROM project_assignments WHERE project_id = projects.id
  )
);
```

## API Documentation

### API Architecture

All APIs follow a consistent pattern using the `apiRoute` middleware wrapper:

```typescript
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    // Handler logic
    return NextResponse.json({ data });
  },
  {
    auth: true, // Require authentication
    roles: [PlatformRole.ADMIN], // Required roles
    permission: 'resource:action', // Required permission
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    validation: zodSchema, // Request validation
    audit: { action: 'resource:action', resource: 'resource_name' },
  }
);
```

### API Endpoints by Platform

**ATLVS APIs** (`/apps/atlvs/src/app/api/`)
- `/api/projects` - Project management
- `/api/deals` - Deal pipeline
- `/api/contacts` - Contact management
- `/api/assets` - Asset tracking
- `/api/ledger-accounts` - Ledger management
- `/api/ledger-entries` - Financial transactions
- `/api/employees` - Workforce management
- `/api/vendors` - Vendor management
- `/api/purchase-orders` - Procurement
- `/api/analytics` - Business analytics
- `/api/search` - Multi-table search

**COMPVSS APIs** (`/apps/compvss/src/app/api/`)
- `/api/projects` - Production projects
- `/api/crew` - Crew management
- `/api/run-of-show` - Event timelines
- `/api/advancing` - Advancing requests
- `/api/equipment` - Equipment inventory
- `/api/opportunities` - Job listings
- `/api/search` - Multi-type search

**GVTEWAY APIs** (`/apps/gvteway/src/app/api/`)
- `/api/events` - Event listings
- `/api/tickets` - Ticket management
- `/api/orders` - Order processing
- `/api/venues` - Venue directory
- `/api/memberships` - Membership management
- `/api/checkout/session` - Stripe checkout
- `/api/webhooks/stripe` - Stripe webhooks
- `/api/admin/refunds` - Refund processing
- `/api/admin/reconciliation` - Financial reconciliation
- `/api/admin/payouts` - Payout management

### Authentication

All authenticated requests require:
- `Authorization: Bearer <token>` header (JWT from Supabase Auth)
- Valid user session
- Appropriate role assignments

### Error Responses

Standard error format:
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Environment Configuration

### Required Environment Variables

**Supabase (All Apps)**
```env
NEXT_PUBLIC_SUPABASE_URL=<project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

**Stripe (GVTEWAY)**
```env
STRIPE_SECRET_KEY=<secret_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<publishable_key>
```

**Application URLs**
```env
NEXT_PUBLIC_APP_URL=<base_url>
```

### Secrets Management

**Development:** Use `.env.local` files (never commit)
**Production:** Use Vercel environment variables

1. Navigate to Vercel project settings
2. Add environment variables under "Environment Variables"
3. Set appropriate environment (Production/Preview/Development)
4. Use encrypted secrets for sensitive data

## Deployment Procedures

### Vercel Deployment

**Prerequisites:**
- Vercel account with appropriate permissions
- GitHub repository connected to Vercel
- Environment variables configured

**Deployment Workflow:**

1. **Feature Branch Deployment (Preview)**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   ```
   - Vercel automatically creates preview deployment
   - Test on preview URL
   - QA and stakeholder review

2. **Production Deployment**
   ```bash
   # Merge to main branch
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```
   - Vercel automatically deploys to production
   - Monitor deployment logs
   - Verify deployment health

3. **Manual Deployment**
   ```bash
   vercel --prod
   ```

**Rollback Procedure:**
1. Navigate to Vercel dashboard
2. Select deployment to rollback to
3. Click "Promote to Production"
4. Verify rollback successful

### Database Migrations

**Create New Migration:**
```bash
supabase migration new <migration_name>
# Edit migration file in supabase/migrations/
```

**Apply Migrations (Development):**
```bash
supabase db reset # Fresh reset with all migrations
# OR
supabase db push # Push new migrations only
```

**Apply Migrations (Production):**
```bash
supabase db push --linked --include-seed=false
```

**Migration Best Practices:**
- Always test migrations locally first
- Use transactions for data migrations
- Include rollback scripts
- Document breaking changes

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `release/*` - Release candidates
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Code Standards

**TypeScript:**
- Strict mode enabled
- No implicit `any`
- Explicit return types for functions
- Interface over type when possible

**React/Next.js:**
- Functional components with hooks
- Server components by default
- Client components only when necessary
- Use Next.js Image component for images

**Styling:**
- Use Tailwind CSS utilities
- Use design system tokens
- Follow design system component patterns
- Mobile-first responsive design

### Testing

**Run Tests:**
```bash
pnpm test # All tests
pnpm test:coverage # With coverage
pnpm test:watch # Watch mode
```

**Test Structure:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Component/Function Name', () => {
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    expect(result).toBe(expected);
  });
});
```

## Security

### Authentication & Authorization

- **Authentication:** Supabase Auth with JWT tokens
- **Session Management:** HTTP-only cookies
- **Password Requirements:** Minimum 8 characters, complexity enforced
- **MFA:** Available for Legend roles

### Role-Based Access Control (RBAC)

Three-tier role system:
1. **Platform Roles:** ATLVS_ADMIN, COMPVSS_TEAM_MEMBER, etc.
2. **Event Roles:** EXECUTIVE, CREW, VIP, etc.
3. **Legend Roles:** God-mode access (requires @ghxstship.pro email)

### API Security

- **Authentication:** Required for all protected endpoints
- **Rate Limiting:** Configured per endpoint
- **Input Validation:** Zod schemas on all inputs
- **SQL Injection Prevention:** Parameterized queries via Supabase
- **XSS Protection:** React escaping + Content Security Policy
- **CSRF Protection:** SameSite cookies + Origin validation

### Data Protection

- **Encryption at Rest:** Supabase-managed encryption
- **Encryption in Transit:** HTTPS enforced
- **PII Handling:** Minimal collection, encrypted storage
- **Audit Logging:** All sensitive operations logged

## Monitoring & Logging

### Application Monitoring

**Vercel Analytics:**
- Web Vitals tracking
- Error tracking
- Performance monitoring

**Supabase Dashboard:**
- Database performance
- API usage
- Real-time connections

### Logging

**Application Logs:**
```typescript
console.log('[INFO]', 'Message'); // Info
console.error('[ERROR]', 'Message'); // Errors
```

**Audit Logs:**
All sensitive operations automatically logged via middleware:
- User actions (create, update, delete)
- Authentication events
- Permission changes
- Financial transactions

### Alerting

**Setup Alerts For:**
- High error rates (>5% of requests)
- Slow API responses (>2s p95)
- Database connection issues
- Failed deployments
- Stripe webhook failures
- Security events

## Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Reset Supabase
supabase stop
supabase start
```

**TypeScript Errors:**
```bash
# Regenerate types
pnpm supabase gen types typescript --local > packages/config/supabase-types.ts
```

**Build Failures:**
```bash
# Clear cache
pnpm clean
pnpm install
pnpm build
```

**Stripe Webhook Testing:**
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3003/api/webhooks/stripe
```

## Additional Resources

- [Master Roadmap](./MASTER_ROADMAP.md)
- [API Specifications](./packages/api-specs/)
- [Design System](./packages/ui/README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** November 24, 2024
**Version:** 1.0.0
