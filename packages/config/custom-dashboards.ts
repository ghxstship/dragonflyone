/**
 * Custom Dashboard Builder System
 * Allows users to create personalized dashboards with configurable widgets
 */

import { createClient } from '@supabase/supabase-js';

export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'timeline'
  | 'gauge'
  | 'progress'
  | 'activity_feed'
  | 'recent_items';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  data_source: string;
  filters?: Record<string, any>;
  settings?: Record<string, any>;
  refresh_interval?: number; // seconds
}

export interface Dashboard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_public: boolean;
  layout: 'grid' | 'flex' | 'custom';
  widgets: WidgetConfig[];
  created_at: string;
  updated_at: string;
}

export interface WidgetDataSource {
  id: string;
  name: string;
  type: 'query' | 'function' | 'api';
  config: Record<string, any>;
}

/**
 * Custom Dashboard Manager
 * Handles dashboard creation, widget management, and data fetching
 */
export class DashboardManager {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Create a new dashboard
   */
  async createDashboard(
    userId: string,
    dashboard: {
      name: string;
      description?: string;
      layout?: 'grid' | 'flex' | 'custom';
      is_default?: boolean;
      is_public?: boolean;
    }
  ): Promise<{ success: boolean; dashboard?: Dashboard; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          name: dashboard.name,
          description: dashboard.description,
          layout: dashboard.layout || 'grid',
          is_default: dashboard.is_default || false,
          is_public: dashboard.is_public || false,
          widgets: [],
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        dashboard: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description,
          is_default: data.is_default,
          is_public: data.is_public,
          layout: data.layout,
          widgets: data.widgets,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's dashboards
   */
  async getUserDashboards(userId: string): Promise<Dashboard[]> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      description: d.description,
      is_default: d.is_default,
      is_public: d.is_public,
      layout: d.layout,
      widgets: d.widgets,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  }

  /**
   * Get default dashboard for user
   */
  async getDefaultDashboard(userId: string): Promise<Dashboard | null> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      is_default: data.is_default,
      is_public: data.is_public,
      layout: data.layout,
      widgets: data.widgets,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(
    dashboardId: string,
    widget: Omit<WidgetConfig, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current dashboard
      const { data: dashboard, error: fetchError } = await this.supabase
        .from('dashboard_widgets')
        .select('widgets')
        .eq('id', dashboardId)
        .single();

      if (fetchError || !dashboard) {
        return { success: false, error: 'Dashboard not found' };
      }

      // Generate widget ID
      const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add widget to array
      const updatedWidgets = [
        ...(dashboard.widgets || []),
        { id: widgetId, ...widget },
      ];

      // Update dashboard
      const { error: updateError } = await this.supabase
        .from('dashboard_widgets')
        .update({ widgets: updatedWidgets })
        .eq('id', dashboardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update widget configuration
   */
  async updateWidget(
    dashboardId: string,
    widgetId: string,
    updates: Partial<WidgetConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: dashboard, error: fetchError } = await this.supabase
        .from('dashboard_widgets')
        .select('widgets')
        .eq('id', dashboardId)
        .single();

      if (fetchError || !dashboard) {
        return { success: false, error: 'Dashboard not found' };
      }

      const widgetIndex = dashboard.widgets.findIndex((w: any) => w.id === widgetId);
      if (widgetIndex === -1) {
        return { success: false, error: 'Widget not found' };
      }

      // Update widget
      const updatedWidgets = [...dashboard.widgets];
      updatedWidgets[widgetIndex] = {
        ...updatedWidgets[widgetIndex],
        ...updates,
      };

      const { error: updateError } = await this.supabase
        .from('dashboard_widgets')
        .update({ widgets: updatedWidgets })
        .eq('id', dashboardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove widget from dashboard
   */
  async removeWidget(
    dashboardId: string,
    widgetId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: dashboard, error: fetchError } = await this.supabase
        .from('dashboard_widgets')
        .select('widgets')
        .eq('id', dashboardId)
        .single();

      if (fetchError || !dashboard) {
        return { success: false, error: 'Dashboard not found' };
      }

      const updatedWidgets = dashboard.widgets.filter((w: any) => w.id !== widgetId);

      const { error: updateError } = await this.supabase
        .from('dashboard_widgets')
        .update({ widgets: updatedWidgets })
        .eq('id', dashboardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reorder widgets
   */
  async reorderWidgets(
    dashboardId: string,
    widgetOrder: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: dashboard, error: fetchError } = await this.supabase
        .from('dashboard_widgets')
        .select('widgets')
        .eq('id', dashboardId)
        .single();

      if (fetchError || !dashboard) {
        return { success: false, error: 'Dashboard not found' };
      }

      // Reorder based on provided order
      const widgetMap = new Map(dashboard.widgets.map((w: any) => [w.id, w]));
      const reorderedWidgets = widgetOrder
        .map((id) => widgetMap.get(id))
        .filter(Boolean);

      const { error: updateError } = await this.supabase
        .from('dashboard_widgets')
        .update({ widgets: reorderedWidgets })
        .eq('id', dashboardId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Set dashboard as default
   */
  async setDefaultDashboard(
    userId: string,
    dashboardId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Unset current default
      await this.supabase
        .from('dashboard_widgets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      // Set new default
      const { error } = await this.supabase
        .from('dashboard_widgets')
        .update({ is_default: true })
        .eq('id', dashboardId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Duplicate dashboard
   */
  async duplicateDashboard(
    dashboardId: string,
    newName: string
  ): Promise<{ success: boolean; dashboard?: Dashboard; error?: string }> {
    try {
      const { data: original, error: fetchError } = await this.supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (fetchError || !original) {
        return { success: false, error: 'Dashboard not found' };
      }

      const { data, error } = await this.supabase
        .from('dashboard_widgets')
        .insert({
          user_id: original.user_id,
          name: newName,
          description: original.description,
          layout: original.layout,
          is_default: false,
          is_public: false,
          widgets: original.widgets,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        dashboard: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description,
          is_default: data.is_default,
          is_public: data.is_public,
          layout: data.layout,
          widgets: data.widgets,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', dashboardId);

    return !error;
  }

  /**
   * Share dashboard publicly
   */
  async shareDashboard(
    dashboardId: string,
    isPublic: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('dashboard_widgets')
        .update({ is_public: isPublic })
        .eq('id', dashboardId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get public dashboards
   */
  async getPublicDashboards(limit: number = 20): Promise<Dashboard[]> {
    const { data, error } = await this.supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      description: d.description,
      is_default: d.is_default,
      is_public: d.is_public,
      layout: d.layout,
      widgets: d.widgets,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  }
}

/**
 * Widget Data Fetcher
 * Handles fetching data for different widget types
 */
export class WidgetDataFetcher {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Fetch data for a widget based on its data source
   */
  async fetchWidgetData(
    dataSource: string,
    filters?: Record<string, any>
  ): Promise<any> {
    try {
      // Parse data source (format: "table:field" or "function:name")
      const [sourceType, sourceName] = dataSource.split(':');

      if (sourceType === 'table') {
        return await this.fetchTableData(sourceName, filters);
      } else if (sourceType === 'function') {
        return await this.fetchFunctionData(sourceName, filters);
      }

      return null;
    } catch (error) {
      console.error('Error fetching widget data:', error);
      return null;
    }
  }

  /**
   * Fetch data from a table
   */
  private async fetchTableData(
    tableName: string,
    filters?: Record<string, any>
  ): Promise<any> {
    let query = this.supabase.from(tableName).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.limit(100);

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Fetch data from a database function
   */
  private async fetchFunctionData(
    functionName: string,
    params?: Record<string, any>
  ): Promise<any> {
    const { data, error } = await this.supabase.rpc(functionName, params);

    if (error) {
      throw error;
    }

    return data;
  }
}

/**
 * Export dashboard management utilities
 */
export const customDashboards = {
  createManager: (supabase: ReturnType<typeof createClient>) =>
    new DashboardManager(supabase),
  createDataFetcher: (supabase: ReturnType<typeof createClient>) =>
    new WidgetDataFetcher(supabase),
};

export default customDashboards;
