# KPI Master List Implementation Guide

## Overview

The KPI Master List is a comprehensive, prebuilt analytics and reporting system for ATLVS that provides 200 preconfigured KPI metrics organized across 5 major categories. This system enables powerful data-driven insights and decision-making for live entertainment production and event management.

## Architecture

### Components

1. **KPI Definitions Library** (`packages/config/kpi-definitions.ts`)
   - Complete catalog of 200 KPI metrics
   - Structured by category and subcategory
   - Includes calculation methods, data sources, and visualization types
   
2. **Database Schema** (`supabase/migrations/0031_kpi_tracking_system.sql`)
   - `kpi_data_points`: Historical KPI data storage
   - `kpi_reports`: Pre-configured and custom report definitions
   - `kpi_targets`: Target values and thresholds
   - Analytics views for aggregations and summaries

3. **API Routes** (`apps/atlvs/src/app/api/kpi/`)
   - `/api/kpi` - Get KPI definitions
   - `/api/kpi/[code]` - Get specific KPI details
   - `/api/kpi/data` - Get/post KPI data points
   - `/api/kpi/trend/[code]` - Get trend analysis
   - `/api/kpi/reports` - Manage KPI reports

4. **UI Components** (`apps/atlvs/src/app/analytics/kpi/`)
   - Main KPI Library browser
   - Individual KPI detail views
   - Trend visualization
   - Report management

5. **Analytics Client** (`packages/config/kpi-client.ts`)
   - Helper functions for KPI operations
   - Integrated with main analytics client

## KPI Categories

### 1. Financial Performance (45 KPIs)
- **Revenue Metrics** (10 KPIs): Total revenue, per capita spending, VIP revenue, merchandise, F&B, sponsorship, etc.
- **Cost Management** (15 KPIs): Cost per attendee, labor costs, budget variance, vendor efficiency, etc.
- **Profitability** (20 KPIs): Profit margin, ROI, EBITDA, break-even point, revenue multiples, etc.

### 2. Ticket & Attendance Analytics (45 KPIs)
- **Sales Performance** (25 KPIs): Conversion rates, ticket velocity, discount redemption, cart abandonment, etc.
- **Capacity Utilization** (15 KPIs): Attendance rate, no-show rate, capacity utilization, entry processing speed, etc.
- **Pricing Optimization** (5 KPIs): Average ticket price, sell-through rate, price elasticity, optimal pricing, etc.

### 3. Operational Efficiency (55 KPIs)
- **Project Management** (20 KPIs): Schedule adherence, milestone completion, task velocity, risk mitigation, etc.
- **Team Performance** (20 KPIs): Staff utilization, satisfaction, training completion, productivity, retention, etc.
- **Vendor & Supply Chain** (15 KPIs): Vendor reliability, lead times, contract compliance, quality metrics, etc.

### 4. Marketing & Audience Engagement (30 KPIs)
- **Digital Marketing** (10 KPIs): Social media engagement, website conversion, email performance, paid ad ROAS, etc.
- **Audience Insights** (10 KPIs): Net Promoter Score, demographics, geographic reach, discovery methods, etc.
- **Brand Experience** (10 KPIs): Brand awareness, sentiment, media impressions, user-generated content, virality, etc.

### 5. Customer Experience & Satisfaction (25 KPIs)
- **Experience Quality** (15 KPIs): Overall satisfaction, venue rating, sound/visual quality, F&B service, etc.
- **Customer Service** (10 KPIs): Support ticket resolution time, complaint rate, refund rate, self-service success, etc.

## Usage

### Recording KPI Data Points

```typescript
import { recordKPIDataPoint } from '@ghxstship/config/kpi-client';

await recordKPIDataPoint(supabase, {
  kpi_code: 'FIN_REV_001',
  kpi_name: 'Total Event Revenue',
  value: 125000.50,
  unit: 'CURRENCY',
  project_id: 'project-uuid',
  event_id: 'event-uuid',
  period_start: '2025-01-01',
  period_end: '2025-01-31',
  metadata: { source: 'ticket_sales', region: 'north_america' }
});
```

### Getting KPI Trend Data

```typescript
import { getKPITrend } from '@ghxstship/config/kpi-client';

const trendData = await getKPITrend(supabase, 'FIN_PROF_001', 90); // 90 days
```

### Creating Custom Reports

```typescript
import { createKPIReport } from '@ghxstship/config/kpi-client';

const report = await createKPIReport(supabase, {
  name: 'Q1 Financial Overview',
  description: 'Quarterly financial performance metrics',
  kpi_codes: ['FIN_REV_001', 'FIN_PROF_001', 'FIN_PROF_003'],
  category: 'FINANCIAL_PERFORMANCE',
  filters: { quarter: 'Q1', year: 2025 }
});
```

### Browsing KPI Library

Navigate to `/analytics/kpi` in ATLVS to:
- Browse all 200 KPI definitions
- Filter by category/subcategory
- View preconfigured reports
- Access individual KPI details and trends

## Global Preconfigured Reports

The system includes **200 individual global reports**, one dedicated report for each KPI in the master list:

### Financial Performance (45 Reports)
- Total Event Revenue Report
- Per Capita Spending Report
- VIP Revenue Report
- Merchandise Revenue Report
- F&B Revenue Report
- ... and 40 more financial reports

### Ticket & Attendance (45 Reports)
- Ticket Sales Conversion Report
- Cart Abandonment Rate Report
- Ticket Sales Velocity Report
- Average Transaction Value Report
- ... and 41 more ticket reports

### Operational Efficiency (55 Reports)
- Schedule Adherence Report
- Milestone Completion Report
- Task Completion Report
- On-Time Delivery Report
- ... and 51 more operational reports

### Marketing & Engagement (30 Reports)
- Social Media Engagement Report
- Follower Growth Rate Report
- Social Media Reach Report
- ... and 27 more marketing reports

### Customer Experience (25 Reports)
- Overall Satisfaction Score Report
- Venue Rating Report
- Sound Quality Rating Report
- ... and 22 more customer experience reports

**Each report provides focused analytics for its specific KPI with trend analysis, targets, and thresholds.**

## Data Sources

KPIs pull data from multiple tables:
- `transactions` - Revenue and financial data
- `tickets` / `check_ins` - Attendance and ticketing data
- `budget_line_items` - Cost and expense data
- `project_milestones` / `tasks` - Project management data
- `staff_assignments` / `time_entries` - Team performance data
- `vendor_deliverables` - Vendor and supply chain data
- `survey_responses` - Customer satisfaction data
- `marketing_campaigns` / `social_media_posts` - Marketing data

## Calculation Frequency

- **Real-time**: Transactions, ticket sales, check-ins
- **Hourly**: Marketing campaigns, web analytics
- **Daily**: Budget metrics, task completion, vendor performance
- **Weekly**: Staff metrics, vendor relationships
- **After Event**: Survey-based KPIs, final reconciliation

## Thresholds and Alerts

Each KPI can have:
- **Target Value**: Desired performance level
- **Warning Threshold**: Trigger for attention
- **Critical Threshold**: Trigger for immediate action

Example:
```typescript
{
  kpi_code: 'TKT_CAP_001',
  targetValue: 90,      // 90% attendance rate target
  warningThreshold: 85, // Warning at 85%
  criticalThreshold: 75 // Critical at 75%
}
```

## Extending the System

### Adding New KPIs

1. Add definition to `kpi-definitions.ts`:
```typescript
{
  id: 201,
  code: 'CUSTOM_001',
  name: 'Custom Metric Name',
  description: 'Metric description',
  category: 'OPERATIONAL_EFFICIENCY',
  subcategory: 'PROJECT_MANAGEMENT',
  unit: 'PERCENTAGE',
  targetDirection: 'HIGHER_IS_BETTER',
  dataSources: [{ table: 'source_table', fields: ['field_name'] }],
  calculation: 'Calculation formula',
  updateFrequency: 'DAILY',
  visualizations: ['GAUGE', 'LINE_CHART'],
  enabled: true
}
```

2. Record data points via API or client function

3. KPI automatically appears in library and can be added to reports

### Custom Calculations

Use database functions or API routes to implement complex KPI calculations that require joins, aggregations, or business logic.

## Best Practices

1. **Regular Updates**: Configure automated jobs to calculate and record KPI values
2. **Data Quality**: Ensure source data is accurate and complete
3. **Meaningful Thresholds**: Set realistic targets and thresholds based on historical data
4. **Report Customization**: Create custom reports for specific stakeholder needs
5. **Trend Analysis**: Monitor KPIs over time to identify patterns and trends
6. **Action Items**: Use thresholds to trigger alerts and action items
7. **Documentation**: Keep calculation methods and data sources well-documented

## API Reference

### GET `/api/kpi`
Query parameters:
- `category` - Filter by KPI category
- `subcategory` - Filter by KPI subcategory
- `enabled` - Filter by enabled status

### GET `/api/kpi/[code]`
Get specific KPI definition by code

### GET `/api/kpi/data`
Query parameters:
- `kpi_code` - Filter by KPI code
- `project_id` - Filter by project
- `event_id` - Filter by event
- `days` - Filter by number of days
- `limit` - Limit results

### POST `/api/kpi/data`
Record new KPI data point

### GET `/api/kpi/trend/[code]`
Query parameters:
- `days` - Trend period (default: 30)
- `project_id` - Filter by project

### GET `/api/kpi/reports`
Query parameters:
- `category` - Filter by category
- `global` - Show only global reports

### POST `/api/kpi/reports`
Create custom KPI report

## Database Functions

### `record_kpi_data_point()`
Records a new KPI data point with automatic organization context

### `get_kpi_trend()`
Retrieves trend data with targets and thresholds

### `analytics.refresh_kpi_views()`
Refreshes materialized views for KPI analytics

## Visualization Types

Available visualization types for KPIs:
- `NUMBER` - Single value display
- `GAUGE` - Gauge chart with thresholds
- `LINE_CHART` - Time series trend
- `BAR_CHART` - Category comparison
- `PIE_CHART` - Part-to-whole
- `AREA_CHART` - Stacked trends
- `SCATTER_PLOT` - Correlation analysis
- `HEATMAP` - Density visualization
- `FUNNEL` - Conversion funnel
- `PROGRESS_BAR` - Goal progress
- `COMPARISON` - Before/after comparison
- `TREND_INDICATOR` - Directional indicator
- `DISTRIBUTION` - Value distribution

## Support

For issues, enhancements, or questions about the KPI system:
- Review this guide and the code documentation
- Check example implementations in `/apps/atlvs/src/app/analytics/kpi`
- Refer to the KPI master list specification at `/KPIMasterList`

## Future Enhancements

Planned features:
- Real-time KPI dashboards
- Automated KPI calculation jobs
- Advanced charting library integration
- Export to Excel/PDF
- KPI forecasting and predictions
- Custom alert configurations
- Mobile KPI monitoring app
- API webhooks for KPI thresholds
- Multi-organization KPI benchmarking

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Total KPIs**: 200
**Status**: Production Ready ✓
