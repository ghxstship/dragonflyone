/**
 * GVTEWAY 200 KPI Metrics Library
 * Complete KPI definitions organized by category
 * This is the single source of truth for all KPI metrics across the platform
 */

import type { KPIDefinition } from './types/kpi-types';

// Import KPIs from separate category files
import { OPERATIONAL_KPIS } from './kpi-operational';
import { MARKETING_KPIS } from './kpi-marketing';
import { CUSTOMER_EXPERIENCE_KPIS } from './kpi-customer-experience';

// Re-export for external use
export { OPERATIONAL_KPIS, MARKETING_KPIS, CUSTOMER_EXPERIENCE_KPIS };

/**
 * FINANCIAL PERFORMANCE KPIs (1-45)
 * Revenue Metrics (1-10), Cost Management (11-25), Profitability (26-45)
 */
export const FINANCIAL_KPIS: KPIDefinition[] = [
  // Revenue Metrics (1-10)
  {
    id: 1,
    code: 'FIN_REV_001',
    name: 'Total Event Revenue',
    description: 'Sum of all revenue streams including tickets, merchandise, F&B, parking, sponsorships',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount'], filters: ['transaction_status = completed'] }],
    calculation: 'SUM(transactions.total_amount WHERE status = completed)',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER', 'LINE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 2,
    code: 'FIN_REV_002',
    name: 'Per Capita Spending',
    description: 'Average amount spent per attendee across all revenue streams',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'Total Revenue / Actual Attendance',
    dependencies: ['FIN_REV_001'],
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  {
    id: 3,
    code: 'FIN_REV_003',
    name: 'VIP Revenue Percentage',
    description: 'Percentage of total revenue from VIP ticket sales and packages',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'tickets', fields: ['tier_id'] },
      { table: 'ticket_tiers', fields: ['tier_type'], filters: ['tier_type = vip'] }
    ],
    calculation: '(VIP Revenue / Total Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    targetValue: 30,
    warningThreshold: 20,
    criticalThreshold: 15,
    enabled: true
  },
  {
    id: 4,
    code: 'FIN_REV_004',
    name: 'Merchandise Revenue Per Attendee',
    description: 'Average merchandise sales per attendee',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'], filters: ['transaction_type = merchandise'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'SUM(merchandise transactions) / Actual Attendance',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 5,
    code: 'FIN_REV_005',
    name: 'F&B Revenue Per Attendee',
    description: 'Average food and beverage revenue per attendee',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'], filters: ['transaction_type = food_beverage'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'SUM(F&B transactions) / Actual Attendance',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 6,
    code: 'FIN_REV_006',
    name: 'Sponsorship Revenue Goal Achievement',
    description: 'Percentage of sponsorship revenue target achieved',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'], filters: ['transaction_type = sponsorship'] },
      { table: 'budgets', fields: ['revenue_target'] }
    ],
    calculation: '(Actual Sponsorship Revenue / Budgeted Sponsorship Revenue) × 100',
    updateFrequency: 'WEEKLY',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    targetValue: 100,
    warningThreshold: 80,
    criticalThreshold: 60,
    enabled: true
  },
  {
    id: 7,
    code: 'FIN_REV_007',
    name: 'Secondary Revenue Percentage',
    description: 'Percentage of total revenue from non-ticket sources',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount', 'transaction_type'] }],
    calculation: '(Non-ticket Revenue / Total Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['PIE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 8,
    code: 'FIN_REV_008',
    name: 'Average Transaction Value',
    description: 'Average dollar amount per transaction across all revenue types',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount'] }],
    calculation: 'SUM(total_amount) / COUNT(transactions)',
    updateFrequency: 'HOURLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 9,
    code: 'FIN_REV_009',
    name: 'Revenue Growth Rate',
    description: 'Percentage change in revenue compared to previous comparable event',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'kpi_data_points', fields: ['value'], filters: ['kpi_code = FIN_REV_001'] }
    ],
    calculation: '((Current Revenue - Previous Revenue) / Previous Revenue) × 100',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER', 'TREND_INDICATOR'],
    enabled: true
  },
  {
    id: 10,
    code: 'FIN_REV_010',
    name: 'Lifetime Value Per Attendee',
    description: 'Average total revenue generated per attendee across multiple events',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount', 'customer_id'] },
      { table: 'tickets', fields: ['purchaser_id'] }
    ],
    calculation: 'SUM(all transactions by customer) / Unique customers',
    updateFrequency: 'MONTHLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  // Cost Management (11-25)
  {
    id: 11,
    code: 'FIN_COST_001',
    name: 'Cost Per Attendee',
    description: 'Total event costs divided by actual number of attendees',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['item_type = expense'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'SUM(expense line items) / Actual Attendance',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 12,
    code: 'FIN_COST_002',
    name: 'Labor Cost Percentage',
    description: 'Labor costs as a percentage of total event costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = staffing'] },
      { table: 'time_entries', fields: ['total_cost'] }
    ],
    calculation: '(Total Labor Costs / Total Event Costs) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    targetValue: 27.5,
    warningThreshold: 35,
    criticalThreshold: 40,
    enabled: true
  },
  {
    id: 13,
    code: 'FIN_COST_003',
    name: 'Venue Cost Per Attendee',
    description: 'Venue rental costs divided by actual attendance',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = venue-rental'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'Venue Rental Cost / Actual Attendance',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 14,
    code: 'FIN_COST_004',
    name: 'Marketing Cost Percentage',
    description: 'Marketing expenses as a percentage of total event costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = marketing'] },
      { table: 'marketing_campaigns', fields: ['actual_spend'] }
    ],
    calculation: '(Total Marketing Costs / Total Event Costs) × 100',
    updateFrequency: 'WEEKLY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    targetValue: 17.5,
    warningThreshold: 25,
    criticalThreshold: 30,
    enabled: true
  },
  {
    id: 15,
    code: 'FIN_COST_005',
    name: 'Production Cost Per Hour',
    description: 'Production-related costs divided by total event duration',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = production'] },
      { table: 'events', fields: ['event_start_date', 'event_end_date'] }
    ],
    calculation: 'Production Costs / Event Duration Hours',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 16,
    code: 'FIN_COST_006',
    name: 'Overtime Hours Percentage',
    description: 'Percentage of labor hours that were overtime',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'time_entries', fields: ['duration_minutes', 'work_type'] },
      { table: 'staff_assignments', fields: ['actual_hours', 'overtime_hours'] }
    ],
    calculation: '(Total Overtime Hours / Total Hours Worked) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    warningThreshold: 15,
    criticalThreshold: 25,
    enabled: true
  },
  {
    id: 17,
    code: 'FIN_COST_007',
    name: 'Budget Variance Percentage',
    description: 'Percentage difference between budgeted and actual costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [{ table: 'budget_line_items', fields: ['budgeted_amount', 'actual_amount'] }],
    calculation: '((Actual - Budgeted) / Budgeted) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'BAR_CHART'],
    targetValue: 0,
    warningThreshold: 10,
    criticalThreshold: 20,
    enabled: true
  },
  {
    id: 18,
    code: 'FIN_COST_008',
    name: 'Cost Per Lead',
    description: 'Marketing spend divided by total leads generated',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'marketing_campaigns', fields: ['actual_spend', 'leads_generated'] }],
    calculation: 'Total Marketing Spend / Total Leads',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 19,
    code: 'FIN_COST_009',
    name: 'Break-Even Attendance',
    description: 'Number of attendees required to cover all fixed costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'COUNT',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['budgeted_amount'], filters: ['cost_type = fixed'] },
      { table: 'ticket_tiers', fields: ['price'] }
    ],
    calculation: 'Fixed Costs / (Average Ticket Price - Variable Cost Per Attendee)',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  {
    id: 20,
    code: 'FIN_COST_010',
    name: 'Cash Flow Cycle Time',
    description: 'Average days from initial deposit to final payment',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'DAYS',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['processed_at', 'completed_at'] },
      { table: 'contracts', fields: ['deposit_due_date', 'final_payment_due_date'] }
    ],
    calculation: 'AVG(final_payment_date - deposit_date)',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 21,
    code: 'FIN_COST_011',
    name: 'Vendor Cost Efficiency',
    description: 'Percentage of vendor costs that came in at or under budget',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'budget_line_items', fields: ['budgeted_amount', 'actual_amount'], filters: ['category LIKE vendor%'] }],
    calculation: '(Budgeted Vendor Costs / Actual Vendor Costs) × 100',
    updateFrequency: 'WEEKLY',
    visualizations: ['GAUGE'],
    targetValue: 100,
    warningThreshold: 90,
    criticalThreshold: 80,
    enabled: true
  },
  {
    id: 22,
    code: 'FIN_COST_012',
    name: 'Insurance Cost Per Attendee',
    description: 'Total insurance costs divided by attendance',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = insurance'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'Insurance Costs / Actual Attendance',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 23,
    code: 'FIN_COST_013',
    name: 'Permit and License Cost Percentage',
    description: 'Permits and licenses as percentage of total costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = permits-licenses'] }],
    calculation: '(Permit Costs / Total Costs) × 100',
    updateFrequency: 'WEEKLY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 24,
    code: 'FIN_COST_014',
    name: 'Transportation Cost Per Mile',
    description: 'Transportation costs divided by total miles traveled',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = transportation'] }],
    calculation: 'Transportation Costs / Total Miles',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 25,
    code: 'FIN_COST_015',
    name: 'Accommodation Cost Per Night',
    description: 'Average accommodation cost per night across all bookings',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'COST_MANAGEMENT',
    unit: 'CURRENCY',
    targetDirection: 'TARGET_RANGE',
    dataSources: [{ table: 'budget_line_items', fields: ['actual_amount'], filters: ['category = accommodations'] }],
    calculation: 'Total Accommodation Costs / Total Room Nights',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER'],
    enabled: true
  },
  // Profitability (26-45)
  {
    id: 26,
    code: 'FIN_PROF_001',
    name: 'Profit Margin Percentage',
    description: 'Net profit as a percentage of total revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '((Total Revenue - Total Costs) / Total Revenue) × 100',
    dependencies: ['FIN_REV_001'],
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    targetValue: 15,
    warningThreshold: 10,
    criticalThreshold: 5,
    enabled: true
  },
  {
    id: 27,
    code: 'FIN_PROF_002',
    name: 'Revenue Per Available Hour',
    description: 'Total revenue divided by event duration in hours',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'events', fields: ['event_start_date', 'event_end_date'] }
    ],
    calculation: 'Total Revenue / Event Duration Hours',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  {
    id: 28,
    code: 'FIN_PROF_003',
    name: 'Return on Investment (ROI)',
    description: 'Net profit divided by total investment, expressed as percentage',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '((Total Revenue - Total Costs) / Total Costs) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'TREND_INDICATOR'],
    enabled: true
  },
  {
    id: 29,
    code: 'FIN_PROF_004',
    name: 'EBITDA Margin',
    description: 'Earnings before interest, taxes, depreciation, and amortization as percentage of revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '(EBITDA / Total Revenue) × 100',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 30,
    code: 'FIN_PROF_005',
    name: 'Gross Profit Margin',
    description: 'Revenue minus cost of goods sold, divided by revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['cost_type = direct'] }
    ],
    calculation: '((Revenue - COGS) / Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 31,
    code: 'FIN_PROF_006',
    name: 'Operating Profit Margin',
    description: 'Operating profit divided by revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['cost_type = operating'] }
    ],
    calculation: '(Operating Profit / Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 32,
    code: 'FIN_PROF_007',
    name: 'Revenue Per Square Foot',
    description: 'Total revenue divided by venue square footage',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'venues', fields: ['total_square_footage'] }
    ],
    calculation: 'Total Revenue / Venue Square Footage',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  {
    id: 33,
    code: 'FIN_PROF_008',
    name: 'Contribution Margin',
    description: 'Revenue minus variable costs, divided by revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'], filters: ['cost_type = variable'] }
    ],
    calculation: '((Revenue - Variable Costs) / Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 34,
    code: 'FIN_PROF_009',
    name: 'Net Profit Per Attendee',
    description: 'Total net profit divided by actual attendance',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: '(Total Revenue - Total Costs) / Actual Attendance',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 35,
    code: 'FIN_PROF_010',
    name: 'Profit Per Hour',
    description: 'Net profit divided by event duration',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] },
      { table: 'events', fields: ['event_start_date', 'event_end_date'] }
    ],
    calculation: 'Net Profit / Event Duration Hours',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 36,
    code: 'FIN_PROF_011',
    name: 'Gross Revenue Multiple',
    description: 'Total revenue as multiple of initial investment',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'RATIO',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: 'Total Revenue / Initial Investment',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 37,
    code: 'FIN_PROF_012',
    name: 'Payback Period',
    description: 'Days required to recover initial investment',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'DAYS',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount', 'processed_at'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: 'Days until cumulative revenue exceeds investment',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 38,
    code: 'FIN_PROF_013',
    name: 'Profit Variance from Target',
    description: 'Difference between actual and targeted profit',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] },
      { table: 'events', fields: ['target_profit_margin'] }
    ],
    calculation: 'Actual Profit - Target Profit',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 39,
    code: 'FIN_PROF_014',
    name: 'Revenue Concentration Index',
    description: 'Measure of revenue diversification across streams',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'INDEX',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['transaction_type', 'total_amount'] }],
    calculation: 'Herfindahl-Hirschman Index',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 40,
    code: 'FIN_PROF_015',
    name: 'Cost Efficiency Ratio',
    description: 'Value delivered per dollar spent',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'RATIO',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: 'Total Revenue / Total Costs',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 41,
    code: 'FIN_PROF_016',
    name: 'Fixed Cost Coverage Ratio',
    description: 'Contribution margin divided by fixed costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'RATIO',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount', 'cost_type'] }
    ],
    calculation: '(Revenue - Variable Costs) / Fixed Costs',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    targetValue: 1.5,
    warningThreshold: 1.2,
    criticalThreshold: 1.0,
    enabled: true
  },
  {
    id: 42,
    code: 'FIN_PROF_017',
    name: 'Operating Leverage',
    description: 'Percentage change in operating income per percentage change in revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'RATIO',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '% Change in Operating Income / % Change in Revenue',
    updateFrequency: 'QUARTERLY',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 43,
    code: 'FIN_PROF_018',
    name: 'Break-Even Point',
    description: 'Revenue level required to cover all costs',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'CURRENCY',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'budget_line_items', fields: ['budgeted_amount', 'cost_type'] },
      { table: 'ticket_tiers', fields: ['price'] }
    ],
    calculation: 'Fixed Costs / (1 - (Variable Costs / Revenue))',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 44,
    code: 'FIN_PROF_019',
    name: 'Safety Margin',
    description: 'Percentage by which actual revenue exceeds break-even',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount'] }],
    calculation: '((Actual Revenue - Break-Even Revenue) / Actual Revenue) × 100',
    dependencies: ['FIN_PROF_018'],
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 45,
    code: 'FIN_PROF_020',
    name: 'Return on Marketing Investment',
    description: 'Revenue attributed to marketing divided by marketing spend',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'RATIO',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'marketing_campaigns', fields: ['actual_spend', 'actual_revenue'] }
    ],
    calculation: 'Marketing-Attributed Revenue / Marketing Spend',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  }
];

/**
 * TICKET & ATTENDANCE KPIs (46-90)
 * Sales Performance (46-70), Capacity & Utilization (71-85), Pricing Optimization (86-90)
 */
export const TICKET_ATTENDANCE_KPIS: KPIDefinition[] = [
  // Sales Performance (46-70)
  {
    id: 46,
    code: 'TKT_SALES_001',
    name: 'Ticket Sales Conversion Rate',
    description: 'Percentage of website visitors who purchased tickets',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['id'], filters: ['status = active'] },
      { table: 'analytics_events', fields: ['visitor_count'] }
    ],
    calculation: '(Tickets Sold / Total Website Visitors) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 47,
    code: 'TKT_SALES_002',
    name: 'Daily Ticket Sales Velocity',
    description: 'Average number of tickets sold per day',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'COUNT',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['id', 'purchase_date'] }],
    calculation: 'Total Tickets Sold / Days in Sales Period',
    updateFrequency: 'DAILY',
    visualizations: ['LINE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 48,
    code: 'TKT_SALES_003',
    name: 'Peak Sales Period',
    description: 'Time period with highest concentration of ticket sales',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'COUNT',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'tickets', fields: ['purchase_date'] }],
    calculation: 'Identify period with maximum sales density',
    updateFrequency: 'DAILY',
    visualizations: ['HEATMAP', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 49,
    code: 'TKT_SALES_004',
    name: 'Ticket Type Distribution',
    description: 'Percentage breakdown of tickets sold by tier',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'tickets', fields: ['tier_id'] },
      { table: 'ticket_tiers', fields: ['tier_name', 'tier_type'] }
    ],
    calculation: '(Tickets per Tier / Total Tickets) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['PIE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 50,
    code: 'TKT_SALES_005',
    name: 'Group Sales Percentage',
    description: 'Percentage of tickets sold as group bookings',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['purchaser_id'] },
      { table: 'ticket_tiers', fields: ['tier_type'], filters: ['tier_type = group'] }
    ],
    calculation: '(Group Tickets / Total Tickets) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    enabled: true
  },
  {
    id: 51,
    code: 'TKT_SALES_006',
    name: 'Discount Redemption Rate',
    description: 'Percentage of tickets sold with discount codes',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [{ table: 'tickets', fields: ['discount_amount'] }],
    calculation: '(Discounted Tickets / Total Tickets) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 52,
    code: 'TKT_SALES_007',
    name: 'Waitlist Conversion Rate',
    description: 'Percentage of waitlisted customers who purchased when capacity opened',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['id', 'metadata'] }],
    calculation: '(Converted from Waitlist / Total Waitlisted) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 53,
    code: 'TKT_SALES_008',
    name: 'Cart Abandonment Rate',
    description: 'Percentage of shopping carts abandoned before purchase completion',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'analytics_events', fields: ['event_name'], filters: ['event_category = conversion'] }],
    calculation: '(Abandoned Carts / Total Carts Created) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    warningThreshold: 70,
    criticalThreshold: 80,
    enabled: true
  },
  {
    id: 54,
    code: 'TKT_SALES_009',
    name: 'Mobile Ticket Sales Percentage',
    description: 'Percentage of tickets purchased via mobile devices',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'tickets', fields: ['id'] },
      { table: 'analytics_events', fields: ['device_type'] }
    ],
    calculation: '(Mobile Purchases / Total Purchases) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['PIE_CHART', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 55,
    code: 'TKT_SALES_010',
    name: 'International Attendee Percentage',
    description: 'Percentage of attendees from outside the country',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'tickets', fields: ['billing_country'] }],
    calculation: '(International Tickets / Total Tickets) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    enabled: true
  },
  {
    id: 56,
    code: 'TKT_SALES_011',
    name: 'Repeat Attendee Rate',
    description: 'Percentage of attendees who have attended previous events',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['purchaser_id'] }],
    calculation: '(Repeat Customers / Total Customers) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 57,
    code: 'TKT_SALES_012',
    name: 'Early Bird Conversion Rate',
    description: 'Percentage of capacity sold during early bird pricing period',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['purchase_date', 'tier_id'] },
      { table: 'ticket_tiers', fields: ['sale_start_date', 'sale_end_date'] },
      { table: 'events', fields: ['total_capacity'] }
    ],
    calculation: '(Early Bird Tickets / Total Capacity) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    enabled: true
  },
  {
    id: 58,
    code: 'TKT_SALES_013',
    name: 'Last-Minute Sales Percentage',
    description: 'Percentage of tickets sold in final 48 hours before event',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['purchase_date'] },
      { table: 'events', fields: ['event_start_date'] }
    ],
    calculation: '(Tickets sold in final 48hrs / Total Tickets) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 59,
    code: 'TKT_SALES_014',
    name: 'Tier Upgrade Rate',
    description: 'Percentage of customers who upgraded ticket tier after initial purchase',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['tier_id', 'metadata'] }],
    calculation: '(Upgraded Tickets / Total Tickets) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 60,
    code: 'TKT_SALES_015',
    name: 'Cross-Sell Conversion Rate',
    description: 'Percentage of ticket buyers who purchased add-ons',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['customer_id', 'transaction_type'] }],
    calculation: '(Customers with Add-ons / Total Ticket Buyers) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 61,
    code: 'TKT_SALES_016',
    name: 'Average Days to Purchase',
    description: 'Average number of days before event that tickets are purchased',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'DAYS',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['purchase_date'] },
      { table: 'events', fields: ['event_start_date'] }
    ],
    calculation: 'AVG(event_start_date - purchase_date)',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'DISTRIBUTION'],
    enabled: true
  },
  {
    id: 62,
    code: 'TKT_SALES_017',
    name: 'Sales by Traffic Source',
    description: 'Ticket sales breakdown by referring source',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'COUNT',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'tickets', fields: ['id'] },
      { table: 'analytics_events', fields: ['utm_source', 'utm_medium'] }
    ],
    calculation: 'COUNT(tickets) GROUP BY traffic_source',
    updateFrequency: 'DAILY',
    visualizations: ['PIE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 63,
    code: 'TKT_SALES_018',
    name: 'Price Sensitivity Index',
    description: 'Correlation between price changes and sales volume',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'INDEX',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'ticket_tiers', fields: ['price'] },
      { table: 'tickets', fields: ['purchase_date'] }
    ],
    calculation: 'Statistical correlation analysis',
    updateFrequency: 'WEEKLY',
    visualizations: ['LINE_CHART', 'SCATTER_PLOT'],
    enabled: true
  },
  {
    id: 64,
    code: 'TKT_SALES_019',
    name: 'Promotional Code Effectiveness',
    description: 'Average incremental sales per promotional code campaign',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'COUNT',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['discount_code', 'discount_amount'] }],
    calculation: 'AVG(tickets per promo code) compared to baseline',
    updateFrequency: 'WEEKLY',
    visualizations: ['BAR_CHART', 'COMPARISON'],
    enabled: true
  },
  {
    id: 65,
    code: 'TKT_SALES_020',
    name: 'Average Purchase Quantity',
    description: 'Average number of tickets purchased per transaction',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'COUNT',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['purchaser_id', 'purchase_date'] }],
    calculation: 'Total Tickets Sold / Total Transactions',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 66,
    code: 'TKT_SALES_021',
    name: 'Revenue Per Transaction',
    description: 'Average revenue generated per ticket purchase transaction',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount'], filters: ['transaction_type = ticket_sale'] }],
    calculation: 'SUM(transaction amounts) / COUNT(transactions)',
    updateFrequency: 'HOURLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 67,
    code: 'TKT_SALES_022',
    name: 'Sales Funnel Conversion Rate',
    description: 'Conversion rate at each stage of ticket purchase funnel',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'sales_funnel', fields: ['stage', 'count', 'conversion_from_previous'] }],
    calculation: '(Stage N completions / Stage N-1 entries) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['FUNNEL'],
    enabled: true
  },
  {
    id: 68,
    code: 'TKT_SALES_023',
    name: 'First-Time Buyer Percentage',
    description: 'Percentage of ticket buyers purchasing from this organization for first time',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'tickets', fields: ['purchaser_id'] }],
    calculation: '(First-time Purchasers / Total Purchasers) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    enabled: true
  },
  {
    id: 69,
    code: 'TKT_SALES_024',
    name: 'Sales Decline Rate',
    description: 'Rate of sales decrease after peak sales period',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['purchase_date'] }],
    calculation: '(Current Day Sales - Peak Day Sales) / Peak Day Sales × 100',
    updateFrequency: 'DAILY',
    visualizations: ['LINE_CHART'],
    enabled: true
  },
  {
    id: 70,
    code: 'TKT_SALES_025',
    name: 'Dynamic Pricing Effectiveness',
    description: 'Revenue increase attributed to dynamic pricing vs. fixed pricing',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'ticket_tiers', fields: ['price'] },
      { table: 'tickets', fields: ['final_price', 'purchase_date'] }
    ],
    calculation: '(Dynamic Revenue - Projected Fixed Revenue) / Projected Fixed Revenue × 100',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  // Capacity & Utilization (71-85)
  {
    id: 71,
    code: 'TKT_CAP_001',
    name: 'Attendance Rate',
    description: 'Percentage of ticket holders who actually attended the event',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'check_ins', fields: ['id'], filters: ['check_in_status = completed'] },
      { table: 'tickets', fields: ['id'], filters: ['ticket_status NOT IN (cancelled, refunded)'] }
    ],
    calculation: '(Checked In Count / Tickets Sold) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'NUMBER'],
    targetValue: 90,
    warningThreshold: 85,
    criticalThreshold: 75,
    enabled: true
  },
  {
    id: 72,
    code: 'TKT_CAP_002',
    name: 'Capacity Utilization Rate',
    description: 'Percentage of total venue capacity that was filled',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'check_ins', fields: ['id'] },
      { table: 'events', fields: ['total_capacity'] }
    ],
    calculation: '(Actual Attendance / Total Capacity) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    enabled: true
  },
  {
    id: 73,
    code: 'TKT_CAP_003',
    name: 'No-Show Rate',
    description: 'Percentage of ticket holders who did not attend',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['id'] },
      { table: 'check_ins', fields: ['ticket_id'] }
    ],
    calculation: '((Tickets Sold - Checked In) / Tickets Sold) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE'],
    warningThreshold: 15,
    criticalThreshold: 25,
    enabled: true
  },
  {
    id: 74,
    code: 'TKT_CAP_004',
    name: 'VIP Area Utilization',
    description: 'Percentage of VIP capacity that was used',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'check_ins', fields: ['id', 'ticket_id'] },
      { table: 'tickets', fields: ['tier_id'] },
      { table: 'events', fields: ['vip_capacity'] }
    ],
    calculation: '(VIP Check-ins / VIP Capacity) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 75,
    code: 'TKT_CAP_005',
    name: 'Time-Based Attendance Distribution',
    description: 'Attendance breakdown by time of day/hour',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'COUNT',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'check_ins', fields: ['checked_in_at'] }],
    calculation: 'COUNT(check_ins) GROUP BY hour/time_block',
    updateFrequency: 'HOURLY',
    visualizations: ['LINE_CHART', 'HEATMAP'],
    enabled: true
  },
  {
    id: 76,
    code: 'TKT_CAP_006',
    name: 'Entry Processing Speed',
    description: 'Average number of attendees processed through entry per minute',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'COUNT',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'check_ins', fields: ['checked_in_at'] }],
    calculation: 'Total Check-ins / Total Check-in Period Minutes',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 77,
    code: 'TKT_CAP_007',
    name: 'Queue Wait Time Average',
    description: 'Average wait time in entry queue',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'MINUTES',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'check_ins', fields: ['checked_in_at'] }],
    calculation: 'Queue theory calculation or direct measurement',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER', 'LINE_CHART'],
    warningThreshold: 15,
    criticalThreshold: 30,
    enabled: true
  },
  {
    id: 78,
    code: 'TKT_CAP_008',
    name: 'Seat Turnover Rate',
    description: 'For multi-session events, average number of different attendees per seat',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'RATIO',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['section', 'row', 'seat_number'] }],
    calculation: 'Unique Attendees per Seat / Total Sessions',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER'],
    enabled: true
  },
  {
    id: 79,
    code: 'TKT_CAP_009',
    name: 'Standing Area Density',
    description: 'Attendees per square meter in standing areas',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'RATIO',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'check_ins', fields: ['check_in_location'] },
      { table: 'venues', fields: ['standing_area_sqm'] }
    ],
    calculation: 'Attendees in Standing Areas / Standing Area Square Meters',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER', 'HEATMAP'],
    enabled: true
  },
  {
    id: 80,
    code: 'TKT_CAP_010',
    name: 'Accessibility Accommodation Rate',
    description: 'Percentage of accessibility requests successfully fulfilled',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'tickets', fields: ['special_requirements'] }],
    calculation: '(Requests Fulfilled / Total Requests) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    targetValue: 100,
    warningThreshold: 95,
    criticalThreshold: 90,
    enabled: true
  },
  {
    id: 81,
    code: 'TKT_CAP_011',
    name: 'Peak Occupancy Time',
    description: 'Time period with maximum concurrent attendance',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'COUNT',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'check_ins', fields: ['checked_in_at'] }],
    calculation: 'Identify time with maximum concurrent attendees',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['LINE_CHART'],
    enabled: true
  },
  {
    id: 82,
    code: 'TKT_CAP_012',
    name: 'Entry Gate Efficiency',
    description: 'Comparison of processing speed across different entry gates',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'COUNT',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'check_ins', fields: ['check_in_gate', 'checked_in_at'] }],
    calculation: 'COUNT(check_ins per gate) / Time Period',
    updateFrequency: 'REAL_TIME',
    visualizations: ['BAR_CHART', 'COMPARISON'],
    enabled: true
  },
  {
    id: 83,
    code: 'TKT_CAP_013',
    name: 'Re-Entry Rate',
    description: 'Percentage of attendees who exited and re-entered',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'check_ins', fields: ['ticket_id', 'checked_in_at'] }],
    calculation: '(Tickets with Multiple Check-ins / Total Tickets) × 100',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 84,
    code: 'TKT_CAP_014',
    name: 'Early Departure Rate',
    description: 'Percentage of attendees who left before official end time',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'survey_responses', fields: ['departure_time'] }],
    calculation: '(Early Departures / Total Attendees) × 100',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['GAUGE'],
    enabled: true
  },
  {
    id: 85,
    code: 'TKT_CAP_015',
    name: 'Capacity Warning Threshold Breaches',
    description: 'Number of times occupancy exceeded safe capacity limits',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'COUNT',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [{ table: 'check_ins', fields: ['checked_in_at'] }],
    calculation: 'COUNT(instances where concurrent > max_safe_capacity)',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER'],
    targetValue: 0,
    warningThreshold: 1,
    criticalThreshold: 3,
    enabled: true
  },
  // Pricing Optimization (86-90)
  {
    id: 86,
    code: 'TKT_PRICE_001',
    name: 'Average Ticket Price',
    description: 'Average price per ticket sold across all tiers',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'CURRENCY',
    targetDirection: 'INFORMATIONAL',
    dataSources: [{ table: 'tickets', fields: ['final_price'] }],
    calculation: 'SUM(final_price) / COUNT(tickets)',
    updateFrequency: 'HOURLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 87,
    code: 'TKT_PRICE_002',
    name: 'Sell-Through Rate',
    description: 'Percentage of total capacity that has been sold',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['id'], filters: ['ticket_status IN (sold, active)'] },
      { table: 'events', fields: ['total_capacity'] }
    ],
    calculation: '(Tickets Sold / Total Capacity) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    enabled: true
  },
  {
    id: 88,
    code: 'TKT_PRICE_003',
    name: 'Price Elasticity',
    description: 'Percentage change in sales volume per percentage change in price',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'RATIO',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'ticket_tiers', fields: ['price'] },
      { table: 'tickets', fields: ['id', 'purchase_date'] }
    ],
    calculation: '(% Change in Quantity / % Change in Price)',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'SCATTER_PLOT'],
    enabled: true
  },
  {
    id: 89,
    code: 'TKT_PRICE_004',
    name: 'Optimal Price Point',
    description: 'Price point that maximizes total revenue',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'CURRENCY',
    targetDirection: 'INFORMATIONAL',
    dataSources: [
      { table: 'ticket_tiers', fields: ['price'] },
      { table: 'tickets', fields: ['final_price'] }
    ],
    calculation: 'Revenue maximization analysis across price points',
    updateFrequency: 'WEEKLY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 90,
    code: 'TKT_PRICE_005',
    name: 'Dynamic Pricing Uplift',
    description: 'Revenue increase from dynamic pricing vs. static pricing baseline',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'ticket_tiers', fields: ['price'] },
      { table: 'tickets', fields: ['final_price'] }
    ],
    calculation: '((Dynamic Revenue - Static Baseline) / Static Baseline) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  }
];

/**
 * Master KPI List - All 200 KPIs
 * Complete implementation of all metrics from the master specification
 */
export const KPI_MASTER_LIST: KPIDefinition[] = [
  ...FINANCIAL_KPIS,
  ...TICKET_ATTENDANCE_KPIS,
  ...OPERATIONAL_KPIS,
  ...MARKETING_KPIS,
  ...CUSTOMER_EXPERIENCE_KPIS
];

/**
 * KPI Lookup by Code
 */
export const KPI_BY_CODE = KPI_MASTER_LIST.reduce((acc, kpi) => {
  acc[kpi.code] = kpi;
  return acc;
}, {} as Record<string, KPIDefinition>);

/**
 * KPI Lookup by ID
 */
export const KPI_BY_ID = KPI_MASTER_LIST.reduce((acc, kpi) => {
  acc[kpi.id] = kpi;
  return acc;
}, {} as Record<number, KPIDefinition>);

/**
 * Get KPIs by Category
 */
export function getKPIsByCategory(category: string): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.category === category && kpi.enabled !== false);
}

/**
 * Get KPIs by Subcategory
 */
export function getKPIsBySubcategory(subcategory: string): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.subcategory === subcategory && kpi.enabled !== false);
}

/**
 * Get KPI by Code
 */
export function getKPIByCode(code: string): KPIDefinition | undefined {
  return KPI_BY_CODE[code];
}

/**
 * Get KPI by ID
 */
export function getKPIById(id: number): KPIDefinition | undefined {
  return KPI_BY_ID[id];
}

/**
 * Get all enabled KPIs
 */
export function getEnabledKPIs(): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.enabled !== false);
}
