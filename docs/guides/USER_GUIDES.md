# GHXSTSHIP Platform User Guides

> **Version:** 2.0  
> **Last Updated:** December 31, 2025  
> **Platforms:** GVTEWAY (Consumer), ATLVS (Business Operations), COMPVSS (Production Operations)

---

## Table of Contents

### Part 1: Getting Started
1. [Platform Overview](#platform-overview)
2. [Account Creation & Onboarding](#account-creation--onboarding)
3. [Authentication Methods](#authentication-methods)
4. [Understanding Your Role](#understanding-your-role)

### Part 2: Complete User Journeys
5. [Consumer Journey (GVTEWAY)](#consumer-journey-gvteway)
6. [Business Operations Journey (ATLVS)](#business-operations-journey-atlvs)
7. [Production Operations Journey (COMPVSS)](#production-operations-journey-compvss)

### Part 3: End-to-End Workflows
8. [Project Lifecycle: Creation to Archiving](#project-lifecycle-creation-to-archiving)
9. [Event Lifecycle: Planning to Settlement](#event-lifecycle-planning-to-settlement)
10. [Financial Lifecycle: Budgeting to Reconciliation](#financial-lifecycle-budgeting-to-reconciliation)

### Part 4: Role-Specific Guides
11. [Admin Guide](#admin-guide)
12. [Portal User Guides](#portal-user-guides)
13. [FAQ & Troubleshooting](#faq--troubleshooting)

### Part 5: Reference
14. [Workflow Cross-Reference](#workflow-cross-reference)
15. [Support & Resources](#support--resources)

---

# Part 1: Getting Started

## Platform Overview

GHXSTSHIP is an integrated platform ecosystem for live event management, consisting of three interconnected applications:

| Platform | Purpose | Primary Users | Key Features |
|----------|---------|---------------|--------------|
| **GVTEWAY** | Consumer-facing ticketing & fan engagement | Fans, ticket buyers, artists, venue managers | Event discovery, ticket purchase, live event experience, community |
| **ATLVS** | Business operations & finance | Internal teams, executives, investors, sponsors | Project management, budgeting, CRM, contracts, analytics |
| **COMPVSS** | Production operations & crew management | Production crews, vendors, artists, staff | Scheduling, crew coordination, equipment, safety, run-of-show |

### Platform Interconnection

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GHXSTSHIP ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│   │   GVTEWAY   │◄───►│    ATLVS    │◄───►│   COMPVSS   │          │
│   │  Consumer   │     │  Business   │     │ Production  │          │
│   │  Platform   │     │ Operations  │     │ Operations  │          │
│   └─────────────┘     └─────────────┘     └─────────────┘          │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│   • Ticket Sales      • Financials        • Crew Schedules         │
│   • Fan Engagement    • Contracts         • Equipment              │
│   • Event Discovery   • Budgets           • Run of Show            │
│   • Community         • Analytics         • Safety                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Account Creation & Onboarding

### Step 1: Choose Your Platform

Navigate to the appropriate platform based on your role:
- **Fans/Consumers:** gvteway.ghxstship.com
- **Business Operations:** atlvs.ghxstship.com
- **Production Operations:** compvss.ghxstship.com

### Step 2: Create Your Account

**Path:** `/auth/signup`

1. Click **Sign Up** in the navigation header
2. Enter your information:
   - **Email Address** (required) - Must be a valid email
   - **Password** (required) - Minimum 8 characters, must include uppercase, lowercase, and number
   - **Full Name** (required)
   - **Organization** (optional for consumers, required for business users)
3. Accept the Terms of Service and Privacy Policy
4. Click **Create Account**

### Step 3: Verify Your Email

**Path:** `/auth/verify-email`

1. Check your email inbox for the verification message
2. Click the verification link within 24 hours
3. You'll be redirected to the platform with a confirmed account

### Step 4: Complete Onboarding

**Path:** `/onboarding`

Based on your role, you'll complete a customized onboarding flow:

| Role Type | Onboarding Steps |
|-----------|------------------|
| **Consumer (GVTEWAY)** | Preferences, interests, notification settings |
| **Team Member (ATLVS)** | Organization setup, role assignment, workspace tour |
| **Production Staff (COMPVSS)** | Skills profile, certifications, availability |
| **Artist** | Profile setup, rider preferences, media upload |
| **Vendor** | Company info, rate card, service categories |
| **Investor** | Investment preferences, document access |

### Step 5: Access Your Dashboard

After onboarding, you'll land on your role-specific dashboard:
- **Path:** `/dashboard`

---

## Authentication Methods

### Standard Sign In

**Path:** `/auth/signin`

1. Enter your registered email address
2. Enter your password
3. Click **Sign In**
4. Optionally enable "Remember Me" for 30-day sessions

### Magic Link Authentication

**Path:** `/auth/magic-link`

For passwordless authentication:
1. Enter your email address
2. Click **Send Magic Link**
3. Check your email and click the secure link
4. You'll be automatically signed in

### Password Reset

**Path:** `/auth/forgot-password`

1. Click **Forgot Password** on the sign-in page
2. Enter your registered email address
3. Click **Send Reset Link**
4. Check your email for the reset link
5. Click the link to access the reset form

**Path:** `/auth/reset-password`

6. Enter your new password (must meet security requirements)
7. Confirm your new password
8. Click **Reset Password**
9. Sign in with your new credentials

### Two-Factor Authentication (2FA)

For enhanced security, enable 2FA in your account settings:

**Path:** `/settings` → **Security** → **Two-Factor Authentication**

1. Click **Enable 2FA**
2. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
3. Enter the 6-digit verification code
4. Save your backup codes in a secure location
5. 2FA is now active for your account

---

## Understanding Your Role

### Platform Roles (RBAC)

Your platform role determines what you can access and do within each application.

#### Legend Roles (Internal - @ghxstship.pro email required)

| Role | Access Level | Description |
|------|--------------|-------------|
| `LEGEND_SUPER_ADMIN` | God Mode | Absolute platform control across all apps |
| `LEGEND_ADMIN` | Full Admin | Internal product management |
| `LEGEND_DEVELOPER` | Technical | Full repository and system access |
| `LEGEND_SUPPORT` | Support | Tech support with impersonation capability |

#### ATLVS Roles

| Role | Level | Capabilities |
|------|-------|--------------|
| `ATLVS_SUPER_ADMIN` | Admin | Full system administration, all features |
| `ATLVS_ADMIN` | Admin | Administrative access, user management |
| `ATLVS_TEAM_MEMBER` | Member | Work on tasks, projects, submit expenses |
| `ATLVS_VIEWER` | Viewer | Read-only access to assigned resources |

#### COMPVSS Roles

| Role | Level | Capabilities |
|------|-------|--------------|
| `COMPVSS_ADMIN` | Admin | Full production administration |
| `COMPVSS_TEAM_MEMBER` | Member | Work on events, manage crew |
| `COMPVSS_COLLABORATOR` | Member | Limited event access |
| `COMPVSS_VIEWER` | Viewer | Read-only production access |

#### GVTEWAY Roles

| Role | Level | Capabilities |
|------|-------|--------------|
| `GVTEWAY_ADMIN` | Admin | Full platform administration |
| `GVTEWAY_EXPERIENCE_CREATOR` | Manager | Create and manage events |
| `GVTEWAY_VENUE_MANAGER` | Manager | Manage venue profiles and events |
| `GVTEWAY_ARTIST_VERIFIED` | Member | Verified artist with full profile |
| `GVTEWAY_MEMBER_EXTRA` | Member | Premium membership tier |
| `GVTEWAY_MEMBER_PLUS` | Member | Enhanced membership tier |
| `GVTEWAY_MEMBER` | Member | Standard member access |

### Event-Level Roles

In addition to platform roles, you may have event-specific roles that grant additional access during productions:

| Role | Level | Platform Access |
|------|-------|-----------------|
| `EXECUTIVE` | 1000 | ATLVS + COMPVSS + GVTEWAY |
| `CORE_AAA` | 900 | ATLVS + COMPVSS + GVTEWAY |
| `PRODUCTION` | 700 | ATLVS + COMPVSS |
| `CREW` | 500 | COMPVSS only |
| `ARTIST` | 350 | COMPVSS + GVTEWAY |
| `VENDOR` | 400 | COMPVSS only |
| `VIP` | Various | GVTEWAY only |

---

# Part 2: Complete User Journeys

## Consumer Journey (GVTEWAY)

GVTEWAY is the consumer-facing platform for discovering events, purchasing tickets, and engaging with the community.

### Journey Overview: Fan Experience

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CONSUMER JOURNEY MAP                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. DISCOVER    2. EXPLORE     3. PURCHASE    4. PREPARE    5. EXPERIENCE   │
│  ───────────    ──────────     ──────────     ─────────     ────────────    │
│  • Browse       • Event        • Add to       • Get         • Check-in      │
│  • Search         Details        Cart           Tickets     • Navigate      │
│  • Discover     • Program      • Checkout     • Directions  • Engage        │
│  • Calendar     • Seating      • Payment      • Parking     • Shop          │
│  • Map          • Access       • Confirm      • Plan        • Connect       │
│                                                                              │
│  6. POST-EVENT                                                               │
│  ────────────                                                                │
│  • Review • Share • Rewards • Community                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Event Discovery

#### Browse Events
**Path:** `/browse`

1. Navigate to **Browse** in the main menu
2. Use filters to narrow results:
   - **Category**: Music, Sports, Arts, Comedy, Theater, etc.
   - **Date Range**: Select start and end dates
   - **Location**: Filter by city, region, or venue
   - **Price Range**: Set minimum and maximum prices
   - **Accessibility**: Filter for accessible events
3. Sort results by date, popularity, or price
4. View events in list or grid format

#### Search Events
**Path:** `/search`

1. Use the search bar at the top of the page
2. Enter event name, artist, venue, or keyword
3. Press Enter or click the search icon
4. Results appear instantly with relevance ranking
5. Use **Universal Search** (`/search/universal`) for cross-platform results

#### Discover Curated Events
**Path:** `/discover`

1. Access personalized recommendations based on your preferences
2. Take the **Discovery Quiz** (`/discover/quiz`) for tailored suggestions
3. Browse curated collections and featured events
4. Explore trending events in your area

#### Additional Discovery Methods
- **Calendar View** (`/calendar`): See events by date
- **Map View** (`/map`): Find events by location
- **Nearby Events** (`/nearby`): Location-based discovery
- **New Events** (`/new-events`): Recently added events
- **Destinations** (`/destinations`): Browse by travel destination
- **Tours** (`/tours`): Multi-city tour schedules
- **Experiences** (`/experiences`): Curated experience packages

### Phase 2: Event Exploration

#### View Event Details
**Path:** `/events/[id]`

1. Click on any event to view full details
2. Review event information:
   - Date, time, and venue
   - Artist/performer lineup
   - Ticket types and pricing
   - Age restrictions
   - Event description
3. View the **Social Wall** (`/events/[id]/social-wall`) for fan content

#### Explore Event Information
- **Program** (`/events/[id]/program`): Full event schedule
- **Seating Chart** (`/events/[id]/seating`): Interactive seat selection
- **Accessibility** (`/events/[id]/accessibility`): Accessibility accommodations
- **Entry Info** (`/events/[id]/entry-info`): Gates, times, policies
- **Parking** (`/events/[id]/parking`): Parking options and pricing
- **Compare Events** (`/events/compare`): Side-by-side comparison

#### Explore Artists & Venues
- **Artists** (`/artists`): Browse artist profiles
- **Artist Profile** (`/artists/[id]`): Bio, events, media
- **Venues** (`/venues`): Browse venue directory
- **Venue Details** (`/venues/[id]`): Capacity, amenities, directions
- **Creators** (`/creators`): Event organizers and promoters

### Phase 3: Ticket Purchase

#### Add to Cart
**Path:** `/cart`

1. From the event page, select your ticket type:
   - General Admission (GA)
   - VIP packages
   - Reserved seating
   - Accessible seating
2. Choose quantity (subject to limits)
3. Click **Add to Cart**
4. Continue shopping or proceed to checkout

#### Checkout Process
**Path:** `/checkout`

1. Review your cart items
2. Apply promo codes if available
3. Select currency (`/checkout/currency`) if international
4. Click **Proceed to Checkout**
5. Sign in or continue as guest
6. Enter billing information
7. Select payment method:
   - Credit/debit card
   - PayPal
   - Apple Pay / Google Pay
   - Gift card balance
8. Review order summary including fees
9. Accept terms and conditions
10. Click **Complete Purchase**

#### Order Confirmation
**Path:** `/confirmation`

- Confirmation email sent immediately
- Order number displayed on screen
- Tickets available in **My Tickets** section
- Download PDF or add to mobile wallet
- Share purchase on social media (optional)

### Phase 4: Pre-Event Preparation

#### Manage Your Tickets
**Path:** `/tickets` or `/account/tickets`

1. View all your tickets for upcoming events
2. Access ticket details and QR codes
3. Download tickets for offline access
4. Add tickets to your mobile wallet (`/wallet`)

#### Ticket Actions
- **Transfer** (`/tickets/transfer`): Send tickets to others
- **Gift** (`/tickets/gift`): Gift tickets with a message
- **Groups** (`/tickets/groups`): Manage group tickets
- **Print at Home** (`/tickets/print-at-home`): Generate printable tickets
- **Resale** (`/resale`): List tickets for resale
- **Tracking** (`/tickets/tracking`): Track transferred tickets

#### Plan Your Visit
- **Directions** (`/directions`): Get directions to venue
- **Parking Info**: Review parking options
- **Entry Info**: Check gate times and policies
- **Accessibility**: Request accommodations

### Phase 5: Live Event Experience

#### Event Hub
**Path:** `/e/[eventId]`

On event day, access your personalized event hub:

1. **My Tickets** (`/e/[eventId]/my-tickets`): Quick ticket access
2. **Ticket View** (`/e/[eventId]/ticket`): Display QR code for entry
3. **Entry Info** (`/e/[eventId]/entry-info`): Real-time gate information

#### Navigate the Venue
- **Navigate** (`/e/[eventId]/navigate`): Interactive navigation
- **Parking** (`/e/[eventId]/navigate/parking`): Find your parking
- **Accessibility** (`/e/[eventId]/navigate/accessibility`): Accessible routes
- **Directions** (`/e/[eventId]/navigate/directions`): Turn-by-turn
- **Map** (`/e/[eventId]/map`): Venue map with points of interest
- **Seating** (`/e/[eventId]/seating`): Find your seat

#### Event Information
- **Lineup** (`/e/[eventId]/lineup`): Performance schedule
- **Program** (`/e/[eventId]/program`): Full event program

#### Engage with the Event
**Path:** `/e/[eventId]/engage`

- **Challenges** (`/e/[eventId]/engage/challenges`): Participate in event challenges
- **Polls** (`/e/[eventId]/engage/polls`): Vote in live polls
- **Q&A** (`/e/[eventId]/engage/qa`): Submit questions
- **UGC** (`/e/[eventId]/engage/ugc`): Share your content
- **Chat** (`/e/[eventId]/chat`): Connect with other attendees
- **Friends** (`/e/[eventId]/friends`): Find friends at the event
- **Photos** (`/e/[eventId]/photos`): Event photo booth
- **Shop** (`/e/[eventId]/shop`): In-event merchandise

#### Event Services
**Path:** `/e/[eventId]/services`

- **Emergency** (`/e/[eventId]/services/emergency`): Emergency contacts
- **Lost & Found** (`/e/[eventId]/services/lost-found`): Report lost items
- **Support** (`/e/[eventId]/services/support`): Get help
- **Refunds** (`/e/[eventId]/refunds`): Request refunds

### Phase 6: Post-Event

#### Write Reviews
**Path:** `/e/[eventId]/reviews` or `/reviews/new`

1. Rate the event (1-5 stars)
2. Rate specific aspects:
   - Venue quality
   - Production value
   - Value for money
3. Write your review
4. Upload photos (optional)
5. Submit for moderation

#### Community Engagement
**Path:** `/community`

- **Challenges** (`/community/challenges`): Ongoing challenges
- **Fan Content** (`/community/fan-content`): Browse fan submissions
- **Polls** (`/community/polls`): Community polls
- **Forums** (`/forums`): Discussion forums
- **Groups** (`/groups`): Join interest groups
- **Friends** (`/friends`): Connect with other fans
- **Activity** (`/activity`): Your activity feed

#### Rewards & Membership
- **Rewards** (`/rewards`): View and redeem points
- **Membership** (`/membership`): Manage membership tier
- **Benefits** (`/membership/benefits`): View tier benefits
- **Referrals** (`/referrals`): Refer friends for rewards
- **Fan Club** (`/fan-club`): Artist fan clubs
- **Exclusive Access** (`/fan-club/exclusive-access`): Member exclusives

### Account Management

#### Profile & Settings
**Path:** `/account` or `/profile`

- **Profile** (`/account/profile`): Edit personal information
- **Orders** (`/account/orders`): Order history
- **Tickets** (`/account/tickets`): All tickets
- **Refunds** (`/account/my-refunds`): Refund requests
- **Transfers** (`/account/my-transfers`): Transfer history
- **Badges** (`/profile/badges`): Earned badges
- **Reputation** (`/profile/reputation`): Community reputation

#### Settings
**Path:** `/settings`

- **Language** (`/settings/language`): Language preferences
- **Notifications** (`/settings/notifications`): Notification settings
- **Privacy** (`/settings/privacy`): Privacy controls
- **Sessions** (`/settings/sessions`): Active sessions
- **Connected Apps** (`/settings/connected-apps`): Third-party connections
- **API Access** (`/settings/api-access`): Developer access
- **Webhooks** (`/settings/webhooks`): Webhook configuration

---

## Business Operations Journey (ATLVS)

ATLVS is the business operations platform for managing projects, finances, and organizational resources.

### Journey Overview: Business Operations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     BUSINESS OPERATIONS JOURNEY MAP                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SETUP       2. PLAN        3. EXECUTE     4. MANAGE     5. CLOSE        │
│  ─────────      ─────────      ──────────     ─────────     ─────────       │
│  • Org Setup    • Create       • Track        • Finance     • Settlement    │
│  • Team           Production     Progress     • Vendors     • Wrap Report   │
│  • Roles        • Budget       • Tasks        • Contracts   • Archive       │
│  • Integrations • Timeline     • Resources    • Compliance  • Analytics     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Organization Setup

#### Dashboard Overview
**Path:** `/dashboard`

The dashboard provides at-a-glance metrics:
- **Revenue**: Current period revenue vs. target
- **Active Projects**: Projects in progress
- **Outstanding Invoices**: Unpaid invoices
- **Team Utilization**: Resource allocation
- **Action Items**: Pending tasks requiring attention

#### Organization Management
**Path:** `/organizations`

1. **View Organizations** (`/organizations`): List all organizations
2. **Create Organization** (`/organizations/new`): Add new organization
3. **Organization Details** (`/organizations/[id]`): View/edit details
4. **Edit Organization** (`/organizations/[id]/edit`): Modify settings

#### People Management
**Path:** `/people`

1. **View People** (`/people`): Directory of all contacts
2. **Person Details** (`/people/[id]`): Individual profile
3. **Edit Person** (`/people/[id]/edit`): Update contact info

### Phase 2: Project Planning

#### Creating a Production
**Path:** `/events/new` or `/productions/new`

1. Click **New Production** from the dashboard
2. Fill in production details:
   - **Production Name** (required)
   - **Production Type**: Concert, Festival, Corporate, etc.
   - **Start Date** and **End Date**
   - **Venue(s)**
   - **Description**
3. Set initial budget parameters
4. Assign initial team members
5. Click **Create Production**

#### Production Configuration
**Path:** `/p/[productionId]/settings`

After creation, configure your production:
- **Overview** (`/p/[productionId]/overview`): Production dashboard
- **Settings** (`/p/[productionId]/settings`): Production settings
- **Team** (`/p/[productionId]/team`): Team assignments
- **Documents** (`/p/[productionId]/documents`): Document management

#### Budget Setup
**Path:** `/budgets` or `/finance/budgets`

1. Navigate to **Finance** > **Budgets**
2. Create budget categories:
   - Talent
   - Production
   - Marketing
   - Operations
   - Contingency
3. Set category allocations
4. Define approval thresholds
5. Link to production

### Phase 3: Execution & Tracking

#### Task Management
**Path:** `/p/[productionId]/schedule`

1. Open a production
2. Go to the **Schedule** tab
3. Create and manage tasks:
   - Title and description
   - Assignee
   - Due date
   - Priority level
   - Dependencies
4. Track progress with status updates

#### Advancing Management
**Path:** `/advancing`

1. **Advancing Hub** (`/advancing`): Overview of all advancing
2. **Review** (`/advancing/review`): Review submissions
3. **Production Advancing** (`/p/[productionId]/advancing`): Production-specific

#### Asset Management
**Path:** `/assets`

1. **Asset List** (`/assets`): View all assets
2. **New Asset** (`/assets/new`): Add new asset
3. **Asset Details** (`/assets/[id]`): View asset information
4. **Edit Asset** (`/assets/[id]/edit`): Modify asset
5. **Maintenance** (`/assets/maintenance`): Maintenance schedules
6. **Scan** (`/assets/scan`): QR/barcode scanning

### Phase 4: Financial Management

#### Invoice Management
**Path:** `/invoices` or `/finance/invoices`

1. **Invoice List** (`/invoices`): All invoices
2. **New Invoice** (`/invoices/new`): Create invoice
3. **Invoice Details** (`/invoices/[id]`): View/edit invoice
4. Send invoices to clients
5. Track payment status

#### Expense Management
**Path:** `/finance/expenses`

1. Navigate to **Finance** > **Expenses**
2. Click **Add Expense**
3. Enter details:
   - Amount and currency
   - Category
   - Vendor
   - Receipt upload
   - Production link
4. Submit for approval if required

#### Bills & Purchase Orders
- **Bills** (`/bills` or `/finance/bills`): Vendor bills
- **Purchase Orders** (`/finance/purchase-orders`): PO management
- **Proposals** (`/finance/proposals`): Client proposals

#### Deals & CRM
**Path:** `/deals`

1. **Deal Pipeline** (`/deals`): View deals by stage
2. **New Deal** (`/deals/new`): Create new opportunity
3. Drag deals between stages
4. Track deal value and probability

### Phase 5: Analytics & Reporting

#### Analytics Hub
**Path:** `/analytics`

1. **Analytics Dashboard** (`/analytics`): Key metrics
2. **Dashboard Builder** (`/analytics/dashboard-builder`): Custom dashboards
3. Generate reports:
   - Financial summary
   - Project status
   - Resource utilization
   - Client analytics
4. Export as PDF or Excel

### Phase 6: Production Wrap & Settlement

#### Wrap Process
**Path:** `/p/[productionId]/wrap`

1. Access the production wrap section
2. Complete final tasks:
   - Finalize all expenses
   - Process outstanding invoices
   - Complete vendor payments
   - Generate wrap report
3. Archive production documents

#### Shows & Run of Show
**Path:** `/p/[productionId]/shows`

- Manage show schedules
- Run of show coordination
- Set times management

#### Vendor Management
**Path:** `/p/[productionId]/vendors`

- Assign vendors to production
- Track vendor deliverables
- Process vendor payments

### Portal Access (External Users)

#### Artist Portal
**Path:** `/portal/artist`

Artists can access:
- Event assignments
- Schedule information
- Advancing submissions
- Document access

#### Investor Portal
**Path:** `/portal/investor`

Investors can access:
- Investment information
- Financial reports
- Company updates
- Document library

#### Sponsor Portal
**Path:** `/portal/sponsor`

Sponsors can access:
- Activation details
- Deliverable tracking
- Performance reports
- Asset library

#### Vendor Portal
**Path:** `/portal/vendor`

Vendors can access:
- Purchase orders
- Invoice submission
- Payment status
- Contract documents

### Admin Functions

#### User Management
**Path:** `/admin/users`

1. View all users
2. Invite new users
3. Assign roles
4. Manage permissions
5. Deactivate accounts

#### Batch Operations
**Path:** `/admin/batch-operations`

1. Bulk user updates
2. Mass data imports
3. Batch processing

---

## Production Operations Journey (COMPVSS)

COMPVSS is the production management platform for crew coordination, equipment tracking, and event execution.

### Journey Overview: Production Operations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION OPERATIONS JOURNEY MAP                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. PRE-PROD    2. LOAD-IN     3. SHOW DAY    4. LOAD-OUT   5. WRAP         │
│  ──────────     ─────────      ──────────     ──────────    ─────────       │
│  • Planning     • Build        • Operations   • Strike      • Settlement    │
│  • Crew         • Equipment    • Run of Show  • Equipment   • Reports       │
│  • Advancing    • QA           • Safety       • Logistics   • Archive       │
│  • Credentials  • Logistics    • Catering     • Cleanup     • Review        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Pre-Production

#### Dashboard Overview
**Path:** `/dashboard`

The production dashboard shows:
- **Active Productions**: Current projects
- **Crew Availability**: Team status
- **Equipment Status**: Inventory overview
- **Upcoming Deadlines**: Critical dates
- **Notifications**: Alerts and updates

#### Project Setup
**Path:** `/projects`

1. **Project List** (`/projects`): View all projects
2. **New Project** (`/projects/new`): Create production
3. Configure production settings
4. Set up communication channels
5. Define credential types and zones

#### Crew Management
**Path:** `/crew`

1. **Crew Directory** (`/crew`): Browse all crew members
2. **Crew Profile** (`/crew/[id]`): Individual details
3. Filter by:
   - Skills and certifications
   - Availability
   - Rating
   - Department
4. Check availability (`/availability`)

#### Advancing Coordination
**Path:** `/advancing`

1. **Advancing Hub** (`/advancing`): Overview
2. **New Request** (`/advancing/new`): Create advancing request
3. **Request Details** (`/advancing/[id]`): Manage request
4. **Catalog** (`/advancing/catalog`): Browse advancing items
5. Track submissions and approvals

#### Credentials Management
**Path:** `/credentials`

1. Define credential types
2. Configure access zones
3. Issue credentials to crew
4. Generate credential reports

### Phase 2: Load-In & Build

#### Build/Strike Schedule
**Path:** `/build-strike`

1. View build schedule
2. Track load-in progress
3. Coordinate deliveries
4. Manage logistics

#### Equipment Management
**Path:** `/equipment`

1. View all equipment items
2. Filter by category, status, location
3. Check out equipment for production
4. Track equipment location
5. Report issues or damage

#### Deliveries & Logistics
**Path:** `/deliveries`

1. Track incoming deliveries
2. Coordinate vendor arrivals
3. Manage logistics timing
4. Confirm receipts

#### Quality Assurance
**Path:** `/qa-checkpoints` and `/punch-list`

1. **QA Checkpoints** (`/qa-checkpoints`): Complete quality checks
2. **Punch List** (`/punch-list`): Track issues to resolve
3. Document with photos (`/photo-documentation`)

### Phase 3: Show Day Operations

#### Run of Show
**Path:** `/run-of-show`

1. View the complete run of show
2. Mark cues as complete
3. Add real-time notes
4. Track actual vs. planned times
5. Coordinate with all departments

#### Set Times
**Path:** `/set-times`

1. View artist set times
2. Track schedule adherence
3. Communicate changes

#### Schedule Management
**Path:** `/schedule`

1. View master schedule
2. Track all activities
3. Manage conflicts
4. Real-time updates

#### Safety & Emergency
**Path:** `/emergency` and `/incidents`

1. **Emergency Info** (`/emergency`): Emergency procedures
2. **Incidents** (`/incidents`): Report and track incidents
3. Access safety protocols
4. Emergency contacts

### Phase 4: Load-Out & Strike

#### Settlement Preparation
**Path:** `/settlement`

1. Begin settlement process
2. Finalize crew timesheets
3. Process vendor payments
4. Document equipment returns

#### Equipment Returns
**Path:** `/equipment`

1. Check in returned equipment
2. Document condition
3. Report any damage
4. Update inventory

### Phase 5: Wrap & Archive

#### Production Wrap
**Path:** `/p/[productionId]/wrap`

1. Complete daily reports
2. Generate wrap report
3. Finalize all documentation
4. Archive production files

#### Settlement Finalization
**Path:** `/p/[productionId]/settlement`

1. Process final settlement
2. Reconcile all expenses
3. Complete vendor payments
4. Close production

### Supporting Functions

#### BEOs (Banquet Event Orders)
**Path:** `/beos`

1. **BEO List** (`/beos`): All BEOs
2. **New BEO** (`/beos/new`): Create BEO
3. **BEO Details** (`/beos/[id]`): View/edit
4. **Versions** (`/beos/[id]/versions`): Version history

#### Certifications & Training
**Path:** `/certifications`

1. View team certifications
2. Track expiration dates
3. Upload new certificates
4. Receive renewal reminders

#### Background Checks
**Path:** `/background-checks`

1. Initiate background checks
2. Track status
3. View results
4. Maintain compliance

#### Risk Register
**Path:** `/risk-register`

1. Identify risks
2. Assess impact and probability
3. Create mitigation plans
4. Track risk status

#### Permits
**Path:** `/permits`

1. Track required permits
2. Submit applications
3. Monitor approval status
4. Link to productions

#### Maintenance
**Path:** `/maintenance`

1. Schedule equipment maintenance
2. Track maintenance history
3. Manage service requests

#### Integrations
**Path:** `/integrations`

1. Configure third-party integrations
2. Manage API connections
3. Sync data across systems

### Production-Level Pages

#### Production Overview
**Path:** `/p/[productionId]/overview`

Central hub for production information

#### Production Crew
**Path:** `/p/[productionId]/crew`

Manage crew assignments for the production

#### Production Documents
**Path:** `/p/[productionId]/documents`

Access and manage production documents

#### Production Safety
**Path:** `/p/[productionId]/safety`

Safety protocols and procedures

#### Production Schedule
**Path:** `/p/[productionId]/schedule`

Production-specific scheduling

#### Production Vendors
**Path:** `/p/[productionId]/vendors`

Vendor management for the production

#### Production Advancing
**Path:** `/p/[productionId]/advancing`

Advancing coordination for the production

---

# Part 3: End-to-End Workflows

## Project Lifecycle: Creation to Archiving

This section documents the complete lifecycle of a project/production from initial creation through final archiving.

### Lifecycle Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      PROJECT LIFECYCLE STAGES                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INITIATION     PLANNING      EXECUTION     MONITORING    CLOSURE           │
│  ──────────     ────────      ─────────     ──────────    ───────           │
│  • Opportunity  • Scope       • Kickoff     • Progress    • Settlement      │
│  • Proposal     • Budget      • Tasks       • Budget      • Wrap Report     │
│  • Approval     • Timeline    • Resources   • Quality     • Archive         │
│  • Setup        • Team        • Vendors     • Risk        • Review          │
│                                                                              │
│  Status: DRAFT → PLANNING → ACTIVE → IN_PROGRESS → WRAP → SETTLED → ARCHIVED│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Initiation

#### 1.1 Opportunity Identification
**Workflow:** WF-COMPVSS-014 (Opportunity & Bid Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Identify opportunity | COMPVSS | `/opportunities` |
| 2 | Evaluate bid decision | COMPVSS | `/opportunities/bid-decision` |
| 3 | Create proposal | COMPVSS | `/opportunities/proposals` |
| 4 | Submit bid | COMPVSS | `/bid-portal` |
| 5 | Track win/loss | COMPVSS | `/opportunities/win-loss` |

#### 1.2 Project Creation
**Workflow:** WF-ATLVS-001 (Production Creation & Setup)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Navigate to Productions | ATLVS | `/productions` |
| 2 | Click "New Production" | ATLVS | `/productions/new` |
| 3 | Enter production details | ATLVS | `/productions/new` |
| 4 | Select production vertical | ATLVS | `/productions/new` |
| 5 | Assign initial team | ATLVS | `/productions/new` |
| 6 | Set budget parameters | ATLVS | `/productions/new` |
| 7 | Submit for creation | ATLVS | `/productions/new` |

### Stage 2: Planning

#### 2.1 Budget Setup
**Workflow:** WF-ATLVS-002 (Budget Management & Approval)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access production budgets | ATLVS | `/p/[id]/budgets` |
| 2 | Create budget line items | ATLVS | `/p/[id]/budgets` |
| 3 | Set category allocations | ATLVS | `/p/[id]/budgets` |
| 4 | Define approval thresholds | ATLVS | `/p/[id]/budgets` |

#### 2.2 Vendor Onboarding
**Workflow:** WF-ATLVS-003 (Vendor Onboarding & Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Navigate to Vendors | ATLVS | `/vendors` |
| 2 | Add vendor details | ATLVS | `/vendors` |
| 3 | Upload tax documents | ATLVS | `/vendors` |
| 4 | Set up rate card | ATLVS | `/vendors/rate-cards` |
| 5 | Create vendor contract | ATLVS | `/vendors/contracts` |
| 6 | Activate vendor portal | ATLVS | `/vendors` |

#### 2.3 Production Configuration
**Workflow:** WF-COMPVSS-001 (Production Setup & Configuration)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Navigate to Projects | COMPVSS | `/projects` |
| 2 | Create new project | COMPVSS | `/projects/new` |
| 3 | Configure settings | COMPVSS | `/p/[id]/settings` |
| 4 | Set up communication | COMPVSS | `/p/[id]/communication/channels` |
| 5 | Define credential types | COMPVSS | `/credentials/types` |
| 6 | Configure access zones | COMPVSS | `/credentials/zones` |
| 7 | Upload SOPs | COMPVSS | `/p/[id]/documents/sops` |

#### 2.4 Crew Scheduling
**Workflow:** WF-COMPVSS-002 (Crew Scheduling & Assignment)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access crew management | COMPVSS | `/crew` |
| 2 | Check availability | COMPVSS | `/directory/availability` |
| 3 | Filter by skills | COMPVSS | `/directory/filters` |
| 4 | Assign crew | COMPVSS | `/crew/assign` |
| 5 | Set shift schedules | COMPVSS | `/p/[id]/crew` |
| 6 | Issue credentials | COMPVSS | `/credentials/issue` |

### Stage 3: Execution

#### 3.1 Advancing Coordination
**Workflow:** WF-COMPVSS-003 (Advancing Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access advancing hub | COMPVSS | `/advancing` |
| 2 | Create advancing request | COMPVSS | `/advancing/new` |
| 3 | Select template | COMPVSS | `/p/[id]/advancing/templates` |
| 4 | Define requirements | COMPVSS | `/advancing/[id]` |
| 5 | Assign to stakeholders | COMPVSS | `/advancing/[id]` |
| 6 | Track submissions | COMPVSS | `/advancing/[id]` |
| 7 | Review and approve | COMPVSS | `/advancing/[id]` |

#### 3.2 Load-In Management
**Workflow:** WF-COMPVSS-009 (Load-In Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access load-in | COMPVSS | `/p/[id]/load-in` |
| 2 | Review schedule | COMPVSS | `/p/[id]/schedule/build-strike` |
| 3 | Coordinate deliveries | COMPVSS | `/deliveries` |
| 4 | Manage logistics | COMPVSS | `/p/[id]/logistics` |
| 5 | Track equipment | COMPVSS | `/equipment` |
| 6 | Document progress | COMPVSS | `/photo-documentation` |
| 7 | Complete QA checkpoints | COMPVSS | `/qa-checkpoints` |

#### 3.3 Show Day Operations
**Workflow:** WF-COMPVSS-010 (Show Day Operations)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access operations | COMPVSS | `/p/[id]/operations` |
| 2 | Review show call | COMPVSS | `/show-call` |
| 3 | Monitor soundcheck | COMPVSS | `/soundcheck` |
| 4 | Track set times | COMPVSS | `/set-times` |
| 5 | Follow run of show | COMPVSS | `/run-of-show` |
| 6 | Manage catering | COMPVSS | `/p/[id]/catering` |
| 7 | Log incidents | COMPVSS | `/p/[id]/incidents` |

### Stage 4: Monitoring

#### 4.1 Budget Tracking
**Workflow:** WF-ATLVS-002 (Budget Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Review budget vs actuals | ATLVS | `/p/[id]/budgets` |
| 2 | Approve/reject requests | ATLVS | `/p/[id]/budgets` |
| 3 | Generate budget reports | ATLVS | `/p/[id]/budgets` |

#### 4.2 Expense Processing
**Workflow:** WF-ATLVS-010 (Expense Submission & Approval)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Navigate to Expenses | ATLVS | `/expenses` |
| 2 | Review submissions | ATLVS | `/expenses/[id]` |
| 3 | Approve/reject | ATLVS | `/expenses/[id]` |
| 4 | Generate reports | ATLVS | `/expenses/reports` |

#### 4.3 Quality Assurance
**Workflow:** WF-COMPVSS-007 (Quality Assurance Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access quality hub | COMPVSS | `/p/[id]/quality` |
| 2 | Define QA checkpoints | COMPVSS | `/p/[id]/quality/qa-checkpoints` |
| 3 | Create punch list | COMPVSS | `/p/[id]/quality/punch-list` |
| 4 | Log quality issues | COMPVSS | `/p/[id]/quality/issues` |
| 5 | Track resolution | COMPVSS | `/p/[id]/quality` |

### Stage 5: Closure

#### 5.1 Load-Out & Strike
**Workflow:** WF-COMPVSS-011 (Load-Out & Strike)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access load-out | COMPVSS | `/p/[id]/load-out` |
| 2 | Execute strike | COMPVSS | `/p/[id]/strike` |
| 3 | Track equipment return | COMPVSS | `/equipment` |
| 4 | Document condition | COMPVSS | `/photo-documentation` |
| 5 | Complete punch list | COMPVSS | `/punch-list` |
| 6 | Process timesheets | COMPVSS | `/timekeeping` |

#### 5.2 Production Wrap
**Workflow:** WF-COMPVSS-012 (Production Wrap & Settlement)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access wrap | COMPVSS | `/p/[id]/wrap` |
| 2 | Complete daily reports | COMPVSS | `/reports/daily` |
| 3 | Generate wrap report | COMPVSS | `/reports/wrap` |
| 4 | Process settlement | COMPVSS | `/p/[id]/settlement` |
| 5 | Finalize expenses | COMPVSS | `/p/[id]/expenses` |
| 6 | Archive documents | COMPVSS | `/p/[id]/documents` |
| 7 | Close production | COMPVSS | `/p/[id]/wrap` |

#### 5.3 Financial Settlement
**Workflow:** WF-ATLVS-011 (Invoice Processing)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access Invoices | ATLVS | `/invoices` |
| 2 | Process final invoices | ATLVS | `/invoices` |
| 3 | Match to POs | ATLVS | `/invoices` |
| 4 | Approve payments | ATLVS | `/invoices` |
| 5 | Record payments | ATLVS | `/invoices` |
| 6 | Update accounts | ATLVS | `/finance/accounts-receivable` |

---

## Event Lifecycle: Planning to Settlement

This section documents the complete lifecycle of a consumer-facing event from planning through settlement.

### Lifecycle Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       EVENT LIFECYCLE STAGES                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CREATE        CONFIGURE     ON-SALE       LIVE          POST-EVENT         │
│  ──────        ─────────     ───────       ────          ──────────         │
│  • Event       • Ticketing   • Marketing   • Check-in    • Settlement       │
│  • Venue       • Pricing     • Sales       • Operations  • Analytics        │
│  • Artists     • Seating     • Promos      • Engagement  • Reviews          │
│  • Program     • Access      • Waitlist    • Services    • Payouts          │
│                                                                              │
│  Status: DRAFT → CONFIGURED → ON_SALE → LIVE → COMPLETED → SETTLED          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Event Creation
**Workflow:** WF-GVTEWAY-021 (Event Creation & Management)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access events | GVTEWAY | `/events` |
| 2 | Create event | GVTEWAY | `/events/create` |
| 3 | Use blueprint | GVTEWAY | `/events/create/from-blueprint` |
| 4 | Configure event | GVTEWAY | `/events/[id]` |
| 5 | Build landing page | GVTEWAY | `/events/[id]/landing-builder` |
| 6 | Configure floor | GVTEWAY | `/events/[id]/floor-config` |
| 7 | Set up seating | GVTEWAY | `/events/[id]/seating` |
| 8 | Configure accessibility | GVTEWAY | `/events/[id]/accessibility` |
| 9 | Set up parking | GVTEWAY | `/events/[id]/parking` |
| 10 | Configure program | GVTEWAY | `/events/[id]/program` |

### Stage 2: Ticketing Configuration
**Workflow:** WF-GVTEWAY-022 (Ticketing Administration)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access admin | GVTEWAY | `/dashboard` |
| 2 | Configure anti-scalping | GVTEWAY | `/admin/anti-scalping` |
| 3 | Set urgency pricing | GVTEWAY | `/tickets/urgency` |
| 4 | Manage promo codes | GVTEWAY | `/admin/promo-codes` |
| 5 | Configure early bird | GVTEWAY | `/admin/pricing/early-bird` |
| 6 | Manage will call | GVTEWAY | `/admin/will-call` |
| 7 | Sync inventory | GVTEWAY | `/admin/inventory-sync` |

### Stage 3: Marketing & Sales
**Workflow:** WF-GVTEWAY-023 (Marketing Administration)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access marketing | GVTEWAY | `/marketing/analytics` |
| 2 | Configure A/B testing | GVTEWAY | `/marketing/ab-testing` |
| 3 | Set early bird | GVTEWAY | `/marketing/early-bird` |
| 4 | Manage influencers | GVTEWAY | `/marketing/influencers` |
| 5 | Create media kit | GVTEWAY | `/marketing/media-kit` |
| 6 | Configure pixels | GVTEWAY | `/marketing/pixels` |

### Stage 4: Live Event Operations
**Workflow:** WF-GVTEWAY-027 (Box Office Operations)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access box office | GVTEWAY | `/e/[eventId]/box-office` |
| 2 | Process will call | GVTEWAY | `/e/[eventId]/will-call` |
| 3 | Check in attendees | GVTEWAY | `/e/[eventId]/check-in` |
| 4 | Scan tickets | GVTEWAY | `/e/[eventId]/scan` |
| 5 | Issue credentials | GVTEWAY | `/e/[eventId]/credentials` |

### Stage 5: Event Settlement
**Workflow:** WF-GVTEWAY-028 (Event Settlement)

| Step | Action | Platform | Path |
|------|--------|----------|------|
| 1 | Access settlement | GVTEWAY | `/e/[eventId]/settlement` |
| 2 | Review sales | GVTEWAY | `/admin/sales-reporting` |
| 3 | Process settlement | GVTEWAY | `/e/[eventId]/settlement` |

---

## Financial Lifecycle: Budgeting to Reconciliation

This section documents the complete financial lifecycle from initial budgeting through final reconciliation.

### Lifecycle Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FINANCIAL LIFECYCLE STAGES                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BUDGET        PROCUREMENT   EXECUTION     TRACKING      RECONCILIATION     │
│  ──────        ───────────   ─────────     ────────      ─────────────      │
│  • Create      • RFP/RFQ     • Expenses    • Actuals     • Settlement       │
│  • Allocate    • PO          • Invoices    • Variance    • Audit            │
│  • Approve     • Contract    • Payments    • Reports     • Archive          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Budget Creation
**Workflow:** WF-ATLVS-002 (Budget Management & Approval)

| Step | Action | Path |
|------|--------|------|
| 1 | Access production budgets | `/p/[id]/budgets` |
| 2 | Create budget line items | `/p/[id]/budgets` |
| 3 | Set category allocations | `/p/[id]/budgets` |
| 4 | Define approval thresholds | `/p/[id]/budgets` |

### Stage 2: Procurement
**Workflow:** WF-ATLVS-014 (Procurement & Purchase Orders)

| Step | Action | Path |
|------|--------|------|
| 1 | Navigate to Procurement | `/procurement` |
| 2 | Create requisition | `/procurement` |
| 3 | Request quotes | `/quotes` |
| 4 | Compare vendor quotes | `/quotes` |
| 5 | Select vendor | `/procurement/vendor-selection` |
| 6 | Create purchase order | `/p/[id]/procurement/purchase-orders` |
| 7 | Route for approval | `/p/[id]/procurement/purchase-orders` |
| 8 | Send PO to vendor | `/p/[id]/procurement/purchase-orders` |

### Stage 3: Expense Execution
**Workflow:** WF-ATLVS-010 (Expense Submission & Approval)

| Step | Action | Path |
|------|--------|------|
| 1 | Navigate to Expenses | `/expenses` |
| 2 | Create new expense | `/expenses` |
| 3 | Enter expense details | `/expenses` |
| 4 | Upload receipt | `/expenses` |
| 5 | Select category | `/expenses/categories` |
| 6 | Link to production | `/expenses` |
| 7 | Submit for approval | `/expenses` |

### Stage 4: Invoice Processing
**Workflow:** WF-ATLVS-011 (Invoice Processing)

| Step | Action | Path |
|------|--------|------|
| 1 | Access Invoices | `/invoices` |
| 2 | Create/receive invoice | `/invoices` |
| 3 | Match to PO | `/invoices` |
| 4 | Verify amounts | `/invoices` |
| 5 | Route for approval | `/invoices` |
| 6 | Approve payment | `/invoices` |
| 7 | Schedule payment | `/invoices` |
| 8 | Record payment | `/invoices` |

### Stage 5: Reconciliation
**Workflow:** WF-ATLVS-019 (Analytics & Reporting)

| Step | Action | Path |
|------|--------|------|
| 1 | Access Analytics | `/analytics` |
| 2 | Review budget vs actuals | `/p/[id]/budgets` |
| 3 | Generate financial reports | `/analytics/reports` |
| 4 | Export for stakeholders | `/analytics` |
| 5 | Archive financial records | `/documents` |

---

# Part 4: Role-Specific Guides

## Admin Guide

### User Management

#### Adding Users
**Path:** `/admin/users` (ATLVS) or `/settings/users`

1. Go to **Settings** > **Users**
2. Click **Invite User**
3. Enter email address
4. Select role(s):
   - Platform role (ATLVS_ADMIN, ATLVS_TEAM_MEMBER, etc.)
   - Event roles (if applicable)
5. Set permissions
6. Send invitation

#### Managing Roles
**Path:** `/settings/roles`

1. Go to **Settings** > **Roles**
2. View role hierarchy
3. Edit role permissions
4. Create custom roles if needed
5. Assign roles to users

#### Deactivating Users

1. Find user in **Users** list
2. Click **Edit**
3. Toggle **Active** status
4. Confirm deactivation
5. User access is immediately revoked

### Organization Settings

#### General Settings
**Path:** `/settings/organization`

1. Go to **Settings** > **Organization**
2. Update:
   - Organization name
   - Logo and branding
   - Contact information
   - Time zone
   - Default currency

#### Billing & Subscription
**Path:** `/settings/billing`

1. Go to **Settings** > **Billing**
2. View current plan
3. Update payment method
4. View invoice history
5. Upgrade/downgrade plan

### Integrations

#### Connecting Services
**Path:** `/settings/integrations` or `/integrations`

1. Go to **Settings** > **Integrations**
2. Browse available integrations:
   - Payment processors (Stripe)
   - Accounting (QuickBooks, Xero)
   - CRM (Salesforce, HubSpot)
   - Communication (Slack, Teams)
3. Click **Connect** on desired service
4. Follow OAuth flow
5. Configure sync settings

#### API Keys
**Path:** `/settings/api-keys`

1. Go to **Settings** > **API**
2. Click **Generate API Key**
3. Set permissions and expiration
4. Copy key (shown only once)
5. Use in external applications

### Audit & Compliance

#### Audit Logs
**Path:** `/audit`

1. View all system activity
2. Filter by user, action, date
3. Export audit logs
4. Review permission changes

#### Compliance Dashboard
**Path:** `/compliance`

1. Track compliance requirements
2. Assign compliance tasks
3. Upload evidence
4. Generate compliance reports

---

## Portal User Guides

### Artist Portal
**Path:** `/portal/artist`

**Workflow:** WF-ATLVS-026 (Artist Portal)

Artists can access:
- **Event Assignments**: View assigned events and schedules
- **Advancing**: Submit rider information and requirements
- **Schedule**: View performance times and soundcheck
- **Documents**: Access contracts, stage plots, technical specs
- **Profile**: Update artist profile and media

### Crew Portal
**Path:** `/portal/crew`

**Workflow:** WF-ATLVS-027 (Crew Portal)

Crew members can access:
- **Assignments**: View crew assignments and roles
- **Schedule**: View shift schedules and call times
- **Availability**: Submit availability for future events
- **Documents**: Access SOPs, safety protocols, site maps
- **Profile**: Update skills and certifications

### Investor Portal
**Path:** `/portal/investor`

**Workflow:** WF-ATLVS-028 (Investor Portal)

Investors can access:
- **Investments**: View investment portfolio
- **Updates**: Read company and fund updates
- **Documents**: Access financial reports, K-1s, statements
- **Profile**: Update contact and tax information

### Sponsor Portal
**Path:** `/portal/sponsor`

**Workflow:** WF-ATLVS-029 (Sponsor Portal)

Sponsors can access:
- **Activations**: View sponsorship activations
- **Deliverables**: Track deliverable fulfillment
- **Reports**: Access performance reports and analytics
- **Assets**: Download brand assets and materials

### Vendor Portal
**Path:** `/portal/vendor`

**Workflow:** WF-ATLVS-030 (Vendor Portal)

Vendors can access:
- **Purchase Orders**: View and acknowledge POs
- **Invoices**: Submit invoices for payment
- **Payment Status**: Track payment processing
- **Rate Card**: Update pricing and availability
- **Contracts**: Access and sign contracts

---

## FAQ & Troubleshooting

### Account & Access

**Q: How do I change my email address?**
A: Go to Settings > Account > Email. Enter your new email and verify it via the confirmation link sent to the new address.

**Q: I forgot my password. What do I do?**
A: Click "Forgot Password" on the login page (`/auth/forgot-password`). Enter your email and follow the reset instructions sent to your inbox.

**Q: Can I have multiple roles?**
A: Yes, users can have multiple platform roles and event-specific roles. Your access is the combination of all assigned roles.

**Q: How do I enable two-factor authentication?**
A: Go to Settings > Security > Two-Factor Authentication. Follow the setup wizard to enable 2FA using an authenticator app.

**Q: I'm locked out of my account. What should I do?**
A: Contact support at support@ghxstship.com with your email address. After identity verification, we can help restore access.

### Tickets & Orders

**Q: How do I get a refund?**
A: Go to My Orders (`/orders`), find the order, and click "Request Refund." Refunds are processed within 5-7 business days based on the event's refund policy.

**Q: Can I transfer my ticket to someone else?**
A: Yes, open the ticket in My Tickets (`/tickets`) and click "Transfer." Enter the recipient's email address. They'll receive an email to claim the ticket.

**Q: My ticket isn't showing up. What should I do?**
A: Check your spam folder for the confirmation email. If still missing, verify you're logged into the correct account. Contact support if the issue persists.

**Q: How do I add tickets to my mobile wallet?**
A: Open the ticket in My Tickets, click "Add to Wallet," and select Apple Wallet or Google Pay. The ticket will be added to your device.

**Q: Can I resell my tickets?**
A: If the event allows resale, go to My Tickets, select the ticket, and click "List for Resale." Set your price and the ticket will be listed on the marketplace.

### Technical Issues

**Q: The page won't load. What should I do?**
A: Try these steps in order:
1. Refresh the page
2. Clear your browser cache
3. Try a different browser
4. Check your internet connection
5. Contact support if the issue persists

**Q: I'm getting an error message. What does it mean?**
A: Note the error code and message, then contact support with these details. Common codes:
- **401**: Session expired - sign in again
- **403**: Permission denied - contact your admin
- **404**: Page not found - check the URL
- **500**: Server error - try again later

**Q: The mobile app is crashing. What should I do?**
A: Try these steps:
1. Force close and reopen the app
2. Check for app updates
3. Restart your device
4. Reinstall the app
5. Contact support if the issue persists

### Billing & Payments

**Q: How do I update my payment method?**
A: Go to Settings > Payment Methods to add, edit, or remove payment methods. You can set a default payment method for future purchases.

**Q: Where can I find my invoices?**
A: Go to Settings > Billing > Invoice History to view and download invoices. You can also access invoices from the Orders page.

**Q: Why was my payment declined?**
A: Common reasons include:
- Insufficient funds
- Card expired
- Incorrect billing address
- Bank security block
Contact your bank or try a different payment method.

**Q: How do I cancel my subscription?**
A: Go to Settings > Billing > Subscription and click "Cancel Subscription." Your access continues until the end of the billing period.

### Production & Operations

**Q: How do I assign crew to a production?**
A: Go to the production in COMPVSS, navigate to the Crew tab, and click "Assign Crew." Search for crew members, select their role, and confirm the assignment.

**Q: How do I submit an expense for reimbursement?**
A: Go to Expenses in ATLVS, click "Add Expense," fill in the details, upload your receipt, and submit for approval.

**Q: How do I access the run of show?**
A: Go to the production in COMPVSS and navigate to Run of Show. You can view, edit, and mark cues as complete during the event.

**Q: How do I report a safety incident?**
A: Go to Safety > Incidents in COMPVSS, click "Report Incident," fill in all required details, and submit. Follow up with any additional documentation.

---

# Part 5: Reference

## Workflow Cross-Reference

### By Platform

| Platform | Workflow Count | Documentation |
|----------|----------------|---------------|
| ATLVS | 31 workflows | [ATLVS_WORKFLOWS.md](../workflows/ATLVS_WORKFLOWS.md) |
| COMPVSS | 34 workflows | [COMPVSS_WORKFLOWS.md](../workflows/COMPVSS_WORKFLOWS.md) |
| GVTEWAY | 31 workflows | [GVTEWAY_WORKFLOWS.md](../workflows/GVTEWAY_WORKFLOWS.md) |

### By User Role

| Role | Key Workflows |
|------|---------------|
| **Admin** | User management, settings, integrations, compliance |
| **Team Member** | Daily tasks, expense submission, production work |
| **Viewer** | Read-only access to assigned resources |
| **Artist** | Portal access, advancing, schedule |
| **Crew** | Check-in, assignments, timesheets, training |
| **Vendor** | Portal access, POs, invoices, deliveries |
| **Consumer** | Discovery, purchase, tickets, engagement |

### By Lifecycle Stage

| Stage | ATLVS Workflows | COMPVSS Workflows | GVTEWAY Workflows |
|-------|-----------------|-------------------|-------------------|
| **Initiation** | WF-001, WF-004, WF-005 | WF-014 | WF-021 |
| **Planning** | WF-002, WF-003, WF-006 | WF-001, WF-002, WF-003 | WF-022 |
| **Execution** | WF-007, WF-010, WF-014 | WF-009, WF-010 | WF-027 |
| **Monitoring** | WF-002, WF-019 | WF-006, WF-007 | WF-023, WF-024 |
| **Closure** | WF-011 | WF-011, WF-012 | WF-028 |

---

## Support & Resources

### Contact Support

| Channel | Details | Hours |
|---------|---------|-------|
| **Email** | support@ghxstship.com | 24/7 response within 24h |
| **Help Center** | https://help.ghxstship.com | Self-service 24/7 |
| **Live Chat** | In-app chat widget | Mon-Fri 9AM-6PM EST |
| **Phone** | 1-800-GHXSTSHIP | Mon-Fri 9AM-6PM EST |

### Business Hours
- **Monday - Friday:** 9 AM - 6 PM EST
- **Saturday:** 10 AM - 4 PM EST
- **Sunday:** Closed

### Emergency Support
For urgent production issues during events:
- **Hotline:** 1-800-GHXSTSHIP (24/7 during events)
- **Emergency Email:** urgent@ghxstship.com
- **Response Time:** 15 minutes during live events

### Documentation Resources

| Resource | Location |
|----------|----------|
| **User Guides** | `/docs/guides/USER_GUIDES.md` |
| **Workflow Documentation** | `/docs/workflows/` |
| **API Documentation** | `/docs/api/` |
| **Architecture** | `/docs/architecture/` |
| **Permissions** | `/docs/PERMISSIONS.md` |

### Training Resources

- **Video Tutorials:** Available in Help Center
- **Webinars:** Monthly training sessions
- **Knowledge Base:** Searchable articles and guides
- **Community Forum:** Peer support and best practices

---

*Document Version: 2.0*  
*Last Updated: December 31, 2025*  
*Total Workflows Documented: 96*  
*Platforms Covered: GVTEWAY, ATLVS, COMPVSS*
