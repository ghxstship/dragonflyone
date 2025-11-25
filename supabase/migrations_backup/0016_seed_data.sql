-- 0016_seed_data.sql
-- Baseline seed data for demos and testing

-- Insert demo organization
insert into organizations (id, slug, name, timezone)
values 
  ('00000000-0000-0000-0000-000000000001', 'ghxstship', 'GHXSTSHIP Industries', 'America/New_York')
on conflict (slug) do nothing;

-- Insert departments
insert into departments (organization_id, code, name) values
  ('00000000-0000-0000-0000-000000000001', 'DESIGN', 'Design'),
  ('00000000-0000-0000-0000-000000000001', 'DEVELOPMENT', 'Development'),
  ('00000000-0000-0000-0000-000000000001', 'DIRECTION', 'Direction'),
  ('00000000-0000-0000-0000-000000000001', 'DISRUPTION', 'Disruption')
on conflict (organization_id, code) do nothing;

-- Insert status registry
insert into status_registry (organization_id, category, code, label, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'deal', 'lead', 'Lead', 1),
  ('00000000-0000-0000-0000-000000000001', 'deal', 'qualified', 'Qualified', 2),
  ('00000000-0000-0000-0000-000000000001', 'deal', 'proposal', 'Proposal', 3),
  ('00000000-0000-0000-0000-000000000001', 'deal', 'won', 'Won', 4),
  ('00000000-0000-0000-0000-000000000001', 'deal', 'lost', 'Lost', 5),
  ('00000000-0000-0000-0000-000000000001', 'project', 'intake', 'Intake', 1),
  ('00000000-0000-0000-0000-000000000001', 'project', 'preproduction', 'Pre-Production', 2),
  ('00000000-0000-0000-0000-000000000001', 'project', 'in_production', 'In Production', 3),
  ('00000000-0000-0000-0000-000000000001', 'project', 'post', 'Post-Production', 4)
on conflict (organization_id, category, code) do nothing;

-- Insert risk levels
insert into risk_levels (organization_id, code, label, score, description) values
  ('00000000-0000-0000-0000-000000000001', 'low', 'Low', 1, 'Minimal impact, routine handling'),
  ('00000000-0000-0000-0000-000000000001', 'medium', 'Medium', 5, 'Moderate impact, requires attention'),
  ('00000000-0000-0000-0000-000000000001', 'high', 'High', 8, 'Significant impact, urgent action needed'),
  ('00000000-0000-0000-0000-000000000001', 'critical', 'Critical', 10, 'Severe impact, immediate escalation required')
on conflict (organization_id, code) do nothing;

-- Insert workforce roles
insert into workforce_roles (organization_id, code, name, category) values
  ('00000000-0000-0000-0000-000000000001', 'EXEC', 'Executive', 'Leadership'),
  ('00000000-0000-0000-0000-000000000001', 'PM', 'Project Manager', 'Management'),
  ('00000000-0000-0000-0000-000000000001', 'TD', 'Technical Director', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'LD', 'Lighting Designer', 'Creative'),
  ('00000000-0000-0000-0000-000000000001', 'SOUND', 'Sound Engineer', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'VIDEO', 'Video Director', 'Creative'),
  ('00000000-0000-0000-0000-000000000001', 'STAGE_MGR', 'Stage Manager', 'Operations'),
  ('00000000-0000-0000-0000-000000000001', 'RIGGER', 'Rigger', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'TECH', 'Technician', 'Technical')
on conflict (organization_id, code) do nothing;

-- Insert expense categories
insert into finance_expense_categories (organization_id, code, name) values
  ('00000000-0000-0000-0000-000000000001', 'TRAVEL', 'Travel & Transportation'),
  ('00000000-0000-0000-0000-000000000001', 'MEALS', 'Meals & Entertainment'),
  ('00000000-0000-0000-0000-000000000001', 'EQUIPMENT', 'Equipment Rental'),
  ('00000000-0000-0000-0000-000000000001', 'MATERIALS', 'Materials & Supplies'),
  ('00000000-0000-0000-0000-000000000001', 'SOFTWARE', 'Software & Licenses'),
  ('00000000-0000-0000-0000-000000000001', 'VENUE', 'Venue & Space Rental'),
  ('00000000-0000-0000-0000-000000000001', 'PERMITS', 'Permits & Insurance'),
  ('00000000-0000-0000-0000-000000000001', 'OTHER', 'Other Expenses')
on conflict (organization_id, code) do nothing;

-- Insert ledger accounts
insert into ledger_accounts (organization_id, code, name, account_type) values
  ('00000000-0000-0000-0000-000000000001', '1000', 'Cash', 'Asset'),
  ('00000000-0000-0000-0000-000000000001', '1200', 'Accounts Receivable', 'Asset'),
  ('00000000-0000-0000-0000-000000000001', '1500', 'Equipment', 'Asset'),
  ('00000000-0000-0000-0000-000000000001', '2000', 'Accounts Payable', 'Liability'),
  ('00000000-0000-0000-0000-000000000001', '3000', 'Equity', 'Equity'),
  ('00000000-0000-0000-0000-000000000001', '4000', 'Revenue', 'Revenue'),
  ('00000000-0000-0000-0000-000000000001', '5000', 'Cost of Goods Sold', 'Expense'),
  ('00000000-0000-0000-0000-000000000001', '6000', 'Operating Expenses', 'Expense'),
  ('00000000-0000-0000-0000-000000000001', '7000', 'Labor Costs', 'Expense')
on conflict (organization_id, code) do nothing;

-- Insert automation trigger catalog
insert into automation_trigger_catalog (key, label, description, platform_scope, payload_schema) values
  ('deal.created', 'Deal Created', 'Triggered when a new deal is created', array['ATLVS'], '{"type":"object","properties":{"deal_id":{"type":"string"},"title":{"type":"string"},"contact_id":{"type":"string"}}}'),
  ('deal.won', 'Deal Won', 'Triggered when a deal status changes to won', array['ATLVS'], '{"type":"object","properties":{"deal_id":{"type":"string"},"title":{"type":"string"},"value":{"type":"number"}}}'),
  ('project.created', 'Project Created', 'Triggered when a new project is created', array['ATLVS'], '{"type":"object","properties":{"project_id":{"type":"string"},"name":{"type":"string"},"budget":{"type":"number"}}}'),
  ('asset.reserved', 'Asset Reserved', 'Triggered when an asset is reserved for a project', array['ATLVS'], '{"type":"object","properties":{"asset_id":{"type":"string"},"project_id":{"type":"string"}}}'),
  ('expense.submitted', 'Expense Submitted', 'Triggered when an expense is submitted for approval', array['ATLVS'], '{"type":"object","properties":{"expense_id":{"type":"string"},"amount":{"type":"number"}}}'),
  ('purchase_order.approved', 'PO Approved', 'Triggered when a purchase order is approved', array['ATLVS'], '{"type":"object","properties":{"po_id":{"type":"string"},"total_amount":{"type":"number"}}}')
on conflict (key) do nothing;

-- Insert automation action catalog
insert into automation_action_catalog (key, label, description, platform_scope, payload_schema) values
  ('create.contact', 'Create Contact', 'Create a new contact record', array['ATLVS'], '{"type":"object","required":["first_name","last_name","email"],"properties":{"company":{"type":"string"},"first_name":{"type":"string"},"last_name":{"type":"string"},"email":{"type":"string"},"output":{"type":"object","properties":{"contact_id":{"type":"string"}}}}}'),
  ('create.deal', 'Create Deal', 'Create a new deal', array['ATLVS'], '{"type":"object","required":["title"],"properties":{"title":{"type":"string"},"contact_id":{"type":"string"},"value":{"type":"number"},"output":{"type":"object","properties":{"deal_id":{"type":"string"}}}}}'),
  ('create.project', 'Create Project', 'Create a new project', array['ATLVS'], '{"type":"object","required":["code","name"],"properties":{"code":{"type":"string"},"name":{"type":"string"},"budget":{"type":"number"},"output":{"type":"object","properties":{"project_id":{"type":"string"}}}}}'),
  ('update.deal_status', 'Update Deal Status', 'Update deal status', array['ATLVS'], '{"type":"object","required":["deal_id","status"],"properties":{"deal_id":{"type":"string"},"status":{"type":"string","enum":["lead","qualified","proposal","won","lost"]},"output":{"type":"object","properties":{"success":{"type":"boolean"}}}}}'),
  ('assign.asset', 'Assign Asset', 'Assign asset to project', array['ATLVS'], '{"type":"object","required":["asset_id","project_id"],"properties":{"asset_id":{"type":"string"},"project_id":{"type":"string"},"output":{"type":"object","properties":{"success":{"type":"boolean"}}}}}'),
  ('create.expense', 'Create Expense', 'Submit new expense', array['ATLVS'], '{"type":"object","required":["amount","incurred_on"],"properties":{"amount":{"type":"number"},"currency":{"type":"string"},"incurred_on":{"type":"string"},"description":{"type":"string"},"output":{"type":"object","properties":{"expense_id":{"type":"string"}}}}}'),
  ('send.notification', 'Send Notification', 'Send notification to user', array['ATLVS'], '{"type":"object","required":["recipient","subject","message"],"properties":{"recipient":{"type":"string"},"subject":{"type":"string"},"message":{"type":"string"},"output":{"type":"object","properties":{"queued":{"type":"boolean"}}}}}')
on conflict (key) do nothing;
