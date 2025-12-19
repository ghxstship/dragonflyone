# DRAGONFLYONE PLATFORM SITE MAP
**Generated:** 2024-12-19
**Total Pages:** 734
**Last Marketing Update:** 2024-12-19 (7-Tier BYO Model)

---

## ATLVS (Venue & Production Management) - 366 Pages

### Authentication
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/auth/forgot-password` - Password recovery
- `/auth/magic-link` - Magic link auth
- `/auth/reset-password` - Password reset
- `/auth/verify-email` - Email verification

### Dashboard & Core
- `/` - Home/Landing
- `/dashboard` - Main dashboard
- `/profile` - User profile
- `/notifications` - Notifications
- `/settings/appearance` - Appearance settings
- `/quick-links` - Quick links
- `/offline` - Offline mode

### Authenticated Routes (CRM/Sales)
- `/(authenticated)/analytics` - Analytics dashboard
- `/(authenticated)/analytics/pipeline` - Pipeline analytics
- `/(authenticated)/analytics/revenue` - Revenue analytics
- `/(authenticated)/availability` - Availability management
- `/(authenticated)/availability/widget` - Availability widget
- `/(authenticated)/beos/[id]/preview` - BEO preview
- `/(authenticated)/beos/templates` - BEO templates
- `/(authenticated)/bookings` - Bookings list
- `/(authenticated)/bookings/[id]` - Booking detail
- `/(authenticated)/bookings/[id]/edit` - Edit booking
- `/(authenticated)/bookings/new` - New booking
- `/(authenticated)/bookings/packages` - Booking packages
- `/(authenticated)/bookings/templates` - Booking templates
- `/(authenticated)/calendar` - Calendar view
- `/(authenticated)/calendar/spaces` - Spaces calendar
- `/(authenticated)/calendar/timeline` - Timeline view
- `/(authenticated)/catalog` - Service catalog
- `/(authenticated)/catalog/[id]` - Catalog item
- `/(authenticated)/catalog/categories` - Catalog categories
- `/(authenticated)/catalog/new` - New catalog item
- `/(authenticated)/client-portal` - Client portal
- `/(authenticated)/client-portal/documents` - Client documents
- `/(authenticated)/client-portal/events` - Client events
- `/(authenticated)/client-portal/invoices` - Client invoices
- `/(authenticated)/contacts` - Contacts list
- `/(authenticated)/contacts/[id]` - Contact detail
- `/(authenticated)/contacts/[id]/edit` - Edit contact
- `/(authenticated)/contacts/[id]/timeline` - Contact timeline
- `/(authenticated)/contacts/duplicates` - Duplicate contacts
- `/(authenticated)/contacts/new` - New contact
- `/(authenticated)/contracts` - Contracts list
- `/(authenticated)/contracts/[id]` - Contract detail
- `/(authenticated)/contracts/[id]/audit` - Contract audit
- `/(authenticated)/contracts/clauses` - Contract clauses
- `/(authenticated)/contracts/new` - New contract
- `/(authenticated)/contracts/templates` - Contract templates
- `/(authenticated)/floor-plans` - Floor plans
- `/(authenticated)/floor-plans/[id]` - Floor plan detail
- `/(authenticated)/floor-plans/new` - New floor plan
- `/(authenticated)/holds` - Holds management
- `/(authenticated)/holds/expiring` - Expiring holds
- `/(authenticated)/inventory` - Inventory
- `/(authenticated)/inventory/availability` - Inventory availability
- `/(authenticated)/inventory/new` - New inventory
- `/(authenticated)/inventory/scan` - Inventory scan
- `/(authenticated)/invoices/[id]/preview` - Invoice preview
- `/(authenticated)/lead-forms` - Lead forms
- `/(authenticated)/lead-forms/[id]` - Lead form detail
- `/(authenticated)/lead-forms/[id]/analytics` - Lead form analytics
- `/(authenticated)/lead-forms/[id]/embed` - Lead form embed
- `/(authenticated)/lead-forms/[id]/submissions` - Lead form submissions
- `/(authenticated)/lead-forms/new` - New lead form
- `/(authenticated)/payment-schedules` - Payment schedules
- `/(authenticated)/payment-schedules/overdue` - Overdue payments
- `/(authenticated)/payment-schedules/upcoming` - Upcoming payments
- `/(authenticated)/payments/[id]` - Payment detail
- `/(authenticated)/pipeline` - Sales pipeline
- `/(authenticated)/pipeline/analytics` - Pipeline analytics
- `/(authenticated)/pipeline/deals/[id]` - Deal detail
- `/(authenticated)/pipeline/deals/new` - New deal
- `/(authenticated)/pipeline/settings` - Pipeline settings
- `/(authenticated)/preferred-vendors` - Preferred vendors
- `/(authenticated)/preferred-vendors/[id]` - Vendor detail
- `/(authenticated)/preferred-vendors/new` - New preferred vendor
- `/(authenticated)/project-costs` - Project costs
- `/(authenticated)/proposals` - Proposals
- `/(authenticated)/proposals/[id]` - Proposal detail
- `/(authenticated)/proposals/[id]/analytics` - Proposal analytics
- `/(authenticated)/proposals/[id]/edit` - Edit proposal
- `/(authenticated)/proposals/new` - New proposal
- `/(authenticated)/proposals/templates` - Proposal templates
- `/(authenticated)/purchase-orders` - Purchase orders
- `/(authenticated)/purchase-orders/[id]` - PO detail
- `/(authenticated)/purchase-orders/[id]/receive` - PO receiving
- `/(authenticated)/purchase-orders/new` - New PO
- `/(authenticated)/reports` - Reports
- `/(authenticated)/reports/revenue` - Revenue reports
- `/(authenticated)/rfps/[id]/compare` - RFP comparison
- `/(authenticated)/rfps/new` - New RFP
- `/(authenticated)/settings` - Settings
- `/(authenticated)/settings/billing` - Billing settings
- `/(authenticated)/settings/integrations` - Integrations
- `/(authenticated)/settings/notifications` - Notification settings
- `/(authenticated)/settings/team` - Team settings
- `/(authenticated)/sign/[token]` - Document signing
- `/(authenticated)/spaces` - Spaces
- `/(authenticated)/spaces/[id]` - Space detail
- `/(authenticated)/spaces/[id]/capacity` - Space capacity
- `/(authenticated)/spaces/[id]/pricing` - Space pricing
- `/(authenticated)/spaces/combinations` - Space combinations
- `/(authenticated)/spaces/new` - New space
- `/(authenticated)/vendor-invoices` - Vendor invoices
- `/(authenticated)/vendor-invoices/[id]` - Vendor invoice detail
- `/(authenticated)/vendor-invoices/new` - New vendor invoice
- `/(authenticated)/vendor-orders` - Vendor orders
- `/(authenticated)/vendor-orders/[id]` - Vendor order detail
- `/(authenticated)/vendor-orders/approvals` - Vendor approvals
- `/(authenticated)/vendor-orders/new` - New vendor order
- `/(authenticated)/vendors` - Vendors
- `/(authenticated)/vendors/[id]` - Vendor detail
- `/(authenticated)/vendors/[id]/issues` - Vendor issues
- `/(authenticated)/vendors/[id]/metrics` - Vendor metrics
- `/(authenticated)/vendors/[id]/performance` - Vendor performance
- `/(authenticated)/vendors/[id]/reviews` - Vendor reviews
- `/(authenticated)/vendors/categories` - Vendor categories
- `/(authenticated)/vendors/new` - New vendor
- `/(authenticated)/webhooks` - Webhooks
- `/(authenticated)/webhooks/new` - New webhook

### Production Routes `/p/[productionId]/`
- `/p/[productionId]/advancing` - Production advancing
- `/p/[productionId]/advancing/allocations` - Advancing allocations
- `/p/[productionId]/advancing/fulfillment` - Advancing fulfillment
- `/p/[productionId]/advancing/history` - Advancing history
- `/p/[productionId]/alignment` - Production alignment
- `/p/[productionId]/assets` - Production assets
- `/p/[productionId]/budgets` - Production budgets
- `/p/[productionId]/close` - Production close
- `/p/[productionId]/compliance` - Production compliance
- `/p/[productionId]/contracts` - Production contracts
- `/p/[productionId]/documents` - Production documents
- `/p/[productionId]/expenses` - Production expenses
- `/p/[productionId]/insurance` - Production insurance
- `/p/[productionId]/investors` - Production investors
- `/p/[productionId]/investors/documents` - Investor documents
- `/p/[productionId]/investors/reports` - Investor reports
- `/p/[productionId]/investors/rounds` - Investment rounds
- `/p/[productionId]/invoices` - Production invoices
- `/p/[productionId]/marketing` - Production marketing
- `/p/[productionId]/metrics` - Production metrics
- `/p/[productionId]/overview` - Production overview
- `/p/[productionId]/permits` - Production permits
- `/p/[productionId]/procurement` - Production procurement
- `/p/[productionId]/procurement/purchase-orders` - Production POs
- `/p/[productionId]/procurement/quotes` - Production quotes
- `/p/[productionId]/procurement/rfps` - Production RFPs
- `/p/[productionId]/reconciliation` - Production reconciliation
- `/p/[productionId]/schedule` - Production schedule
- `/p/[productionId]/schedule/contingencies` - Schedule contingencies
- `/p/[productionId]/schedule/tasks` - Schedule tasks
- `/p/[productionId]/schedule/templates` - Schedule templates
- `/p/[productionId]/settings` - Production settings
- `/p/[productionId]/shows` - Production shows
- `/p/[productionId]/shows/cues` - Show cues
- `/p/[productionId]/shows/run-of-show` - Run of show
- `/p/[productionId]/shows/set-times` - Set times
- `/p/[productionId]/sponsors` - Production sponsors
- `/p/[productionId]/stakeholders` - Production stakeholders
- `/p/[productionId]/team` - Production team
- `/p/[productionId]/team/assignments` - Team assignments
- `/p/[productionId]/team/training` - Team training
- `/p/[productionId]/vendors` - Production vendors
- `/p/[productionId]/venues` - Production venues
- `/p/[productionId]/venues/maps` - Venue maps
- `/p/[productionId]/venues/zones` - Venue zones
- `/p/[productionId]/wrap` - Production wrap

### Public/Marketing Pages
- `/about` - About us
- `/blog` - Blog
- `/careers` - Careers
- `/case-studies` - Case studies
- `/changelog` - Changelog
- `/contact` - Contact us
- `/demo` - Request demo ✅ **Updated 12/19** (BYO tool stack form)
- `/docs/api` - API documentation
- `/features` - Features
- `/guides` - Guides
- `/help` - Help center
- `/help/community` - Community
- `/help/docs` - Documentation
- `/help/faq` - FAQ
- `/help/getting-started` - Getting started
- `/help/tutorials` - Tutorials
- `/legal/accessibility` - Accessibility
- `/legal/cookies` - Cookie policy
- `/legal/privacy` - Privacy policy
- `/legal/terms` - Terms of service
- `/partners` - Partners
- `/press` - Press
- `/pricing` - Pricing ✅ **Updated 12/19** (7-tier BYO model)
- `/products` - Products ✅ **Updated 12/19** (competitor replacement messaging)
- `/products/atlvs` - ATLVS product
- `/products/compare` - Product comparison ✅ **Updated 12/19** (7-tier matrix + scenarios)
- `/products/compvss` - COMPVSS product
- `/products/gvteway` - GVTEWAY product
- `/resources` - Resources
- `/security` - Security
- `/solutions` - Solutions ✅ **Updated 12/19** (role-tier-BYO mapping)
- `/solutions/[slug]` - Solution detail
- `/status` - Status page
- `/verticals/activations` - Activations vertical
- `/verticals/destinations` - Destinations vertical
- `/verticals/installations` - Installations vertical
- `/verticals/productions` - Productions vertical

#### 7-Tier Pricing Structure (Updated 12/19)
| Tier | Products | Category | BYO |
|------|----------|----------|-----|
| GVTEWAY | Ticketing | Single | CRM, Finance, Crews |
| COMPVSS | Crews | Single | CRM, Finance, Ticketing |
| ATLVS | Business | Single | Crews, Ticketing |
| OPERATIONS | GVTEWAY + COMPVSS | Bundle | CRM, Finance |
| EXPERIENCE | ATLVS + GVTEWAY | Bundle | Crews |
| PRODUCTION | ATLVS + COMPVSS | Bundle | Ticketing |
| ENTERPRISE | All Three | Full Stack | Nothing |

### Finance & Accounting
- `/advances` - Advances
- `/advances/[id]` - Advance detail
- `/billing` - Billing
- `/bills` - Bills
- `/budgets` - Budgets
- `/budgets/categories` - Budget categories
- `/expenses` - Expenses
- `/expenses/[id]` - Expense detail
- `/expenses/categories` - Expense categories
- `/expenses/reports` - Expense reports
- `/finance` - Finance dashboard
- `/finance/accounts-receivable` - AR
- `/finance/bank-reconciliation` - Bank reconciliation
- `/finance/commissions` - Commissions
- `/finance/credit-cards` - Credit cards
- `/invoices` - Invoices
- `/invoices/[id]` - Invoice detail
- `/invoices/new` - New invoice
- `/payments` - Payments
- `/payments/settings` - Payment settings
- `/payroll` - Payroll
- `/pay/[token]` - Payment page
- `/quotes` - Quotes
- `/revenue-recognition` - Revenue recognition
- `/taxes` - Taxes

### Operations
- `/action-items` - Action items
- `/advancing` - Advancing
- `/advancing/requests/[id]` - Advancing request
- `/alignment` - Alignment
- `/artists` - Artists
- `/assets` - Assets
- `/assets/calibration` - Asset calibration
- `/assets/damage-reports` - Damage reports
- `/assets/idle-analysis` - Idle analysis
- `/assets/kits` - Asset kits
- `/assets/maintenance` - Asset maintenance
- `/assets/optimization` - Asset optimization
- `/assets/performance` - Asset performance
- `/assets/rentals` - Asset rentals
- `/assets/scan` - Asset scanning
- `/assets/serialized` - Serialized assets
- `/assets/specifications` - Asset specs
- `/assets/storage` - Asset storage
- `/assets/tracking` - Asset tracking
- `/assets/utilization` - Asset utilization
- `/audit` - Audit
- `/audit-logs` - Audit logs
- `/clients` - Clients
- `/compliance` - Compliance
- `/crew` - Crew
- `/departments` - Departments
- `/documents` - Documents
- `/employees` - Employees
- `/events` - Events
- `/governance` - Governance
- `/insurance` - Insurance
- `/insurance/[id]` - Insurance detail
- `/integrations` - Integrations
- `/integrations/[provider]` - Integration detail
- `/leads` - Leads
- `/leads/scoring` - Lead scoring
- `/locations` - Locations
- `/metrics` - Metrics
- `/metrics/kpis` - KPIs
- `/metrics/reports` - Metric reports
- `/okrs` - OKRs
- `/onboarding` - Onboarding
- `/opportunities` - Opportunities
- `/orders` - Orders
- `/organization` - Organization
- `/partnerships` - Partnerships
- `/performance` - Performance
- `/permits` - Permits
- `/permits/[id]` - Permit detail
- `/portfolio` - Portfolio
- `/procurement` - Procurement
- `/procurement/categories` - Procurement categories
- `/procurement/emergency` - Emergency procurement
- `/procurement/logistics` - Logistics
- `/procurement/vendor-audits` - Vendor audits
- `/procurement/vendor-selection` - Vendor selection
- `/productions` - Productions
- `/productions/new` - New production
- `/projects` - Projects
- `/projects/[id]` - Project detail
- `/proposal/[token]` - Proposal view
- `/reports/scheduled` - Scheduled reports
- `/rfp` - RFP
- `/risks` - Risks
- `/roles` - Roles
- `/scenarios` - Scenarios
- `/schedule` - Schedule
- `/schedule/contingencies` - Contingencies
- `/schedule/contingencies/[id]` - Contingency detail
- `/schedule/tasks` - Tasks
- `/schedule/tasks/[id]` - Task detail
- `/schedule/templates` - Schedule templates
- `/schedules` - Schedules
- `/stakeholders` - Stakeholders
- `/subsidiaries` - Subsidiaries
- `/tags` - Tags
- `/templates` - Templates
- `/tickets` - Tickets
- `/timesheets` - Timesheets
- `/training` - Training
- `/workflows` - Workflows

### Sponsors & Investors
- `/investors` - Investors
- `/investors/[id]` - Investor detail
- `/investors/documents` - Investor documents
- `/investors/reports` - Investor reports
- `/investors/rounds` - Investment rounds
- `/sponsors` - Sponsors
- `/sponsors/[id]` - Sponsor detail
- `/sponsors/deck` - Sponsor deck
- `/sponsors/fulfillment` - Sponsor fulfillment
- `/sponsors/reports` - Sponsor reports
- `/sponsors/tiers` - Sponsor tiers

### Portals
- `/portal/artist` - Artist portal
- `/portal/crew` - Crew portal
- `/portal/investor` - Investor portal
- `/portal/investor/investor-updates` - Investor updates
- `/portal/investor/my-investments` - My investments
- `/portal/sponsor` - Sponsor portal
- `/portal/sponsor/my-activations` - My activations
- `/portal/sponsor/my-deliverables` - My deliverables
- `/portal/sponsor/my-reports` - My reports
- `/portal/vendor` - Vendor portal

### Venues
- `/venues` - Venues
- `/venues/[id]` - Venue detail
- `/venues/maps` - Venue maps
- `/venues/zones` - Venue zones
- `/venues/zones/[id]` - Zone detail

### Vendors
- `/vendors/contracts` - Vendor contracts
- `/vendors/rate-cards` - Rate cards

### Workforce/HR
- `/benefits` - Benefits
- `/workforce` - Workforce
- `/workforce/background-checks` - Background checks
- `/workforce/compensation` - Compensation
- `/workforce/handbook` - Handbook
- `/workforce/labor-laws` - Labor laws
- `/workforce/referrals` - Referrals
- `/workforce/succession` - Succession
- `/workforce/union-compliance` - Union compliance
- `/workforce/union-rules` - Union rules

### CRM
- `/crm` - CRM dashboard
- `/crm/calendar` - CRM calendar
- `/crm/email-integration` - Email integration
- `/crm/lead-scoring` - Lead scoring
- `/crm/relationships` - Relationships
- `/crm/tasks` - CRM tasks

### Admin
- `/(dashboard)/admin/batch-operations` - Batch operations
- `/(dashboard)/admin/users` - User management

### API & Development
- `/api-management` - API management
- `/api-management/keys` - API keys
- `/api-management/logs` - API logs
- `/api-management/webhooks` - API webhooks
- `/design-system` - Design system
- `/generator` - Generator
- `/generator/share/[id]` - Share generator
- `/ip-tracking` - IP tracking
- `/marketing/attribution` - Marketing attribution

---

## COMPVSS (Production Operations) - 172 Pages

### Authentication
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/auth/forgot-password` - Password recovery
- `/auth/magic-link` - Magic link
- `/auth/reset-password` - Password reset
- `/auth/verify-email` - Email verification

### Dashboard & Core
- `/` - Home
- `/dashboard` - Dashboard
- `/profile` - Profile
- `/notifications` - Notifications
- `/settings` - Settings
- `/offline` - Offline mode
- `/onboarding` - Onboarding

### Authenticated Routes
- `/(authenticated)/beos` - BEOs
- `/(authenticated)/beos/[id]` - BEO detail
- `/(authenticated)/beos/new` - New BEO
- `/(authenticated)/vendor-communications` - Vendor communications
- `/(authenticated)/vendor-schedules` - Vendor schedules
- `/(authenticated)/vendor-schedules/new` - New vendor schedule

### Advancing
- `/advancing` - Advancing
- `/advancing/[id]` - Advancing detail
- `/advancing/catalog` - Advancing catalog
- `/advancing/new` - New advancing

### Crew Management
- `/crew` - Crew directory
- `/crew/assign` - Crew assignments
- `/crew/background-checks` - Background checks
- `/crew/social` - Crew social
- `/crew-social` - Crew social (alternate)
- `/directory` - Directory
- `/directory/availability` - Crew availability
- `/directory/filters` - Directory filters

### My Portal (Crew Self-Service)
- `/my-assignments` - My assignments
- `/my-contracts` - My contracts
- `/my-credentials` - My credentials
- `/my-deliveries` - My deliveries
- `/my-hospitality` - My hospitality
- `/my-invoices` - My invoices
- `/my-rider` - My rider
- `/my-schedule` - My schedule
- `/my-timesheets` - My timesheets
- `/my-training` - My training

### Credentials
- `/credentials` - Credentials
- `/credentials/issue` - Issue credentials
- `/credentials/reports` - Credential reports
- `/credentials/scan` - Scan credentials
- `/credentials/types` - Credential types
- `/credentials/zones` - Credential zones

### Communications
- `/channels` - Channels
- `/communications` - Communications
- `/communications/channels` - Communication channels
- `/messages` - Messages

### Safety & Emergency
- `/emergency` - Emergency
- `/incidents` - Incidents
- `/safety` - Safety
- `/risk-register` - Risk register
- `/backup-plans` - Backup plans

### Operations
- `/availability` - Availability
- `/build-strike` - Build/Strike
- `/catering` - Catering
- `/clock-in` - Clock in/out
- `/deliveries` - Deliveries
- `/drawings` - Drawings/CAD
- `/equipment` - Equipment
- `/expenses` - Expenses
- `/files` - Files
- `/integrations` - Integrations
- `/issues` - Issues
- `/logistics` - Logistics
- `/maintenance` - Maintenance
- `/permits` - Permits
- `/photo-documentation` - Photo documentation
- `/punch-list` - Punch list
- `/qa-checkpoints` - QA checkpoints
- `/run-of-show` - Run of show
- `/schedule` - Schedule
- `/set-times` - Set times
- `/settlement` - Settlement
- `/show-call` - Show call
- `/site-access` - Site access
- `/site-surveys` - Site surveys
- `/soundcheck` - Soundcheck
- `/spec-sheets` - Spec sheets
- `/stage-management` - Stage management
- `/subcontractors` - Subcontractors
- `/tech-rehearsal` - Tech rehearsal
- `/timekeeping` - Timekeeping
- `/travel` - Travel
- `/troubleshooting` - Troubleshooting
- `/vendors/compare` - Vendor comparison
- `/venues` - Venues
- `/vip-management` - VIP management
- `/weather` - Weather
- `/weather-contingency` - Weather contingency

### Knowledge & Documentation
- `/best-practices` - Best practices
- `/case-studies` - Case studies
- `/glossary` - Glossary
- `/knowledge` - Knowledge base
- `/knowledge/brand-guidelines` - Brand guidelines
- `/knowledge/multilingual` - Multilingual
- `/knowledge/offline` - Offline knowledge
- `/knowledge/regulations` - Regulations
- `/mentorship` - Mentorship
- `/skills` - Skills
- `/sops` - SOPs
- `/sops/[id]` - SOP detail
- `/sops/acknowledgments` - SOP acknowledgments
- `/sops/categories` - SOP categories
- `/sops/training` - SOP training
- `/templates` - Templates

### Portals
- `/artist-portal` - Artist portal
- `/artists` - Artists
- `/bid-portal` - Bid portal
- `/social-amplification` - Social amplification
- `/stakeholder-portal` - Stakeholder portal
- `/vendor-portal` - Vendor portal

### Projects
- `/projects` - Projects
- `/projects/new` - New project

### Reports
- `/reports/daily` - Daily reports
- `/reports/daily/[id]` - Daily report detail
- `/reports/wrap` - Wrap reports
- `/reports/wrap/[id]` - Wrap report detail

### Opportunities
- `/opportunities` - Opportunities
- `/opportunities/bid-decision` - Bid decision
- `/opportunities/mobile` - Mobile opportunities
- `/opportunities/proposals` - Proposals
- `/opportunities/win-loss` - Win/loss analysis

### Certifications & Background
- `/background-checks` - Background checks
- `/certifications` - Certifications

### Production Routes `/p/[productionId]/`
- `/p/[productionId]/advancing` - Advancing
- `/p/[productionId]/advancing/templates` - Advancing templates
- `/p/[productionId]/catering` - Catering
- `/p/[productionId]/communication` - Communication
- `/p/[productionId]/communication/channels` - Channels
- `/p/[productionId]/communication/messages` - Messages
- `/p/[productionId]/communication/stakeholder-portal` - Stakeholder portal
- `/p/[productionId]/credentials` - Credentials
- `/p/[productionId]/crew` - Crew
- `/p/[productionId]/crew/timekeeping` - Timekeeping
- `/p/[productionId]/documents` - Documents
- `/p/[productionId]/documents/backup-plans` - Backup plans
- `/p/[productionId]/documents/files` - Files
- `/p/[productionId]/documents/sops` - SOPs
- `/p/[productionId]/documents/spec-sheets` - Spec sheets
- `/p/[productionId]/documents/templates` - Templates
- `/p/[productionId]/expenses` - Expenses
- `/p/[productionId]/incidents` - Incidents
- `/p/[productionId]/load-in` - Load in
- `/p/[productionId]/load-out` - Load out
- `/p/[productionId]/logistics` - Logistics
- `/p/[productionId]/lost-found` - Lost & found
- `/p/[productionId]/operations` - Operations
- `/p/[productionId]/overview` - Overview
- `/p/[productionId]/quality` - Quality
- `/p/[productionId]/quality/issues` - Quality issues
- `/p/[productionId]/quality/punch-list` - Punch list
- `/p/[productionId]/quality/qa-checkpoints` - QA checkpoints
- `/p/[productionId]/quality/troubleshooting` - Troubleshooting
- `/p/[productionId]/reports` - Reports
- `/p/[productionId]/safety` - Safety
- `/p/[productionId]/schedule` - Schedule
- `/p/[productionId]/schedule/build-strike` - Build/Strike
- `/p/[productionId]/schedule/run-of-show` - Run of show
- `/p/[productionId]/schedule/set-times` - Set times
- `/p/[productionId]/schedule/show-call` - Show call
- `/p/[productionId]/schedule/soundcheck` - Soundcheck
- `/p/[productionId]/schedule/tech-rehearsal` - Tech rehearsal
- `/p/[productionId]/settings` - Settings
- `/p/[productionId]/settlement` - Settlement
- `/p/[productionId]/strike` - Strike
- `/p/[productionId]/vendors` - Vendors
- `/p/[productionId]/weather` - Weather
- `/p/[productionId]/wrap` - Wrap

---

## GVTEWAY (Fan Experience Platform) - 196 Pages

### Authentication
- `/(auth)/login` - Login
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/auth/forgot-password` - Password recovery
- `/auth/magic-link` - Magic link
- `/auth/reset-password` - Password reset
- `/auth/verify-email` - Email verification

### Dashboard & Core
- `/` - Home
- `/dashboard` - Dashboard
- `/profile` - Profile
- `/profile/badges` - User badges
- `/profile/reputation` - User reputation
- `/notifications` - Notifications
- `/settings` - Settings
- `/settings/language` - Language settings
- `/settings/notifications` - Notification settings
- `/settings/privacy` - Privacy settings
- `/offline` - Offline mode
- `/onboarding` - Onboarding
- `/design-system` - Design system

### Account
- `/account` - Account
- `/account/my-refunds` - My refunds
- `/account/my-transfers` - My transfers
- `/account/orders` - My orders
- `/account/profile` - Profile settings
- `/account/tickets` - My tickets

### Browse & Discovery
- `/browse` - Browse events
- `/calendar` - Event calendar
- `/discover` - Discover
- `/discover/quiz` - Discovery quiz
- `/favorites` - Favorites
- `/map` - Map
- `/match` - Match
- `/nearby` - Nearby events
- `/new-events` - New events
- `/saved-searches` - Saved searches
- `/search` - Search
- `/search/universal` - Universal search

### Events
- `/events` - Events list
- `/events/[id]` - Event detail
- `/events/[id]/accessibility` - Event accessibility
- `/events/[id]/chat` - Event chat
- `/events/[id]/engage` - Event engagement
- `/events/[id]/entry-info` - Entry info
- `/events/[id]/floor-config` - Floor configuration
- `/events/[id]/friends` - Friends at event
- `/events/[id]/landing-builder` - Landing builder
- `/events/[id]/languages` - Event languages
- `/events/[id]/map` - Event map
- `/events/[id]/parking` - Parking
- `/events/[id]/photo-booth` - Photo booth
- `/events/[id]/program` - Program
- `/events/[id]/rfid` - RFID
- `/events/[id]/seating` - Seating
- `/events/[id]/services` - Services
- `/events/[id]/social-wall` - Social wall
- `/events/[id]/ticket` - Ticket
- `/events/[id]/waitlist` - Waitlist
- `/events/clone` - Clone event
- `/events/compare` - Compare events
- `/events/create` - Create event
- `/events/create/collaboration` - Collaborative creation
- `/events/create/from-blueprint` - From blueprint
- `/events/templates` - Event templates

### Event Routes `/e/[eventId]/`
- `/e/[eventId]` - Event detail
- `/e/[eventId]/box-office` - Box office
- `/e/[eventId]/chat` - Chat
- `/e/[eventId]/check-in` - Check-in
- `/e/[eventId]/credentials` - Credentials
- `/e/[eventId]/engage` - Engagement
- `/e/[eventId]/engage/challenges` - Challenges
- `/e/[eventId]/engage/polls` - Polls
- `/e/[eventId]/engage/qa` - Q&A
- `/e/[eventId]/engage/ugc` - UGC
- `/e/[eventId]/entry-info` - Entry info
- `/e/[eventId]/friends` - Friends
- `/e/[eventId]/lineup` - Lineup
- `/e/[eventId]/map` - Map
- `/e/[eventId]/my-tickets` - My tickets
- `/e/[eventId]/navigate` - Navigate
- `/e/[eventId]/navigate/accessibility` - Accessibility
- `/e/[eventId]/navigate/directions` - Directions
- `/e/[eventId]/navigate/parking` - Parking
- `/e/[eventId]/page` - Event page
- `/e/[eventId]/photos` - Photos
- `/e/[eventId]/program` - Program
- `/e/[eventId]/refunds` - Refunds
- `/e/[eventId]/reviews` - Reviews
- `/e/[eventId]/scan` - Scan
- `/e/[eventId]/seating` - Seating
- `/e/[eventId]/services` - Services
- `/e/[eventId]/services/emergency` - Emergency
- `/e/[eventId]/services/lost-found` - Lost & found
- `/e/[eventId]/services/support` - Support
- `/e/[eventId]/settlement` - Settlement
- `/e/[eventId]/shop` - Shop
- `/e/[eventId]/ticket` - Ticket
- `/e/[eventId]/tickets` - Tickets
- `/e/[eventId]/will-call` - Will call

### Authenticated Event Routes
- `/(authenticated)/events/[id]/check-in` - Check-in
- `/(authenticated)/events/[id]/orders` - Orders
- `/(authenticated)/events/[id]/ticketing` - Ticketing

### Ticketing
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/checkout/currency` - Currency selection
- `/confirmation` - Confirmation
- `/tickets` - Tickets
- `/tickets/anti-scalping` - Anti-scalping
- `/tickets/gift` - Gift tickets
- `/tickets/groups` - Group tickets
- `/tickets/print-at-home` - Print at home
- `/tickets/tracking` - Ticket tracking
- `/tickets/transfer` - Transfer tickets
- `/tickets/urgency` - Urgency
- `/orders` - Orders
- `/orders/history` - Order history
- `/resale` - Resale marketplace
- `/wallet` - Wallet
- `/wallet/offline` - Offline wallet

### Artists & Content
- `/artists` - Artists
- `/artists/[id]` - Artist detail
- `/collections/[id]` - Collection
- `/content` - Content
- `/creators` - Creators
- `/qa-sessions` - Q&A sessions
- `/venues` - Venues
- `/venues/[id]` - Venue detail

### Community & Social
- `/community` - Community
- `/community/challenges` - Challenges
- `/community/fan-content` - Fan content
- `/community/guidelines` - Guidelines
- `/community/polls` - Polls
- `/forums` - Forums
- `/friends` - Friends
- `/groups` - Groups
- `/messages` - Messages
- `/reviews` - Reviews
- `/reviews/new` - New review
- `/ugc` - User-generated content

### Fan Engagement
- `/activity` - Activity feed
- `/deals` - Deals
- `/experiences` - Experiences
- `/fan-club` - Fan club
- `/fan-club/exclusive-access` - Exclusive access
- `/fan-clubs` - Fan clubs
- `/gift-cards` - Gift cards
- `/membership` - Membership
- `/membership/benefits` - Benefits
- `/merch` - Merchandise
- `/merch/[artistId]` - Artist merch
- `/merch/bundles` - Bundles
- `/packages` - Packages
- `/photos` - Photos
- `/price-alerts` - Price alerts
- `/referrals` - Referrals
- `/rewards` - Rewards
- `/tours` - Tours
- `/watch-parties` - Watch parties
- `/wishlist` - Wishlist

### Accessibility & Services
- `/accessibility` - Accessibility
- `/accessibility/request` - Accessibility request
- `/directions` - Directions
- `/destinations` - Destinations
- `/help` - Help
- `/lost-found` - Lost & found
- `/support/chat` - Support chat
- `/surveys/[id]` - Survey

### Admin
- `/admin/anti-scalping` - Anti-scalping admin
- `/admin/content-calendar` - Content calendar
- `/admin/contests` - Contests
- `/admin/integrations` - Integrations
- `/admin/inventory-sync` - Inventory sync
- `/admin/marketing/sms` - SMS marketing
- `/admin/moderation` - Moderation
- `/admin/pos` - POS
- `/admin/pos/cashless` - Cashless
- `/admin/pricing/early-bird` - Early bird pricing
- `/admin/promo-codes` - Promo codes
- `/admin/sales-reporting` - Sales reporting
- `/admin/will-call` - Will call admin

### Marketing
- `/marketing/ab-testing` - A/B testing
- `/marketing/analytics` - Analytics
- `/marketing/early-bird` - Early bird
- `/marketing/influencers` - Influencers
- `/marketing/media-kit` - Media kit
- `/marketing/pixels` - Tracking pixels

### Social
- `/social` - Social hub
- `/social/crisis-management` - Crisis management
- `/social/inbox` - Social inbox
- `/social/sentiment` - Sentiment analysis
- `/social/story-templates` - Story templates
- `/social/tiktok-challenges` - TikTok challenges

### Shop
- `/shop/shoppable` - Shoppable content

### Apply
- `/apply` - Apply
- `/apply/confirmation` - Application confirmation

### My Events
- `/my-events` - My events

### Moderate
- `/moderate` - Moderation

---

## Summary Statistics

| App | Pages | Categories |
|-----|-------|------------|
| ATLVS | 366 | CRM, Finance, Operations, Productions, Vendors, Portals |
| COMPVSS | 172 | Crew, Credentials, Operations, Safety, Knowledge, Productions |
| GVTEWAY | 196 | Events, Ticketing, Community, Fan Engagement, Admin |
| **Total** | **734** | |

---

## Validation Status

- [ ] ATLVS - Pending full 6-layer validation
- [ ] COMPVSS - Pending full 6-layer validation  
- [ ] GVTEWAY - Pending full 6-layer validation
