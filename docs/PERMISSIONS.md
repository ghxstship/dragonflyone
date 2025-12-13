# GHXSTSHIP Platform - Permissions Documentation

> **Gap 11 Remediation**: Auto-generated permission documentation for users
> **Last Updated**: December 2025

---

## Table of Contents

1. [Platform Roles](#platform-roles)
2. [Role Hierarchy](#role-hierarchy)
3. [Permissions by Role](#permissions-by-role)
4. [Event Roles](#event-roles)
5. [Finance Permissions](#finance-permissions)
6. [Portal Access](#portal-access)

---

## Platform Roles

### Legend Roles (God Mode)

These roles have unrestricted access across all platforms. Requires `@ghxstship.pro` email.

| Role | Level | Description |
|------|-------|-------------|
| `LEGEND_SUPER_ADMIN` | God | Absolute platform control across all systems |
| `LEGEND_ADMIN` | God | Internal product management with cross-app access |
| `LEGEND_DEVELOPER` | God | Full repository access, internal product team |
| `LEGEND_COLLABORATOR` | God | External scoped full repo access |
| `LEGEND_SUPPORT` | God | Tech support with conditional user impersonation |
| `LEGEND_INCOGNITO` | God | Stealth mode operations with unrestricted impersonation |

### ATLVS Roles

| Role | Level | Inherits From | Description |
|------|-------|---------------|-------------|
| `ATLVS_SUPER_ADMIN` | Admin | ATLVS_ADMIN | Full system administration and configuration |
| `ATLVS_ADMIN` | Admin | ATLVS_TEAM_MEMBER | Administrative access to business operations |
| `ATLVS_TEAM_MEMBER` | Member | ATLVS_VIEWER | Work on assigned tasks and projects |
| `ATLVS_VIEWER` | Viewer | - | Read-only access to business data |

### COMPVSS Roles

| Role | Level | Inherits From | Description |
|------|-------|---------------|-------------|
| `COMPVSS_ADMIN` | Admin | COMPVSS_TEAM_MEMBER | Full administrative access to production operations |
| `COMPVSS_TEAM_MEMBER` | Member | COMPVSS_VIEWER | Work on assigned events and productions |
| `COMPVSS_COLLABORATOR` | Member | COMPVSS_VIEWER | Limited event access for external collaborators |
| `COMPVSS_VIEWER` | Viewer | - | Read-only access to production data |

### GVTEWAY Roles

| Role | Level | Description |
|------|-------|-------------|
| `GVTEWAY_ADMIN` | Admin | Full platform administration |
| `GVTEWAY_EXPERIENCE_CREATOR` | Manager | Create and manage experiences/events |
| `GVTEWAY_VENUE_MANAGER` | Manager | Manage venue profiles and operations |
| `GVTEWAY_ARTIST_VERIFIED` | Member | Verified artist with enhanced features |
| `GVTEWAY_ARTIST` | Member | Artist profile and fan engagement |
| `GVTEWAY_MEMBER_EXTRA` | Member | Premium membership with exclusive benefits |
| `GVTEWAY_MEMBER_PLUS` | Member | Enhanced membership with early access |
| `GVTEWAY_MEMBER` | Member | Standard member access |
| `GVTEWAY_MEMBER_GUEST` | Member | Temporary guest access |
| `GVTEWAY_AFFILIATE` | Member | Affiliate marketing and referrals |
| `GVTEWAY_MODERATOR` | Manager | Content moderation and community management |

---

## Role Hierarchy

```
God (100)
  └── Legend Roles
        ├── LEGEND_SUPER_ADMIN
        ├── LEGEND_ADMIN
        ├── LEGEND_DEVELOPER
        ├── LEGEND_COLLABORATOR
        ├── LEGEND_SUPPORT
        └── LEGEND_INCOGNITO

Admin (80)
  └── Platform Admins
        ├── ATLVS_SUPER_ADMIN → ATLVS_ADMIN
        ├── COMPVSS_ADMIN
        └── GVTEWAY_ADMIN

Manager (60)
  └── Platform Managers
        ├── GVTEWAY_EXPERIENCE_CREATOR
        ├── GVTEWAY_VENUE_MANAGER
        └── GVTEWAY_MODERATOR

Member (40)
  └── Platform Members
        ├── ATLVS_TEAM_MEMBER
        ├── COMPVSS_TEAM_MEMBER
        ├── COMPVSS_COLLABORATOR
        └── GVTEWAY_* (Member roles)

Viewer (20)
  └── Read-Only Access
        ├── ATLVS_VIEWER
        └── COMPVSS_VIEWER
```

---

## Permissions by Role

### Event Management Permissions

| Permission | Legend | ATLVS Admin | ATLVS Member | COMPVSS Admin | GVTEWAY Admin |
|------------|--------|-------------|--------------|---------------|---------------|
| `events:create` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `events:edit` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `events:delete` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `events:view` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Ticketing Permissions

| Permission | Legend | ATLVS Admin | COMPVSS Admin | GVTEWAY Admin | GVTEWAY Member |
|------------|--------|-------------|---------------|---------------|----------------|
| `tickets:manage` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `orders:view` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `orders:view:own` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `orders:refund` | ✅ | ✅ | ❌ | ✅ | ❌ |

### Project & Task Permissions

| Permission | Legend | ATLVS Admin | ATLVS Member | COMPVSS Admin |
|------------|--------|-------------|--------------|---------------|
| `projects:create` | ✅ | ✅ | ❌ | ✅ |
| `projects:edit` | ✅ | ✅ | ❌ | ✅ |
| `projects:view` | ✅ | ✅ | ✅ | ✅ |
| `tasks:assign` | ✅ | ✅ | ❌ | ✅ |
| `tasks:view` | ✅ | ✅ | ✅ | ✅ |

### Budget & Finance Permissions

| Permission | Legend | ATLVS Admin | ATLVS Member | ATLVS Viewer |
|------------|--------|-------------|--------------|--------------|
| `budgets:manage` | ✅ | ✅ | ❌ | ❌ |
| `budgets:view` | ✅ | ✅ | ✅ | ✅ |

### Advancing Permissions

| Permission | Legend | ATLVS Admin | ATLVS Member | COMPVSS Admin | COMPVSS Member |
|------------|--------|-------------|--------------|---------------|----------------|
| `advancing:submit` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `advancing:approve` | ✅ | ✅ | ❌ | ✅ | ❌ |

### User Management Permissions

| Permission | Legend | ATLVS Super Admin | GVTEWAY Admin |
|------------|--------|-------------------|---------------|
| `users:manage` | ✅ | ✅ | ✅ |

### Venue Access Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `venue:access:all` | Full venue access | Legend, ATLVS Super Admin, COMPVSS Admin |
| `venue:access:restricted` | Limited area access | AA, COMPVSS Collaborator |
| `venue:access:production` | Production areas | Production role |
| `venue:access:crew` | Crew areas | Crew, COMPVSS Team Member |
| `venue:access:backstage` | Backstage access | Backstage L1/L2, Artists |
| `venue:access:vip` | VIP areas | VIP L1/L2/L3 |
| `venue:access:ga` | General admission | GA L1-L5 |

### Special Access Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `backstage:access` | Backstage entry | Executive, Core AAA, AA, Production, Crew, Artists |
| `greenroom:access` | Green room entry | Entertainers, Artists, Backstage L2 |
| `vip:lounge:access` | VIP lounge entry | Platinum VIP, VIP L3, Backstage L2 |
| `priority:entry` | Priority venue entry | Platinum VIP L2, GA L5 |
| `photo:pit:access` | Photo pit access | Media |

---

## Event Roles

Event roles are assigned per-event and determine access levels during events.

### All-Platform Access (Level 600+)

| Role | Level | Platforms | Key Permissions |
|------|-------|-----------|-----------------|
| EXECUTIVE | 1000 | ATLVS, COMPVSS, GVTEWAY | Full control, user management |
| CORE_AAA | 900 | ATLVS, COMPVSS, GVTEWAY | Event management, budget management |
| AA | 800 | ATLVS, COMPVSS, GVTEWAY | Event editing, task assignment |
| PRODUCTION | 700 | ATLVS, COMPVSS, GVTEWAY | Production area access |
| MANAGEMENT | 600 | ATLVS, COMPVSS, GVTEWAY | View access, budget viewing |

### COMPVSS-Only Roles

| Role | Level | Key Permissions |
|------|-------|-----------------|
| CREW | 500 | Crew area access, backstage |
| STAFF | 450 | Staff area access |
| VENDOR | 400 | Vendor area access, own orders |
| AGENT | 300 | Agent area access, client orders |
| INTERN | 100 | Intern area access |
| VOLUNTEER | 50 | Volunteer area access |

### GVTEWAY-Only Roles

| Role | Level | Key Permissions |
|------|-------|-----------------|
| BACKSTAGE_L2 | 500 | Full backstage, green room, VIP lounge |
| BACKSTAGE_L1 | 450 | Backstage access |
| PLATINUM_VIP_L2 | 400 | Platinum VIP, lounge, priority entry |
| VIP_L3 | 300 | VIP area, lounge access |
| GA_L5 | 150 | GA access, priority entry |
| GA_L1 | 60 | Basic GA access |

---

## Finance Permissions

Finance permissions are granular and can be assigned independently.

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `finance:view` | View financial data | ATLVS Admin, ATLVS Team Member |
| `finance:edit` | Edit financial records | ATLVS Admin |
| `finance:approve` | Approve expenses/budgets | ATLVS Admin |
| `finance:export` | Export financial data | ATLVS Super Admin only |

### Approval Limits

Finance permissions can include approval limits:
- Amount threshold (e.g., up to $10,000)
- Production restrictions (specific productions only)
- Department restrictions (specific departments only)
- Category restrictions (specific budget categories only)

---

## Portal Access

Portal users have scoped access to specific entities.

### Portal Types

| Portal | Entity Type | Access Scope |
|--------|-------------|--------------|
| Vendor Portal | Vendor | Own vendor record, contracts, POs |
| Sponsor Portal | Sponsor | Own sponsor record, activations |
| Investor Portal | Investor | Own investor record, rounds participated |
| Artist Portal | Artist | Own artist record, events |
| Crew Portal | Crew | Own crew record, assignments |

### Access Levels

| Level | Description |
|-------|-------------|
| `read` | View entity data only |
| `write` | View and edit entity data |
| `admin` | Full control over entity |

---

## Two-Factor Authentication (2FA)

### Required Roles

2FA is **required** for the following roles:
- All Legend roles
- ATLVS_SUPER_ADMIN, ATLVS_ADMIN
- COMPVSS_ADMIN
- GVTEWAY_ADMIN

### 2FA Features

- TOTP-based authentication (Google Authenticator, Authy, etc.)
- 8 backup codes for recovery
- Account lockout after 5 failed attempts (15 minute cooldown)
- Audit logging of all verification attempts

---

## Audit Logging

All permission changes are logged:
- Role assignments and removals
- Permission grants and revocations
- Portal access changes
- 2FA enable/disable
- Impersonation sessions
- API key creation/revocation

Audit logs are accessible to:
- Legend roles (all logs)
- Platform admins (organization-scoped logs)

---

*This documentation is auto-generated from the role system. For questions, contact your administrator.*
