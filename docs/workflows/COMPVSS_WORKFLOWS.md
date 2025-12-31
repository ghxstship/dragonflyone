# COMPVSS Detailed Workflows

> **Version:** 2.0  
> **Last Updated:** December 31, 2025  
> **App Purpose:** Production operations, crew management, event execution  
> **Total Pages:** 166  
> **Total Workflows:** 34

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [USER_GUIDES.md](../guides/USER_GUIDES.md) | End-to-end user guides including COMPVSS production operations journey |
| [WORKFLOW_INVENTORY.md](./WORKFLOW_INVENTORY.md) | Master workflow inventory with cross-platform overview |
| [ATLVS_WORKFLOWS.md](./ATLVS_WORKFLOWS.md) | Business operations workflows |
| [GVTEWAY_WORKFLOWS.md](./GVTEWAY_WORKFLOWS.md) | Consumer platform workflows |

---

## Table of Contents

1. [Admin Workflows](#admin-workflows) (18 workflows)
2. [Team Member Workflows](#team-member-workflows) (6 workflows)
3. [Crew Workflows](#crew-workflows) (3 workflows)
4. [Artist Workflows](#artist-workflows) (2 workflows)
5. [Vendor Workflows](#vendor-workflows) (2 workflows)
6. [Stakeholder Workflows](#stakeholder-workflows) (1 workflow)
7. [Offline & Authentication Workflows](#offline--authentication-workflows) (2 workflows)

---

## Admin Workflows

### WF-COMPVSS-001: Production Setup & Configuration

**Actor:** COMPVSS_ADMIN  
**Trigger:** New production needs to be set up for operations

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to Projects | `/projects` | View all projects |
| 2 | Create new project | `/projects/new` | Project form opens |
| 3 | Enter project details | `/projects/new` | Details captured |
| 4 | Configure production settings | `/p/[id]/settings` | Settings customized |
| 5 | Set up communication channels | `/p/[id]/communication/channels` | Channels created |
| 6 | Define credential types | `/credentials/types` | Types established |
| 7 | Configure access zones | `/credentials/zones` | Zones defined |
| 8 | Upload SOPs | `/p/[id]/documents/sops` | SOPs available |
| 9 | Upload spec sheets | `/p/[id]/documents/spec-sheets` | Specs available |
| 10 | Create backup plans | `/p/[id]/documents/backup-plans` | Contingencies ready |

**Post-Conditions:**
- Production configured
- Communication channels active
- Credentials system ready
- Documentation available

---

### WF-COMPVSS-002: Crew Scheduling & Assignment

**Actor:** COMPVSS_ADMIN  
**Trigger:** Crew needs to be scheduled for production

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access crew management | `/crew` | View crew directory |
| 2 | Check availability | `/directory/availability` | Availability displayed |
| 3 | Filter by skills | `/directory/filters` | Qualified crew listed |
| 4 | Assign crew to production | `/crew/assign` | Assignments made |
| 5 | Set shift schedules | `/p/[id]/crew` | Schedules created |
| 6 | Configure timekeeping | `/p/[id]/crew/timekeeping` | Time tracking enabled |
| 7 | Issue credentials | `/credentials/issue` | Credentials issued |
| 8 | Send notifications | `/notifications` | Crew notified |
| 9 | Generate credential reports | `/credentials/reports` | Reports created |

**Post-Conditions:**
- Crew assigned
- Schedules set
- Credentials issued
- Crew notified

---

### WF-COMPVSS-003: Advancing Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Production advancing needs to be coordinated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access advancing hub | `/advancing` | View advancing status |
| 2 | Create advancing request | `/advancing/new` | Request initiated |
| 3 | Select template | `/p/[id]/advancing/templates` | Template applied |
| 4 | Define requirements | `/advancing/[id]` | Requirements listed |
| 5 | Browse catalog | `/advancing/catalog` | Items available |
| 6 | Assign to stakeholders | `/advancing/[id]` | Stakeholders assigned |
| 7 | Track submissions | `/advancing/[id]` | Submissions monitored |
| 8 | Review and approve | `/advancing/[id]` | Submissions approved |
| 9 | Coordinate fulfillment | `/p/[id]/advancing` | Fulfillment tracked |

**Post-Conditions:**
- Advancing coordinated
- Requirements collected
- Fulfillment tracked

---

### WF-COMPVSS-004: Credential System Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Credentials need to be managed for event

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access credentials hub | `/credentials` | View credentials |
| 2 | Define credential types | `/credentials/types` | Types created |
| 3 | Configure access zones | `/credentials/zones` | Zones defined |
| 4 | Issue credentials | `/credentials/issue` | Credentials issued |
| 5 | Scan credentials | `/credentials/scan` | Access verified |
| 6 | Generate reports | `/credentials/reports` | Reports created |
| 7 | Manage site access | `/site-access` | Access controlled |

**Post-Conditions:**
- Credentials issued
- Access controlled
- Reports available

---

### WF-COMPVSS-005: Schedule Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Production schedule needs to be created/updated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access schedule | `/schedule` | View master schedule |
| 2 | Create build/strike schedule | `/p/[id]/schedule/build-strike` | Build schedule set |
| 3 | Set tech rehearsal | `/p/[id]/schedule/tech-rehearsal` | Rehearsal scheduled |
| 4 | Configure soundcheck | `/p/[id]/schedule/soundcheck` | Soundcheck set |
| 5 | Define show call | `/p/[id]/schedule/show-call` | Show call established |
| 6 | Set artist times | `/p/[id]/schedule/set-times` | Set times defined |
| 7 | Create run of show | `/p/[id]/schedule/run-of-show` | ROS created |
| 8 | Publish schedule | `/p/[id]/schedule` | Schedule published |

**Post-Conditions:**
- Schedule complete
- All parties informed
- ROS available

---

### WF-COMPVSS-006: Safety & Incident Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Safety protocols need management or incident occurred

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access safety hub | `/safety` | View safety status |
| 2 | Review safety protocols | `/p/[id]/safety` | Protocols reviewed |
| 3 | Configure emergency procedures | `/emergency` | Procedures set |
| 4 | Log incident | `/incidents` | Incident recorded |
| 5 | Document incident details | `/p/[id]/incidents` | Details captured |
| 6 | Assign follow-up | `/incidents` | Actions assigned |
| 7 | Track resolution | `/incidents` | Resolution monitored |
| 8 | Generate safety report | `/safety` | Report created |

**Post-Conditions:**
- Safety managed
- Incidents documented
- Follow-up tracked

---

### WF-COMPVSS-007: Quality Assurance Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Quality checks needed for production

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access quality hub | `/p/[id]/quality` | View QA status |
| 2 | Define QA checkpoints | `/p/[id]/quality/qa-checkpoints` | Checkpoints set |
| 3 | Create punch list | `/p/[id]/quality/punch-list` | Punch list created |
| 4 | Log quality issues | `/p/[id]/quality/issues` | Issues documented |
| 5 | Assign troubleshooting | `/p/[id]/quality/troubleshooting` | Tasks assigned |
| 6 | Track resolution | `/p/[id]/quality` | Progress monitored |
| 7 | Verify completion | `/p/[id]/quality` | Quality verified |

**Post-Conditions:**
- Quality assured
- Issues resolved
- Punch list complete

---

### WF-COMPVSS-008: Vendor Coordination

**Actor:** COMPVSS_ADMIN  
**Trigger:** Vendors need to be coordinated for production

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access vendor management | `/p/[id]/vendors` | View vendors |
| 2 | Compare vendors | `/vendors/compare` | Vendors compared |
| 3 | Assign vendors | `/p/[id]/vendors` | Vendors assigned |
| 4 | Coordinate deliveries | `/deliveries` | Deliveries scheduled |
| 5 | Track logistics | `/logistics` | Logistics monitored |
| 6 | Manage subcontractors | `/subcontractors` | Subs managed |
| 7 | Process expenses | `/p/[id]/expenses` | Expenses tracked |

**Post-Conditions:**
- Vendors coordinated
- Deliveries scheduled
- Expenses tracked

---

### WF-COMPVSS-009: Load-In Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Production load-in begins

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access load-in | `/p/[id]/load-in` | View load-in status |
| 2 | Review schedule | `/p/[id]/schedule/build-strike` | Schedule confirmed |
| 3 | Coordinate deliveries | `/deliveries` | Deliveries tracked |
| 4 | Manage logistics | `/p/[id]/logistics` | Logistics coordinated |
| 5 | Track equipment | `/equipment` | Equipment monitored |
| 6 | Document progress | `/photo-documentation` | Progress documented |
| 7 | Update punch list | `/punch-list` | Issues logged |
| 8 | Complete QA checkpoints | `/qa-checkpoints` | Quality verified |

**Post-Conditions:**
- Load-in complete
- Equipment in place
- Quality verified

---

### WF-COMPVSS-010: Show Day Operations

**Actor:** COMPVSS_ADMIN  
**Trigger:** Show day begins

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access operations | `/p/[id]/operations` | View operations |
| 2 | Review show call | `/show-call` | Show call confirmed |
| 3 | Monitor soundcheck | `/soundcheck` | Soundcheck tracked |
| 4 | Track set times | `/set-times` | Times monitored |
| 5 | Follow run of show | `/run-of-show` | ROS executed |
| 6 | Manage catering | `/p/[id]/catering` | Catering coordinated |
| 7 | Monitor weather | `/p/[id]/weather` | Weather tracked |
| 8 | Handle lost & found | `/p/[id]/lost-found` | Items managed |
| 9 | Manage VIPs | `/vip-management` | VIPs handled |
| 10 | Log incidents | `/p/[id]/incidents` | Incidents recorded |

**Post-Conditions:**
- Show executed
- Issues handled
- Operations documented

---

### WF-COMPVSS-011: Load-Out & Strike

**Actor:** COMPVSS_ADMIN  
**Trigger:** Show ends, strike begins

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access load-out | `/p/[id]/load-out` | View load-out status |
| 2 | Execute strike | `/p/[id]/strike` | Strike managed |
| 3 | Track equipment return | `/equipment` | Returns tracked |
| 4 | Coordinate logistics | `/logistics` | Logistics managed |
| 5 | Document condition | `/photo-documentation` | Condition documented |
| 6 | Complete punch list | `/punch-list` | Issues resolved |
| 7 | Process timesheets | `/timekeeping` | Time recorded |

**Post-Conditions:**
- Strike complete
- Equipment returned
- Time recorded

---

### WF-COMPVSS-012: Production Wrap & Settlement

**Actor:** COMPVSS_ADMIN  
**Trigger:** Production complete, wrap needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access wrap | `/p/[id]/wrap` | View wrap status |
| 2 | Complete daily reports | `/reports/daily` | Reports completed |
| 3 | Generate wrap report | `/reports/wrap` | Wrap report created |
| 4 | Process settlement | `/p/[id]/settlement` | Settlement processed |
| 5 | Finalize expenses | `/p/[id]/expenses` | Expenses finalized |
| 6 | Archive documents | `/p/[id]/documents` | Documents archived |
| 7 | Close production | `/p/[id]/wrap` | Production closed |

**Post-Conditions:**
- Production wrapped
- Settlement complete
- Documents archived

---

### WF-COMPVSS-013: SOP Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** SOPs need to be created or updated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access SOPs | `/sops` | View all SOPs |
| 2 | Create/edit SOP | `/sops/[id]` | SOP maintained |
| 3 | Categorize SOP | `/sops/categories` | Category assigned |
| 4 | Assign training | `/sops/training` | Training required |
| 5 | Track acknowledgments | `/sops/acknowledgments` | Acknowledgments tracked |
| 6 | Update production SOPs | `/p/[id]/documents/sops` | Production SOPs current |

**Post-Conditions:**
- SOPs current
- Training assigned
- Acknowledgments tracked

---

### WF-COMPVSS-014: Opportunity & Bid Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** New business opportunity identified

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access opportunities | `/opportunities` | View opportunities |
| 2 | Create opportunity | `/opportunities` | Opportunity logged |
| 3 | Evaluate bid decision | `/opportunities/bid-decision` | Decision made |
| 4 | Create proposal | `/opportunities/proposals` | Proposal drafted |
| 5 | Submit bid | `/bid-portal` | Bid submitted |
| 6 | Track mobile opportunities | `/opportunities/mobile` | Mobile tracked |
| 7 | Analyze win/loss | `/opportunities/win-loss` | Analysis completed |

**Post-Conditions:**
- Opportunity tracked
- Bid submitted
- Analysis available

---

### WF-COMPVSS-015: Communication Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Communication needs to be coordinated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access communications | `/communications` | View communications |
| 2 | Manage channels | `/communications/channels` | Channels configured |
| 3 | Send messages | `/messages` | Messages sent |
| 4 | Configure stakeholder portal | `/p/[id]/communication/stakeholder-portal` | Portal configured |
| 5 | Manage notifications | `/notifications` | Notifications sent |
| 6 | Coordinate social amplification | `/social-amplification` | Social managed |

**Post-Conditions:**
- Communication coordinated
- Stakeholders informed
- Social amplified

---

### WF-COMPVSS-016: Risk Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Risks need to be identified and managed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access risk register | `/risk-register` | View risks |
| 2 | Identify risks | `/risk-register` | Risks logged |
| 3 | Assess impact | `/risk-register` | Impact assessed |
| 4 | Create mitigation plans | `/backup-plans` | Plans created |
| 5 | Monitor weather | `/weather` | Weather tracked |
| 6 | Activate contingency | `/weather-contingency` | Contingency activated |

**Post-Conditions:**
- Risks identified
- Mitigation planned
- Contingencies ready

---

### WF-COMPVSS-017: Training & Certification Management

**Actor:** COMPVSS_ADMIN  
**Trigger:** Training needs to be managed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access certifications | `/certifications` | View certifications |
| 2 | Track skills | `/skills` | Skills tracked |
| 3 | Assign training | `/sops/training` | Training assigned |
| 4 | Manage mentorship | `/mentorship` | Mentorship coordinated |
| 5 | Process background checks | `/background-checks` | Checks completed |
| 6 | Onboard new crew | `/onboarding` | Crew onboarded |

**Post-Conditions:**
- Training tracked
- Certifications current
- Crew qualified

---

### WF-COMPVSS-018: Reporting & Documentation

**Actor:** COMPVSS_ADMIN  
**Trigger:** Reports needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Create daily report | `/reports/daily` | Daily report created |
| 2 | View report details | `/reports/daily/[id]` | Details reviewed |
| 3 | Create wrap report | `/reports/wrap` | Wrap report created |
| 4 | View wrap details | `/reports/wrap/[id]` | Details reviewed |
| 5 | Access production reports | `/p/[id]/reports` | Reports available |
| 6 | Document with photos | `/photo-documentation` | Photos captured |

**Post-Conditions:**
- Reports complete
- Documentation archived

---

## Team Member Workflows

### WF-COMPVSS-019: Daily Work Management

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Daily work activities

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View dashboard | `/dashboard` | Overview displayed |
| 2 | Check my schedule | `/my-schedule` | Schedule displayed |
| 3 | View assignments | `/my-assignments` | Assignments listed |
| 4 | Clock in | `/clock-in` | Time started |
| 5 | Access production | `/p/[id]/overview` | Production accessed |
| 6 | Complete tasks | `/p/[id]/operations` | Tasks completed |
| 7 | Log time | `/timekeeping` | Time logged |
| 8 | Clock out | `/clock-in` | Time ended |

**Post-Conditions:**
- Work completed
- Time logged

---

### WF-COMPVSS-020: Credential Management

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Credentials needed for access

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View my credentials | `/my-credentials` | Credentials displayed |
| 2 | Access production credentials | `/p/[id]/credentials` | Production creds shown |
| 3 | Scan for access | `/credentials/scan` | Access verified |
| 4 | Report issues | `/credentials` | Issues reported |

**Post-Conditions:**
- Access granted
- Issues reported

---

### WF-COMPVSS-021: Document Access

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Documents needed for work

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access documents | `/p/[id]/documents` | Documents available |
| 2 | View SOPs | `/p/[id]/documents/sops` | SOPs displayed |
| 3 | View spec sheets | `/p/[id]/documents/spec-sheets` | Specs available |
| 4 | Access files | `/p/[id]/documents/files` | Files accessible |
| 5 | View templates | `/p/[id]/documents/templates` | Templates available |
| 6 | Access knowledge base | `/knowledge` | Knowledge accessible |
| 7 | View regulations | `/knowledge/regulations` | Regulations displayed |
| 8 | Access offline | `/knowledge/offline` | Offline access |

**Post-Conditions:**
- Documents accessed
- Knowledge available

---

### WF-COMPVSS-022: Quality & Issue Reporting

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Quality issue identified

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access quality | `/p/[id]/quality` | Quality hub opened |
| 2 | Log issue | `/p/[id]/quality/issues` | Issue logged |
| 3 | Add to punch list | `/p/[id]/quality/punch-list` | Item added |
| 4 | Access troubleshooting | `/p/[id]/quality/troubleshooting` | Solutions found |
| 5 | Complete QA checkpoint | `/p/[id]/quality/qa-checkpoints` | Checkpoint completed |
| 6 | Document with photos | `/photo-documentation` | Photos captured |

**Post-Conditions:**
- Issue logged
- Resolution tracked

---

### WF-COMPVSS-023: Safety & Incident Reporting

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Safety concern or incident

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access safety | `/safety` | Safety hub opened |
| 2 | Review procedures | `/p/[id]/safety` | Procedures reviewed |
| 3 | Report incident | `/p/[id]/incidents` | Incident reported |
| 4 | Access emergency info | `/emergency` | Emergency info available |
| 5 | Document incident | `/incidents` | Incident documented |

**Post-Conditions:**
- Incident reported
- Safety maintained

---

### WF-COMPVSS-024: Communication & Messaging

**Actor:** COMPVSS_TEAM_MEMBER  
**Trigger:** Communication needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access messages | `/messages` | Messages displayed |
| 2 | View channels | `/channels` | Channels available |
| 3 | Access production messages | `/p/[id]/communication/messages` | Messages shown |
| 4 | Check notifications | `/notifications` | Notifications reviewed |
| 5 | Access crew social | `/crew-social` | Social available |

**Post-Conditions:**
- Communication complete
- Informed of updates

---

## Crew Workflows

### WF-COMPVSS-025: Crew Check-In & Work

**Actor:** Crew Member (CREW event role)  
**Trigger:** Crew member arrives for shift

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login | `/auth/signin` | Authenticated |
| 2 | View my schedule | `/my-schedule` | Schedule displayed |
| 3 | Clock in | `/clock-in` | Shift started |
| 4 | View assignments | `/my-assignments` | Tasks listed |
| 5 | Access credentials | `/my-credentials` | Credentials shown |
| 6 | View training | `/my-training` | Training available |
| 7 | Complete tasks | Dashboard | Tasks completed |
| 8 | Log timesheet | `/my-timesheets` | Time recorded |
| 9 | Clock out | `/clock-in` | Shift ended |

**Post-Conditions:**
- Shift completed
- Time logged
- Tasks done

---

### WF-COMPVSS-026: Crew Training & Certification

**Actor:** Crew Member  
**Trigger:** Training required

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access my training | `/my-training` | Training displayed |
| 2 | View required SOPs | `/sops` | SOPs listed |
| 3 | Complete SOP training | `/sops/training` | Training completed |
| 4 | Acknowledge SOP | `/sops/acknowledgments` | Acknowledgment recorded |
| 5 | View certifications | `/certifications` | Certs displayed |
| 6 | Update skills | `/skills` | Skills updated |

**Post-Conditions:**
- Training complete
- Certifications current

---

### WF-COMPVSS-027: Crew Social & Directory

**Actor:** Crew Member  
**Trigger:** Social interaction or directory lookup

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access crew social | `/crew/social` | Social hub opened |
| 2 | Browse directory | `/directory` | Directory displayed |
| 3 | Check availability | `/directory/availability` | Availability shown |
| 4 | Connect with crew | `/crew-social` | Connections made |

**Post-Conditions:**
- Connections made
- Directory accessed

---

## Artist Workflows

### WF-COMPVSS-028: Artist Portal Access

**Actor:** Artist (ARTIST event role)  
**Trigger:** Artist needs production information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login | `/auth/signin` | Authenticated |
| 2 | Access artist portal | `/artist-portal` | Portal displayed |
| 3 | View my rider | `/my-rider` | Rider displayed |
| 4 | View my schedule | `/my-schedule` | Schedule shown |
| 5 | View hospitality | `/my-hospitality` | Hospitality info |
| 6 | Access credentials | `/my-credentials` | Credentials shown |
| 7 | View set times | `/set-times` | Times displayed |
| 8 | Access soundcheck | `/soundcheck` | Soundcheck info |

**Post-Conditions:**
- Artist informed
- Rider accessible
- Schedule confirmed

---

### WF-COMPVSS-029: Artist Advancing

**Actor:** Artist  
**Trigger:** Advancing information needed

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access advancing | `/advancing` | Advancing hub |
| 2 | View requirements | `/advancing/[id]` | Requirements shown |
| 3 | Submit rider info | `/my-rider` | Rider submitted |
| 4 | Submit hospitality needs | `/my-hospitality` | Needs submitted |
| 5 | Confirm schedule | `/my-schedule` | Schedule confirmed |

**Post-Conditions:**
- Advancing submitted
- Requirements communicated

---

## Vendor Workflows

### WF-COMPVSS-030: Vendor Portal Access

**Actor:** Vendor (VENDOR event role)  
**Trigger:** Vendor needs to access production information

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login | `/auth/signin` | Authenticated |
| 2 | Access vendor portal | `/vendor-portal` | Portal displayed |
| 3 | View deliveries | `/my-deliveries` | Deliveries listed |
| 4 | View contracts | `/my-contracts` | Contracts shown |
| 5 | Submit invoices | `/my-invoices` | Invoices submitted |
| 6 | View credentials | `/my-credentials` | Credentials shown |
| 7 | Access schedule | `/my-schedule` | Schedule displayed |

**Post-Conditions:**
- Vendor informed
- Invoices submitted
- Deliveries tracked

---

### WF-COMPVSS-031: Vendor Delivery Coordination

**Actor:** Vendor  
**Trigger:** Delivery needs to be coordinated

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | View delivery schedule | `/my-deliveries` | Schedule displayed |
| 2 | Confirm delivery time | `/my-deliveries` | Time confirmed |
| 3 | Access site info | `/site-access` | Site info available |
| 4 | View logistics | `/logistics` | Logistics displayed |
| 5 | Confirm delivery | `/my-deliveries` | Delivery confirmed |

**Post-Conditions:**
- Delivery coordinated
- Site access confirmed

---

## Stakeholder Workflows

### WF-COMPVSS-032: Stakeholder Portal Access

**Actor:** Stakeholder  
**Trigger:** Stakeholder needs production updates

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Login | `/auth/signin` | Authenticated |
| 2 | Access stakeholder portal | `/stakeholder-portal` | Portal displayed |
| 3 | View production updates | `/p/[id]/communication/stakeholder-portal` | Updates shown |
| 4 | Access documents | `/p/[id]/documents` | Documents available |
| 5 | View reports | `/p/[id]/reports` | Reports displayed |

**Post-Conditions:**
- Stakeholder informed
- Documents accessible

---

## Offline & Mobile Workflows

### WF-COMPVSS-033: Offline Work Mode

**Actor:** All COMPVSS Users  
**Trigger:** Network unavailable

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Access offline mode | `/offline` | Offline mode active |
| 2 | View cached schedule | `/my-schedule` | Schedule available |
| 3 | View cached documents | `/knowledge/offline` | Docs available |
| 4 | Log work offline | `/offline` | Work logged locally |
| 5 | Sync when online | `/offline` | Data synced |

**Post-Conditions:**
- Work continues offline
- Data synced when connected

---

## Authentication Workflows

### WF-COMPVSS-034: User Authentication

**Actor:** All Users  
**Trigger:** User needs to access system

| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Navigate to sign in | `/auth/signin` | Login form |
| 2 | Enter credentials | `/auth/signin` | Credentials entered |
| 3 | Submit | `/auth/signin` | Auth attempted |
| 4 | **Success:** Dashboard | `/dashboard` | Access granted |
| 5 | **Failure:** Error | `/auth/signin` | Error shown |

**Alternative: Magic Link**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Request magic link | `/auth/magic-link` | Link requested |
| 2 | Check email | Email | Link received |
| 3 | Click link | Email | Authenticated |

**Alternative: Password Reset**
| Step | Action | Page | Outcome |
|------|--------|------|---------|
| 1 | Forgot password | `/auth/forgot-password` | Reset form |
| 2 | Enter email | `/auth/forgot-password` | Email entered |
| 3 | Reset link | Email | Link received |
| 4 | New password | `/auth/reset-password` | Password set |

---

*End of COMPVSS Detailed Workflows*
