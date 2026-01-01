# 3NF Table Mapping Reference

This document maps old/legacy table names to the correct 3NF normalized table names.

## Legend Tables (Entities/Nouns)

### People
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `profiles` | `platform_users` | - |
| `users` | `platform_users` | - |
| `employees` | `legend_people` | `people_profile_employee` |
| `crew_members` | `legend_people` | `people_profile_crew` |
| `artists` | `legend_people` | `people_profile_artist` |
| `volunteers` | `legend_people` | `people_profile_volunteer` |
| `contacts` | `legend_people` | `people_profile_contact` |
| `candidates` | `legend_people` | `people_profile_candidate` |
| `mentors` | `legend_people` | `people_profile_mentor` |
| `influencers` | `legend_people` | `people_profile_influencer` |
| `speakers` | `legend_people` | `people_profile_speaker` |
| `attendees` | `legend_people` | `people_profile_attendee` |

### Places
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `venues` | `legend_places` | `places_profile_venue` |
| `warehouses` | `legend_places` | `places_profile_warehouse` |
| `zones` | `legend_places` | `places_profile_zone` |
| `spaces` | `legend_places` | `places_profile_space` |
| `staging_areas` | `legend_places` | `places_profile_staging` |
| `parking_lots` | `legend_places` | `places_profile_parking` |
| `offices` | `legend_places` | `places_profile_office` |

### Organizations
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `vendors` | `legend_organizations` | `orgs_profile_vendor` |
| `sponsors` | `legend_organizations` | `orgs_profile_sponsor` |
| `clients` | `legend_organizations` | `orgs_profile_client` |
| `agencies` | `legend_organizations` | `orgs_profile_agency` |
| `partners` | `legend_organizations` | `orgs_profile_partner` |

### Products
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `tickets` | `legend_products` | `products_profile_ticket` |
| `merchandise` | `legend_products` | `products_profile_merchandise` |
| `services` | `legend_products` | `products_profile_service` |
| `subscriptions` | `legend_products` | `products_profile_subscription` |
| `rentals` | `legend_products` | `products_profile_rental` |

### Events
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `events` | `legend_events` | - |
| `conferences` | `legend_events` | `events_profile_conference` |
| `festivals` | `legend_events` | `events_profile_festival` |
| `workshops` | `legend_events` | `events_profile_workshop` |
| `webinars` | `legend_events` | `events_profile_webinar` |
| `activations` | `legend_events` | `events_profile_activation` |

### Documents
| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `contracts` | `legend_documents` | `docs_profile_contract` |
| `invoices` | `legend_documents` | `docs_profile_invoice` |
| `reports` | `legend_documents` | `docs_profile_report` |
| `templates` | `legend_documents` | `docs_profile_template` |

## Saga Tables (Workflows/Verbs)

| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `approvals` | `saga_instances` | `saga_profile_approval` |
| `requests` | `saga_instances` | `saga_profile_request` |
| `submissions` | `saga_instances` | `saga_profile_submission` |
| `workflows` | `saga_instances` | `saga_profile_process` |
| `automations` | `saga_instances` | `saga_profile_automation` |
| `change_orders` | `saga_instances` | `saga_profile_change` |

## Chronicle Tables (Activities/Transactions)

| Old Table | 3NF Table | Profile Table |
|-----------|-----------|---------------|
| `transactions` | `chronicle_entries` | `chronicle_profile_transaction` |
| `payments` | `chronicle_entries` | `chronicle_profile_transaction` |
| `timesheets` | `chronicle_entries` | `chronicle_profile_timesheet` |
| `time_entries` | `chronicle_entries` | `chronicle_profile_timesheet` |
| `asset_movements` | `chronicle_entries` | `chronicle_profile_movement` |
| `audit_logs` | `chronicle_entries` | `chronicle_profile_audit` |
| `automation_logs` | `chronicle_entries` | `chronicle_profile_automation` |
| `communications` | `chronicle_entries` | `chronicle_profile_communication` |

## Other Core Tables (Already Correct)

These tables exist and are correctly named:
- `organizations`
- `platform_users`
- `user_organizations`
- `role_definitions`
- `user_roles`
- `projects`
- `orders`
- `order_items`
- `notifications`
- `assets`
- `addresses`
- `entity_addresses`

## Tables That Need Special Handling

| Old Reference | Correct Approach |
|---------------|------------------|
| `ticket_types` | Use `legend_products` with `product_type = 'ticket'` |
| `user_locations` | Use `entity_addresses` with `entity_type = 'user'` |
| `user_roles` | Already exists as `user_roles` |
| `roles` | Use `role_definitions` |
| `marketing_campaigns` | Use `social_amplification_campaigns` |
| `marketing_automations` | Use `automation_rules` |
