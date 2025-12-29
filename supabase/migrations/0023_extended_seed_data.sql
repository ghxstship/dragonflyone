-- ============================================================================
-- 0023_extended_seed_data.sql
-- Extended Seed Data for Development and Testing
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ADDITIONAL ROLE DEFINITIONS
-- ============================================================================

INSERT INTO role_definitions (code, platform, description, level, hierarchy_rank, is_system) VALUES
  ('FINANCE_ADMIN', 'atlvs', 'Finance administrator', 'admin', 3, true),
  ('WORKFORCE_MANAGER', 'atlvs', 'Workforce/HR manager', 'admin', 3, true),
  ('PROCUREMENT_MANAGER', 'atlvs', 'Procurement manager', 'admin', 3, true),
  ('COMPVSS_COLLABORATOR', 'compvss', 'Production collaborator', 'member', 2, true),
  ('GVTEWAY_EXPERIENCE_CREATOR', 'gvteway', 'Experience creator', 'member', 2, true),
  ('GVTEWAY_VENUE_MANAGER', 'gvteway', 'Venue manager', 'admin', 3, true),
  ('GVTEWAY_ARTIST_VERIFIED', 'gvteway', 'Verified artist', 'member', 2, true),
  ('GVTEWAY_ARTIST', 'gvteway', 'Artist', 'member', 1, true),
  ('GVTEWAY_MEMBER_EXTRA', 'gvteway', 'Extra member tier', 'member', 2, true),
  ('GVTEWAY_MEMBER_PLUS', 'gvteway', 'Plus member tier', 'member', 2, true),
  ('GVTEWAY_MEMBER_GUEST', 'gvteway', 'Guest member', 'viewer', 1, true),
  ('GVTEWAY_AFFILIATE', 'gvteway', 'Affiliate partner', 'member', 1, true),
  ('GVTEWAY_MODERATOR', 'gvteway', 'Community moderator', 'member', 2, true),
  ('LEGEND_COLLABORATOR', 'legend', 'Legend collaborator', 'member', 3, true),
  ('LEGEND_INCOGNITO', 'legend', 'Incognito mode', 'god', 5, true)
ON CONFLICT (code) DO UPDATE SET
  platform = EXCLUDED.platform,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  hierarchy_rank = EXCLUDED.hierarchy_rank;

-- ============================================================================
-- EXPENSE CATEGORIES
-- ============================================================================

INSERT INTO finance_expense_categories (organization_id, code, name, description, requires_receipt_above, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'TRAVEL', 'Travel', 'Travel and transportation expenses', 25.00, 1),
  ('00000000-0000-0000-0000-000000000001', 'MEALS', 'Meals & Entertainment', 'Meals and entertainment expenses', 25.00, 2),
  ('00000000-0000-0000-0000-000000000001', 'EQUIPMENT', 'Equipment', 'Equipment purchases and rentals', 100.00, 3),
  ('00000000-0000-0000-0000-000000000001', 'MATERIALS', 'Materials & Supplies', 'Production materials and supplies', 50.00, 4),
  ('00000000-0000-0000-0000-000000000001', 'SOFTWARE', 'Software & Subscriptions', 'Software licenses and subscriptions', 0.00, 5),
  ('00000000-0000-0000-0000-000000000001', 'VENUE', 'Venue & Facilities', 'Venue rentals and facility costs', 500.00, 6),
  ('00000000-0000-0000-0000-000000000001', 'PERMITS', 'Permits & Licenses', 'Permits, licenses, and fees', 0.00, 7),
  ('00000000-0000-0000-0000-000000000001', 'MARKETING', 'Marketing & Advertising', 'Marketing and advertising expenses', 100.00, 8),
  ('00000000-0000-0000-0000-000000000001', 'PROFESSIONAL', 'Professional Services', 'Consulting and professional services', 500.00, 9),
  ('00000000-0000-0000-0000-000000000001', 'OTHER', 'Other', 'Miscellaneous expenses', 25.00, 99)
ON CONFLICT (organization_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requires_receipt_above = EXCLUDED.requires_receipt_above;

-- ============================================================================
-- LEDGER ACCOUNTS (Chart of Accounts)
-- ============================================================================

INSERT INTO ledger_accounts (organization_id, account_code, account_name, account_type, description) VALUES
  ('00000000-0000-0000-0000-000000000001', '1000', 'Cash', 'Asset', 'Cash and cash equivalents'),
  ('00000000-0000-0000-0000-000000000001', '1100', 'Petty Cash', 'Asset', 'Petty cash fund'),
  ('00000000-0000-0000-0000-000000000001', '1200', 'Accounts Receivable', 'Asset', 'Customer receivables'),
  ('00000000-0000-0000-0000-000000000001', '1300', 'Prepaid Expenses', 'Asset', 'Prepaid expenses'),
  ('00000000-0000-0000-0000-000000000001', '1400', 'Inventory', 'Asset', 'Merchandise inventory'),
  ('00000000-0000-0000-0000-000000000001', '1500', 'Equipment', 'Asset', 'Production equipment'),
  ('00000000-0000-0000-0000-000000000001', '1510', 'Accumulated Depreciation - Equipment', 'Asset', 'Equipment depreciation'),
  ('00000000-0000-0000-0000-000000000001', '1600', 'Vehicles', 'Asset', 'Company vehicles'),
  ('00000000-0000-0000-0000-000000000001', '2000', 'Accounts Payable', 'Liability', 'Vendor payables'),
  ('00000000-0000-0000-0000-000000000001', '2100', 'Accrued Expenses', 'Liability', 'Accrued liabilities'),
  ('00000000-0000-0000-0000-000000000001', '2200', 'Payroll Liabilities', 'Liability', 'Payroll taxes and withholdings'),
  ('00000000-0000-0000-0000-000000000001', '2300', 'Deferred Revenue', 'Liability', 'Unearned revenue'),
  ('00000000-0000-0000-0000-000000000001', '2400', 'Notes Payable', 'Liability', 'Short-term notes'),
  ('00000000-0000-0000-0000-000000000001', '3000', 'Owner Equity', 'Equity', 'Owner capital'),
  ('00000000-0000-0000-0000-000000000001', '3100', 'Retained Earnings', 'Equity', 'Retained earnings'),
  ('00000000-0000-0000-0000-000000000001', '4000', 'Event Revenue', 'Revenue', 'Revenue from events'),
  ('00000000-0000-0000-0000-000000000001', '4100', 'Ticket Sales', 'Revenue', 'Ticket sales revenue'),
  ('00000000-0000-0000-0000-000000000001', '4200', 'Sponsorship Revenue', 'Revenue', 'Sponsorship income'),
  ('00000000-0000-0000-0000-000000000001', '4300', 'Merchandise Sales', 'Revenue', 'Merchandise revenue'),
  ('00000000-0000-0000-0000-000000000001', '4400', 'Service Revenue', 'Revenue', 'Service fees'),
  ('00000000-0000-0000-0000-000000000001', '4500', 'Rental Income', 'Revenue', 'Equipment rental income'),
  ('00000000-0000-0000-0000-000000000001', '5000', 'Cost of Goods Sold', 'Expense', 'Direct costs'),
  ('00000000-0000-0000-0000-000000000001', '5100', 'Production Costs', 'Expense', 'Event production costs'),
  ('00000000-0000-0000-0000-000000000001', '5200', 'Artist Fees', 'Expense', 'Artist and talent fees'),
  ('00000000-0000-0000-0000-000000000001', '5300', 'Venue Costs', 'Expense', 'Venue rental and fees'),
  ('00000000-0000-0000-0000-000000000001', '6000', 'Operating Expenses', 'Expense', 'General operating expenses'),
  ('00000000-0000-0000-0000-000000000001', '6100', 'Salaries & Wages', 'Expense', 'Employee compensation'),
  ('00000000-0000-0000-0000-000000000001', '6200', 'Payroll Taxes', 'Expense', 'Employer payroll taxes'),
  ('00000000-0000-0000-0000-000000000001', '6300', 'Benefits', 'Expense', 'Employee benefits'),
  ('00000000-0000-0000-0000-000000000001', '6400', 'Rent', 'Expense', 'Office rent'),
  ('00000000-0000-0000-0000-000000000001', '6500', 'Utilities', 'Expense', 'Utilities expense'),
  ('00000000-0000-0000-0000-000000000001', '6600', 'Insurance', 'Expense', 'Insurance premiums'),
  ('00000000-0000-0000-0000-000000000001', '6700', 'Marketing', 'Expense', 'Marketing and advertising'),
  ('00000000-0000-0000-0000-000000000001', '6800', 'Professional Fees', 'Expense', 'Legal and accounting'),
  ('00000000-0000-0000-0000-000000000001', '6900', 'Travel & Entertainment', 'Expense', 'Travel and entertainment'),
  ('00000000-0000-0000-0000-000000000001', '7000', 'Labor Costs', 'Expense', 'Contract labor'),
  ('00000000-0000-0000-0000-000000000001', '7100', 'Crew Labor', 'Expense', 'Event crew labor'),
  ('00000000-0000-0000-0000-000000000001', '7200', 'Contractor Fees', 'Expense', 'Independent contractors'),
  ('00000000-0000-0000-0000-000000000001', '8000', 'Other Income', 'Revenue', 'Miscellaneous income'),
  ('00000000-0000-0000-0000-000000000001', '9000', 'Other Expenses', 'Expense', 'Miscellaneous expenses')
ON CONFLICT (organization_id, account_code) DO UPDATE SET
  account_name = EXCLUDED.account_name,
  account_type = EXCLUDED.account_type,
  description = EXCLUDED.description;

-- ============================================================================
-- WORKFORCE ROLES
-- ============================================================================

INSERT INTO workforce_roles (organization_id, code, name, description, hourly_rate_min, hourly_rate_max, daily_rate, overtime_multiplier, requires_certification) VALUES
  ('00000000-0000-0000-0000-000000000001', 'EXEC', 'Executive', 'Executive leadership', NULL, NULL, NULL, 1.0, false),
  ('00000000-0000-0000-0000-000000000001', 'PM', 'Production Manager', 'Production management', 50.00, 100.00, 800.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'TD', 'Technical Director', 'Technical direction', 45.00, 85.00, 680.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'SM', 'Stage Manager', 'Stage management', 35.00, 65.00, 520.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'LD', 'Lighting Designer', 'Lighting design', 40.00, 80.00, 640.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'SOUND', 'Sound Engineer', 'Audio engineering', 35.00, 70.00, 560.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'VIDEO', 'Video Engineer', 'Video engineering', 35.00, 70.00, 560.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'RIGGER', 'Rigger', 'Rigging specialist', 30.00, 60.00, 480.00, 1.5, true),
  ('00000000-0000-0000-0000-000000000001', 'TECH', 'Technician', 'General technician', 25.00, 45.00, 360.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'STAGEHAND', 'Stagehand', 'General stagehand', 20.00, 35.00, 280.00, 1.5, false),
  ('00000000-0000-0000-0000-000000000001', 'DRIVER', 'Driver', 'Vehicle operator', 20.00, 35.00, 280.00, 1.5, true),
  ('00000000-0000-0000-0000-000000000001', 'SECURITY', 'Security', 'Event security', 18.00, 30.00, 240.00, 1.5, true),
  ('00000000-0000-0000-0000-000000000001', 'RUNNER', 'Runner', 'Production assistant', 15.00, 25.00, 200.00, 1.5, false)
ON CONFLICT (organization_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  hourly_rate_min = EXCLUDED.hourly_rate_min,
  hourly_rate_max = EXCLUDED.hourly_rate_max,
  daily_rate = EXCLUDED.daily_rate;

-- ============================================================================
-- STATUS REGISTRY
-- ============================================================================

INSERT INTO status_registry (organization_id, category, code, label, description, color, sort_order, is_terminal, next_statuses) VALUES
  -- Deal statuses
  (NULL, 'deal', 'lead', 'Lead', 'New lead', '#3B82F6', 1, false, ARRAY['qualified', 'lost']),
  (NULL, 'deal', 'qualified', 'Qualified', 'Qualified opportunity', '#8B5CF6', 2, false, ARRAY['proposal', 'lost']),
  (NULL, 'deal', 'proposal', 'Proposal', 'Proposal sent', '#F59E0B', 3, false, ARRAY['won', 'lost']),
  (NULL, 'deal', 'won', 'Won', 'Deal closed won', '#10B981', 4, true, ARRAY[]::TEXT[]),
  (NULL, 'deal', 'lost', 'Lost', 'Deal closed lost', '#EF4444', 5, true, ARRAY[]::TEXT[]),
  
  -- Project statuses
  (NULL, 'project', 'intake', 'Intake', 'Project intake', '#3B82F6', 1, false, ARRAY['preproduction', 'cancelled']),
  (NULL, 'project', 'preproduction', 'Pre-Production', 'Pre-production phase', '#8B5CF6', 2, false, ARRAY['in_production', 'cancelled']),
  (NULL, 'project', 'in_production', 'In Production', 'Active production', '#F59E0B', 3, false, ARRAY['post', 'cancelled']),
  (NULL, 'project', 'post', 'Post-Production', 'Post-production phase', '#06B6D4', 4, false, ARRAY['completed', 'cancelled']),
  (NULL, 'project', 'completed', 'Completed', 'Project completed', '#10B981', 5, true, ARRAY[]::TEXT[]),
  (NULL, 'project', 'cancelled', 'Cancelled', 'Project cancelled', '#EF4444', 6, true, ARRAY[]::TEXT[]),
  
  -- Asset statuses
  (NULL, 'asset', 'available', 'Available', 'Asset available', '#10B981', 1, false, ARRAY['reserved', 'maintenance', 'retired']),
  (NULL, 'asset', 'reserved', 'Reserved', 'Asset reserved', '#F59E0B', 2, false, ARRAY['deployed', 'available']),
  (NULL, 'asset', 'deployed', 'Deployed', 'Asset deployed', '#3B82F6', 3, false, ARRAY['available', 'maintenance']),
  (NULL, 'asset', 'maintenance', 'Maintenance', 'Under maintenance', '#8B5CF6', 4, false, ARRAY['available', 'retired']),
  (NULL, 'asset', 'retired', 'Retired', 'Asset retired', '#6B7280', 5, true, ARRAY[]::TEXT[])
ON CONFLICT (organization_id, category, code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  next_statuses = EXCLUDED.next_statuses;

-- ============================================================================
-- RISK LEVELS
-- ============================================================================

INSERT INTO risk_levels (organization_id, code, label, description, severity, color, mitigation_required, approval_required, notification_required) VALUES
  (NULL, 'low', 'Low', 'Low risk - minimal impact', 2, '#10B981', false, false, false),
  (NULL, 'medium', 'Medium', 'Medium risk - moderate impact', 5, '#F59E0B', true, false, true),
  (NULL, 'high', 'High', 'High risk - significant impact', 7, '#EF4444', true, true, true),
  (NULL, 'critical', 'Critical', 'Critical risk - severe impact', 10, '#7F1D1D', true, true, true)
ON CONFLICT (organization_id, code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  color = EXCLUDED.color;

-- ============================================================================
-- AUTOMATION TRIGGER CATALOG
-- ============================================================================

INSERT INTO automation_trigger_catalog (key, label, description, category, entity_type, event_type, payload_schema) VALUES
  ('deal.created', 'Deal Created', 'Triggered when a new deal is created', 'CRM', 'deal', 'create', '{"type": "object", "properties": {"deal_id": {"type": "string"}, "title": {"type": "string"}, "value": {"type": "number"}}}'),
  ('deal.status_changed', 'Deal Status Changed', 'Triggered when deal status changes', 'CRM', 'deal', 'update', '{"type": "object", "properties": {"deal_id": {"type": "string"}, "old_status": {"type": "string"}, "new_status": {"type": "string"}}}'),
  ('deal.won', 'Deal Won', 'Triggered when a deal is marked as won', 'CRM', 'deal', 'update', '{"type": "object", "properties": {"deal_id": {"type": "string"}, "value": {"type": "number"}}}'),
  ('project.created', 'Project Created', 'Triggered when a new project is created', 'Production', 'project', 'create', '{"type": "object", "properties": {"project_id": {"type": "string"}, "name": {"type": "string"}}}'),
  ('project.phase_changed', 'Project Phase Changed', 'Triggered when project phase changes', 'Production', 'project', 'update', '{"type": "object", "properties": {"project_id": {"type": "string"}, "old_phase": {"type": "string"}, "new_phase": {"type": "string"}}}'),
  ('expense.submitted', 'Expense Submitted', 'Triggered when an expense is submitted for approval', 'Finance', 'expense', 'update', '{"type": "object", "properties": {"expense_id": {"type": "string"}, "amount": {"type": "number"}, "submitter_id": {"type": "string"}}}'),
  ('expense.approved', 'Expense Approved', 'Triggered when an expense is approved', 'Finance', 'expense', 'update', '{"type": "object", "properties": {"expense_id": {"type": "string"}, "amount": {"type": "number"}, "approver_id": {"type": "string"}}}'),
  ('asset.state_changed', 'Asset State Changed', 'Triggered when asset state changes', 'Inventory', 'asset', 'update', '{"type": "object", "properties": {"asset_id": {"type": "string"}, "old_state": {"type": "string"}, "new_state": {"type": "string"}}}'),
  ('asset.maintenance_due', 'Asset Maintenance Due', 'Triggered when asset maintenance is due', 'Inventory', 'asset', 'schedule', '{"type": "object", "properties": {"asset_id": {"type": "string"}, "maintenance_date": {"type": "string"}}}'),
  ('time_entry.submitted', 'Time Entry Submitted', 'Triggered when time entry is submitted', 'Workforce', 'time_entry', 'create', '{"type": "object", "properties": {"entry_id": {"type": "string"}, "employee_id": {"type": "string"}, "hours": {"type": "number"}}}'),
  ('certification.expiring', 'Certification Expiring', 'Triggered when certification is about to expire', 'Workforce', 'certification', 'schedule', '{"type": "object", "properties": {"certification_id": {"type": "string"}, "employee_id": {"type": "string"}, "expiration_date": {"type": "string"}}}'),
  ('alert.triggered', 'Alert Triggered', 'Triggered when a system alert is raised', 'System', 'alert', 'create', '{"type": "object", "properties": {"alert_id": {"type": "string"}, "severity": {"type": "string"}, "message": {"type": "string"}}}')
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  payload_schema = EXCLUDED.payload_schema;

-- ============================================================================
-- AUTOMATION ACTION CATALOG
-- ============================================================================

INSERT INTO automation_action_catalog (key, label, description, category, target_entity_type, action_type, payload_schema, requires_confirmation, is_destructive) VALUES
  ('notification.send_email', 'Send Email', 'Send an email notification', 'Notification', NULL, 'notify', '{"type": "object", "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}}}', false, false),
  ('notification.send_slack', 'Send Slack Message', 'Send a Slack notification', 'Notification', NULL, 'notify', '{"type": "object", "properties": {"channel": {"type": "string"}, "message": {"type": "string"}}}', false, false),
  ('notification.send_sms', 'Send SMS', 'Send an SMS notification', 'Notification', NULL, 'notify', '{"type": "object", "properties": {"phone": {"type": "string"}, "message": {"type": "string"}}}', false, false),
  ('deal.update_status', 'Update Deal Status', 'Update the status of a deal', 'CRM', 'deal', 'update', '{"type": "object", "properties": {"deal_id": {"type": "string"}, "status": {"type": "string"}}}', false, false),
  ('deal.assign_owner', 'Assign Deal Owner', 'Assign an owner to a deal', 'CRM', 'deal', 'update', '{"type": "object", "properties": {"deal_id": {"type": "string"}, "owner_id": {"type": "string"}}}', false, false),
  ('project.create', 'Create Project', 'Create a new project', 'Production', 'project', 'create', '{"type": "object", "properties": {"name": {"type": "string"}, "deal_id": {"type": "string"}}}', false, false),
  ('project.assign_manager', 'Assign Project Manager', 'Assign a project manager', 'Production', 'project', 'update', '{"type": "object", "properties": {"project_id": {"type": "string"}, "manager_id": {"type": "string"}}}', false, false),
  ('expense.approve', 'Approve Expense', 'Automatically approve an expense', 'Finance', 'expense', 'update', '{"type": "object", "properties": {"expense_id": {"type": "string"}}}', true, false),
  ('expense.reject', 'Reject Expense', 'Reject an expense', 'Finance', 'expense', 'update', '{"type": "object", "properties": {"expense_id": {"type": "string"}, "reason": {"type": "string"}}}', true, false),
  ('asset.reserve', 'Reserve Asset', 'Reserve an asset for a project', 'Inventory', 'asset', 'update', '{"type": "object", "properties": {"asset_id": {"type": "string"}, "project_id": {"type": "string"}}}', false, false),
  ('asset.schedule_maintenance', 'Schedule Maintenance', 'Schedule asset maintenance', 'Inventory', 'asset', 'update', '{"type": "object", "properties": {"asset_id": {"type": "string"}, "date": {"type": "string"}}}', false, false),
  ('saga.create', 'Create Workflow', 'Create a new workflow instance', 'Workflow', 'saga', 'create', '{"type": "object", "properties": {"template_id": {"type": "string"}, "title": {"type": "string"}}}', false, false),
  ('saga.assign', 'Assign Workflow', 'Assign a workflow to a user', 'Workflow', 'saga', 'update', '{"type": "object", "properties": {"saga_id": {"type": "string"}, "user_id": {"type": "string"}}}', false, false),
  ('webhook.call', 'Call Webhook', 'Make an HTTP request to a webhook', 'Integration', NULL, 'webhook', '{"type": "object", "properties": {"url": {"type": "string"}, "method": {"type": "string"}, "body": {"type": "object"}}}', false, false),
  ('record.create', 'Create Record', 'Create a generic record', 'Data', NULL, 'create', '{"type": "object", "properties": {"table": {"type": "string"}, "data": {"type": "object"}}}', false, false),
  ('record.update', 'Update Record', 'Update a generic record', 'Data', NULL, 'update', '{"type": "object", "properties": {"table": {"type": "string"}, "id": {"type": "string"}, "data": {"type": "object"}}}', false, false)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  payload_schema = EXCLUDED.payload_schema;

-- ============================================================================
-- DEFAULT SECURITY POLICIES
-- ============================================================================

INSERT INTO security_policy_config (organization_id, policy_type, policy_name, description, config, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'expense', 'auto_approve', 'Auto-approve expenses below threshold', '{"auto_approve_threshold": 50.00}', true),
  ('00000000-0000-0000-0000-000000000001', 'workflow', 'deal_to_project', 'Auto-create project on deal won', '{"auto_create_project_on_deal_won": false}', true),
  ('00000000-0000-0000-0000-000000000001', 'session', 'timeout', 'Session timeout settings', '{"idle_timeout_minutes": 30, "absolute_timeout_hours": 12}', true),
  ('00000000-0000-0000-0000-000000000001', 'password', 'requirements', 'Password requirements', '{"min_length": 8, "require_uppercase": true, "require_number": true, "require_special": true}', true)
ON CONFLICT (organization_id, policy_type, policy_name) DO UPDATE SET
  config = EXCLUDED.config;

-- ============================================================================
-- DEFAULT ALERT THRESHOLDS
-- ============================================================================

INSERT INTO alert_thresholds (organization_id, name, description, metric_type, threshold_value, comparison_operator, severity, notification_channels, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'High Expense Alert', 'Alert when single expense exceeds threshold', 'expense_amount', 5000.00, 'gt', 'warning', ARRAY['email'], true),
  ('00000000-0000-0000-0000-000000000001', 'Budget Overrun Alert', 'Alert when project budget is exceeded', 'budget_variance', 0, 'lt', 'critical', ARRAY['email', 'slack'], true),
  ('00000000-0000-0000-0000-000000000001', 'Low Asset Availability', 'Alert when available assets drop below threshold', 'available_asset_count', 5, 'lt', 'warning', ARRAY['email'], true),
  ('00000000-0000-0000-0000-000000000001', 'Certification Expiry', 'Alert when certifications are expiring', 'certification_days_to_expiry', 30, 'lt', 'warning', ARRAY['email'], true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEFAULT KPI TARGETS
-- ============================================================================

INSERT INTO kpi_targets (organization_id, kpi_code, target_value, warning_threshold, critical_threshold, comparison_operator, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'deal_conversion_rate', 25.00, 20.00, 15.00, 'gte', 'Target deal conversion rate percentage'),
  ('00000000-0000-0000-0000-000000000001', 'project_margin', 30.00, 25.00, 20.00, 'gte', 'Target project profit margin percentage'),
  ('00000000-0000-0000-0000-000000000001', 'asset_utilization', 70.00, 60.00, 50.00, 'gte', 'Target asset utilization percentage'),
  ('00000000-0000-0000-0000-000000000001', 'workforce_utilization', 80.00, 70.00, 60.00, 'gte', 'Target workforce utilization percentage'),
  ('00000000-0000-0000-0000-000000000001', 'nps_score', 50.00, 30.00, 10.00, 'gte', 'Target Net Promoter Score'),
  ('00000000-0000-0000-0000-000000000001', 'expense_approval_time', 48.00, 72.00, 96.00, 'lte', 'Target expense approval time in hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCHEMA VERSION UPDATE
-- ============================================================================

INSERT INTO schema_version (version, description) VALUES
  ('3.1.0', 'Gap remediation - operational tables, triggers, RPCs, and seed data')
ON CONFLICT DO NOTHING;
