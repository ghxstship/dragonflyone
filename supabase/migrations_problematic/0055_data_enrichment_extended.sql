-- 0044_data_enrichment_extended.sql
-- Extended sample data for comprehensive testing

DO $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_project_id uuid;
  v_project_id_2 uuid;
  v_staff_id uuid;
  v_vendor_id uuid;
  v_contact_id uuid;
  v_task_id uuid;
BEGIN
  -- Get existing organization or create one
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'sample-org' LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, settings)
    VALUES ('Sample Organization', 'sample-org', '{"industry": "live_entertainment", "timezone": "America/New_York"}'::jsonb)
    RETURNING id INTO v_org_id;
  END IF;

  -- Get or create user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Create additional projects
  INSERT INTO projects (organization_id, name, code, status, budget, start_date, end_date, description)
  VALUES 
    (v_org_id, 'Fall Concert Series 2025', 'FCS2025', 'planning', 300000.00, '2025-09-01', '2025-11-30', 'Multi-venue concert series'),
    (v_org_id, 'Winter Holiday Spectacular', 'WHS2025', 'in_progress', 450000.00, '2025-11-15', '2025-12-31', 'Holiday entertainment event')
  RETURNING id INTO v_project_id_2;
  
  SELECT id INTO v_project_id FROM projects WHERE organization_id = v_org_id AND code = 'SMF2025' LIMIT 1;

  -- Create sample staff
  INSERT INTO staff (organization_id, first_name, last_name, email, role, department, phone)
  VALUES
    (v_org_id, 'Sarah', 'Johnson', 'sarah.johnson@sample.com', 'Production Manager', 'Production', '+1-555-0101'),
    (v_org_id, 'Michael', 'Chen', 'michael.chen@sample.com', 'Technical Director', 'Technical', '+1-555-0102'),
    (v_org_id, 'Emily', 'Rodriguez', 'emily.rodriguez@sample.com', 'Stage Manager', 'Operations', '+1-555-0103'),
    (v_org_id, 'David', 'Thompson', 'david.thompson@sample.com', 'Audio Engineer', 'Technical', '+1-555-0104'),
    (v_org_id, 'Lisa', 'Martinez', 'lisa.martinez@sample.com', 'Lighting Designer', 'Creative', '+1-555-0105')
  RETURNING id INTO v_staff_id;

  -- Create sample vendors
  INSERT INTO vendors (organization_id, name, vendor_type, contact_name, email, phone, address, rating)
  VALUES
    (v_org_id, 'Premier Audio Systems', 'audio_equipment', 'John Smith', 'john@premieraudio.com', '+1-555-1001', '123 Sound Ave', 4.8),
    (v_org_id, 'Bright Lights Rigging', 'lighting_equipment', 'Jane Doe', 'jane@brightlights.com', '+1-555-1002', '456 Stage Rd', 4.6),
    (v_org_id, 'EventStaff Pro', 'staffing', 'Bob Wilson', 'bob@eventstaffpro.com', '+1-555-1003', '789 Crew St', 4.5),
    (v_org_id, 'Stagecraft Productions', 'staging', 'Alice Brown', 'alice@stagecraft.com', '+1-555-1004', '321 Platform Ln', 4.9),
    (v_org_id, 'Catering Excellence', 'catering', 'Tom Green', 'tom@cateringexcel.com', '+1-555-1005', '654 Food Blvd', 4.7)
  RETURNING id INTO v_vendor_id;

  -- Create sample contacts
  INSERT INTO contacts (organization_id, first_name, last_name, email, phone, company, role, contact_type)
  VALUES
    (v_org_id, 'Jennifer', 'Adams', 'jennifer.adams@artist.com', '+1-555-2001', 'Artist Management Group', 'Artist Manager', 'artist'),
    (v_org_id, 'Robert', 'Lee', 'robert.lee@venue.com', '+1-555-2002', 'Metro Arena', 'Venue Director', 'venue'),
    (v_org_id, 'Maria', 'Garcia', 'maria.garcia@sponsor.com', '+1-555-2003', 'Brand Solutions Inc', 'Sponsorship Manager', 'sponsor'),
    (v_org_id, 'James', 'Wilson', 'james.wilson@media.com', '+1-555-2004', 'City Media Network', 'PR Director', 'media')
  RETURNING id INTO v_contact_id;

  -- Create sample tasks
  INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours)
  SELECT
    v_project_id,
    task_data.title,
    task_data.description,
    task_data.status,
    task_data.priority,
    v_staff_id,
    now() + (task_data.days_offset || ' days')::interval,
    task_data.hours
  FROM (VALUES
    ('Audio System Setup', 'Install and test main PA system', 'in_progress', 'high', 5, 16),
    ('Stage Construction', 'Build main and side stages', 'completed', 'critical', -2, 40),
    ('Lighting Design', 'Create lighting plot and program', 'in_progress', 'high', 10, 24),
    ('Security Briefing', 'Coordinate with security team', 'pending', 'medium', 15, 4),
    ('Artist Liaison', 'Communicate rider requirements', 'in_progress', 'high', 3, 8),
    ('Ticketing System Test', 'Test all ticketing touchpoints', 'completed', 'medium', -5, 6),
    ('Marketing Materials', 'Design and distribute promotional content', 'in_progress', 'medium', 20, 12),
    ('Vendor Coordination', 'Finalize vendor contracts', 'pending', 'high', 7, 10),
    ('Load-In Schedule', 'Create detailed load-in timeline', 'pending', 'medium', 12, 5),
    ('Emergency Procedures', 'Document and train on safety protocols', 'pending', 'critical', 8, 8)
  ) AS task_data(title, description, status, priority, days_offset, hours)
  RETURNING id INTO v_task_id;

  -- Create sample budget line items
  INSERT INTO budget_line_items (project_id, category, item_name, amount, actual_cost, status)
  VALUES
    (v_project_id, 'audio', 'Main PA System Rental', 25000.00, 24500.00, 'approved'),
    (v_project_id, 'lighting', 'Lighting Equipment & Control', 18000.00, 17800.00, 'approved'),
    (v_project_id, 'staging', 'Stage Construction & Setup', 35000.00, 36200.00, 'approved'),
    (v_project_id, 'staffing', 'Production Crew', 45000.00, 42000.00, 'approved'),
    (v_project_id, 'marketing', 'Marketing & Promotion', 30000.00, 28500.00, 'approved'),
    (v_project_id, 'catering', 'Artist & Crew Catering', 15000.00, 14800.00, 'approved'),
    (v_project_id, 'transportation', 'Equipment Transport', 12000.00, 11500.00, 'approved'),
    (v_project_id, 'security', 'Security Services', 20000.00, 19800.00, 'approved'),
    (v_project_id, 'insurance', 'Event Insurance', 8000.00, 8000.00, 'approved'),
    (v_project_id, 'contingency', 'Contingency Fund', 25000.00, 5200.00, 'approved');

  -- Create sample assets
  INSERT INTO assets (organization_id, name, asset_type, serial_number, purchase_date, purchase_cost, current_value, status, location)
  VALUES
    (v_org_id, 'Yamaha CL5 Digital Console', 'audio_equipment', 'CL5-2024-001', '2024-01-15', 15000.00, 13000.00, 'available', 'Equipment Warehouse A'),
    (v_org_id, 'Martin MAC Aura Lights (x12)', 'lighting_equipment', 'MAC-AURA-SET-01', '2024-03-20', 24000.00, 22000.00, 'in_use', 'On Site - Main Stage'),
    (v_org_id, 'Shure Wireless Mic System', 'audio_equipment', 'SHURE-ULXD-2024', '2024-02-10', 3500.00, 3200.00, 'available', 'Equipment Warehouse A'),
    (v_org_id, 'Stage Decks (24x 8x4)', 'staging', 'STAGE-DECK-SET-A', '2023-06-01', 12000.00, 10000.00, 'in_use', 'On Site - Main Stage'),
    (v_org_id, 'LED Video Wall Panels', 'video_equipment', 'LED-WALL-2024-P3', '2024-04-05', 45000.00, 43000.00, 'available', 'Equipment Warehouse B');

  -- Create time entries
  INSERT INTO time_entries (staff_id, project_id, date, hours, task_id, notes)
  SELECT
    v_staff_id,
    v_project_id,
    (now() - (generate_series || ' days')::interval)::date,
    (CASE WHEN generate_series % 7 IN (0,6) THEN 0 ELSE (random() * 4 + 4)::numeric(5,2) END),
    v_task_id,
    'Project work for day ' || generate_series
  FROM generate_series(1, 30);

  -- Add more KPI data points for trends
  INSERT INTO kpi_data_points (organization_id, kpi_code, kpi_name, value, unit, project_id, calculated_at)
  SELECT
    v_org_id,
    'FIN_REV_001',
    'Total Event Revenue',
    100000 + (generate_series * 5000) + (random() * 10000)::numeric(10,2),
    'CURRENCY',
    v_project_id,
    (now() - ((30 - generate_series) || ' days')::interval)
  FROM generate_series(1, 30);

  INSERT INTO kpi_data_points (organization_id, kpi_code, kpi_name, value, unit, project_id, calculated_at)
  SELECT
    v_org_id,
    'TKT_SALES_001',
    'Ticket Sales Conversion Rate',
    (7 + random() * 4)::numeric(5,2),
    'PERCENTAGE',
    v_project_id,
    (now() - ((30 - generate_series) || ' days')::interval)
  FROM generate_series(1, 30);

  INSERT INTO kpi_data_points (organization_id, kpi_code, kpi_name, value, unit, project_id, calculated_at)
  SELECT
    v_org_id,
    'OPS_PM_001',
    'Schedule Adherence Rate',
    (90 + random() * 8)::numeric(5,2),
    'PERCENTAGE',
    v_project_id,
    (now() - ((30 - generate_series) || ' days')::interval)
  FROM generate_series(1, 30);

  RAISE NOTICE 'Extended enrichment complete!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 2 additional projects';
  RAISE NOTICE '  - 5 staff members';
  RAISE NOTICE '  - 5 vendors';
  RAISE NOTICE '  - 4 contacts';
  RAISE NOTICE '  - 10 tasks';
  RAISE NOTICE '  - 10 budget line items';
  RAISE NOTICE '  - 5 assets';
  RAISE NOTICE '  - 30 days of time entries';
  RAISE NOTICE '  - 90 additional KPI data points';
END $$;
