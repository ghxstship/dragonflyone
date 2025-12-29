-- ============================================================================
-- 0024_seed_kpi_reports_catalog.sql
-- Global KPI Report Library & Production Advancing Catalog Seed Data
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- SECTION 1: GLOBAL KPI REPORT LIBRARY (200 Reports)
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    v_org_id := '00000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  DELETE FROM kpi_reports WHERE is_global = true;

  -- FINANCIAL PERFORMANCE KPIs (1-45)
  INSERT INTO kpi_reports (organization_id, name, description, kpi_codes, category, is_global, report_type) VALUES
  (v_org_id, 'Total Event Revenue', 'Sum of all revenue streams for an event', '{FIN_REV_001}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Per Capita Spending', 'Average revenue generated per attendee', '{FIN_REV_002}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'VIP/Premium Revenue', 'Revenue from VIP packages and premium experiences', '{FIN_REV_003}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Merchandise Revenue', 'Total merchandise sales revenue', '{FIN_REV_004}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'F&B Revenue', 'Food and beverage sales revenue', '{FIN_REV_005}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Parking Revenue', 'Revenue from parking fees', '{FIN_REV_006}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Sponsorship Revenue', 'Total sponsorship and partnership revenue', '{FIN_REV_007}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Secondary Ticket Revenue', 'Revenue from resale marketplace', '{FIN_REV_008}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Early Bird Revenue', 'Revenue from early bird ticket sales', '{FIN_REV_009}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Group Sales Revenue', 'Revenue from group ticket packages', '{FIN_REV_010}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Cost Per Attendee', 'Total event costs divided by attendance', '{FIN_COST_001}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Labor Cost Percentage', 'Labor costs as percentage of total budget', '{FIN_COST_002}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Vendor Cost Ratio', 'Third-party vendor costs vs total costs', '{FIN_COST_003}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Marketing Cost Per Ticket', 'Marketing spend divided by tickets sold', '{FIN_COST_004}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Venue Rental Cost', 'Total venue rental and facility costs', '{FIN_COST_005}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Equipment Rental Cost', 'Audio, visual, and staging equipment costs', '{FIN_COST_006}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Insurance Cost', 'Event insurance and liability costs', '{FIN_COST_007}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Security Cost', 'Security personnel and services costs', '{FIN_COST_008}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Technology Cost', 'Ticketing, streaming, and tech infrastructure costs', '{FIN_COST_009}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Logistics Cost', 'Transportation, shipping, and logistics costs', '{FIN_COST_010}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Budget Variance', 'Difference between budgeted and actual costs', '{FIN_COST_011}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Cost Overrun Rate', 'Percentage of budget categories exceeding plan', '{FIN_COST_012}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Contingency Usage', 'Percentage of contingency budget utilized', '{FIN_COST_013}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Burn Rate', 'Rate of budget consumption over time', '{FIN_COST_014}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Cost Savings Achieved', 'Savings from negotiations and efficiencies', '{FIN_COST_015}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Profit Margin', 'Net profit as percentage of revenue', '{FIN_PROF_001}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Gross Profit', 'Revenue minus direct costs', '{FIN_PROF_002}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Net Profit', 'Total profit after all expenses', '{FIN_PROF_003}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'EBITDA', 'Earnings before interest, taxes, depreciation, amortization', '{FIN_PROF_004}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Operating Profit Margin', 'Operating income as percentage of revenue', '{FIN_PROF_005}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Return on Investment', 'Net profit divided by total investment', '{FIN_PROF_006}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Return on Assets', 'Net income relative to total assets used', '{FIN_PROF_007}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Break-Even Point', 'Attendance/revenue needed to cover costs', '{FIN_PROF_008}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Contribution Margin', 'Revenue minus variable costs per unit', '{FIN_PROF_009}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Economic Value Added', 'Net operating profit minus capital costs', '{FIN_PROF_010}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Cash Flow from Operations', 'Net cash generated from event operations', '{FIN_PROF_011}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Working Capital Ratio', 'Current assets vs current liabilities', '{FIN_PROF_012}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Days Sales Outstanding', 'Average days to collect receivables', '{FIN_PROF_013}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Accounts Payable Turnover', 'Rate of paying vendor invoices', '{FIN_PROF_014}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Revenue Per Available Seat', 'Total revenue divided by venue capacity', '{FIN_PROF_015}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Revenue Per Square Foot', 'Revenue relative to venue space utilized', '{FIN_PROF_016}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Revenue Growth Rate', 'Year-over-year revenue increase percentage', '{FIN_PROF_017}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Profit Per Event', 'Average net profit per event produced', '{FIN_PROF_018}', 'FINANCIAL_PERFORMANCE', true, 'executive'),
  (v_org_id, 'Revenue Multiple', 'Total revenue relative to production costs', '{FIN_PROF_019}', 'FINANCIAL_PERFORMANCE', true, 'standard'),
  (v_org_id, 'Asset Turnover Ratio', 'Revenue generated per dollar of assets', '{FIN_PROF_020}', 'FINANCIAL_PERFORMANCE', true, 'standard');

  RAISE NOTICE 'Financial KPIs (45) created';

  -- TICKET & ATTENDANCE KPIs (46-90)
  INSERT INTO kpi_reports (organization_id, name, description, kpi_codes, category, is_global, report_type) VALUES
  (v_org_id, 'Total Tickets Sold', 'Count of all tickets sold for event', '{TKT_SALES_001}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Sell-Through Rate', 'Percentage of available tickets sold', '{TKT_SALES_002}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Average Ticket Price', 'Mean price across all ticket types', '{TKT_SALES_003}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Ticket Revenue', 'Total revenue from ticket sales', '{TKT_SALES_004}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Sales Velocity', 'Tickets sold per day/hour', '{TKT_SALES_005}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Channel Mix', 'Distribution of sales across channels', '{TKT_SALES_006}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Mobile Sales Percentage', 'Tickets purchased via mobile devices', '{TKT_SALES_007}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Conversion Rate', 'Visitors who complete ticket purchase', '{TKT_SALES_008}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Cart Abandonment Rate', 'Started but incomplete purchases', '{TKT_SALES_009}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Promo Code Usage', 'Percentage of sales using promotions', '{TKT_SALES_010}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Refund Rate', 'Percentage of tickets refunded', '{TKT_SALES_011}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Chargeback Rate', 'Disputed transactions percentage', '{TKT_SALES_012}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Season Pass Sales', 'Multi-event package sales', '{TKT_SALES_013}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Upgrade Rate', 'Attendees upgrading ticket tier', '{TKT_SALES_014}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Add-On Attachment Rate', 'Tickets with additional purchases', '{TKT_SALES_015}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'First-Time Buyer Rate', 'New customers as percentage of sales', '{TKT_SALES_016}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Repeat Purchase Rate', 'Returning customers percentage', '{TKT_SALES_017}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Days to Sellout', 'Time from on-sale to capacity', '{TKT_SALES_018}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Waitlist Conversion', 'Waitlist members who purchased', '{TKT_SALES_019}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Presale Performance', 'Presale vs general sale ratio', '{TKT_SALES_020}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Last-Minute Sales', 'Tickets sold in final 48 hours', '{TKT_SALES_021}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Geographic Distribution', 'Sales by region/market', '{TKT_SALES_022}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Payment Method Mix', 'Distribution of payment types', '{TKT_SALES_023}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Average Order Value', 'Mean transaction amount', '{TKT_SALES_024}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Tickets Per Transaction', 'Average tickets per order', '{TKT_SALES_025}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Venue Capacity Utilization', 'Actual attendance vs capacity', '{TKT_CAP_001}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Section Fill Rate', 'Occupancy by venue section', '{TKT_CAP_002}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'No-Show Rate', 'Ticket holders who did not attend', '{TKT_CAP_003}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Check-In Rate', 'Percentage of tickets scanned', '{TKT_CAP_004}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Peak Attendance Time', 'Highest concurrent attendance', '{TKT_CAP_005}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Entry Flow Rate', 'Attendees processed per hour', '{TKT_CAP_006}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Exit Flow Rate', 'Departure rate post-event', '{TKT_CAP_007}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Dwell Time', 'Average time spent at venue', '{TKT_CAP_008}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Zone Density', 'Crowd density by area', '{TKT_CAP_009}', 'TICKET_ATTENDANCE', true, 'operational'),
  (v_org_id, 'Accessibility Utilization', 'ADA seating/services usage', '{TKT_CAP_010}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'VIP Area Utilization', 'Premium section occupancy', '{TKT_CAP_011}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Standing vs Seated Ratio', 'GA vs reserved attendance', '{TKT_CAP_012}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Multi-Day Attendance', 'Unique vs repeat daily attendance', '{TKT_CAP_013}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Weather Impact Factor', 'Attendance variance due to weather', '{TKT_CAP_014}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Competitor Event Impact', 'Effect of competing events', '{TKT_CAP_015}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Dynamic Pricing Lift', 'Revenue increase from dynamic pricing', '{TKT_PRICE_001}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Price Elasticity', 'Demand sensitivity to price changes', '{TKT_PRICE_002}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Tier Distribution', 'Sales across price tiers', '{TKT_PRICE_003}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Discount Depth', 'Average discount percentage applied', '{TKT_PRICE_004}', 'TICKET_ATTENDANCE', true, 'standard'),
  (v_org_id, 'Revenue Per Available Ticket', 'Total revenue divided by capacity', '{TKT_PRICE_005}', 'TICKET_ATTENDANCE', true, 'standard');

  RAISE NOTICE 'Ticket & Attendance KPIs (45) created';

  -- OPERATIONAL EFFICIENCY KPIs (91-145)
  INSERT INTO kpi_reports (organization_id, name, description, kpi_codes, category, is_global, report_type) VALUES
  (v_org_id, 'Schedule Adherence Rate', 'Milestones completed on time', '{OPS_PM_001}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Project Timeline Adherence', 'Project staying on schedule', '{OPS_PM_002}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Change Order Frequency', 'Scope changes per project', '{OPS_PM_003}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Risk Mitigation Success', 'Risks successfully prevented', '{OPS_PM_004}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Milestone Velocity', 'Days ahead/behind schedule', '{OPS_PM_005}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Resource Allocation Efficiency', 'Allocated vs utilized hours', '{OPS_PM_006}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Dependency Fulfillment', 'Task dependencies met on time', '{OPS_PM_007}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Critical Path Variance', 'Critical path timeline deviation', '{OPS_PM_008}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Average Task Duration', 'Mean time to complete tasks', '{OPS_PM_009}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Sprint Velocity', 'Story points per sprint', '{OPS_PM_010}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Blocker Resolution Time', 'Time to clear blockers', '{OPS_PM_011}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Task Completion Rate', 'Tasks marked complete', '{OPS_PM_012}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Overdue Task Percentage', 'Tasks past due date', '{OPS_PM_013}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Task Estimation Accuracy', 'Estimated vs actual duration', '{OPS_PM_014}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Planning Accuracy', 'Delivery within original plan', '{OPS_PM_015}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Scope Creep Index', 'Scope increase from baseline', '{OPS_PM_016}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Communication Response Time', 'Project communication response', '{OPS_PM_017}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Meeting Effectiveness', 'Meetings with actionable outcomes', '{OPS_PM_018}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Decision Velocity', 'Time from issue to decision', '{OPS_PM_019}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Project Health Score', 'Composite project health', '{OPS_PM_020}', 'OPERATIONAL_EFFICIENCY', true, 'dashboard'),
  (v_org_id, 'Staff Utilization Rate', 'Billable/productive hours', '{OPS_TEAM_001}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Employee Satisfaction', 'Staff satisfaction rating', '{OPS_TEAM_002}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Training Completion Rate', 'Required training completed', '{OPS_TEAM_003}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Cross-Training Index', 'Roles per staff member', '{OPS_TEAM_004}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Staff Turnover Rate', 'Staff departures percentage', '{OPS_TEAM_005}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Average Crew Experience', 'Years of experience', '{OPS_TEAM_006}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Staff Response Time', 'Message response time', '{OPS_TEAM_007}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Incident Report Frequency', 'Safety incidents per event', '{OPS_TEAM_008}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Staff Punctuality', 'On-time arrivals', '{OPS_TEAM_009}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Certification Compliance', 'Valid certifications', '{OPS_TEAM_010}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Overtime Percentage', 'Overtime hours worked', '{OPS_TEAM_011}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Staff Productivity', 'Tasks per staff per day', '{OPS_TEAM_012}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Team Collaboration Score', 'Collaborative task success', '{OPS_TEAM_013}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Staff Retention Rate', 'Returning staff percentage', '{OPS_TEAM_014}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Skills Gap Index', 'Uncovered required skills', '{OPS_TEAM_015}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Onboarding Time', 'Days to complete onboarding', '{OPS_TEAM_016}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Performance Review Completion', 'Reviews completed on schedule', '{OPS_TEAM_017}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Staff Morale Index', 'Staff satisfaction composite', '{OPS_TEAM_018}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Internal Promotion Rate', 'Internal candidates promoted', '{OPS_TEAM_019}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Conflict Resolution Time', 'Time to resolve conflicts', '{OPS_TEAM_020}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Vendor Reliability Score', 'On-time vendor deliveries', '{OPS_VENDOR_001}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Supplier Lead Time', 'Order to delivery time', '{OPS_VENDOR_002}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Contract Compliance Rate', 'Contracts meeting terms', '{OPS_VENDOR_003}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Vendor Cost Variance', 'Budget vs actual vendor costs', '{OPS_VENDOR_004}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Quality Rejection Rate', 'Rejected deliverables', '{OPS_VENDOR_005}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Backup Vendor Activation', 'Backup vendor usage', '{OPS_VENDOR_006}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Vendor Dispute Resolution', 'Time to resolve disputes', '{OPS_VENDOR_007}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Local Vendor Percentage', 'Locally sourced vendors', '{OPS_VENDOR_008}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Sustainable Supplier Rate', 'Sustainability certified vendors', '{OPS_VENDOR_009}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Vendor NPS', 'Vendor recommendation score', '{OPS_VENDOR_010}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Vendor Response Time', 'Vendor inquiry response', '{OPS_VENDOR_011}', 'OPERATIONAL_EFFICIENCY', true, 'operational'),
  (v_org_id, 'Vendor Performance Score', 'Composite vendor rating', '{OPS_VENDOR_012}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Contract Renewal Rate', 'Renewed contracts', '{OPS_VENDOR_013}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Vendor Diversity Index', 'Vendor portfolio diversity', '{OPS_VENDOR_014}', 'OPERATIONAL_EFFICIENCY', true, 'standard'),
  (v_org_id, 'Supply Chain Risk Score', 'Supply chain vulnerabilities', '{OPS_VENDOR_015}', 'OPERATIONAL_EFFICIENCY', true, 'standard');

  RAISE NOTICE 'Operational Efficiency KPIs (55) created';

  -- MARKETING & ENGAGEMENT KPIs (146-175)
  INSERT INTO kpi_reports (organization_id, name, description, kpi_codes, category, is_global, report_type) VALUES
  (v_org_id, 'Social Media Engagement', 'Interactions per impressions', '{MKT_DIG_001}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Website Conversion Rate', 'Visitors completing actions', '{MKT_DIG_002}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Landing Page Bounce Rate', 'Single-page sessions', '{MKT_DIG_003}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Email Click-Through Rate', 'Email link clicks', '{MKT_DIG_004}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Email Open Rate', 'Emails opened', '{MKT_DIG_005}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Email List Growth', 'Net new subscribers', '{MKT_DIG_006}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Social Follower Growth', 'Net new followers', '{MKT_DIG_007}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Paid Ad ROAS', 'Ad revenue per dollar spent', '{MKT_DIG_008}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Organic Search Traffic', 'Traffic from organic search', '{MKT_DIG_009}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Video Completion Rate', 'Videos watched to end', '{MKT_DIG_010}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Net Promoter Score', 'Recommendation likelihood', '{MKT_AUD_001}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Brand Mention Velocity', 'Brand mentions per day', '{MKT_AUD_002}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Demographics Match', 'Target vs actual demographics', '{MKT_AUD_003}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Geographic Reach', 'Regions represented', '{MKT_AUD_004}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Age Distribution', 'Attendees by age group', '{MKT_AUD_005}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Gender Distribution', 'Attendee gender breakdown', '{MKT_AUD_006}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Income Distribution', 'Economic demographics', '{MKT_AUD_007}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Interest Affinity', 'Event-interest alignment', '{MKT_AUD_008}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Discovery Method', 'How attendees found event', '{MKT_AUD_009}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'First-Time vs Repeat', 'New vs returning ratio', '{MKT_AUD_010}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Brand Awareness Lift', 'Recognition increase', '{MKT_BRAND_001}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Brand Sentiment Score', 'Positive mention ratio', '{MKT_BRAND_002}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'User-Generated Content', 'Fan-created content volume', '{MKT_BRAND_003}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Hashtag Performance', 'Event hashtag usage', '{MKT_BRAND_004}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Media Impressions', 'PR and media reach', '{MKT_BRAND_005}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Press Sentiment', 'Positive press coverage', '{MKT_BRAND_006}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Partnership Brand Lift', 'Sponsor awareness increase', '{MKT_BRAND_007}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Event FOMO Factor', 'Demand exceeding supply', '{MKT_BRAND_008}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Post-Event Engagement', 'Continued engagement duration', '{MKT_BRAND_009}', 'MARKETING_ENGAGEMENT', true, 'standard'),
  (v_org_id, 'Content Virality', 'Shares per original post', '{MKT_BRAND_010}', 'MARKETING_ENGAGEMENT', true, 'standard');

  RAISE NOTICE 'Marketing & Engagement KPIs (30) created';

  -- CUSTOMER EXPERIENCE KPIs (176-200)
  INSERT INTO kpi_reports (organization_id, name, description, kpi_codes, category, is_global, report_type) VALUES
  (v_org_id, 'Overall Satisfaction', 'Event experience rating', '{CX_EXP_001}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Likelihood to Recommend', 'Would recommend event', '{CX_EXP_002}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Expectation Gap', 'Expected vs actual experience', '{CX_EXP_003}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Venue Experience', 'Venue satisfaction rating', '{CX_EXP_004}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Sound Quality', 'Audio experience rating', '{CX_EXP_005}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Visual Production', 'Lighting and visuals rating', '{CX_EXP_006}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'F&B Service Quality', 'Food and beverage rating', '{CX_EXP_007}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Restroom Cleanliness', 'Facilities cleanliness', '{CX_EXP_008}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Parking Experience', 'Parking satisfaction', '{CX_EXP_009}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Accessibility Experience', 'Accessibility accommodations', '{CX_EXP_010}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Merchandise Quality', 'Merchandise satisfaction', '{CX_EXP_011}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Staff Friendliness', 'Staff courtesy rating', '{CX_EXP_012}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Event Flow', 'Pacing and schedule rating', '{CX_EXP_013}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Queue Management', 'Wait times satisfaction', '{CX_EXP_014}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Information Clarity', 'Signage and info clarity', '{CX_EXP_015}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Support Resolution Time', 'Ticket resolution hours', '{CX_SVC_001}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'First Contact Resolution', 'Issues resolved first contact', '{CX_SVC_002}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'Complaint Rate', 'Complaints per attendee', '{CX_SVC_003}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Refund Request Rate', 'Refund requests percentage', '{CX_SVC_004}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Support Satisfaction', 'Service interaction rating', '{CX_SVC_005}', 'CUSTOMER_EXPERIENCE', true, 'standard'),
  (v_org_id, 'Live Chat Response', 'Chat response time', '{CX_SVC_006}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'Self-Service Success', 'Self-resolved issues', '{CX_SVC_007}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'Escalation Rate', 'Escalated tickets', '{CX_SVC_008}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'Follow-Up Completion', 'Required follow-ups done', '{CX_SVC_009}', 'CUSTOMER_EXPERIENCE', true, 'operational'),
  (v_org_id, 'Service Recovery Success', 'Satisfied after resolution', '{CX_SVC_010}', 'CUSTOMER_EXPERIENCE', true, 'standard');

  RAISE NOTICE 'Customer Experience KPIs (25) created';
  RAISE NOTICE 'All 200 Global KPI Reports created successfully';
END $$;

-- ============================================================================
-- SECTION 2: PRODUCTION ADVANCING CATALOG (329+ Items)
-- ============================================================================

-- Clear existing catalog items for clean seed
DELETE FROM production_advancing_catalog WHERE item_id LIKE 'TECH-%' OR item_id LIKE 'PROD-%' OR item_id LIKE 'EQUIP-%' OR item_id LIKE 'SITE-%' OR item_id LIKE 'HOSP-%' OR item_id LIKE 'TRANS-%' OR item_id LIKE 'STAGE-%' OR item_id LIKE 'POWER-%' OR item_id LIKE 'COMM-%' OR item_id LIKE 'SAFE-%' OR item_id LIKE 'DECOR-%' OR item_id LIKE 'SIGN-%' OR item_id LIKE 'FURN-%' OR item_id LIKE 'SPEC-%';

-- TECHNICAL - AUDIO (20 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-1000', 'Technical', 'Audio', 'PA System - Small', ARRAY['Line Array', 'Point Source', 'Portable'], 'Up to 500 capacity', 'Per System/Day', 500, 2000, 3),
('TECH-1001', 'Technical', 'Audio', 'PA System - Medium', ARRAY['Line Array', 'Ground Stack', 'Flown'], '500-2000 capacity', 'Per System/Day', 2000, 8000, 5),
('TECH-1002', 'Technical', 'Audio', 'PA System - Large', ARRAY['Line Array', 'Festival System', 'Arena'], '2000+ capacity', 'Per System/Day', 8000, 50000, 7),
('TECH-1003', 'Technical', 'Audio', 'Monitor System - Wedge', ARRAY['12" Wedge', '15" Wedge', 'Bi-Amp'], 'Stage monitoring', 'Per Unit/Day', 50, 200, 2),
('TECH-1004', 'Technical', 'Audio', 'Monitor System - IEM', ARRAY['Wireless IEM', 'Wired IEM', 'Personal Mix'], 'In-ear monitoring', 'Per Channel/Day', 100, 400, 3),
('TECH-1005', 'Technical', 'Audio', 'Wireless Microphone - Handheld', ARRAY['Shure', 'Sennheiser', 'Audio-Technica'], 'UHF wireless handheld', 'Per Unit/Day', 50, 150, 2),
('TECH-1006', 'Technical', 'Audio', 'Wireless Microphone - Lavalier', ARRAY['Shure', 'Sennheiser', 'Countryman'], 'Lapel wireless', 'Per Unit/Day', 75, 200, 2),
('TECH-1007', 'Technical', 'Audio', 'Wireless Microphone - Headset', ARRAY['DPA', 'Shure', 'Sennheiser'], 'Headworn wireless', 'Per Unit/Day', 100, 250, 2),
('TECH-1008', 'Technical', 'Audio', 'Wired Microphone - Vocal', ARRAY['SM58', 'Beta 58', 'KSM9'], 'Dynamic vocal mic', 'Per Unit/Day', 15, 50, 1),
('TECH-1009', 'Technical', 'Audio', 'Wired Microphone - Instrument', ARRAY['SM57', 'MD421', 'E609'], 'Dynamic instrument mic', 'Per Unit/Day', 15, 75, 1),
('TECH-1010', 'Technical', 'Audio', 'Condenser Microphone', ARRAY['Large Diaphragm', 'Small Diaphragm', 'Pencil'], 'Studio/live condenser', 'Per Unit/Day', 50, 200, 2),
('TECH-1011', 'Technical', 'Audio', 'DI Box - Passive', ARRAY['Single', 'Dual', 'Stereo'], 'Passive direct injection', 'Per Unit/Day', 10, 30, 1),
('TECH-1012', 'Technical', 'Audio', 'DI Box - Active', ARRAY['Single', 'Dual', 'Multi-Channel'], 'Active direct injection', 'Per Unit/Day', 20, 50, 1),
('TECH-1013', 'Technical', 'Audio', 'Audio Console - Digital', ARRAY['Yamaha', 'Allen & Heath', 'DiGiCo'], 'Digital mixing console', 'Per Unit/Day', 200, 2000, 3),
('TECH-1014', 'Technical', 'Audio', 'Audio Console - Analog', ARRAY['Midas', 'Soundcraft', 'Yamaha'], 'Analog mixing console', 'Per Unit/Day', 150, 800, 3),
('TECH-1015', 'Technical', 'Audio', 'Stage Box/Snake', ARRAY['16 Channel', '32 Channel', '48 Channel'], 'Audio stage box', 'Per Unit/Day', 50, 300, 2),
('TECH-1016', 'Technical', 'Audio', 'Audio Processing - Compressor', ARRAY['Stereo', 'Multi-Channel', 'Dynamics'], 'Dynamic processing', 'Per Unit/Day', 30, 150, 2),
('TECH-1017', 'Technical', 'Audio', 'Audio Processing - EQ', ARRAY['Graphic', 'Parametric', 'Digital'], 'Equalization', 'Per Unit/Day', 30, 150, 2),
('TECH-1018', 'Technical', 'Audio', 'Audio Processing - Effects', ARRAY['Reverb', 'Delay', 'Multi-FX'], 'Effects processing', 'Per Unit/Day', 40, 200, 2),
('TECH-1019', 'Technical', 'Audio', 'Audio Playback', ARRAY['CD Player', 'Media Player', 'Computer'], 'Audio playback system', 'Per Unit/Day', 50, 200, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - LIGHTING (25 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-2000', 'Technical', 'Lighting', 'Moving Head - Spot', ARRAY['Beam', 'Profile', 'Hybrid'], 'Intelligent spot', 'Per Unit/Day', 75, 300, 3),
('TECH-2001', 'Technical', 'Lighting', 'Moving Head - Wash', ARRAY['LED Wash', 'Fresnel', 'Zoom'], 'Intelligent wash', 'Per Unit/Day', 60, 250, 3),
('TECH-2002', 'Technical', 'Lighting', 'LED Par', ARRAY['RGBW', 'RGBA', 'UV'], 'LED par can', 'Per Unit/Day', 20, 75, 2),
('TECH-2003', 'Technical', 'Lighting', 'LED Wash/Flood', ARRAY['Cyc Light', 'Wall Wash', 'Flood'], 'LED wash fixture', 'Per Unit/Day', 30, 100, 2),
('TECH-2004', 'Technical', 'Lighting', 'Followspot', ARRAY['Short Throw', 'Long Throw', 'LED'], 'Followspot with operator', 'Per Unit/Day', 200, 600, 3),
('TECH-2005', 'Technical', 'Lighting', 'Ellipsoidal/Leko', ARRAY['19deg', '26deg', '36deg', '50deg'], 'ERS spotlight', 'Per Unit/Day', 25, 75, 2),
('TECH-2006', 'Technical', 'Lighting', 'Fresnel', ARRAY['6in', '8in', 'LED'], 'Fresnel spotlight', 'Per Unit/Day', 20, 60, 2),
('TECH-2007', 'Technical', 'Lighting', 'Strobe', ARRAY['LED Strobe', 'Xenon', 'Blinder'], 'Strobe effect', 'Per Unit/Day', 30, 150, 2),
('TECH-2008', 'Technical', 'Lighting', 'Blinder', ARRAY['2-Lite', '4-Lite', '8-Lite'], 'Audience blinder', 'Per Unit/Day', 40, 150, 2),
('TECH-2009', 'Technical', 'Lighting', 'Haze Machine', ARRAY['Oil-Based', 'Water-Based', 'Touring'], 'Atmospheric haze', 'Per Unit/Day', 75, 300, 2),
('TECH-2010', 'Technical', 'Lighting', 'Fog Machine', ARRAY['Low Fog', 'High Output', 'CO2'], 'Fog/smoke machine', 'Per Unit/Day', 50, 250, 2),
('TECH-2011', 'Technical', 'Lighting', 'Lighting Console', ARRAY['grandMA', 'Hog', 'ETC'], 'DMX lighting console', 'Per Unit/Day', 200, 1500, 3),
('TECH-2012', 'Technical', 'Lighting', 'DMX Splitter/Opto', ARRAY['4-Way', '8-Way', 'Wireless'], 'DMX distribution', 'Per Unit/Day', 20, 75, 2),
('TECH-2013', 'Technical', 'Lighting', 'Dimmer Pack', ARRAY['4 Channel', '6 Channel', '12 Channel'], 'Conventional dimmer', 'Per Unit/Day', 30, 100, 2),
('TECH-2014', 'Technical', 'Lighting', 'Truss - 12in Box', ARRAY['8ft', '10ft', 'Custom'], 'Aluminum box truss', 'Per Linear Foot/Day', 5, 15, 3),
('TECH-2015', 'Technical', 'Lighting', 'Truss - 20.5in Box', ARRAY['8ft', '10ft', 'Custom'], 'Heavy duty box truss', 'Per Linear Foot/Day', 8, 20, 3),
('TECH-2016', 'Technical', 'Lighting', 'Truss - Triangle', ARRAY['8ft', '10ft', 'Custom'], 'Triangle truss', 'Per Linear Foot/Day', 6, 15, 3),
('TECH-2017', 'Technical', 'Lighting', 'Lighting Stand', ARRAY['Tripod', 'Crank', 'Heavy Duty'], 'Lighting support', 'Per Unit/Day', 15, 50, 2),
('TECH-2018', 'Technical', 'Lighting', 'Gobo', ARRAY['Steel', 'Glass', 'Custom'], 'Pattern projection', 'Per Unit', 25, 150, 5),
('TECH-2019', 'Technical', 'Lighting', 'Color Scroller', ARRAY['Standard', 'High Speed'], 'Motorized color changer', 'Per Unit/Day', 30, 100, 2),
('TECH-2020', 'Technical', 'Lighting', 'LED Strip/Tape', ARRAY['RGB', 'RGBW', 'Pixel'], 'LED strip lighting', 'Per Linear Foot/Day', 2, 10, 3),
('TECH-2021', 'Technical', 'Lighting', 'Uplighting Package', ARRAY['4 Unit', '8 Unit', '12 Unit'], 'Wireless LED uplights', 'Per Package/Day', 100, 400, 2),
('TECH-2022', 'Technical', 'Lighting', 'String Lights', ARRAY['Edison', 'Globe', 'Fairy'], 'Decorative string lights', 'Per 100ft/Day', 25, 100, 2),
('TECH-2023', 'Technical', 'Lighting', 'Laser', ARRAY['RGB', 'Green', 'Multi-Color'], 'Laser effect system', 'Per Unit/Day', 150, 1000, 5),
('TECH-2024', 'Technical', 'Lighting', 'Mirror Ball', ARRAY['12in', '20in', '40in'], 'Disco mirror ball', 'Per Unit/Day', 25, 150, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - VIDEO (20 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-3000', 'Technical', 'Video', 'LED Wall - Indoor', ARRAY['2.5mm', '2.9mm', '3.9mm'], 'Indoor LED video wall', 'Per Panel/Day', 50, 200, 5),
('TECH-3001', 'Technical', 'Video', 'LED Wall - Outdoor', ARRAY['3.9mm', '4.8mm', '5.9mm'], 'Outdoor LED video wall', 'Per Panel/Day', 75, 250, 5),
('TECH-3002', 'Technical', 'Video', 'Projector - Standard', ARRAY['5000 Lumen', '8000 Lumen', '10000 Lumen'], 'Standard projector', 'Per Unit/Day', 150, 500, 3),
('TECH-3003', 'Technical', 'Video', 'Projector - Large Venue', ARRAY['15000 Lumen', '20000 Lumen', '30000 Lumen'], 'Large venue projector', 'Per Unit/Day', 500, 2000, 5),
('TECH-3004', 'Technical', 'Video', 'Projector - Laser', ARRAY['20000 Lumen', '30000 Lumen', '40000 Lumen'], 'Laser phosphor projector', 'Per Unit/Day', 1000, 5000, 7),
('TECH-3005', 'Technical', 'Video', 'Projection Screen - Front', ARRAY['Tripod', 'Fast-Fold', 'Truss'], 'Front projection screen', 'Per Screen/Day', 100, 500, 3),
('TECH-3006', 'Technical', 'Video', 'Projection Screen - Rear', ARRAY['Fast-Fold', 'Truss', 'Custom'], 'Rear projection screen', 'Per Screen/Day', 150, 750, 3),
('TECH-3007', 'Technical', 'Video', 'Camera - PTZ', ARRAY['HD', '4K', 'NDI'], 'PTZ camera', 'Per Unit/Day', 100, 400, 3),
('TECH-3008', 'Technical', 'Video', 'Camera - Broadcast', ARRAY['HD', '4K', 'Cinema'], 'Broadcast camera', 'Per Unit/Day', 300, 1500, 5),
('TECH-3009', 'Technical', 'Video', 'Camera - Robotic', ARRAY['Track', 'Jib', 'Crane'], 'Robotic camera system', 'Per Unit/Day', 500, 3000, 7),
('TECH-3010', 'Technical', 'Video', 'Video Switcher', ARRAY['HD', '4K', 'Multi-Format'], 'Video production switcher', 'Per Unit/Day', 200, 1500, 3),
('TECH-3011', 'Technical', 'Video', 'Video Playback', ARRAY['Media Server', 'Playback Pro', 'Resolume'], 'Video playback system', 'Per Unit/Day', 150, 800, 3),
('TECH-3012', 'Technical', 'Video', 'Confidence Monitor', ARRAY['24in', '32in', '55in'], 'Stage confidence monitor', 'Per Unit/Day', 50, 200, 2),
('TECH-3013', 'Technical', 'Video', 'Video Router/Matrix', ARRAY['8x8', '16x16', '32x32'], 'Video signal routing', 'Per Unit/Day', 100, 500, 3),
('TECH-3014', 'Technical', 'Video', 'Video Scaler', ARRAY['Basic', 'Multi-Format', 'Presentation'], 'Video scaling/conversion', 'Per Unit/Day', 75, 300, 2),
('TECH-3015', 'Technical', 'Video', 'Streaming Encoder', ARRAY['Hardware', 'Software', 'Cloud'], 'Live streaming encoder', 'Per Unit/Day', 100, 500, 3),
('TECH-3016', 'Technical', 'Video', 'Recording System', ARRAY['ISO Recording', 'Multi-Track', 'Broadcast'], 'Video recording system', 'Per Unit/Day', 150, 600, 3),
('TECH-3017', 'Technical', 'Video', 'Graphics System', ARRAY['CG', 'Lower Thirds', 'Virtual Set'], 'Broadcast graphics', 'Per Unit/Day', 200, 1000, 5),
('TECH-3018', 'Technical', 'Video', 'Teleprompter', ARRAY['Camera Mount', 'Presidential', 'Floor'], 'Teleprompter system', 'Per Unit/Day', 100, 400, 3),
('TECH-3019', 'Technical', 'Video', 'Video Distribution', ARRAY['SDI', 'HDMI', 'Fiber'], 'Video signal distribution', 'Per Unit/Day', 50, 200, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - BACKLINE (15 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-1054', 'Technical', 'Backline', 'Guitar Amplifier', ARRAY['Combo Amp', 'Stack Amp', 'Modeling Amp'], 'Guitar amplification', 'Per Unit/Day', 50, 300, 3),
('TECH-1055', 'Technical', 'Backline', 'Bass Amplifier', ARRAY['Combo Bass Amp', 'Bass Head & Cabinet'], 'Bass amplification', 'Per Unit/Day', 50, 300, 3),
('TECH-1056', 'Technical', 'Backline', 'Keyboard/Synth', ARRAY['Stage Piano', 'Synthesizer', 'Organ', 'Controller'], 'Keyboard instrument', 'Per Unit/Day', 75, 400, 3),
('TECH-1057', 'Technical', 'Backline', 'Drum Kit', ARRAY['Acoustic Kit', 'Electronic Kit', 'Hybrid'], 'Complete drum kit', 'Per Kit/Day', 150, 600, 3),
('TECH-1058', 'Technical', 'Backline', 'Percussion', ARRAY['Congas', 'Bongos', 'Timbales', 'Cajon'], 'Percussion instruments', 'Per Item/Day', 25, 150, 3),
('TECH-1059', 'Technical', 'Backline', 'Electric Guitar', ARRAY['Solid Body', 'Hollow Body', '7-String'], 'Electric guitar', 'Per Unit/Day', 50, 250, 3),
('TECH-1060', 'Technical', 'Backline', 'Bass Guitar', ARRAY['4-String', '5-String', 'Fretless'], 'Bass guitar', 'Per Unit/Day', 50, 250, 3),
('TECH-1061', 'Technical', 'Backline', 'Acoustic Guitar', ARRAY['Steel String', 'Nylon String', '12-String'], 'Acoustic guitar', 'Per Unit/Day', 40, 200, 3),
('TECH-1062', 'Technical', 'Backline', 'DJ Equipment', ARRAY['DJ Controller', 'CDJ Players', 'Mixer', 'Turntables'], 'DJ setup', 'Per Setup/Day', 150, 800, 3),
('TECH-1063', 'Technical', 'Backline', 'String Instruments', ARRAY['Violin', 'Viola', 'Cello', 'Bass'], 'Orchestral strings', 'Per Unit/Day', 75, 400, 5),
('TECH-1064', 'Technical', 'Backline', 'Brass Instruments', ARRAY['Trumpet', 'Trombone', 'French Horn', 'Tuba'], 'Brass instruments', 'Per Unit/Day', 50, 300, 5),
('TECH-1065', 'Technical', 'Backline', 'Woodwinds', ARRAY['Saxophone', 'Clarinet', 'Flute', 'Oboe'], 'Woodwind instruments', 'Per Unit/Day', 50, 300, 5),
('TECH-1066', 'Technical', 'Backline', 'Instrument Stands', ARRAY['Guitar Stand', 'Keyboard Stand', 'Drum Throne'], 'Instrument support', 'Per Unit/Day', 10, 50, 1),
('TECH-1067', 'Technical', 'Backline', 'Instrument Cables', ARRAY['Guitar Cable', 'Keyboard Cable', 'Patch Cable'], 'Instrument cables', 'Per Cable/Day', 5, 25, 1),
('TECH-1068', 'Technical', 'Backline', 'Backline Tech', ARRAY['Guitar Tech', 'Drum Tech', 'Keyboard Tech'], 'Backline technician', 'Per Person/Day', 300, 800, 3)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - RIGGING (12 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-1078', 'Technical', 'Rigging', 'Chain Hoist/Motor', ARRAY['Electric Motor', 'Manual Hoist', 'Variable Speed'], 'Load capacity 250kg-5000kg', 'Per Unit/Day', 75, 400, 3),
('TECH-1079', 'Technical', 'Rigging', 'Rigging Truss', ARRAY['Box Truss', 'Triangle', 'Ladder', 'Circle Truss'], 'Structural truss', 'Per Section/Day', 50, 200, 3),
('TECH-1080', 'Technical', 'Rigging', 'Rigging Points', ARRAY['Beam Clamp', 'Shackle', 'Span Set', 'Wire Rope'], 'Rigging hardware', 'Per Unit/Day', 15, 75, 2),
('TECH-1081', 'Technical', 'Rigging', 'Ground Support', ARRAY['Tower System', 'Base Plates', 'Outriggers'], 'Ground support system', 'Per System/Day', 500, 2500, 5),
('TECH-1082', 'Technical', 'Rigging', 'Rigging Hardware', ARRAY['Shackles', 'Slings', 'Turnbuckles', 'Swivels'], 'Rigging accessories', 'Per Unit/Day', 10, 50, 2),
('TECH-1083', 'Technical', 'Rigging', 'Bridles/Spreader Bars', ARRAY['Spreader Beam', 'Multi-Point Bridle'], 'Load distribution', 'Per Unit/Day', 50, 200, 3),
('TECH-1084', 'Technical', 'Rigging', 'Rigging Software/Design', ARRAY['CAD Design', 'Load Calculations', 'Inspection'], 'Engineering services', 'Per Project', 500, 3000, 7),
('TECH-1085', 'Technical', 'Rigging', 'Fall Protection', ARRAY['Harness', 'Lanyard', 'Anchor Points'], 'Safety equipment', 'Per Person/Day', 25, 100, 2),
('TECH-1086', 'Technical', 'Rigging', 'Rigger/Crew', ARRAY['Head Rigger', 'Rigger', 'Ground Crew'], 'Rigging personnel', 'Per Person/Day', 350, 800, 3),
('TECH-1087', 'Technical', 'Rigging', 'Main Power Distribution', ARRAY['Distro Box', 'Cam-Lok Panel', 'Buss Bars'], 'Power distribution', 'Per Unit/Day', 100, 500, 3),
('TECH-1088', 'Technical', 'Rigging', 'Generator', ARRAY['Diesel Generator', 'Natural Gas', 'Trailer-Mounted'], 'Power generation', 'Per Unit/Day', 300, 2000, 5),
('TECH-1089', 'Technical', 'Rigging', 'PDU (Power Distribution Unit)', ARRAY['Rack PDU', 'Stage PDU', 'Distro Spider'], 'Power distribution unit', 'Per Unit/Day', 50, 200, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - STAGING (15 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-1069', 'Technical', 'Staging', 'Stage Decks', ARRAY['Staging Platform', 'Riser', 'Mobile Stage'], 'Stage platform 4x8', 'Per Deck/Day', 25, 100, 3),
('TECH-1070', 'Technical', 'Staging', 'Stage Roofing', ARRAY['Roof System', 'Weather Protection', 'Canopy'], 'Stage roof system', 'Per System/Day', 1000, 5000, 7),
('TECH-1071', 'Technical', 'Staging', 'Stage Steps', ARRAY['Stair Unit', 'ADA Ramp', 'Loading Ramp'], 'Stage access', 'Per Unit/Day', 50, 200, 2),
('TECH-1072', 'Technical', 'Staging', 'Stage Skirt', ARRAY['Pleated Skirt', 'Flat Panel', 'Velour Drape'], 'Stage skirting', 'Per Linear Foot/Day', 3, 15, 2),
('TECH-1073', 'Technical', 'Staging', 'Drum Riser', ARRAY['Elevated Platform', 'Carpeted Deck'], 'Drum riser platform', 'Per Unit/Day', 75, 250, 2),
('TECH-1074', 'Technical', 'Staging', 'Runway/Catwalk', ARRAY['Extension Stage', 'T-Stage', 'Thrust'], 'Stage extension', 'Per Section/Day', 100, 400, 3),
('TECH-1075', 'Technical', 'Staging', 'Portable Staging', ARRAY['Folding Stage', 'Rolling Stage', 'Quick-Deploy'], 'Portable stage system', 'Per Unit/Day', 150, 600, 3),
('TECH-1076', 'Technical', 'Staging', 'Dance Floor', ARRAY['Sprung Floor', 'Marley', 'Vinyl Floor'], 'Dance surface', 'Per SqFt/Day', 2, 10, 3),
('TECH-1077', 'Technical', 'Staging', 'Guard Rails/Barricade', ARRAY['Crowd Barrier', 'Stage Barrier', 'Safety Rail'], 'Safety barriers', 'Per Section/Day', 15, 50, 2),
('TECH-1090', 'Technical', 'Staging', 'UPS (Uninterruptible Power)', ARRAY['Online UPS', 'Offline UPS', 'Rack Mount'], 'Backup power', 'Per Unit/Day', 50, 300, 3),
('TECH-1091', 'Technical', 'Staging', 'Power Cables', ARRAY['Cam-Lok', 'Feeder Cable', 'Extension', 'Edison'], 'Power cabling', 'Per Cable/Day', 10, 50, 2),
('TECH-1092', 'Technical', 'Staging', 'Cable Ramps/Protection', ARRAY['Heavy Duty Ramp', 'Light Duty', 'Pedestrian'], 'Cable protection', 'Per Section/Day', 15, 75, 2),
('TECH-1093', 'Technical', 'Staging', 'Power Monitoring', ARRAY['Power Meter', 'Logger', 'Remote Monitoring'], 'Power monitoring', 'Per Unit/Day', 50, 200, 2),
('TECH-1094', 'Technical', 'Staging', 'Pipe and Drape', ARRAY['8ft', '10ft', '12ft', 'Custom'], 'Pipe and drape system', 'Per Linear Foot/Day', 5, 20, 2),
('TECH-1095', 'Technical', 'Staging', 'Backdrop', ARRAY['Fabric', 'Vinyl', 'Custom Print'], 'Stage backdrop', 'Per Unit/Day', 100, 500, 5)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TECHNICAL - CREW & MANAGEMENT (10 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TECH-1100', 'Technical', 'Crew & Management', 'Production Manager', ARRAY['PM', 'APM', 'Technical Producer'], 'Production management', 'Per Person/Day', 500, 1500, 5),
('TECH-1101', 'Technical', 'Crew & Management', 'Stage Manager', ARRAY['Stage Manager', 'ASM', 'Deck Manager'], 'Stage management', 'Per Person/Day', 400, 1000, 3),
('TECH-1102', 'Technical', 'Crew & Management', 'Technical Director', ARRAY['TD', 'Systems Integration'], 'Technical direction', 'Per Person/Day', 500, 1500, 5),
('TECH-1103', 'Technical', 'Crew & Management', 'Stagehands/Crew', ARRAY['Load In', 'Load Out', 'Run Crew', 'Push Crew'], 'Stage labor', 'Per Person/Hour', 25, 75, 2),
('TECH-1104', 'Technical', 'Crew & Management', 'Forklift Operator', ARRAY['Certified Operator'], 'Forklift operation', 'Per Person/Hour', 35, 100, 2),
('TECH-1105', 'Technical', 'Crew & Management', 'Audio Engineer', ARRAY['FOH Engineer', 'Monitor Engineer', 'A2'], 'Audio engineering', 'Per Person/Day', 400, 1200, 3),
('TECH-1106', 'Technical', 'Crew & Management', 'Lighting Designer', ARRAY['LD', 'Programmer', 'Board Op'], 'Lighting design', 'Per Person/Day', 400, 1500, 5),
('TECH-1107', 'Technical', 'Crew & Management', 'Video Director', ARRAY['TD', 'Director', 'Engineer'], 'Video direction', 'Per Person/Day', 500, 1500, 5),
('TECH-1108', 'Technical', 'Crew & Management', 'Camera Operator', ARRAY['Camera Op', 'Jib Op', 'Steadicam'], 'Camera operation', 'Per Person/Day', 300, 800, 3),
('TECH-1109', 'Technical', 'Crew & Management', 'Graphics Operator', ARRAY['CG Op', 'Playback Op'], 'Graphics operation', 'Per Person/Day', 300, 700, 3)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- PRODUCTION - EVENT PRODUCTION (10 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('PROD-1105', 'Production', 'Event Production', 'Event Producer', ARRAY['Executive Producer', 'Producer', 'Line Producer'], 'Event production', 'Per Person/Day', 600, 2000, 5),
('PROD-1106', 'Production', 'Event Production', 'Production Coordinator', ARRAY['Coordinator', 'Assistant Coordinator'], 'Production coordination', 'Per Person/Day', 300, 600, 3),
('PROD-1107', 'Production', 'Event Production', 'Production Assistant', ARRAY['PA', 'Runner', 'Office PA'], 'Production assistance', 'Per Person/Day', 150, 300, 2),
('PROD-1108', 'Production', 'Event Production', 'Production Office', ARRAY['On-Site Office', 'Mobile Office'], 'Production office setup', 'Per Setup/Day', 200, 800, 3),
('PROD-1109', 'Production', 'Event Production', 'Production Supplies', ARRAY['Office Supplies', 'Consumables', 'Tools'], 'Production supplies', 'Per Event', 100, 500, 2),
('PROD-1110', 'Production', 'Event Production', 'Creative Director', ARRAY['Art Director', 'Show Director'], 'Creative direction', 'Per Person/Day', 600, 2000, 7),
('PROD-1111', 'Production', 'Event Production', 'Set Designer', ARRAY['Scenic Designer', 'Environmental Designer'], 'Set design', 'Per Project', 1000, 10000, 14),
('PROD-1112', 'Production', 'Event Production', 'Content Creator', ARRAY['Video Content', 'Motion Graphics', 'Animation'], 'Content creation', 'Per Project', 500, 5000, 7),
('PROD-1113', 'Production', 'Event Production', 'Talent', ARRAY['Performer', 'Artist', 'Speaker', 'Host'], 'Talent booking', 'Per Performance', 500, 100000, 14),
('PROD-1114', 'Production', 'Event Production', 'Talent Management', ARRAY['Artist Manager', 'Agent', 'Wrangler'], 'Talent management', 'Per Event', 300, 1500, 5)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- HOSPITALITY (20 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('HOSP-1000', 'Hospitality', 'Catering', 'Breakfast', ARRAY['Continental', 'Hot Breakfast', 'Buffet'], 'Morning meal service', 'Per Person', 15, 50, 3),
('HOSP-1001', 'Hospitality', 'Catering', 'Lunch', ARRAY['Plated', 'Buffet', 'Box Lunch'], 'Midday meal service', 'Per Person', 20, 75, 3),
('HOSP-1002', 'Hospitality', 'Catering', 'Dinner', ARRAY['Plated', 'Buffet', 'Family Style'], 'Evening meal service', 'Per Person', 35, 150, 3),
('HOSP-1003', 'Hospitality', 'Catering', 'Snacks', ARRAY['Light Snacks', 'Heavy Appetizers', 'Desserts'], 'Snack service', 'Per Person', 10, 30, 2),
('HOSP-1004', 'Hospitality', 'Beverages', 'Water', ARRAY['Bottled', 'Gallon Jugs', 'Water Station'], 'Water service', 'Per Case', 15, 40, 1),
('HOSP-1005', 'Hospitality', 'Beverages', 'Soft Drinks', ARRAY['Canned', 'Bottled', 'Fountain'], 'Soft drink service', 'Per Case', 20, 50, 1),
('HOSP-1006', 'Hospitality', 'Beverages', 'Coffee Service', ARRAY['Drip Coffee', 'Espresso', 'Cold Brew'], 'Coffee service', 'Per Gallon', 25, 75, 2),
('HOSP-1007', 'Hospitality', 'Beverages', 'Tea Service', ARRAY['Hot Tea', 'Iced Tea', 'Specialty'], 'Tea service', 'Per Gallon', 20, 50, 2),
('HOSP-1008', 'Hospitality', 'Beverages', 'Juice/Smoothies', ARRAY['Fresh Juice', 'Bottled', 'Smoothie Bar'], 'Juice service', 'Per Gallon', 30, 80, 2),
('HOSP-1009', 'Hospitality', 'Beverages', 'Alcohol - Beer', ARRAY['Domestic', 'Import', 'Craft'], 'Beer service', 'Per Case', 30, 100, 3),
('HOSP-1010', 'Hospitality', 'Beverages', 'Alcohol - Wine', ARRAY['House Wine', 'Premium', 'Champagne'], 'Wine service', 'Per Bottle', 15, 200, 3),
('HOSP-1011', 'Hospitality', 'Beverages', 'Alcohol - Spirits', ARRAY['Well', 'Call', 'Premium'], 'Spirits service', 'Per Bottle', 25, 150, 3),
('HOSP-1012', 'Hospitality', 'Catering', 'Bartender', ARRAY['Bartender', 'Barback'], 'Bar staffing', 'Per Person/Hour', 25, 75, 2),
('HOSP-1013', 'Hospitality', 'Catering', 'Server/Wait Staff', ARRAY['Server', 'Captain', 'Busser'], 'Service staffing', 'Per Person/Hour', 20, 50, 2),
('HOSP-1014', 'Hospitality', 'Catering', 'Chef/Cook', ARRAY['Executive Chef', 'Line Cook', 'Prep Cook'], 'Kitchen staffing', 'Per Person/Hour', 30, 100, 3),
('HOSP-1015', 'Hospitality', 'Green Room', 'Artist Hospitality', ARRAY['Green Room Setup', 'Dressing Room', 'VIP Lounge'], 'Artist hospitality', 'Per Room/Day', 200, 1000, 3),
('HOSP-1016', 'Hospitality', 'Green Room', 'Rider Items', ARRAY['Food Rider', 'Beverage Rider', 'Special Requests'], 'Rider fulfillment', 'Per Artist', 100, 2000, 3),
('HOSP-1017', 'Hospitality', 'Green Room', 'Towels/Linens', ARRAY['Hand Towels', 'Bath Towels', 'Robes'], 'Linens service', 'Per Set', 10, 50, 2),
('HOSP-1018', 'Hospitality', 'Green Room', 'Toiletries', ARRAY['Basic Kit', 'Premium Kit', 'Custom'], 'Toiletries kit', 'Per Kit', 15, 75, 2),
('HOSP-1019', 'Hospitality', 'Green Room', 'Ice/Coolers', ARRAY['Ice Delivery', 'Coolers', 'Ice Machine'], 'Ice service', 'Per Day', 25, 150, 1)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- TRANSPORTATION (15 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('TRANS-1000', 'Transportation', 'Ground', 'Passenger Van', ARRAY['12 Passenger', '15 Passenger'], '12-15 passenger van', 'Per Day', 150, 400, 3),
('TRANS-1001', 'Transportation', 'Ground', 'Sprinter Van', ARRAY['Passenger', 'Cargo', 'Limo'], 'Mercedes Sprinter', 'Per Day', 200, 600, 3),
('TRANS-1002', 'Transportation', 'Ground', 'Box Truck', ARRAY['16ft', '20ft', '26ft'], 'Box truck rental', 'Per Day', 150, 400, 3),
('TRANS-1003', 'Transportation', 'Ground', 'Semi Truck', ARRAY['48ft', '53ft', 'Flatbed'], 'Tractor trailer', 'Per Day', 400, 1200, 5),
('TRANS-1004', 'Transportation', 'Ground', 'Golf Cart', ARRAY['2-Seater', '4-Seater', '6-Seater'], 'Electric golf cart', 'Per Day', 75, 200, 2),
('TRANS-1005', 'Transportation', 'Ground', 'SUV/Sedan', ARRAY['SUV', 'Sedan', 'Luxury'], 'Vehicle rental', 'Per Day', 100, 500, 2),
('TRANS-1006', 'Transportation', 'Ground', 'Bus - Charter', ARRAY['Motor Coach', 'Mini Bus', 'School Bus'], 'Charter bus', 'Per Day', 500, 2000, 5),
('TRANS-1007', 'Transportation', 'Ground', 'Bus - Shuttle', ARRAY['Shuttle Service', 'Loop Route'], 'Shuttle service', 'Per Hour', 75, 200, 3),
('TRANS-1008', 'Transportation', 'Ground', 'Limo/Town Car', ARRAY['Sedan', 'Stretch Limo', 'SUV Limo'], 'Luxury transport', 'Per Hour', 75, 300, 3),
('TRANS-1009', 'Transportation', 'Ground', 'Driver', ARRAY['CDL Driver', 'Chauffeur', 'Shuttle Driver'], 'Driver service', 'Per Hour', 25, 75, 2),
('TRANS-1010', 'Transportation', 'Ground', 'Fuel', ARRAY['Gasoline', 'Diesel', 'Propane'], 'Fuel service', 'Per Gallon', 3, 6, 1),
('TRANS-1011', 'Transportation', 'Air', 'Charter Flight', ARRAY['Private Jet', 'Helicopter', 'Commercial Charter'], 'Air charter', 'Per Flight', 5000, 100000, 14),
('TRANS-1012', 'Transportation', 'Air', 'Commercial Flights', ARRAY['Economy', 'Business', 'First Class'], 'Commercial airfare', 'Per Ticket', 200, 5000, 7),
('TRANS-1013', 'Transportation', 'Freight', 'Freight Shipping', ARRAY['Ground', 'Air', 'Expedited'], 'Freight service', 'Per Shipment', 100, 5000, 5),
('TRANS-1014', 'Transportation', 'Freight', 'Courier Service', ARRAY['Same Day', 'Next Day', 'Rush'], 'Courier delivery', 'Per Delivery', 25, 500, 1)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- SITE INFRASTRUCTURE (25 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('SITE-1128', 'Site Infrastructure', 'Structures', 'Main Stage Structure', ARRAY['Festival Stage', 'Concert Stage', 'Mobile Stage'], 'Main stage system', 'Per Structure/Day', 5000, 50000, 14),
('SITE-1129', 'Site Infrastructure', 'Structures', 'Roof System', ARRAY['Ground Support Roof', 'Suspended Roof'], 'Stage roof', 'Per System/Day', 2000, 15000, 7),
('SITE-1130', 'Site Infrastructure', 'Structures', 'Scaffolding', ARRAY['Frame Scaffold', 'System Scaffold', 'Rolling Tower'], 'Scaffolding system', 'Per Unit/Day', 100, 500, 3),
('SITE-1131', 'Site Infrastructure', 'Structures', 'Bleachers/Seating', ARRAY['Portable Bleachers', 'Fixed Seating', 'Grandstand'], 'Seating structures', 'Per Seat/Day', 5, 25, 5),
('SITE-1132', 'Site Infrastructure', 'Flooring', 'Event Flooring', ARRAY['Interlock Flooring', 'Plywood', 'Turf Protection'], 'Event flooring', 'Per SqFt/Day', 1, 5, 3),
('SITE-1133', 'Site Infrastructure', 'Flooring', 'Carpet/Turf', ARRAY['Event Carpet', 'Artificial Turf', 'Matting'], 'Floor covering', 'Per SqYd/Day', 2, 10, 3),
('SITE-1134', 'Site Infrastructure', 'Barriers', 'Fencing', ARRAY['Chain Link', 'Barricade', 'Privacy Screen'], 'Perimeter fencing', 'Per Linear Foot/Day', 2, 10, 3),
('SITE-1135', 'Site Infrastructure', 'Barriers', 'Bike Rack Barrier', ARRAY['Interlocking Barrier', 'Crowd Control'], 'Crowd barrier', 'Per Section/Day', 10, 30, 2),
('SITE-1136', 'Site Infrastructure', 'Barriers', 'Jersey Barriers', ARRAY['Concrete Barrier', 'Water-Filled Barrier'], 'Vehicle barrier', 'Per Unit/Day', 25, 100, 3),
('SITE-1137', 'Site Infrastructure', 'Facilities', 'Portable Restrooms', ARRAY['Standard', 'ADA', 'Trailer', 'VIP'], 'Portable toilets', 'Per Unit/Day', 75, 500, 3),
('SITE-1138', 'Site Infrastructure', 'Facilities', 'Shower Trailers', ARRAY['Mobile Shower', 'Changing Room'], 'Shower facilities', 'Per Unit/Day', 300, 1000, 5),
('SITE-1139', 'Site Infrastructure', 'Facilities', 'Office Trailers', ARRAY['Mobile Office', 'Production Trailer'], 'Office trailer', 'Per Unit/Day', 150, 500, 5),
('SITE-1140', 'Site Infrastructure', 'Tents/Canopies', 'Frame Tent', ARRAY['Clear Span', 'Hip End', 'Gable'], 'Frame tent', 'Per SqFt/Day', 2, 8, 5),
('SITE-1141', 'Site Infrastructure', 'Tents/Canopies', 'Pole Tent', ARRAY['Center Pole', 'Multi-Pole'], 'Pole tent', 'Per SqFt/Day', 1, 5, 5),
('SITE-1142', 'Site Infrastructure', 'Tents/Canopies', 'Pop-Up Canopy', ARRAY['10x10', '10x20', 'Custom'], 'Pop-up canopy', 'Per Unit/Day', 25, 100, 2),
('SITE-1143', 'Site Infrastructure', 'Climate Control', 'HVAC - Cooling', ARRAY['Portable AC', 'Spot Cooler', 'Chiller'], 'Cooling system', 'Per Ton/Day', 100, 500, 5),
('SITE-1144', 'Site Infrastructure', 'Climate Control', 'HVAC - Heating', ARRAY['Portable Heater', 'Forced Air', 'Radiant'], 'Heating system', 'Per BTU/Day', 75, 400, 5),
('SITE-1145', 'Site Infrastructure', 'Climate Control', 'Fans/Ventilation', ARRAY['Industrial Fan', 'Misting Fan', 'Air Mover'], 'Ventilation', 'Per Unit/Day', 25, 150, 2),
('SITE-1146', 'Site Infrastructure', 'Waste Management', 'Trash Receptacles', ARRAY['Trash Can', 'Dumpster', 'Compactor'], 'Waste containers', 'Per Unit/Day', 10, 100, 2),
('SITE-1147', 'Site Infrastructure', 'Waste Management', 'Recycling Stations', ARRAY['Single Stream', 'Multi-Sort', 'Compost'], 'Recycling', 'Per Station/Day', 25, 100, 2),
('SITE-1148', 'Site Infrastructure', 'Waste Management', 'Waste Removal', ARRAY['Daily Pickup', 'Event Cleanup', 'Haul Away'], 'Waste removal service', 'Per Service', 200, 2000, 3),
('SITE-1149', 'Site Infrastructure', 'Water/Plumbing', 'Water Delivery', ARRAY['Potable Water', 'Non-Potable', 'Hot Water'], 'Water service', 'Per Gallon', 0.05, 0.25, 2),
('SITE-1150', 'Site Infrastructure', 'Water/Plumbing', 'Handwash Stations', ARRAY['Single', 'Multi-Station', 'ADA'], 'Handwashing', 'Per Unit/Day', 50, 200, 2),
('SITE-1151', 'Site Infrastructure', 'Water/Plumbing', 'Plumber', ARRAY['Licensed Plumber', 'Helper'], 'Plumbing service', 'Per Hour', 75, 200, 3),
('SITE-1152', 'Site Infrastructure', 'Water/Plumbing', 'Gray Water Removal', ARRAY['Pump Out', 'Tank Rental'], 'Gray water service', 'Per Service', 100, 500, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- SAFETY & SECURITY (20 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('SAFE-1000', 'Safety', 'Barriers', 'Crowd Barrier', ARRAY['Steel Barrier', 'Aluminum', 'Plastic'], 'Crowd control barrier', 'Per Unit/Day', 10, 40, 2),
('SAFE-1001', 'Safety', 'Barriers', 'Bike Rack', ARRAY['Standard', 'Heavy Duty'], 'Bike rack barrier', 'Per Unit/Day', 8, 25, 2),
('SAFE-1002', 'Safety', 'Medical', 'First Aid Kit', ARRAY['Basic', 'Professional', 'Trauma'], 'First aid supplies', 'Per Kit', 25, 200, 2),
('SAFE-1003', 'Safety', 'Fire', 'Fire Extinguisher', ARRAY['ABC', 'CO2', 'Water'], 'Fire extinguisher', 'Per Unit', 25, 100, 1),
('SAFE-1004', 'Safety', 'Medical', 'Medical Tent', ARRAY['First Aid Station', 'Medical Trailer'], 'Medical facility', 'Per Setup/Day', 500, 2000, 5),
('SAFE-1005', 'Safety', 'Medical', 'EMT/Paramedic', ARRAY['EMT', 'Paramedic', 'Nurse'], 'Medical personnel', 'Per Person/Hour', 35, 100, 3),
('SAFE-1006', 'Safety', 'Medical', 'Ambulance', ARRAY['BLS Ambulance', 'ALS Ambulance'], 'Ambulance standby', 'Per Unit/Day', 500, 2000, 5),
('SAFE-1007', 'Safety', 'Security', 'Security Guard', ARRAY['Unarmed', 'Armed', 'Supervisor'], 'Security personnel', 'Per Person/Hour', 20, 75, 3),
('SAFE-1008', 'Safety', 'Security', 'Security Director', ARRAY['Director', 'Manager'], 'Security management', 'Per Person/Day', 400, 1000, 5),
('SAFE-1009', 'Safety', 'Security', 'Metal Detectors', ARRAY['Walk-Through', 'Handheld', 'X-Ray'], 'Screening equipment', 'Per Unit/Day', 100, 500, 5),
('SAFE-1010', 'Safety', 'Security', 'Bag Check Station', ARRAY['Table', 'Tent', 'Structure'], 'Bag check setup', 'Per Station/Day', 50, 200, 2),
('SAFE-1011', 'Safety', 'Security', 'Credential System', ARRAY['Wristbands', 'Badges', 'RFID'], 'Credentialing', 'Per Person', 1, 25, 5),
('SAFE-1012', 'Safety', 'Security', 'Surveillance Camera', ARRAY['Fixed', 'PTZ', 'Wireless'], 'Security camera', 'Per Unit/Day', 50, 200, 3),
('SAFE-1013', 'Safety', 'Fire', 'Fire Watch', ARRAY['Fire Marshal', 'Fire Watch Personnel'], 'Fire safety', 'Per Person/Hour', 30, 75, 3),
('SAFE-1014', 'Safety', 'Fire', 'Fire Lane Marking', ARRAY['Cones', 'Tape', 'Signs'], 'Fire lane setup', 'Per Setup', 50, 200, 2),
('SAFE-1015', 'Safety', 'Emergency', 'Emergency Plan', ARRAY['EAP Development', 'Site Assessment'], 'Emergency planning', 'Per Plan', 500, 5000, 14),
('SAFE-1016', 'Safety', 'Emergency', 'Weather Monitoring', ARRAY['Weather Service', 'Lightning Detection'], 'Weather monitoring', 'Per Day', 100, 500, 3),
('SAFE-1017', 'Safety', 'Emergency', 'Evacuation Equipment', ARRAY['Megaphones', 'Sirens', 'Signs'], 'Evacuation supplies', 'Per Kit', 100, 500, 3),
('SAFE-1018', 'Safety', 'Crowd Management', 'Crowd Manager', ARRAY['Crowd Manager', 'Supervisor'], 'Crowd management', 'Per Person/Hour', 25, 60, 3),
('SAFE-1019', 'Safety', 'Crowd Management', 'Guest Services', ARRAY['Information', 'Lost & Found', 'ADA'], 'Guest services staff', 'Per Person/Hour', 18, 40, 2)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- COMMUNICATIONS (10 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('COMM-1000', 'Communications', 'Radio', 'Two-Way Radio', ARRAY['Analog', 'Digital', 'Trunked'], 'Two-way radio', 'Per Unit/Day', 15, 50, 2),
('COMM-1001', 'Communications', 'Intercom', 'Clearcom System', ARRAY['Wired', 'Wireless', 'Party Line'], 'Intercom system', 'Per Station/Day', 30, 100, 3),
('COMM-1002', 'Communications', 'Internet', 'WiFi Hotspot', ARRAY['4G', '5G', 'Satellite'], 'Mobile WiFi', 'Per Unit/Day', 25, 100, 2),
('COMM-1003', 'Communications', 'Internet', 'Hardwired Internet', ARRAY['Fiber', 'Cable', 'T1'], 'Wired internet', 'Per Connection/Day', 100, 500, 7),
('COMM-1004', 'Communications', 'Internet', 'WiFi Network', ARRAY['Event WiFi', 'Production WiFi', 'Guest WiFi'], 'WiFi network', 'Per Network/Day', 200, 2000, 5),
('COMM-1005', 'Communications', 'Phone', 'Cell Phone', ARRAY['Smartphone', 'Basic Phone'], 'Mobile phone', 'Per Unit/Day', 10, 50, 2),
('COMM-1006', 'Communications', 'Phone', 'Landline/VOIP', ARRAY['Single Line', 'Multi-Line', 'PBX'], 'Phone service', 'Per Line/Day', 25, 100, 5),
('COMM-1007', 'Communications', 'Paging', 'Paging System', ARRAY['Overhead', 'Zone', 'Emergency'], 'PA/paging system', 'Per System/Day', 100, 500, 3),
('COMM-1008', 'Communications', 'Signage', 'Digital Signage', ARRAY['LED Display', 'LCD Screen', 'Video Wall'], 'Digital signage', 'Per Unit/Day', 100, 500, 3),
('COMM-1009', 'Communications', 'Signage', 'Printed Signage', ARRAY['Banners', 'Posters', 'Directional'], 'Printed signs', 'Per Unit', 25, 500, 5)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- FURNITURE & DECOR (20 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('FURN-1000', 'Furniture', 'Seating', 'Folding Chair', ARRAY['White', 'Black', 'Wood'], 'Folding chair', 'Per Unit/Day', 2, 8, 2),
('FURN-1001', 'Furniture', 'Seating', 'Chiavari Chair', ARRAY['Gold', 'Silver', 'White', 'Black'], 'Chiavari chair', 'Per Unit/Day', 5, 15, 3),
('FURN-1002', 'Furniture', 'Seating', 'Lounge Seating', ARRAY['Sofa', 'Loveseat', 'Ottoman'], 'Lounge furniture', 'Per Unit/Day', 50, 200, 3),
('FURN-1003', 'Furniture', 'Seating', 'Bar Stool', ARRAY['Standard', 'High Back', 'Adjustable'], 'Bar stool', 'Per Unit/Day', 10, 40, 2),
('FURN-1004', 'Furniture', 'Tables', 'Banquet Table', ARRAY['6ft', '8ft', 'Round'], 'Banquet table', 'Per Unit/Day', 8, 25, 2),
('FURN-1005', 'Furniture', 'Tables', 'Cocktail Table', ARRAY['30in', '36in', 'Adjustable'], 'Cocktail/highboy table', 'Per Unit/Day', 10, 35, 2),
('FURN-1006', 'Furniture', 'Tables', 'Coffee Table', ARRAY['Square', 'Rectangle', 'Round'], 'Coffee table', 'Per Unit/Day', 15, 50, 2),
('FURN-1007', 'Furniture', 'Tables', 'Registration Table', ARRAY['6ft', '8ft', 'Skirted'], 'Registration table', 'Per Unit/Day', 15, 40, 2),
('FURN-1008', 'Furniture', 'Linens', 'Tablecloth', ARRAY['Round', 'Rectangle', 'Square'], 'Table linen', 'Per Unit', 8, 30, 2),
('FURN-1009', 'Furniture', 'Linens', 'Chair Cover', ARRAY['Spandex', 'Polyester', 'Sash'], 'Chair cover', 'Per Unit', 3, 12, 2),
('FURN-1010', 'Furniture', 'Linens', 'Napkins', ARRAY['Cloth', 'Paper', 'Specialty'], 'Napkins', 'Per Unit', 0.50, 3, 2),
('DECOR-1000', 'Decor', 'Florals', 'Centerpiece', ARRAY['Fresh Flowers', 'Silk', 'Non-Floral'], 'Table centerpiece', 'Per Unit', 25, 200, 5),
('DECOR-1001', 'Decor', 'Florals', 'Stage Florals', ARRAY['Arrangements', 'Garlands', 'Trees'], 'Stage decoration', 'Per Arrangement', 100, 1000, 5),
('DECOR-1002', 'Decor', 'Balloons', 'Balloon Decor', ARRAY['Arch', 'Column', 'Centerpiece'], 'Balloon decoration', 'Per Installation', 100, 2000, 3),
('DECOR-1003', 'Decor', 'Fabric', 'Draping', ARRAY['Ceiling', 'Wall', 'Entrance'], 'Fabric draping', 'Per Linear Foot', 5, 25, 5),
('DECOR-1004', 'Decor', 'Props', 'Photo Backdrop', ARRAY['Step & Repeat', 'Custom', 'Themed'], 'Photo backdrop', 'Per Unit', 200, 2000, 7),
('DECOR-1005', 'Decor', 'Props', 'Themed Props', ARRAY['Custom Build', 'Rental', 'Purchase'], 'Themed props', 'Per Item', 50, 5000, 14),
('DECOR-1006', 'Decor', 'Lighting', 'Candles/Votives', ARRAY['Real', 'LED', 'Floating'], 'Candle decor', 'Per Unit', 2, 15, 2),
('DECOR-1007', 'Decor', 'Specialty', 'Ice Sculpture', ARRAY['Logo', 'Custom Design', 'Functional'], 'Ice sculpture', 'Per Unit', 300, 3000, 7),
('DECOR-1008', 'Decor', 'Specialty', 'Red Carpet', ARRAY['3ft', '4ft', '6ft Width'], 'Red carpet', 'Per Linear Foot', 5, 20, 3)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- SPECIAL EFFECTS (10 items)
INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, specifications, standard_unit, estimated_cost_min, estimated_cost_max, lead_time_days) VALUES
('SPEC-1000', 'Special Effects', 'Pyrotechnics', 'Indoor Pyro', ARRAY['Gerbs', 'Flames', 'Sparkle'], 'Indoor pyrotechnics', 'Per Effect', 50, 500, 7),
('SPEC-1001', 'Special Effects', 'Pyrotechnics', 'Outdoor Pyro', ARRAY['Fireworks', 'Aerial', 'Ground'], 'Outdoor pyrotechnics', 'Per Show', 1000, 50000, 14),
('SPEC-1002', 'Special Effects', 'Confetti', 'Confetti Cannon', ARRAY['Handheld', 'Electric', 'CO2'], 'Confetti cannon', 'Per Unit', 25, 200, 3),
('SPEC-1003', 'Special Effects', 'Confetti', 'Confetti Blower', ARRAY['Continuous', 'Burst', 'Multi-Color'], 'Confetti blower', 'Per Unit/Day', 100, 500, 3),
('SPEC-1004', 'Special Effects', 'CO2', 'CO2 Jets', ARRAY['Single', 'Multi-Head', 'Cryo'], 'CO2 jet effect', 'Per Unit/Day', 150, 600, 5),
('SPEC-1005', 'Special Effects', 'CO2', 'CO2 Tank', ARRAY['50lb', '100lb', 'Bulk'], 'CO2 supply', 'Per Tank', 50, 200, 2),
('SPEC-1006', 'Special Effects', 'Foam/Snow', 'Foam Machine', ARRAY['Party Foam', 'Fire Foam'], 'Foam machine', 'Per Unit/Day', 200, 800, 5),
('SPEC-1007', 'Special Effects', 'Foam/Snow', 'Snow Machine', ARRAY['Evaporative', 'Foam Snow'], 'Snow machine', 'Per Unit/Day', 150, 500, 3),
('SPEC-1008', 'Special Effects', 'Bubbles', 'Bubble Machine', ARRAY['Standard', 'High Output', 'Mini'], 'Bubble machine', 'Per Unit/Day', 50, 200, 2),
('SPEC-1009', 'Special Effects', 'Wind', 'Wind Machine', ARRAY['Fan', 'Blower', 'Industrial'], 'Wind effect', 'Per Unit/Day', 75, 300, 3)
ON CONFLICT (item_id) DO UPDATE SET category = EXCLUDED.category, subcategory = EXCLUDED.subcategory, item_name = EXCLUDED.item_name, specifications = EXCLUDED.specifications, standard_unit = EXCLUDED.standard_unit, updated_at = now();

-- Add comments
COMMENT ON TABLE production_advancing_catalog IS 'Global catalog of 329+ standardized production items across 24 subcategories for production advancing';

-- Final notice
DO $$ BEGIN RAISE NOTICE 'Production Advancing Catalog seeded with 329+ items across all categories'; END $$;
