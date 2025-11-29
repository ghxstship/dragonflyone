# Demo Login Credentials

All demo accounts use the same password: **`Demo123!`**

## Quick Reference

| App | Role | Email | Password |
|-----|------|-------|----------|
| **ATLVS** | Super Admin | `atlvs.superadmin@demo.ghxstship.com` | `Demo123!` |
| **ATLVS** | Admin | `atlvs.admin@demo.ghxstship.com` | `Demo123!` |
| **ATLVS** | Team Member | `atlvs.team@demo.ghxstship.com` | `Demo123!` |
| **ATLVS** | Viewer | `atlvs.viewer@demo.ghxstship.com` | `Demo123!` |
| **COMPVSS** | Admin | `compvss.admin@demo.ghxstship.com` | `Demo123!` |
| **COMPVSS** | Team Member | `compvss.team@demo.ghxstship.com` | `Demo123!` |
| **COMPVSS** | Collaborator | `compvss.collab@demo.ghxstship.com` | `Demo123!` |
| **COMPVSS** | Viewer | `compvss.viewer@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Admin | `gvteway.admin@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Experience Creator | `gvteway.creator@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Venue Manager | `gvteway.venue@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Verified Artist | `gvteway.artist@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Member Plus | `gvteway.member@demo.ghxstship.com` | `Demo123!` |
| **GVTEWAY** | Affiliate | `gvteway.affiliate@demo.ghxstship.com` | `Demo123!` |
| **Legend** | Super Admin | `legend.super@demo.ghxstship.com` | `Demo123!` |
| **Legend** | Developer | `legend.dev@demo.ghxstship.com` | `Demo123!` |
| **Legend** | Support | `legend.support@demo.ghxstship.com` | `Demo123!` |

---

## ATLVS (Business Operations Platform)

### ATLVS_SUPER_ADMIN
- **Email:** `atlvs.superadmin@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Full system administration, user management, all business operations

### ATLVS_ADMIN
- **Email:** `atlvs.admin@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Project management, task assignment, budget management

### ATLVS_TEAM_MEMBER
- **Email:** `atlvs.team@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** View projects, view tasks, view budgets

### ATLVS_VIEWER
- **Email:** `atlvs.viewer@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Read-only access to projects and tasks

---

## COMPVSS (Production Management Platform)

### COMPVSS_ADMIN
- **Email:** `compvss.admin@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Event management, project creation, task assignment, advancing approval

### COMPVSS_TEAM_MEMBER
- **Email:** `compvss.team@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** View events/projects, view tasks, submit advancing

### COMPVSS_COLLABORATOR
- **Email:** `compvss.collab@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Limited event access for external collaborators

### COMPVSS_VIEWER
- **Email:** `compvss.viewer@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Read-only access to events and projects

---

## GVTEWAY (Fan Experience Platform)

### GVTEWAY_ADMIN
- **Email:** `gvteway.admin@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Full platform administration, user management, event management

### GVTEWAY_EXPERIENCE_CREATOR
- **Email:** `gvteway.creator@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Create/edit events, manage tickets, view orders

### GVTEWAY_VENUE_MANAGER
- **Email:** `gvteway.venue@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Manage venue profiles and operations

### GVTEWAY_ARTIST_VERIFIED
- **Email:** `gvteway.artist@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Artist profile, fan engagement, view own orders

### GVTEWAY_MEMBER_PLUS
- **Email:** `gvteway.member@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Enhanced membership with early access

### GVTEWAY_AFFILIATE
- **Email:** `gvteway.affiliate@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Affiliate marketing, referrals, commission tracking

---

## Legend (God Mode - Cross-Platform Access)

> ⚠️ **Note:** Legend roles have full access across all platforms.

### LEGEND_SUPER_ADMIN
- **Email:** `legend.super@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Absolute platform control, user impersonation

### LEGEND_DEVELOPER
- **Email:** `legend.dev@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Full repository access, internal product team

### LEGEND_SUPPORT
- **Email:** `legend.support@demo.ghxstship.com`
- **Password:** `Demo123!`
- **Permissions:** Tech support, conditional user impersonation

---

## Setup Instructions

### 1. Run Database Migration
```bash
npx supabase db push --local
```

### 2. Seed Auth Users
```bash
npx tsx scripts/seed-demo-users.ts
```

### 3. Start Development Servers
```bash
# ATLVS (port 3001)
pnpm --filter atlvs dev --port 3001

# COMPVSS (port 3002)
pnpm --filter compvss dev --port 3002

# GVTEWAY (port 3000)
pnpm --filter gvteway dev
```

---

## Role Hierarchy

### ATLVS
```
ATLVS_SUPER_ADMIN
    └── ATLVS_ADMIN
        └── ATLVS_TEAM_MEMBER
            └── ATLVS_VIEWER
```

### COMPVSS
```
COMPVSS_ADMIN
    └── COMPVSS_TEAM_MEMBER
        └── COMPVSS_VIEWER
    └── COMPVSS_COLLABORATOR
        └── COMPVSS_VIEWER
```

### GVTEWAY
```
GVTEWAY_ADMIN
    ├── GVTEWAY_EXPERIENCE_CREATOR
    ├── GVTEWAY_VENUE_MANAGER
    ├── GVTEWAY_MODERATOR
    └── GVTEWAY_ARTIST_VERIFIED
        └── GVTEWAY_ARTIST
            └── GVTEWAY_MEMBER_EXTRA
                └── GVTEWAY_MEMBER_PLUS
                    └── GVTEWAY_MEMBER
                        └── GVTEWAY_MEMBER_GUEST
```

### Legend (God Mode)
```
LEGEND_SUPER_ADMIN ─┬─ Full access to all platforms
LEGEND_ADMIN ───────┤
LEGEND_DEVELOPER ───┤
LEGEND_INCOGNITO ───┤
LEGEND_COLLABORATOR ┤
LEGEND_SUPPORT ─────┘
```
