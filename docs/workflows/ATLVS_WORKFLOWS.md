# ATLVS Detailed Workflows

> **Version:** 2.0  
> **Last Updated:** December 31, 2025  
> **App Purpose:** Business operations, finance, project management, investor relations  
> **Total Pages:** 236  
> **Total Workflows:** 31

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [USER_GUIDES.md](../guides/USER_GUIDES.md) | End-to-end user guides including ATLVS business operations journey |
| [WORKFLOW_INVENTORY.md](./WORKFLOW_INVENTORY.md) | Master workflow inventory with cross-platform overview |
| [COMPVSS_WORKFLOWS.md](./COMPVSS_WORKFLOWS.md) | Production operations workflows |
| [GVTEWAY_WORKFLOWS.md](./GVTEWAY_WORKFLOWS.md) | Consumer platform workflows |

---

## Table of Contents

1. [Admin Workflows](#admin-workflows) (20 workflows)
2. [Team Member Workflows](#team-member-workflows) (4 workflows)
3. [Viewer Workflows](#viewer-workflows) (1 workflow)
4. [Portal User Workflows](#portal-user-workflows) (5 workflows)
5. [Authentication Workflows](#authentication-workflows) (1 workflow)

---

## Admin Workflows

### WF-ATLVS-001: Production Creation & Setup

**Actor:** ATLVS_ADMIN, ATLVS_SUPER_ADMIN  
**Trigger:** New production/event opportunity identified

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Productions | `/productions` | View all productions |
| 2 | Click "New Production" | `/productions/new` | Production creation form |
| 3 | Enter production details (name, dates, type, venue) | `/productions/new` | Basic info captured |
| 4 | Select production vertical | `/productions/new` | Vertical assigned |
| 5 | Assign initial team members | `/productions/new` | Team notified |
| 6 | Set initial budget parameters | `/productions/new` | Budget framework created |
| 7 | Submit for creation | `/productions/new` | Production created |
| 8 | Configure production settings | `/p/[id]/settings` | Settings customized |
| 9 | Set up budget categories | `/p/[id]/budgets` | Budget structure defined |
| 10 | Link venue(s) | `/p/[id]/venues` | Venues associated |

**Post-Conditions:**
- Production appears in dashboard
- Team members receive access
- Budget tracking initialized
- Venue linked and available

---

### WF-ATLVS-002: Budget Management & Approval

**Actor:** ATLVS_ADMIN  
**Trigger:** Budget needs to be created, modified, or approved

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access production budgets | `/p/[id]/budgets` | View budget overview |
| 2 | Create budget line items | `/p/[id]/budgets` | Line items added |
| 3 | Set category allocations | `/p/[id]/budgets` | Categories funded |
| 4 | Define approval thresholds | `/p/[id]/budgets` | Approval rules set |
| 5 | Review budget vs actuals | `/p/[id]/budgets` | Variance identified |
| 6 | Approve/reject budget requests | `/p/[id]/budgets` | Requests processed |
| 7 | Generate budget reports | `/p/[id]/budgets` | Reports created |
| 8 | Export for stakeholders | `/p/[id]/budgets` | Data exported |

**Related Workflows:**
- WF-ATLVS-010: Expense Approval
- WF-ATLVS-015: Invoice Processing

---

### WF-ATLVS-003: Vendor Onboarding & Management

**Actor:** ATLVS_ADMIN  
**Trigger:** New vendor needs to be added to system

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Vendors | `/vendors` | View vendor directory |
| 2 | Click "Add Vendor" | `/vendors` | Vendor form opens |
| 3 | Enter vendor details | `/vendors` | Basic info captured |
| 4 | Upload W-9/tax documents | `/vendors` | Tax docs stored |
| 5 | Set up rate card | `/vendors/rate-cards` | Pricing established |
| 6 | Create vendor contract | `/vendors/contracts` | Contract drafted |
| 7 | Send contract for signature | `/vendors/contracts` | Contract sent |
| 8 | Activate vendor account | `/vendors` | Vendor portal access granted |
| 9 | Assign to productions | `/p/[id]/vendors` | Vendor linked to production |

**Post-Conditions:**
- Vendor appears in directory
- Portal access credentials sent
- Rate card available for procurement
- Contract stored in documents

---

### WF-ATLVS-004: Sponsor Acquisition & Management

**Actor:** ATLVS_ADMIN  
**Trigger:** Sponsor opportunity identified or sponsor inquiry received

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Create sponsor lead in CRM | `/crm` | Lead created |
| 2 | Score lead potential | `/crm/lead-scoring` | Lead scored |
| 3 | Generate sponsor deck | `/sponsors/deck` | Deck created |
| 4 | Send deck to prospect | `/sponsors/deck` | Deck delivered |
| 5 | Track engagement | `/crm` | Engagement logged |
| 6 | Create sponsor record | `/sponsors` | Sponsor added |
| 7 | Define sponsorship tier | `/sponsors/tiers` | Tier assigned |
| 8 | Create deliverables list | `/sponsors/fulfillment` | Deliverables defined |
| 9 | Generate contract | `/contracts` | Contract created |
| 10 | Activate sponsor portal | `/sponsors/[id]` | Portal access granted |
| 11 | Track fulfillment | `/sponsors/fulfillment` | Progress monitored |
| 12 | Generate sponsor reports | `/sponsors/reports` | Reports delivered |

**Post-Conditions:**
- Sponsor in system with tier
- Deliverables tracked
- Portal access for sponsor
- Reporting automated

---

### WF-ATLVS-005: Investor Relations Management

**Actor:** ATLVS_ADMIN, ATLVS_SUPER_ADMIN  
**Trigger:** Investor communication needed or funding round initiated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access investor hub | `/investors` | View all investors |
| 2 | Create/update investor profile | `/investors/[id]` | Profile maintained |
| 3 | Upload investor documents | `/investors/documents` | Documents stored |
| 4 | Create funding round | `/investors/rounds` | Round initiated |
| 5 | Set round parameters | `/investors/rounds` | Terms defined |
| 6 | Generate investor reports | `/investors/reports` | Reports created |
| 7 | Send investor updates | `/investors/[id]` | Updates delivered |
| 8 | Track investment commitments | `/investors/rounds` | Commitments logged |
| 9 | Process investment receipt | `/investors/rounds` | Funds recorded |
| 10 | Update cap table | `/investors` | Ownership updated |

**Post-Conditions:**
- Investor records current
- Documents accessible
- Funding tracked
- Portal updated for investors

---

### WF-ATLVS-006: Venue Setup & Configuration

**Actor:** ATLVS_ADMIN  
**Trigger:** New venue needs to be added or existing venue updated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Venues | `/venues` | View venue directory |
| 2 | Create new venue | `/venues` | Venue record created |
| 3 | Enter venue details | `/venues/[id]` | Details captured |
| 4 | Upload venue maps | `/venues/maps` | Maps stored |
| 5 | Define venue zones | `/venues/zones` | Zones created |
| 6 | Configure zone details | `/venues/zones/[id]` | Zone specs set |
| 7 | Set capacity limits | `/venues/[id]` | Capacities defined |
| 8 | Link to productions | `/p/[id]/venues` | Venue associated |

**Post-Conditions:**
- Venue in directory
- Maps available
- Zones defined for access control
- Linked to relevant productions

---

### WF-ATLVS-007: Asset Inventory Management

**Actor:** ATLVS_ADMIN, ATLVS_TEAM_MEMBER  
**Trigger:** Assets need to be tracked, maintained, or allocated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access asset management | `/assets` | View all assets |
| 2 | Add new asset | `/assets` | Asset created |
| 3 | Enter specifications | `/assets/specifications` | Specs recorded |
| 4 | Assign serial number | `/assets/serialized` | Asset serialized |
| 5 | Set storage location | `/assets/storage` | Location tracked |
| 6 | Schedule maintenance | `/assets/maintenance` | Maintenance planned |
| 7 | Track calibration | `/assets/calibration` | Calibration logged |
| 8 | Assign to production | `/p/[id]/assets` | Asset allocated |
| 9 | Scan asset check-in/out | `/assets/scan` | Movement tracked |
| 10 | Report damage | `/assets/damage-reports` | Damage documented |
| 11 | Analyze utilization | `/assets/utilization` | Usage reviewed |
| 12 | Optimize allocation | `/assets/optimization` | Efficiency improved |

**Post-Conditions:**
- Asset inventory accurate
- Maintenance scheduled
- Utilization tracked
- Allocation optimized

---

### WF-ATLVS-008: Contract Lifecycle Management

**Actor:** ATLVS_ADMIN  
**Trigger:** Contract needs to be created, reviewed, or executed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Contracts | `/contracts` | View all contracts |
| 2 | Select contract template | `/templates` | Template loaded |
| 3 | Customize contract terms | `/contracts` | Terms defined |
| 4 | Add parties | `/contracts` | Parties assigned |
| 5 | Set key dates | `/contracts` | Dates established |
| 6 | Route for internal review | `/contracts` | Review initiated |
| 7 | Send for signature | `/contracts` | Signature requested |
| 8 | Track signature status | `/contracts` | Status monitored |
| 9 | Store executed contract | `/documents` | Contract archived |
| 10 | Set renewal reminders | `/contracts` | Alerts configured |

**Post-Conditions:**
- Contract executed
- Document stored
- Renewal tracked
- Parties notified

---

### WF-ATLVS-009: Compliance Management

**Actor:** ATLVS_ADMIN, ATLVS_SUPER_ADMIN  
**Trigger:** Compliance requirement identified or audit scheduled

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access compliance hub | `/compliance` | View compliance status |
| 2 | Review requirements | `/compliance` | Requirements listed |
| 3 | Assign compliance tasks | `/compliance` | Tasks assigned |
| 4 | Track completion | `/compliance` | Progress monitored |
| 5 | Upload evidence | `/compliance` | Documentation stored |
| 6 | Review audit trail | `/audit` | Audit log reviewed |
| 7 | Generate compliance report | `/compliance` | Report created |
| 8 | Address findings | `/compliance` | Issues resolved |

**Post-Conditions:**
- Compliance documented
- Evidence stored
- Audit trail complete
- Reports available

---

### WF-ATLVS-010: Expense Submission & Approval

**Actor:** ATLVS_ADMIN (approval), ATLVS_TEAM_MEMBER (submission)  
**Trigger:** Expense incurred that needs reimbursement

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Expenses | `/expenses` | View expenses |
| 2 | Create new expense | `/expenses` | Expense form opens |
| 3 | Enter expense details | `/expenses` | Details captured |
| 4 | Upload receipt | `/expenses` | Receipt attached |
| 5 | Select category | `/expenses/categories` | Category assigned |
| 6 | Link to production | `/expenses` | Production associated |
| 7 | Submit for approval | `/expenses` | Expense submitted |
| 8 | **Admin:** Review expense | `/expenses/[id]` | Expense reviewed |
| 9 | **Admin:** Approve/reject | `/expenses/[id]` | Decision made |
| 10 | Generate expense report | `/expenses/reports` | Report created |

**Post-Conditions:**
- Expense recorded
- Receipt stored
- Approval documented
- Budget updated

---

### WF-ATLVS-011: Invoice Processing

**Actor:** ATLVS_ADMIN  
**Trigger:** Invoice received from vendor or needs to be sent to client

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access Invoices | `/invoices` | View all invoices |
| 2 | Create/receive invoice | `/invoices` | Invoice recorded |
| 3 | Match to PO | `/invoices` | PO matched |
| 4 | Verify amounts | `/invoices` | Amounts confirmed |
| 5 | Route for approval | `/invoices` | Approval requested |
| 6 | Approve payment | `/invoices` | Payment authorized |
| 7 | Schedule payment | `/invoices` | Payment scheduled |
| 8 | Record payment | `/invoices` | Payment logged |
| 9 | Update accounts receivable | `/finance/accounts-receivable` | AR updated |

**Post-Conditions:**
- Invoice processed
- Payment scheduled/made
- Records updated
- Vendor notified

---

### WF-ATLVS-012: Permit Management

**Actor:** ATLVS_ADMIN, ATLVS_TEAM_MEMBER  
**Trigger:** Event requires permits from authorities

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Permits | `/permits` | View all permits |
| 2 | Identify required permits | `/permits` | Requirements listed |
| 3 | Create permit application | `/permits` | Application started |
| 4 | Enter permit details | `/permits/[id]` | Details captured |
| 5 | Upload supporting docs | `/permits/[id]` | Documents attached |
| 6 | Submit application | `/permits/[id]` | Application submitted |
| 7 | Track approval status | `/permits/[id]` | Status monitored |
| 8 | Receive permit | `/permits/[id]` | Permit obtained |
| 9 | Link to production | `/p/[id]/permits` | Permit associated |
| 10 | Set expiration alerts | `/permits/[id]` | Alerts configured |

**Post-Conditions:**
- Permit obtained
- Documents stored
- Production linked
- Expiration tracked

---

### WF-ATLVS-013: Insurance Management

**Actor:** ATLVS_ADMIN  
**Trigger:** Insurance coverage needed for production or organization

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access Insurance hub | `/insurance` | View all policies |
| 2 | Identify coverage needs | `/insurance` | Requirements assessed |
| 3 | Request quotes | `/insurance` | Quotes requested |
| 4 | Compare coverage options | `/insurance` | Options evaluated |
| 5 | Select policy | `/insurance` | Policy chosen |
| 6 | Upload policy documents | `/insurance/[id]` | Documents stored |
| 7 | Set coverage dates | `/insurance/[id]` | Dates established |
| 8 | Link to production | `/p/[id]/insurance` | Policy associated |
| 9 | Generate COI | `/insurance/[id]` | COI created |
| 10 | Track renewals | `/insurance` | Renewals monitored |

**Post-Conditions:**
- Coverage in place
- Documents accessible
- COIs available
- Renewals tracked

---

### WF-ATLVS-014: Procurement & Purchase Orders

**Actor:** ATLVS_ADMIN, ATLVS_TEAM_MEMBER  
**Trigger:** Goods or services need to be procured

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Procurement | `/procurement` | View procurement hub |
| 2 | Create requisition | `/procurement` | Requisition started |
| 3 | Select category | `/procurement/categories` | Category assigned |
| 4 | Request quotes | `/quotes` | Quotes requested |
| 5 | Compare vendor quotes | `/quotes` | Quotes evaluated |
| 6 | Select vendor | `/procurement/vendor-selection` | Vendor chosen |
| 7 | Create purchase order | `/p/[id]/procurement/purchase-orders` | PO created |
| 8 | Route for approval | `/p/[id]/procurement/purchase-orders` | Approval requested |
| 9 | Send PO to vendor | `/p/[id]/procurement/purchase-orders` | PO sent |
| 10 | Track delivery | `/procurement/logistics` | Delivery monitored |
| 11 | Receive goods | `/procurement` | Receipt confirmed |
| 12 | Process invoice | `/invoices` | Invoice matched |

**Post-Conditions:**
- PO issued
- Vendor notified
- Delivery tracked
- Budget updated

---

### WF-ATLVS-015: RFP Management

**Actor:** ATLVS_ADMIN  
**Trigger:** Complex procurement requires formal RFP process

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to RFP | `/rfp` | View RFP hub |
| 2 | Create new RFP | `/rfp` | RFP initiated |
| 3 | Define requirements | `/rfp` | Requirements documented |
| 4 | Set evaluation criteria | `/rfp` | Criteria established |
| 5 | Identify vendors | `/vendors` | Vendors selected |
| 6 | Distribute RFP | `/rfp` | RFP sent |
| 7 | Receive responses | `/rfp` | Responses collected |
| 8 | Evaluate proposals | `/rfp` | Proposals scored |
| 9 | Select winner | `/rfp` | Winner chosen |
| 10 | Award contract | `/contracts` | Contract issued |

**Post-Conditions:**
- RFP completed
- Vendor selected
- Contract awarded
- Documentation stored

---

### WF-ATLVS-016: Advancing Request Management

**Actor:** ATLVS_ADMIN  
**Trigger:** Production requires advancing coordination

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access Advancing hub | `/advancing` | View advancing status |
| 2 | Create advancing request | `/advancing` | Request initiated |
| 3 | Define requirements | `/advancing/requests/[id]` | Requirements listed |
| 4 | Assign to team | `/advancing/requests/[id]` | Team assigned |
| 5 | Track submissions | `/advancing/requests/[id]` | Submissions monitored |
| 6 | Review submissions | `/advancing/requests/[id]` | Submissions reviewed |
| 7 | Approve/request changes | `/advancing/requests/[id]` | Decision made |
| 8 | Allocate resources | `/p/[id]/advancing/allocations` | Resources allocated |
| 9 | Track fulfillment | `/p/[id]/advancing/fulfillment` | Fulfillment monitored |
| 10 | Review history | `/p/[id]/advancing/history` | History logged |

**Post-Conditions:**
- Advancing coordinated
- Requirements fulfilled
- Resources allocated
- History documented

---

### WF-ATLVS-017: Workforce Management

**Actor:** ATLVS_ADMIN, ATLVS_SUPER_ADMIN  
**Trigger:** HR/workforce management tasks required

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access Workforce hub | `/workforce` | View workforce overview |
| 2 | Manage employees | `/employees` | Employee records maintained |
| 3 | Process background checks | `/workforce/background-checks` | Checks completed |
| 4 | Manage compensation | `/workforce/compensation` | Compensation set |
| 5 | Update handbook | `/workforce/handbook` | Handbook current |
| 6 | Track labor law compliance | `/workforce/labor-laws` | Compliance verified |
| 7 | Manage referrals | `/workforce/referrals` | Referrals processed |
| 8 | Plan succession | `/workforce/succession` | Succession planned |
| 9 | Ensure union compliance | `/workforce/union-compliance` | Union rules followed |
| 10 | Process payroll | `/payroll` | Payroll completed |

**Post-Conditions:**
- Workforce managed
- Compliance maintained
- Payroll processed
- Records updated

---

### WF-ATLVS-018: CRM & Lead Management

**Actor:** ATLVS_ADMIN, ATLVS_TEAM_MEMBER  
**Trigger:** New lead or customer interaction

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access CRM | `/crm` | View CRM dashboard |
| 2 | Create/update contact | `/contacts` | Contact maintained |
| 3 | Log interaction | `/crm` | Interaction recorded |
| 4 | Score lead | `/crm/lead-scoring` | Lead scored |
| 5 | Create task | `/crm/tasks` | Follow-up scheduled |
| 6 | Track relationship | `/crm/relationships` | Relationship mapped |
| 7 | Sync email | `/crm/email-integration` | Emails synced |
| 8 | View calendar | `/crm/calendar` | Meetings scheduled |
| 9 | Generate reports | `/crm` | Reports created |

**Post-Conditions:**
- Lead tracked
- Interactions logged
- Follow-ups scheduled
- Pipeline updated

---

### WF-ATLVS-019: Analytics & Reporting

**Actor:** ATLVS_ADMIN, ATLVS_TEAM_MEMBER  
**Trigger:** Business intelligence or reporting needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access Analytics | `/analytics` | View analytics hub |
| 2 | View dashboards | `/analytics/dashboards` | Dashboards displayed |
| 3 | Build custom dashboard | `/analytics/dashboard-builder` | Dashboard created |
| 4 | Track KPIs | `/analytics/kpi` | KPIs monitored |
| 5 | View KPI details | `/analytics/kpi/[code]` | KPI analyzed |
| 6 | Generate reports | `/analytics/reports` | Reports created |
| 7 | Access data warehouse | `/analytics/data-warehouse` | Data queried |
| 8 | Analyze client retention | `/analytics/client-retention` | Retention reviewed |
| 9 | Schedule reports | `/reports/scheduled` | Reports automated |

**Post-Conditions:**
- Insights generated
- Dashboards available
- Reports distributed
- KPIs tracked

---

### WF-ATLVS-020: API & Integration Management

**Actor:** ATLVS_SUPER_ADMIN  
**Trigger:** API access or integration needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access API Management | `/api-management` | View API hub |
| 2 | Generate API key | `/api-management/keys` | Key created |
| 3 | Configure webhooks | `/api-management/webhooks` | Webhooks set |
| 4 | Monitor API logs | `/api-management/logs` | Usage tracked |
| 5 | Manage integrations | `/integrations` | Integrations configured |
| 6 | Review documentation | `/docs/api` | Docs referenced |

**Post-Conditions:**
- API access granted
- Webhooks configured
- Usage monitored
- Integrations active

---

## Team Member Workflows

### WF-ATLVS-021: Daily Task Management

**Actor:** ATLVS_TEAM_MEMBER  
**Trigger:** Daily work activities

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View dashboard | `/dashboard` | Overview displayed |
| 2 | Check action items | `/action-items` | Tasks listed |
| 3 | View assigned tasks | `/schedule/tasks` | Tasks displayed |
| 4 | Update task status | `/schedule/tasks/[id]` | Status updated |
| 5 | Log time | `/schedule/tasks/[id]` | Time recorded |
| 6 | View schedule | `/schedule` | Schedule displayed |
| 7 | Check notifications | `/notifications` | Alerts reviewed |

**Post-Conditions:**
- Tasks updated
- Time logged
- Progress tracked

---

### WF-ATLVS-022: Production Work

**Actor:** ATLVS_TEAM_MEMBER  
**Trigger:** Assigned to production

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access production | `/p/[id]/overview` | Production overview |
| 2 | View assignments | `/p/[id]/team/assignments` | Assignments listed |
| 3 | Access documents | `/p/[id]/documents` | Documents available |
| 4 | View schedule | `/p/[id]/schedule` | Schedule displayed |
| 5 | Update tasks | `/p/[id]/schedule/tasks` | Tasks updated |
| 6 | Submit expenses | `/p/[id]/expenses` | Expenses submitted |
| 7 | View run of show | `/p/[id]/shows/run-of-show` | ROS displayed |
| 8 | Check set times | `/p/[id]/shows/set-times` | Times confirmed |
| 9 | Access venue maps | `/p/[id]/venues/maps` | Maps available |

**Post-Conditions:**
- Work completed
- Tasks updated
- Expenses submitted

---

### WF-ATLVS-023: Expense Submission

**Actor:** ATLVS_TEAM_MEMBER  
**Trigger:** Expense incurred

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Expenses | `/expenses` | Expenses displayed |
| 2 | Create expense | `/expenses` | Form opened |
| 3 | Enter details | `/expenses` | Details captured |
| 4 | Upload receipt | `/expenses` | Receipt attached |
| 5 | Select category | `/expenses/categories` | Category assigned |
| 6 | Link to production | `/expenses` | Production linked |
| 7 | Submit | `/expenses` | Expense submitted |
| 8 | Track status | `/expenses/[id]` | Status monitored |

**Post-Conditions:**
- Expense submitted
- Receipt stored
- Awaiting approval

---

### WF-ATLVS-024: Advancing Submission

**Actor:** ATLVS_TEAM_MEMBER  
**Trigger:** Advancing information needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access advancing | `/advancing` | Advancing hub |
| 2 | View request | `/advancing/requests/[id]` | Request displayed |
| 3 | Enter information | `/advancing/requests/[id]` | Info captured |
| 4 | Upload documents | `/advancing/requests/[id]` | Docs attached |
| 5 | Submit | `/advancing/requests/[id]` | Submission completed |
| 6 | Track status | `/advancing/requests/[id]` | Status monitored |

**Post-Conditions:**
- Advancing submitted
- Documents stored
- Awaiting review

---

## Viewer Workflows

### WF-ATLVS-025: Read-Only Access

**Actor:** ATLVS_VIEWER  
**Trigger:** Need to view business data

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View dashboard | `/dashboard` | Overview displayed |
| 2 | Browse productions | `/productions` | Productions listed |
| 3 | View production details | `/p/[id]/overview` | Details displayed |
| 4 | View schedules | `/p/[id]/schedule` | Schedule displayed |
| 5 | View run of show | `/p/[id]/shows/run-of-show` | ROS displayed |
| 6 | View venues | `/venues` | Venues listed |
| 7 | View venue details | `/venues/[id]` | Details displayed |
| 8 | Access documents | `/documents` | Documents available |

**Post-Conditions:**
- Information viewed
- No modifications made

---

## Portal User Workflows

### WF-ATLVS-026: Artist Portal

**Actor:** Artist (via portal)  
**Trigger:** Artist needs to access their information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login to portal | `/auth/signin` | Authenticated |
| 2 | Access artist portal | `/portal/artist` | Portal displayed |
| 3 | View assigned events | `/portal/artist` | Events listed |
| 4 | View schedule | `/portal/artist` | Schedule displayed |
| 5 | Submit advancing info | `/portal/artist` | Info submitted |
| 6 | View documents | `/portal/artist` | Documents available |
| 7 | Update profile | `/profile` | Profile updated |

**Post-Conditions:**
- Artist informed
- Advancing submitted
- Profile current

---

### WF-ATLVS-027: Crew Portal

**Actor:** Crew Member (via portal)  
**Trigger:** Crew member needs to access assignments

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login to portal | `/auth/signin` | Authenticated |
| 2 | Access crew portal | `/portal/crew` | Portal displayed |
| 3 | View assignments | `/portal/crew` | Assignments listed |
| 4 | View schedule | `/portal/crew` | Schedule displayed |
| 5 | Submit availability | `/portal/crew` | Availability submitted |
| 6 | View documents | `/portal/crew` | Documents available |
| 7 | Update profile | `/profile` | Profile updated |

**Post-Conditions:**
- Crew informed
- Availability submitted
- Profile current

---

### WF-ATLVS-028: Investor Portal

**Actor:** Investor (via portal)  
**Trigger:** Investor needs to access investment information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login to portal | `/auth/signin` | Authenticated |
| 2 | Access investor portal | `/portal/investor` | Portal displayed |
| 3 | View investments | `/portal/investor/my-investments` | Investments listed |
| 4 | View updates | `/portal/investor/investor-updates` | Updates displayed |
| 5 | Access documents | `/portal/investor` | Documents available |
| 6 | Update profile | `/profile` | Profile updated |

**Post-Conditions:**
- Investor informed
- Documents accessible
- Profile current

---

### WF-ATLVS-029: Sponsor Portal

**Actor:** Sponsor (via portal)  
**Trigger:** Sponsor needs to access sponsorship information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login to portal | `/auth/signin` | Authenticated |
| 2 | Access sponsor portal | `/portal/sponsor` | Portal displayed |
| 3 | View activations | `/portal/sponsor/my-activations` | Activations listed |
| 4 | View deliverables | `/portal/sponsor/my-deliverables` | Deliverables displayed |
| 5 | View reports | `/portal/sponsor/my-reports` | Reports available |
| 6 | Update profile | `/profile` | Profile updated |

**Post-Conditions:**
- Sponsor informed
- Deliverables tracked
- Reports accessible

---

### WF-ATLVS-030: Vendor Portal

**Actor:** Vendor (via portal)  
**Trigger:** Vendor needs to access vendor information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login to portal | `/auth/signin` | Authenticated |
| 2 | Access vendor portal | `/portal/vendor` | Portal displayed |
| 3 | View purchase orders | `/portal/vendor` | POs listed |
| 4 | Submit invoices | `/portal/vendor` | Invoices submitted |
| 5 | View payment status | `/portal/vendor` | Status displayed |
| 6 | Update rate card | `/portal/vendor` | Rates updated |
| 7 | Update profile | `/profile` | Profile updated |

**Post-Conditions:**
- Vendor informed
- Invoices submitted
- Payments tracked

---

## Authentication Workflows

### WF-ATLVS-031: User Authentication

**Actor:** All Users  
**Trigger:** User needs to access system

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to sign in | `/auth/signin` | Login form displayed |
| 2 | Enter credentials | `/auth/signin` | Credentials entered |
| 3 | Submit | `/auth/signin` | Authentication attempted |
| 4 | **Success:** Redirect to dashboard | `/dashboard` | Access granted |
| 5 | **Failure:** Show error | `/auth/signin` | Error displayed |

**Alternative: Magic Link**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Request magic link | `/auth/magic-link` | Link requested |
| 2 | Check email | Email | Link received |
| 3 | Click link | Email | Authenticated |
| 4 | Redirect to dashboard | `/dashboard` | Access granted |

**Alternative: Password Reset**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Click forgot password | `/auth/forgot-password` | Reset form displayed |
| 2 | Enter email | `/auth/forgot-password` | Email entered |
| 3 | Submit | `/auth/forgot-password` | Reset email sent |
| 4 | Click reset link | Email | Reset page opened |
| 5 | Enter new password | `/auth/reset-password` | Password entered |
| 6 | Submit | `/auth/reset-password` | Password updated |

---

*End of ATLVS Detailed Workflows*
