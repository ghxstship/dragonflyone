-- 0176_fix_kpi_report_codes.sql
-- Updates KPI report codes to match the actual KPI definitions in kpi-definitions.ts
-- The original seed (0033) used placeholder codes that don't match the actual KPI library

-- This migration updates the kpi_codes arrays in kpi_reports to use the correct codes
-- from the KPI_MASTER_LIST defined in packages/config/kpi-definitions.ts

DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get the organization ID used for global reports
  SELECT organization_id INTO v_org_id FROM kpi_reports WHERE is_global = true LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE NOTICE 'No global reports found, skipping code updates';
    RETURN;
  END IF;

  -- Update Financial Performance reports with correct codes
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_001}' WHERE name = 'Total Event Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_002}' WHERE name = 'Per Capita Spending' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_003}' WHERE name = 'VIP/Premium Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_004}' WHERE name = 'Merchandise Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_005}' WHERE name = 'F&B Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_006}' WHERE name = 'Parking Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_007}' WHERE name = 'Sponsorship Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_008}' WHERE name = 'Secondary Ticket Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_009}' WHERE name = 'Early Bird Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_REV_010}' WHERE name = 'Group Sales Revenue' AND is_global = true;
  
  -- Cost Management
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_001}' WHERE name = 'Cost Per Attendee' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_002}' WHERE name = 'Labor Cost Percentage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_003}' WHERE name = 'Vendor Cost Ratio' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_004}' WHERE name = 'Marketing Cost Per Ticket' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_005}' WHERE name = 'Venue Rental Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_006}' WHERE name = 'Equipment Rental Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_007}' WHERE name = 'Insurance Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_008}' WHERE name = 'Security Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_009}' WHERE name = 'Technology Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_010}' WHERE name = 'Logistics Cost' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_011}' WHERE name = 'Budget Variance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_012}' WHERE name = 'Cost Overrun Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_013}' WHERE name = 'Contingency Usage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_014}' WHERE name = 'Burn Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_COST_015}' WHERE name = 'Cost Savings Achieved' AND is_global = true;
  
  -- Profitability
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_001}' WHERE name = 'Profit Margin' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_002}' WHERE name = 'Gross Profit' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_003}' WHERE name = 'Net Profit' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_004}' WHERE name = 'EBITDA' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_005}' WHERE name = 'Operating Profit Margin' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_006}' WHERE name = 'Return on Investment' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_007}' WHERE name = 'Return on Assets' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_008}' WHERE name = 'Break-Even Point' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_009}' WHERE name = 'Contribution Margin' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_010}' WHERE name = 'Economic Value Added' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_011}' WHERE name = 'Cash Flow from Operations' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_012}' WHERE name = 'Working Capital Ratio' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_013}' WHERE name = 'Days Sales Outstanding' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_014}' WHERE name = 'Accounts Payable Turnover' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_015}' WHERE name = 'Revenue Per Available Seat' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_016}' WHERE name = 'Revenue Per Square Foot' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_017}' WHERE name = 'Revenue Growth Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_018}' WHERE name = 'Profit Per Event' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_019}' WHERE name = 'Revenue Multiple' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{FIN_PROF_020}' WHERE name = 'Asset Turnover Ratio' AND is_global = true;

  -- Ticket & Attendance - Sales Performance
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_001}' WHERE name = 'Total Tickets Sold' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_002}' WHERE name = 'Sell-Through Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_003}' WHERE name = 'Average Ticket Price' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_004}' WHERE name = 'Ticket Revenue' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_005}' WHERE name = 'Sales Velocity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_006}' WHERE name = 'Channel Mix' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_007}' WHERE name = 'Mobile Sales Percentage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_008}' WHERE name = 'Conversion Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_009}' WHERE name = 'Cart Abandonment Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_010}' WHERE name = 'Promo Code Usage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_011}' WHERE name = 'Refund Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_012}' WHERE name = 'Chargeback Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_013}' WHERE name = 'Season Pass Sales' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_014}' WHERE name = 'Upgrade Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_015}' WHERE name = 'Add-On Attachment Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_016}' WHERE name = 'First-Time Buyer Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_017}' WHERE name = 'Repeat Purchase Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_018}' WHERE name = 'Days to Sellout' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_019}' WHERE name = 'Waitlist Conversion' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_020}' WHERE name = 'Presale Performance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_021}' WHERE name = 'Last-Minute Sales' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_022}' WHERE name = 'Geographic Distribution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_023}' WHERE name = 'Payment Method Mix' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_024}' WHERE name = 'Average Order Value' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_SALES_025}' WHERE name = 'Tickets Per Transaction' AND is_global = true;

  -- Capacity & Utilization
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_001}' WHERE name = 'Venue Capacity Utilization' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_002}' WHERE name = 'Section Fill Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_003}' WHERE name = 'No-Show Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_004}' WHERE name = 'Check-In Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_005}' WHERE name = 'Peak Attendance Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_006}' WHERE name = 'Entry Flow Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_007}' WHERE name = 'Exit Flow Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_008}' WHERE name = 'Dwell Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_009}' WHERE name = 'Zone Density' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_010}' WHERE name = 'Accessibility Utilization' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_011}' WHERE name = 'VIP Area Utilization' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_012}' WHERE name = 'Standing vs Seated Ratio' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_013}' WHERE name = 'Multi-Day Attendance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_014}' WHERE name = 'Weather Impact Factor' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_CAP_015}' WHERE name = 'Competitor Event Impact' AND is_global = true;

  -- Pricing Optimization
  UPDATE kpi_reports SET kpi_codes = '{TKT_PRICE_001}' WHERE name = 'Dynamic Pricing Lift' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_PRICE_002}' WHERE name = 'Price Elasticity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_PRICE_003}' WHERE name = 'Tier Distribution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_PRICE_004}' WHERE name = 'Discount Depth' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{TKT_PRICE_005}' WHERE name = 'Revenue Per Available Ticket' AND is_global = true;

  -- Operational Efficiency - Project Management
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_001}' WHERE name = 'Schedule Adherence Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_002}' WHERE name = 'Project Timeline Adherence' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_003}' WHERE name = 'Change Order Frequency' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_004}' WHERE name = 'Risk Mitigation Success' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_005}' WHERE name = 'Milestone Velocity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_006}' WHERE name = 'Resource Allocation Efficiency' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_007}' WHERE name = 'Dependency Fulfillment' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_008}' WHERE name = 'Critical Path Variance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_009}' WHERE name = 'Average Task Duration' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_010}' WHERE name = 'Sprint Velocity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_011}' WHERE name = 'Blocker Resolution Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_012}' WHERE name = 'Task Completion Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_013}' WHERE name = 'Overdue Task Percentage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_014}' WHERE name = 'Task Estimation Accuracy' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_015}' WHERE name = 'Planning Accuracy' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_016}' WHERE name = 'Scope Creep Index' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_017}' WHERE name = 'Communication Response Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_018}' WHERE name = 'Meeting Effectiveness' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_019}' WHERE name = 'Decision Velocity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_PM_020}' WHERE name = 'Project Health Score' AND is_global = true;

  -- Team Performance
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_001}' WHERE name = 'Staff Utilization Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_002}' WHERE name = 'Employee Satisfaction' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_003}' WHERE name = 'Training Completion Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_004}' WHERE name = 'Cross-Training Index' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_005}' WHERE name = 'Staff Turnover Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_006}' WHERE name = 'Average Crew Experience' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_007}' WHERE name = 'Staff Response Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_008}' WHERE name = 'Incident Report Frequency' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_009}' WHERE name = 'Staff Punctuality' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_010}' WHERE name = 'Certification Compliance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_011}' WHERE name = 'Overtime Percentage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_012}' WHERE name = 'Staff Productivity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_013}' WHERE name = 'Team Collaboration Score' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_014}' WHERE name = 'Staff Retention Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_015}' WHERE name = 'Skills Gap Index' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_016}' WHERE name = 'Onboarding Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_017}' WHERE name = 'Performance Review Completion' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_018}' WHERE name = 'Staff Morale Index' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_019}' WHERE name = 'Internal Promotion Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_TEAM_020}' WHERE name = 'Conflict Resolution Time' AND is_global = true;

  -- Vendor Management
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_001}' WHERE name = 'Vendor Reliability Score' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_002}' WHERE name = 'Supplier Lead Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_003}' WHERE name = 'Contract Compliance Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_004}' WHERE name = 'Vendor Cost Variance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_005}' WHERE name = 'Quality Rejection Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_006}' WHERE name = 'Backup Vendor Activation' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_007}' WHERE name = 'Vendor Dispute Resolution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_008}' WHERE name = 'Local Vendor Percentage' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_009}' WHERE name = 'Sustainable Supplier Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_010}' WHERE name = 'Vendor NPS' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_011}' WHERE name = 'Vendor Response Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_012}' WHERE name = 'Vendor Performance Score' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_013}' WHERE name = 'Contract Renewal Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_014}' WHERE name = 'Vendor Diversity Index' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{OPS_VENDOR_015}' WHERE name = 'Supply Chain Risk Score' AND is_global = true;

  -- Marketing & Engagement - Digital Marketing
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_001}' WHERE name = 'Social Media Engagement' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_002}' WHERE name = 'Website Conversion Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_003}' WHERE name = 'Landing Page Bounce Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_004}' WHERE name = 'Email Click-Through Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_005}' WHERE name = 'Email Open Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_006}' WHERE name = 'Email List Growth' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_007}' WHERE name = 'Social Follower Growth' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_008}' WHERE name = 'Paid Ad ROAS' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_009}' WHERE name = 'Organic Search Traffic' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_DIG_010}' WHERE name = 'Video Completion Rate' AND is_global = true;

  -- Audience Development
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_001}' WHERE name = 'Net Promoter Score' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_002}' WHERE name = 'Brand Mention Velocity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_003}' WHERE name = 'Demographics Match' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_004}' WHERE name = 'Geographic Reach' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_005}' WHERE name = 'Age Distribution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_006}' WHERE name = 'Gender Distribution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_007}' WHERE name = 'Income Distribution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_008}' WHERE name = 'Interest Affinity' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_009}' WHERE name = 'Discovery Method' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_AUD_010}' WHERE name = 'First-Time vs Repeat' AND is_global = true;

  -- Brand & PR
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_001}' WHERE name = 'Brand Awareness Lift' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_002}' WHERE name = 'Brand Sentiment Score' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_003}' WHERE name = 'User-Generated Content' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_004}' WHERE name = 'Hashtag Performance' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_005}' WHERE name = 'Media Impressions' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_006}' WHERE name = 'Press Sentiment' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_007}' WHERE name = 'Partnership Brand Lift' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_008}' WHERE name = 'Event FOMO Factor' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_009}' WHERE name = 'Post-Event Engagement' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{MKT_BRAND_010}' WHERE name = 'Content Virality' AND is_global = true;

  -- Customer Experience - Experience Quality
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_001}' WHERE name = 'Overall Satisfaction' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_002}' WHERE name = 'Likelihood to Recommend' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_003}' WHERE name = 'Expectation Gap' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_004}' WHERE name = 'Venue Experience' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_005}' WHERE name = 'Sound Quality' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_006}' WHERE name = 'Visual Production' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_007}' WHERE name = 'F&B Service Quality' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_008}' WHERE name = 'Restroom Cleanliness' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_009}' WHERE name = 'Parking Experience' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_010}' WHERE name = 'Accessibility Experience' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_011}' WHERE name = 'Merchandise Quality' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_012}' WHERE name = 'Staff Friendliness' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_013}' WHERE name = 'Event Flow' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_014}' WHERE name = 'Queue Management' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_EXP_015}' WHERE name = 'Information Clarity' AND is_global = true;

  -- Service Quality
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_001}' WHERE name = 'Support Resolution Time' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_002}' WHERE name = 'First Contact Resolution' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_003}' WHERE name = 'Complaint Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_004}' WHERE name = 'Refund Request Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_005}' WHERE name = 'Support Satisfaction' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_006}' WHERE name = 'Live Chat Response' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_007}' WHERE name = 'Self-Service Success' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_008}' WHERE name = 'Escalation Rate' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_009}' WHERE name = 'Follow-Up Completion' AND is_global = true;
  UPDATE kpi_reports SET kpi_codes = '{CX_SVC_010}' WHERE name = 'Service Recovery Success' AND is_global = true;

  RAISE NOTICE 'KPI report codes updated successfully';
END $$;
