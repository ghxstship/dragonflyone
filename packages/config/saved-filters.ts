/**
 * Saved Filters and Views System
 * Save and manage user-configured filters and table views
 */

import { createClient } from '@supabase/supabase-js';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'between';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  dataType?: 'string' | 'number' | 'date' | 'boolean';
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  entity_type: string;
  conditions: FilterCondition[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  is_public: boolean;
  is_default: boolean;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedView {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  entity_type: string;
  visible_columns: string[];
  column_order: string[];
  column_widths?: Record<string, number>;
  filters?: FilterCondition[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page_size?: number;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Saved Filters Manager
 * Manage user-saved filters for data tables
 */
export class SavedFiltersManager {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Create saved filter
   */
  async createFilter(
    userId: string,
    filter: Omit<SavedFilter, 'id' | 'user_id' | 'use_count' | 'last_used_at' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; filterId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('saved_filters')
        .insert({
          user_id: userId,
          ...filter,
          use_count: 0,
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, filterId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's saved filters
   */
  async getUserFilters(
    userId: string,
    entityType?: string
  ): Promise<SavedFilter[]> {
    let query = this.supabase
      .from('saved_filters')
      .select('*')
      .eq('user_id', userId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('use_count', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as SavedFilter[];
  }

  /**
   * Get public filters
   */
  async getPublicFilters(entityType: string): Promise<SavedFilter[]> {
    const { data, error } = await this.supabase
      .from('saved_filters')
      .select('*')
      .eq('entity_type', entityType)
      .eq('is_public', true)
      .order('use_count', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as SavedFilter[];
  }

  /**
   * Update saved filter
   */
  async updateFilter(
    filterId: string,
    updates: Partial<Omit<SavedFilter, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', filterId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete saved filter
   */
  async deleteFilter(filterId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('saved_filters')
      .delete()
      .eq('id', filterId);

    return !error;
  }

  /**
   * Set default filter
   */
  async setDefaultFilter(
    userId: string,
    filterId: string,
    entityType: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Unset current default
      await this.supabase
        .from('saved_filters')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('is_default', true);

      // Set new default
      const { error } = await this.supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', filterId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Track filter usage
   */
  async trackFilterUsage(filterId: string): Promise<void> {
    await this.supabase.rpc('increment_filter_usage', { filter_id: filterId });
  }

  /**
   * Apply filter to query
   */
  applyFilter(filter: SavedFilter, query: any): any {
    let modifiedQuery = query;

    for (const condition of filter.conditions) {
      modifiedQuery = this.applyCondition(modifiedQuery, condition);
    }

    if (filter.sort_by) {
      modifiedQuery = modifiedQuery.order(filter.sort_by, {
        ascending: filter.sort_order === 'asc',
      });
    }

    return modifiedQuery;
  }

  /**
   * Apply single condition to query
   */
  private applyCondition(query: any, condition: FilterCondition): any {
    switch (condition.operator) {
      case 'equals':
        return query.eq(condition.field, condition.value);
      case 'not_equals':
        return query.neq(condition.field, condition.value);
      case 'contains':
        return query.ilike(condition.field, `%${condition.value}%`);
      case 'not_contains':
        return query.not(condition.field, 'ilike', `%${condition.value}%`);
      case 'starts_with':
        return query.ilike(condition.field, `${condition.value}%`);
      case 'ends_with':
        return query.ilike(condition.field, `%${condition.value}`);
      case 'greater_than':
        return query.gt(condition.field, condition.value);
      case 'less_than':
        return query.lt(condition.field, condition.value);
      case 'greater_than_or_equal':
        return query.gte(condition.field, condition.value);
      case 'less_than_or_equal':
        return query.lte(condition.field, condition.value);
      case 'in':
        return query.in(condition.field, condition.value);
      case 'not_in':
        return query.not(condition.field, 'in', condition.value);
      case 'is_null':
        return query.is(condition.field, null);
      case 'is_not_null':
        return query.not(condition.field, 'is', null);
      default:
        return query;
    }
  }
}

/**
 * Saved Views Manager
 * Manage user-saved table views and layouts
 */
export class SavedViewsManager {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Create saved view
   */
  async createView(
    userId: string,
    view: Omit<SavedView, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; viewId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('saved_views')
        .insert({
          user_id: userId,
          ...view,
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, viewId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's saved views
   */
  async getUserViews(userId: string, entityType?: string): Promise<SavedView[]> {
    let query = this.supabase
      .from('saved_views')
      .select('*')
      .eq('user_id', userId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as SavedView[];
  }

  /**
   * Get default view
   */
  async getDefaultView(userId: string, entityType: string): Promise<SavedView | null> {
    const { data, error } = await this.supabase
      .from('saved_views')
      .select('*')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as SavedView;
  }

  /**
   * Update saved view
   */
  async updateView(
    viewId: string,
    updates: Partial<Omit<SavedView, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('saved_views')
        .update(updates)
        .eq('id', viewId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete saved view
   */
  async deleteView(viewId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('saved_views')
      .delete()
      .eq('id', viewId);

    return !error;
  }

  /**
   * Set default view
   */
  async setDefaultView(
    userId: string,
    viewId: string,
    entityType: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Unset current default
      await this.supabase
        .from('saved_views')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('is_default', true);

      // Set new default
      const { error } = await this.supabase
        .from('saved_views')
        .update({ is_default: true })
        .eq('id', viewId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Duplicate view
   */
  async duplicateView(
    viewId: string,
    newName: string
  ): Promise<{ success: boolean; viewId?: string; error?: string }> {
    try {
      const { data: original, error: fetchError } = await this.supabase
        .from('saved_views')
        .select('*')
        .eq('id', viewId)
        .single();

      if (fetchError || !original) {
        return { success: false, error: 'View not found' };
      }

      const { data, error } = await this.supabase
        .from('saved_views')
        .insert({
          user_id: original.user_id,
          name: newName,
          description: original.description,
          entity_type: original.entity_type,
          visible_columns: original.visible_columns,
          column_order: original.column_order,
          column_widths: original.column_widths,
          filters: original.filters,
          sort_by: original.sort_by,
          sort_order: original.sort_order,
          page_size: original.page_size,
          is_public: false,
          is_default: false,
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, viewId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Export saved filters and views utilities
 */
export const savedFilters = {
  createFiltersManager: (supabase: ReturnType<typeof createClient>) =>
    new SavedFiltersManager(supabase),
  createViewsManager: (supabase: ReturnType<typeof createClient>) =>
    new SavedViewsManager(supabase),
};

export default savedFilters;
