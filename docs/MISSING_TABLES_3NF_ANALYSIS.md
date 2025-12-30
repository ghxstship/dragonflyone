# Missing Tables 3NF Analysis

## Executive Summary

| Metric | Count |
|--------|-------|
| **Tables referenced in code** | 1,413 |
| **Tables in migrations** | 271 |
| **Tables missing from migrations** | 1,296 |
| **Tables in diff file (never applied)** | 1,606 |

## 3NF Schema Architecture (Non-Negotiable)

The database follows a **Legend/Saga/Chronicle** pattern:

| Schema | Purpose | Single Source of Truth |
|--------|---------|------------------------|
| **Legend** | Entities (Nouns) | `legend_people`, `legend_places`, `legend_organizations`, `legend_products`, `legend_events`, `legend_documents` |
| **Saga** | Workflows (Verbs) | `saga_instances` + profile tables |
| **Chronicle** | Activities (Transactions) | `chronicle_entries` + profile tables |

---

## Category 1: SKIP - Violates 3NF (Should Use Legend Entities)

These tables duplicate entity definitions that should use `legend_*` tables with profile extensions.

### People Duplicates (Use `legend_people` + profiles)
| Table | Reason to Skip | Correct Approach |
|-------|----------------|------------------|
| `artists` | Duplicates person entity | Use `legend_people` + `people_profile_artist` |
| `ambassadors` | Duplicates person entity | Use `legend_people` + profile extension |
| `attendees` | Duplicates person entity | Use `legend_people` + `people_profile_attendee` |
| `candidates` | Duplicates person entity | Use `legend_people` + `people_profile_candidate` |
| `crew_members` | Duplicates person entity | Use `legend_people` + `people_profile_crew` |
| `employees` | Duplicates person entity | Use `legend_people` + `people_profile_employee` |
| `guests` | Duplicates person entity | Use `legend_people` + `people_profile_attendee` |
| `influencers` | Duplicates person entity | Use `legend_people` + `people_profile_influencer` |
| `mentors` | Duplicates person entity | Use `legend_people` + `people_profile_mentor` |
| `performers` | Duplicates person entity | Use `legend_people` + `people_profile_artist` |
| `speakers` | Duplicates person entity | Use `legend_people` + `people_profile_speaker` |
| `staff` | Duplicates person entity | Use `legend_people` + `people_profile_employee` |
| `volunteers` | Duplicates person entity | Use `legend_people` + `people_profile_volunteer` |
| `vip_guests` | Already exists in migrations | N/A |

### Place Duplicates (Use `legend_places` + profiles)
| Table | Reason to Skip | Correct Approach |
|-------|----------------|------------------|
| `venues` | Duplicates place entity | Use `legend_places` + `places_profile_venue` |
| `stages` | Duplicates place entity | Use `legend_places` + profile extension |
| `warehouses` | Duplicates place entity | Use `legend_places` + `places_profile_warehouse` |
| `zones` | Duplicates place entity | Use `legend_places` + `places_profile_zone` |
| `spaces` | Duplicates place entity | Use `legend_places` + `places_profile_space` |
| `staging_areas` | Already exists | Use `legend_places` + `places_profile_staging` |
| `parking_lots` | Duplicates place entity | Use `legend_places` + `places_profile_parking` |
| `offices` | Duplicates place entity | Use `legend_places` + `places_profile_office` |

### Organization Duplicates (Use `legend_organizations` + profiles)
| Table | Reason to Skip | Correct Approach |
|-------|----------------|------------------|
| `vendors` | Duplicates org entity | Use `legend_organizations` + `orgs_profile_vendor` |
| `sponsors` | Duplicates org entity | Use `legend_organizations` + `orgs_profile_sponsor` |
| `clients` | Duplicates org entity | Use `legend_organizations` + `orgs_profile_client` |
| `agencies` | Duplicates org entity | Use `legend_organizations` + `orgs_profile_agency` |
| `subcontractors` | Duplicates org entity | Use `legend_organizations` + profile extension |
| `partners` | Duplicates org entity | Use `legend_organizations` + `orgs_profile_partner` |

### Event Duplicates (Use `legend_events` + profiles)
| Table | Reason to Skip | Correct Approach |
|-------|----------------|------------------|
| `events` | Duplicates event entity | Use `legend_events` |
| `shows` | Duplicates event entity | Use `legend_events` + profile extension |
| `productions` | Duplicates event entity | Use `legend_events` + profile extension |
| `concerts` | Duplicates event entity | Use `legend_events` + `events_profile_concert` |
| `festivals` | Duplicates event entity | Use `legend_events` + `events_profile_festival` |
| `tours` | Duplicates event entity | Use `legend_events` + profile extension |
| `rehearsals` | Duplicates event entity | Use `legend_events` + profile extension |
| `meetings` | Duplicates event entity | Use `legend_events` + profile extension |

### Product Duplicates (Use `legend_products` + profiles)
| Table | Reason to Skip | Correct Approach |
|-------|----------------|------------------|
| `products` | Duplicates product entity | Use `legend_products` |
| `equipment` | Duplicates product entity | Use `legend_products` + profile extension |
| `inventory_items` | Duplicates product entity | Use `legend_products` + profile extension |
| `merchandise` | Duplicates product entity | Use `legend_products` + `products_profile_merchandise` |
| `tickets` | Duplicates product entity | Use `legend_products` + `products_profile_ticket` |

---

## Category 2: SKIP - Violates 3NF (Should Use Saga Workflows)

These tables duplicate workflow patterns that should use `saga_instances` with profile extensions.

### Approval Workflows (Use `saga_instances` + `saga_profile_approval`)
| Table | Reason to Skip |
|-------|----------------|
| `advance_approvals` | Use Saga approval workflow |
| `bid_decision_approvals` | Use Saga approval workflow |
| `change_order_approvals` | Use Saga approval workflow |
| `expense_approvals` | Use Saga approval workflow |
| `purchase_order_approvals` | Use Saga approval workflow |
| `selection_approvals` | Use Saga approval workflow |
| `stakeholder_approvals` | Use Saga approval workflow |
| `vendor_order_approvals` | Use Saga approval workflow |
| `walkthrough_approvals` | Use Saga approval workflow |

### Request Workflows (Use `saga_instances` + `saga_profile_request`)
| Table | Reason to Skip |
|-------|----------------|
| `accessibility_requests` | Already exists in migrations |
| `change_requests` | Use Saga request workflow |
| `mentor_requests` | Use Saga request workflow |
| `refund_requests` | Use Saga request workflow |
| `service_requests` | Use Saga request workflow |
| `time_off_requests` | Use Saga request workflow |
| `transfer_requests` | Use Saga request workflow |
| `travel_requests` | Use Saga request workflow |
| `vendor_onboarding_requests` | Use Saga request workflow |
| `verification_requests` | Use Saga request workflow |

### Submission Workflows (Use `saga_instances` + `saga_profile_submission`)
| Table | Reason to Skip |
|-------|----------------|
| `applications` | Use Saga submission workflow |
| `bid_submissions` | Use Saga submission workflow |
| `contest_entries` | Use Saga submission workflow |
| `rfp_responses` | Use Saga submission workflow |
| `ugc_submissions` | Use Saga submission workflow |

---

## Category 3: SKIP - Violates 3NF (Should Use Chronicle Activities)

These tables duplicate activity/transaction patterns that should use `chronicle_entries`.

### Financial Transactions (Use `chronicle_entries` + `chronicle_profile_transaction`)
| Table | Reason to Skip |
|-------|----------------|
| `bank_transactions` | Use Chronicle transaction |
| `cashless_transactions` | Use Chronicle transaction |
| `credit_card_transactions` | Use Chronicle transaction |
| `payments` | Use Chronicle transaction |
| `refunds` | Use Chronicle transaction |
| `reward_transactions` | Use Chronicle transaction |
| `rfid_transactions` | Use Chronicle transaction |
| `stripe_transactions` | Use Chronicle transaction |
| `transactions` | Use Chronicle transaction |
| `wallet_transactions` | Use Chronicle transaction |

### Time Tracking (Use `chronicle_entries` + `chronicle_profile_timesheet`)
| Table | Reason to Skip |
|-------|----------------|
| `attendance_records` | Use Chronicle timesheet |
| `clock_events` | Use Chronicle timesheet |
| `time_entries` | Use Chronicle timesheet |
| `timesheet_breaks` | Use Chronicle timesheet |
| `timesheets` | Use Chronicle timesheet |

### Audit Logs (Use `chronicle_entries` + `chronicle_profile_audit`)
| Table | Reason to Skip |
|-------|----------------|
| `activity_logs` | Use Chronicle audit |
| `audit_logs` | Use Chronicle audit |
| `audit_trail` | Use Chronicle audit |
| `compliance_audit_log` | Use Chronicle audit |
| `field_history` | Use Chronicle audit |

### Movement Tracking (Use `chronicle_entries` + `chronicle_profile_movement`)
| Table | Reason to Skip |
|-------|----------------|
| `asset_checkouts` | Use Chronicle movement |
| `asset_disposals` | Use Chronicle movement |
| `asset_location_history` | Use Chronicle movement |
| `asset_retirements` | Use Chronicle movement |
| `asset_scans` | Use Chronicle movement |
| `asset_transfers` | Use Chronicle movement |
| `equipment_checkouts` | Use Chronicle movement |
| `equipment_returns` | Use Chronicle movement |
| `inventory_adjustments` | Use Chronicle movement |
| `inventory_movements` | Use Chronicle movement |
| `rfid_scans` | Use Chronicle movement |

---

## Category 4: ADD - Operational Tables (3NF Compliant)

These tables are domain-specific operational tables that don't duplicate Legend/Saga/Chronicle patterns and should be added.

### User Preferences & Settings (ADD)
| Table | Justification |
|-------|---------------|
| `saved_filters` | User-specific filter configurations, no entity duplication |
| `saved_views` | User-specific view configurations, no entity duplication |
| `user_preferences` | User-specific preferences, extends `platform_users` |
| `user_settings` | User-specific settings, extends `platform_users` |
| `user_notification_preferences` | Notification settings per user |
| `user_privacy_settings` | Privacy settings per user |
| `user_accessibility_preferences` | Accessibility settings per user |

### Workspace & Team Management (ADD)
| Table | Justification |
|-------|---------------|
| `teams` | Organizational unit, references `legend_departments` |
| `workspaces` | Project grouping, references `organizations` |
| `team_members` | Junction table for team membership |
| `workspace_projects` | Junction table for workspace-project relationship |

### A/B Testing (ADD - if feature needed)
| Table | Justification |
|-------|---------------|
| `ab_tests` | Test definitions, no entity duplication |
| `ab_test_assignments` | User-test assignments |
| `ab_test_conversions` | Conversion tracking |
| `ab_test_impressions` | Impression tracking |

### API & Webhooks (ADD)
| Table | Justification |
|-------|---------------|
| `api_keys` | API key management |
| `api_key_usage` | Usage tracking |
| `webhooks` | Webhook configurations |
| `webhook_deliveries` | Delivery tracking |
| `webhook_subscriptions` | Subscription management |

### Search & Analytics (ADD)
| Table | Justification |
|-------|---------------|
| `search_history` | User search history |
| `search_index` | Search indexing |
| `analytics_events` | Event tracking |
| `analytics_dashboards` | Dashboard configurations |

### Notifications (ADD)
| Table | Justification |
|-------|---------------|
| `notifications` | Notification records |
| `notification_templates` | Template definitions |
| `push_tokens` | Device push tokens |
| `unified_notifications` | Cross-channel notifications |

### Feature Flags (ADD)
| Table | Justification |
|-------|---------------|
| `feature_flags` | Feature flag definitions |
| `flag_evaluations` | Evaluation logs |
| `flag_overrides` | User/org overrides |

### Import/Export (ADD)
| Table | Justification |
|-------|---------------|
| `import_jobs` | Import job tracking |
| `import_templates` | Import configurations |
| `export_jobs` | Export job tracking |
| `export_templates` | Export configurations |

### SSO & Authentication (ADD)
| Table | Justification |
|-------|---------------|
| `sso_providers` | SSO provider configurations |
| `sso_sessions` | SSO session tracking |
| `sso_domain_verifications` | Domain verification |
| `user_2fa_config` | 2FA configuration |
| `user_2fa_verification_log` | 2FA verification logs |

---

## Category 5: ADD - Junction/Relationship Tables (3NF Compliant)

These are proper junction tables for many-to-many relationships.

| Table | Entities Connected | Justification |
|-------|-------------------|---------------|
| `project_contacts` | projects ↔ contacts | M:M relationship |
| `project_team_members` | projects ↔ people | M:M relationship |
| `project_vendors` | projects ↔ organizations | M:M relationship |
| `event_sponsors` | events ↔ organizations | M:M relationship |
| `event_artists` | events ↔ people | M:M relationship |
| `venue_contacts` | venues ↔ contacts | M:M relationship |
| `vendor_contacts` | vendors ↔ contacts | M:M relationship |
| `sponsor_contacts` | sponsors ↔ contacts | M:M relationship |

---

## Category 6: SKIP - Redundant/Legacy Tables

These tables are redundant with existing normalized structures.

| Table | Reason to Skip |
|-------|----------------|
| `profiles` | Use `platform_users` or `legend_people` |
| `roles` | Use `role_definitions` |
| `activations` | Use `legend_events` with activation profile |
| `activities` | Use `chronicle_entries` |
| `activity_feed` | Use `chronicle_entries` with view |

---

## Recommended Action Plan

### Phase 1: Critical User Experience Tables (Immediate)
Add these tables to unblock core functionality:

1. `saved_filters` - User filter persistence
2. `saved_views` - User view persistence  
3. `user_preferences` - User preferences
4. `user_settings` - User settings
5. `teams` - Team management
6. `workspaces` - Workspace management
7. `audit_logs` - Use `chronicle_entries` + `chronicle_profile_audit` (already exists)

### Phase 2: API & Integration Tables
1. `api_keys`
2. `webhooks`
3. `webhook_deliveries`
4. `feature_flags`

### Phase 3: Update Application Code
Instead of adding 1,296 tables, update the application code to:
1. Use `legend_*` tables for entities
2. Use `saga_instances` for workflows
3. Use `chronicle_entries` for activities

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| **SKIP - Entity Duplicates** | ~150 | Refactor code to use Legend |
| **SKIP - Workflow Duplicates** | ~50 | Refactor code to use Saga |
| **SKIP - Activity Duplicates** | ~80 | Refactor code to use Chronicle |
| **SKIP - Redundant/Legacy** | ~100 | Remove code references |
| **ADD - Operational Tables** | ~50 | Create migrations |
| **ADD - Junction Tables** | ~30 | Create migrations |
| **REVIEW - Domain Specific** | ~800+ | Case-by-case analysis |

**Recommendation**: Create migrations for ~80 operational/junction tables. Refactor application code to use the 3NF Legend/Saga/Chronicle pattern for the remaining ~1,200 tables.
