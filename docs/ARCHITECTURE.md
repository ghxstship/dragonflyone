# GHXSTSHIP Platform Architecture

## System Overview

GHXSTSHIP is a tri-platform ecosystem built on a modern, scalable architecture designed for the live entertainment industry.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CDN (Vercel Edge)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   ATLVS     │    │  COMPVSS    │    │  GVTEWAY    │                      │
│  │  Next.js    │    │  Next.js    │    │  Next.js    │                      │
│  │  :3001      │    │  :3002      │    │  :3000      │                      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                      │
│         │                  │                  │                              │
│         └──────────────────┼──────────────────┘                              │
│                            │                                                 │
│  ┌─────────────────────────┴─────────────────────────┐                      │
│  │              Shared Packages                       │                      │
│  │  @ghxstship/ui  │  @ghxstship/config  │  sdk      │                      │
│  └─────────────────────────┬─────────────────────────┘                      │
│                            │                                                 │
├────────────────────────────┼────────────────────────────────────────────────┤
│                            │                                                 │
│  ┌─────────────────────────┴─────────────────────────┐                      │
│  │                    Supabase                        │                      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │                      │
│  │  │PostgreSQL│  │   Auth   │  │ Storage  │        │                      │
│  │  └──────────┘  └──────────┘  └──────────┘        │                      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │                      │
│  │  │ Realtime │  │Edge Funcs│  │  Vectors │        │                      │
│  │  └──────────┘  └──────────┘  └──────────┘        │                      │
│  └───────────────────────────────────────────────────┘                      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         External Services                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Stripe  │  │  Resend  │  │  Twilio  │  │   n8n    │  │ Analytics│      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **@ghxstship/ui** | Custom component library |
| **React Query** | Server state management |
| **Zustand** | Client state management |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Supabase** | Database, Auth, Storage, Realtime |
| **Edge Functions** | Serverless compute |
| **Zod** | Runtime validation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting and deployment |
| **Supabase Cloud** | Managed PostgreSQL |
| **Cloudflare** | CDN and DDoS protection |
| **GitHub Actions** | CI/CD pipelines |

### Integrations

| Service | Purpose |
|---------|---------|
| **Stripe** | Payment processing |
| **Resend** | Transactional email |
| **Twilio** | SMS notifications |
| **n8n** | Workflow automation |
| **Sentry** | Error tracking |

## Application Architecture

### Monorepo Structure

```
dragonflyone/
├── apps/
│   ├── atlvs/           # Business operations
│   ├── compvss/         # Production management
│   └── gvteway/         # Consumer platform
├── packages/
│   ├── ui/              # Shared components
│   ├── config/          # Shared utilities
│   ├── api-specs/       # OpenAPI specs
│   └── sdk/             # Generated clients
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
└── infrastructure/      # IaC configurations
```

### App Architecture (Next.js)

```
app/
├── (auth)/              # Auth routes (grouped)
│   ├── login/
│   └── signup/
├── api/                 # API routes
│   ├── events/
│   ├── orders/
│   └── webhooks/
├── dashboard/           # Protected routes
├── events/
│   ├── [id]/           # Dynamic routes
│   └── page.tsx
├── layout.tsx           # Root layout
└── page.tsx             # Home page
```

### Component Architecture

```
@ghxstship/ui/
├── atoms/               # Basic elements
│   ├── Button/
│   ├── Input/
│   └── Typography/
├── molecules/           # Composed elements
│   ├── Card/
│   ├── DataTable/
│   └── SearchFilter/
├── organisms/           # Complex components
│   ├── Navigation/
│   ├── Modal/
│   └── SeatingChart/
├── templates/           # Page layouts
│   ├── PageLayout/
│   └── AppShell/
└── utils/               # Utilities
    ├── hooks/
    └── helpers/
```

## Database Architecture

### Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Core Entities                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │organizations │───▶│ departments  │    │platform_users│       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   projects   │───▶│    tasks     │    │  user_roles  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │    events    │───▶│ ticket_types │───▶│   tickets    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                       │                │
│         ▼                                       ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │    venues    │    │    orders    │◀───│ order_items  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Tables

| Table | Description |
|-------|-------------|
| `organizations` | Multi-tenant organization data |
| `platform_users` | User accounts and profiles |
| `user_roles` | Role assignments (platform + event) |
| `projects` | Project management data |
| `events` | Event listings and details |
| `ticket_types` | Ticket pricing and inventory |
| `tickets` | Individual ticket instances |
| `orders` | Purchase transactions |
| `ledger_entries` | Financial transactions |
| `assets` | Equipment inventory |
| `crew_members` | Production crew data |

### Row Level Security (RLS)

All tables implement RLS policies:

```sql
-- Example: Users can only see their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
```

## API Architecture

### Middleware Stack

```typescript
// Request flow through middleware
Request
  │
  ├─▶ Security Headers
  │
  ├─▶ CORS Validation
  │
  ├─▶ Rate Limiting
  │
  ├─▶ Authentication
  │
  ├─▶ Authorization (Role Check)
  │
  ├─▶ Request Validation (Zod)
  │
  ├─▶ Handler Logic
  │
  ├─▶ Audit Logging
  │
  └─▶ Response
```

### API Route Pattern

```typescript
import { apiRoute } from '@ghxstship/config';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  date: z.string().datetime(),
});

export const POST = apiRoute(
  async (request, context) => {
    const { user, validated } = context;
    
    // Business logic here
    const event = await createEvent(validated, user.id);
    
    return NextResponse.json({ data: event }, { status: 201 });
  },
  {
    auth: true,
    roles: ['GVTEWAY_ADMIN', 'EXPERIENCE_CREATOR'],
    validation: schema,
    rateLimit: { maxRequests: 10, windowMs: 60000 },
    audit: { action: 'event:create', resource: 'events' },
  }
);
```

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Next.js │────▶│ Supabase │────▶│ Database │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Login      │                │                │
     │───────────────▶│                │                │
     │                │  2. Verify     │                │
     │                │───────────────▶│                │
     │                │                │  3. Check user │
     │                │                │───────────────▶│
     │                │                │◀───────────────│
     │                │  4. JWT Token  │                │
     │                │◀───────────────│                │
     │  5. Set Cookie │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │  6. API Call   │                │                │
     │───────────────▶│                │                │
     │                │  7. Verify JWT │                │
     │                │───────────────▶│                │
     │                │◀───────────────│                │
     │  8. Response   │                │                │
     │◀───────────────│                │                │
```

## Real-time Architecture

### Supabase Realtime

```typescript
// Subscribe to changes
const channel = supabase
  .channel('events')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'events' },
    (payload) => {
      handleEventChange(payload);
    }
  )
  .subscribe();
```

### Use Cases

| Feature | Implementation |
|---------|----------------|
| Live ticket availability | Realtime subscription on `ticket_types` |
| Order notifications | Broadcast channel for user orders |
| Crew assignments | Realtime updates on `crew_assignments` |
| Chat/messaging | Presence channels |

## Caching Strategy

### Cache Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Cache                           │
│  - Static assets (1 year)                                   │
│  - API responses (stale-while-revalidate)                   │
├─────────────────────────────────────────────────────────────┤
│                      CDN Cache (Vercel)                      │
│  - Static pages (ISR)                                       │
│  - API responses (Cache-Control headers)                    │
├─────────────────────────────────────────────────────────────┤
│                    Application Cache                         │
│  - React Query (in-memory)                                  │
│  - Zustand (client state)                                   │
├─────────────────────────────────────────────────────────────┤
│                     Database Cache                           │
│  - Supabase connection pooling                              │
│  - Materialized views for analytics                         │
└─────────────────────────────────────────────────────────────┘
```

### Cache Invalidation

```typescript
// Invalidate on mutation
const mutation = useMutation({
  mutationFn: updateEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  },
});
```

## Deployment Architecture

### CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  GitHub  │────▶│  Actions │────▶│  Vercel  │────▶│Production│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  Push/PR       │                │                │
     │───────────────▶│                │                │
     │                │  1. Lint       │                │
     │                │  2. Type Check │                │
     │                │  3. Test       │                │
     │                │  4. Build      │                │
     │                │───────────────▶│                │
     │                │                │  5. Deploy     │
     │                │                │───────────────▶│
     │                │                │                │
     │  PR: Preview   │                │                │
     │  Main: Prod    │                │                │
```

### Environment Strategy

| Branch | Environment | URL |
|--------|-------------|-----|
| `feature/*` | Preview | `feature-*.vercel.app` |
| `develop` | Staging | `staging.ghxstship.com` |
| `main` | Production | `ghxstship.com` |

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Edge Security                             │
│  - DDoS protection (Cloudflare)                             │
│  - WAF rules                                                │
│  - Rate limiting                                            │
├─────────────────────────────────────────────────────────────┤
│                  Application Security                        │
│  - HTTPS only                                               │
│  - Security headers (CSP, HSTS, etc.)                       │
│  - CORS validation                                          │
│  - Input validation (Zod)                                   │
├─────────────────────────────────────────────────────────────┤
│                  Authentication                              │
│  - JWT tokens (short-lived)                                 │
│  - Refresh token rotation                                   │
│  - MFA support                                              │
├─────────────────────────────────────────────────────────────┤
│                   Authorization                              │
│  - Role-based access control                                │
│  - Row Level Security (RLS)                                 │
│  - Permission-based checks                                  │
├─────────────────────────────────────────────────────────────┤
│                    Data Security                             │
│  - Encryption at rest                                       │
│  - Encryption in transit                                    │
│  - PII handling compliance                                  │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Monitoring Stack

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Performance metrics |
| **Sentry** | Error tracking |
| **Supabase Dashboard** | Database metrics |
| **Custom Logging** | Application logs |

### Key Metrics

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| API Response Time (p95) | < 200ms |
| Error Rate | < 0.1% |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

## Scaling Considerations

### Horizontal Scaling

- **Vercel**: Auto-scales serverless functions
- **Supabase**: Connection pooling with PgBouncer
- **CDN**: Edge caching reduces origin load

### Database Scaling

- **Read replicas**: For read-heavy workloads
- **Connection pooling**: Efficient connection management
- **Materialized views**: Pre-computed analytics

### Future Scaling Options

- **Redis**: For session storage and caching
- **Queue system**: For background job processing
- **Microservices**: If monolith becomes unwieldy

## Disaster Recovery

### Backup Strategy

| Data | Frequency | Retention |
|------|-----------|-----------|
| Database | Daily | 30 days |
| File storage | Daily | 90 days |
| Logs | Continuous | 7 days |

### Recovery Procedures

1. **Database**: Point-in-time recovery via Supabase
2. **Application**: Rollback via Vercel deployment history
3. **Configuration**: Restore from version control

### RTO/RPO Targets

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 1 hour |
