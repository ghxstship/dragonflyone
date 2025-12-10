import { describe, it, expect } from 'vitest';
import type {
  WidgetType,
  WidgetSize,
  WidgetConfig,
  Dashboard,
  WidgetDataSource,
} from '../custom-dashboards';

describe('custom-dashboards', () => {
  describe('WidgetType', () => {
    it('should include all widget types', () => {
      const types: WidgetType[] = [
        'kpi_card',
        'line_chart',
        'bar_chart',
        'pie_chart',
        'table',
        'list',
        'calendar',
        'timeline',
        'gauge',
        'progress',
        'activity_feed',
        'recent_items',
      ];
      expect(types.length).toBe(12);
    });

    it('should include chart types', () => {
      const chartTypes: WidgetType[] = ['line_chart', 'bar_chart', 'pie_chart'];
      expect(chartTypes.length).toBe(3);
    });

    it('should include data display types', () => {
      const dataTypes: WidgetType[] = ['table', 'list', 'activity_feed', 'recent_items'];
      expect(dataTypes.length).toBe(4);
    });

    it('should include metric types', () => {
      const metricTypes: WidgetType[] = ['kpi_card', 'gauge', 'progress'];
      expect(metricTypes.length).toBe(3);
    });
  });

  describe('WidgetSize', () => {
    it('should include all sizes', () => {
      const sizes: WidgetSize[] = ['small', 'medium', 'large', 'full'];
      expect(sizes.length).toBe(4);
    });
  });

  describe('WidgetConfig interface', () => {
    it('should have all required fields', () => {
      const widget: WidgetConfig = {
        id: 'widget-123',
        type: 'kpi_card',
        title: 'Total Revenue',
        size: 'medium',
        position: { x: 0, y: 0 },
        data_source: 'revenue_query',
      };

      expect(widget.id).toBe('widget-123');
      expect(widget.type).toBe('kpi_card');
      expect(widget.title).toBe('Total Revenue');
      expect(widget.size).toBe('medium');
      expect(widget.position.x).toBe(0);
      expect(widget.data_source).toBe('revenue_query');
    });

    it('should support optional filters', () => {
      const widget: WidgetConfig = {
        id: 'widget-123',
        type: 'bar_chart',
        title: 'Sales by Region',
        size: 'large',
        position: { x: 1, y: 0 },
        data_source: 'sales_by_region',
        filters: {
          date_range: 'last_30_days',
          region: ['US', 'EU'],
        },
      };

      expect(widget.filters?.date_range).toBe('last_30_days');
      expect(widget.filters?.region).toContain('US');
    });

    it('should support optional settings', () => {
      const widget: WidgetConfig = {
        id: 'widget-123',
        type: 'line_chart',
        title: 'Trend Analysis',
        size: 'large',
        position: { x: 0, y: 1 },
        data_source: 'trend_data',
        settings: {
          show_legend: true,
          color_scheme: 'blue',
          animate: true,
        },
      };

      expect(widget.settings?.show_legend).toBe(true);
      expect(widget.settings?.color_scheme).toBe('blue');
    });

    it('should support refresh interval', () => {
      const widget: WidgetConfig = {
        id: 'widget-123',
        type: 'activity_feed',
        title: 'Recent Activity',
        size: 'medium',
        position: { x: 2, y: 0 },
        data_source: 'activity_stream',
        refresh_interval: 30,
      };

      expect(widget.refresh_interval).toBe(30);
    });
  });

  describe('Dashboard interface', () => {
    it('should have all required fields', () => {
      const dashboard: Dashboard = {
        id: 'dash-123',
        user_id: 'user-456',
        name: 'My Dashboard',
        is_default: true,
        is_public: false,
        layout: 'grid',
        widgets: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(dashboard.id).toBe('dash-123');
      expect(dashboard.user_id).toBe('user-456');
      expect(dashboard.name).toBe('My Dashboard');
      expect(dashboard.is_default).toBe(true);
      expect(dashboard.layout).toBe('grid');
    });

    it('should support optional description', () => {
      const dashboard: Dashboard = {
        id: 'dash-123',
        user_id: 'user-456',
        name: 'Executive Dashboard',
        description: 'High-level overview of key metrics',
        is_default: false,
        is_public: true,
        layout: 'flex',
        widgets: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(dashboard.description).toBe('High-level overview of key metrics');
    });

    it('should support multiple widgets', () => {
      const dashboard: Dashboard = {
        id: 'dash-123',
        user_id: 'user-456',
        name: 'Analytics Dashboard',
        is_default: false,
        is_public: false,
        layout: 'grid',
        widgets: [
          {
            id: 'w1',
            type: 'kpi_card',
            title: 'Revenue',
            size: 'small',
            position: { x: 0, y: 0 },
            data_source: 'revenue',
          },
          {
            id: 'w2',
            type: 'line_chart',
            title: 'Trend',
            size: 'large',
            position: { x: 1, y: 0 },
            data_source: 'trend',
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(dashboard.widgets.length).toBe(2);
      expect(dashboard.widgets[0].type).toBe('kpi_card');
      expect(dashboard.widgets[1].type).toBe('line_chart');
    });

    it('should support all layout types', () => {
      const layouts: Dashboard['layout'][] = ['grid', 'flex', 'custom'];
      expect(layouts.length).toBe(3);
    });
  });

  describe('WidgetDataSource interface', () => {
    it('should have all required fields', () => {
      const dataSource: WidgetDataSource = {
        id: 'ds-123',
        name: 'Revenue Query',
        type: 'query',
        config: {
          table: 'finance_revenue',
          aggregation: 'sum',
          field: 'amount',
        },
      };

      expect(dataSource.id).toBe('ds-123');
      expect(dataSource.name).toBe('Revenue Query');
      expect(dataSource.type).toBe('query');
      expect(dataSource.config.table).toBe('finance_revenue');
    });

    it('should support function type', () => {
      const dataSource: WidgetDataSource = {
        id: 'ds-456',
        name: 'Dashboard Metrics',
        type: 'function',
        config: {
          function_name: 'get_dashboard_metrics',
          params: { org_id: 'org-123' },
        },
      };

      expect(dataSource.type).toBe('function');
      expect(dataSource.config.function_name).toBe('get_dashboard_metrics');
    });

    it('should support api type', () => {
      const dataSource: WidgetDataSource = {
        id: 'ds-789',
        name: 'External API',
        type: 'api',
        config: {
          endpoint: 'https://api.example.com/metrics',
          method: 'GET',
          headers: { 'Authorization': 'Bearer token' },
        },
      };

      expect(dataSource.type).toBe('api');
      expect(dataSource.config.endpoint).toContain('api.example.com');
    });
  });
});
