# ATLVS - Business Operations Platform Inventory

**Application:** ATLVS (Atlas)  
**Purpose:** Business operations, finance, CRM, procurement, and HR management  
**Target Users:** Internal staff, finance team, procurement officers, HR managers  
**Last Updated:** November 23, 2025

---

## Pages Inventory (17 Total)

### Authentication
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/auth/signin` | `src/app/auth/signin/page.tsx` | ✅ | Sign-in page for staff |

### Core Application Pages
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/` | `src/app/page.tsx` | ✅ | Landing/home page |
| `/dashboard` | `src/app/dashboard/page.tsx` | ✅ | Main dashboard with KPIs |
| `/analytics` | `src/app/analytics/page.tsx` | 🟡 | Business analytics & insights |
| `/reports` | `src/app/reports/page.tsx` | 🟡 | Financial & operational reports |

### Project Management
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/projects` | `src/app/projects/page.tsx` | 🟡 | Projects list view |
| `/projects/[id]` | `src/app/projects/[id]/page.tsx` | 🟡 | Individual project details |

### CRM & Contacts
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/crm` | `src/app/crm/page.tsx` | 🟡 | CRM dashboard |
| `/contacts` | `src/app/contacts/page.tsx` | 🟡 | Contact management |
| `/deals` | `src/app/deals/page.tsx` | 🟡 | Deal pipeline & tracking |

### Vendor & Procurement
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/vendors` | `src/app/vendors/page.tsx` | 🟡 | Vendor directory |
| `/procurement` | `src/app/procurement/page.tsx` | 🟡 | Procurement requests & POs |

### Finance & Budgeting
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/finance` | `src/app/finance/page.tsx` | 🟡 | Financial overview |
| `/budgets` | `src/app/budgets/page.tsx` | 🟡 | Budget management |

### Asset & HR Management
| Route | File Path | Status | Description |
|-------|-----------|--------|-------------|
| `/assets` | `src/app/assets/page.tsx` | 🟡 | Asset inventory |
| `/employees` | `src/app/employees/page.tsx` | 🟡 | Employee directory |
| `/workforce` | `src/app/workforce/page.tsx` | 🟡 | Workforce management |

---

## Components Inventory (6 Total)

### Navigation Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `Navigation` | `src/components/navigation.tsx` | Layout | Main app navigation |
| `BusinessNavigation` | `src/components/business-navigation.tsx` | Layout | Business-specific nav |

### Form Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `ContactWizard` | `src/components/contact-wizard.tsx` | Form | Multi-step contact creation wizard |

### Display Components
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `ProjectCard` | `src/components/ProjectCard.tsx` | Display | Project summary card |
| `Section` | `src/components/section.tsx` | Layout | Reusable section wrapper |

### Route Protection
| Component | File Path | Type | Description |
|-----------|-----------|------|-------------|
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Auth | Route authentication wrapper |

---

## API Routes Inventory (22 Total)

### Assets Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/assets` | `src/app/api/assets/route.ts` | GET, POST | List/create assets |
| `/api/assets/[id]` | `src/app/api/assets/[id]/route.ts` | GET, PATCH, DELETE | Single asset operations |

### Budget Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/budgets` | `src/app/api/budgets/route.ts` | GET, POST | Budget operations |

### Contact Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/contacts` | `src/app/api/contacts/route.ts` | GET, POST | List/create contacts |
| `/api/contacts/[id]` | `src/app/api/contacts/[id]/route.ts` | GET, PATCH, DELETE | Single contact operations |

### Deal Pipeline
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/deals` | `src/app/api/deals/route.ts` | GET, POST | List/create deals |
| `/api/deals/[id]` | `src/app/api/deals/[id]/route.ts` | GET, PATCH, DELETE | Single deal operations |

### Department Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/departments` | `src/app/api/departments/route.ts` | GET, POST | List/create departments |
| `/api/departments/[id]` | `src/app/api/departments/[id]/route.ts` | GET, PATCH, DELETE | Single department operations |

### Employee Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/employees` | `src/app/api/employees/route.ts` | GET, POST | List/create employees |
| `/api/employees/[id]` | `src/app/api/employees/[id]/route.ts` | GET, PATCH, DELETE | Single employee operations |

### Financial Ledger
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/ledger-accounts` | `src/app/api/ledger-accounts/route.ts` | GET, POST | Chart of accounts |
| `/api/ledger-entries` | `src/app/api/ledger-entries/route.ts` | GET, POST | Ledger entry operations |

### Organization Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/organizations` | `src/app/api/organizations/route.ts` | GET, POST | List/create organizations |
| `/api/organizations/[id]` | `src/app/api/organizations/[id]/route.ts` | GET, PATCH, DELETE | Single org operations |

### Platform Users
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/platform-users` | `src/app/api/platform-users/route.ts` | GET, POST | Internal user management |

### Project Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/projects` | `src/app/api/projects/route.ts` | GET, POST | List/create projects |
| `/api/projects/[id]` | `src/app/api/projects/[id]/route.ts` | GET, PATCH, DELETE | Single project operations |

### Procurement
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/purchase-orders` | `src/app/api/purchase-orders/route.ts` | GET, POST | Purchase order management |

### Reporting
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/reports` | `src/app/api/reports/route.ts` | GET | Generate various reports |

### Vendor Management
| Endpoint | File Path | Methods | Description |
|----------|-----------|---------|-------------|
| `/api/vendors` | `src/app/api/vendors/route.ts` | GET, POST | List/create vendors |
| `/api/vendors/[id]` | `src/app/api/vendors/[id]/route.ts` | GET, PATCH, DELETE | Single vendor operations |

---

## Forms & Data Entry

### Contact Wizard Form
**Component:** `ContactWizard`  
**Steps:** 3-step wizard
1. **Engagement Brief** - Organization, initiative, timeline
2. **Operational Scope** - Asset requirements, crew disciplines
3. **Compliance + Access** - NDA status, security tier, primary contact

**Fields:**
- Organization (text)
- Initiative (text)
- Timeline (text)
- Asset Requirements (textarea)
- Crew Disciplines (textarea)
- NDA Status (text)
- Security Tier (text)
- Primary Contact (text)

---

## Key Features & Workflows

### Dashboard Features
- [ ] Key performance indicators (KPIs)
- [ ] Recent activity feed
- [ ] Quick actions
- [ ] Project status overview
- [ ] Financial summary

### Contact Management
- [x] Multi-step contact wizard
- [ ] Contact list with filtering
- [ ] Contact detail view
- [ ] Contact history tracking
- [ ] Integration with CRM

### Deal Pipeline
- [ ] Deal stages visualization
- [ ] Deal probability tracking
- [ ] Revenue forecasting
- [ ] Deal-to-project handoff workflow

### Financial Operations
- [ ] Budget creation & tracking
- [ ] Purchase order workflow
- [ ] Ledger entry management
- [ ] Financial reporting
- [ ] Vendor payment tracking

### Project Management
- [ ] Project creation
- [ ] Project timeline management
- [ ] Resource allocation
- [ ] Budget tracking per project
- [ ] Project status updates

---

## Build Checklist

### Phase 1: Core Infrastructure ✅
- [x] Page routing structure
- [x] API route definitions
- [x] Authentication setup
- [x] Basic navigation

### Phase 2: Component Development 🟡
- [x] Contact wizard form
- [ ] Project creation form
- [ ] Budget management UI
- [ ] Employee directory
- [ ] Vendor management
- [ ] Deal pipeline kanban
- [ ] Analytics dashboards

### Phase 3: Data Integration ⚪
- [ ] Connect all API routes to Supabase
- [ ] Implement RLS policies
- [ ] Add real-time subscriptions
- [ ] Error handling & validation

### Phase 4: Testing ⚪
- [ ] Unit tests for components
- [ ] Integration tests for APIs
- [ ] E2E tests for critical workflows
- [ ] Performance testing

---

## Database Tables Used

- `organizations`
- `projects`
- `contacts`
- `deals`
- `vendors`
- `purchase_orders`
- `assets`
- `employees`
- `departments`
- `ledger_accounts`
- `ledger_entries`
- `budgets`
- `platform_users`

See database migrations for complete schema details.
