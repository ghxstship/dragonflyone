"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase-client";
import type { FilterCondition } from "../saved-filters";
import type { Json } from "../supabase-types";

/**
 * Filter preset format for UI components
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, string | string[]>;
  searchValue?: string;
  isDefault?: boolean;
  isPublic?: boolean;
}

/**
 * View preset format for UI components
 */
export interface ViewPreset {
  id: string;
  name: string;
  visibleColumns: string[];
  columnOrder: string[];
  columnWidths?: Record<string, number>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageSize?: number;
  isDefault?: boolean;
  isPublic?: boolean;
}

interface UseSavedFiltersOptions {
  entityType: string;
  organizationId: string;
  userId?: string;
  includePublic?: boolean;
}

interface UseSavedFiltersReturn {
  presets: FilterPreset[];
  loading: boolean;
  error: string | null;
  savePreset: (name: string, filters: Record<string, string | string[]>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  setDefaultPreset: (id: string) => Promise<void>;
  togglePublic: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing saved filter presets
 */
export function useSavedFilters(options: UseSavedFiltersOptions): UseSavedFiltersReturn {
  const { entityType, organizationId, userId, includePublic = true } = options;
  
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  // Get current user if not provided
  useEffect(() => {
    if (!userId) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setCurrentUserId(user.id);
        }
      });
    }
  }, [userId]);

  // Convert database row to FilterPreset
  const convertToPreset = useCallback((row: {
    id: string;
    name: string;
    conditions: Json;
    is_default: boolean | null;
    is_public: boolean | null;
  }): FilterPreset => {
    const filters: Record<string, string | string[]> = {};
    const conditions = row.conditions as unknown as FilterCondition[];
    
    for (const condition of conditions) {
      if (condition.operator === "equals") {
        filters[condition.field] = String(condition.value);
      } else if (condition.operator === "in" && Array.isArray(condition.value)) {
        filters[condition.field] = condition.value.map(String);
      }
    }

    return {
      id: row.id,
      name: row.name,
      filters,
      isDefault: row.is_default ?? false,
      isPublic: row.is_public ?? false,
    };
  }, []);

  // Convert FilterPreset to SavedFilter conditions
  const convertToConditions = useCallback((filters: Record<string, string | string[]>): FilterCondition[] => {
    const conditions: FilterCondition[] = [];
    
    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        conditions.push({ field, operator: "in", value });
      } else if (value) {
        conditions.push({ field, operator: "equals", value });
      }
    }

    return conditions;
  }, []);

  // Fetch saved filters
  const fetchPresets = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: userFilters, error: userError } = await supabase
        .from("saved_filters")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("entity_type", entityType)
        .order("use_count", { ascending: false });

      if (userError) throw userError;

      let allFilters = userFilters || [];

      if (includePublic) {
        const { data: publicFilters, error: publicError } = await supabase
          .from("saved_filters")
          .select("*")
          .eq("entity_type", entityType)
          .eq("is_public", true)
          .neq("user_id", currentUserId)
          .order("use_count", { ascending: false })
          .limit(10);

        if (!publicError && publicFilters) {
          allFilters = [...allFilters, ...publicFilters];
        }
      }

      setPresets(allFilters.map(convertToPreset));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load filters");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, entityType, includePublic, convertToPreset]);

  useEffect(() => {
    if (currentUserId) {
      fetchPresets();
    }
  }, [currentUserId, fetchPresets]);

  const savePreset = useCallback(async (
    name: string,
    filters: Record<string, string | string[]>
  ) => {
    if (!currentUserId) {
      setError("User not authenticated");
      return;
    }

    try {
      const conditions = convertToConditions(filters);
      
      const { error: insertError } = await supabase
        .from("saved_filters")
        .insert({
          organization_id: organizationId,
          user_id: currentUserId,
          name,
          entity_type: entityType,
          conditions: conditions as unknown as Json,
          is_public: false,
          is_default: false,
          use_count: 0,
        });

      if (insertError) throw insertError;
      await fetchPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save filter");
    }
  }, [currentUserId, organizationId, entityType, convertToConditions, fetchPresets]);

  const deletePreset = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setPresets(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete filter");
    }
  }, []);

  const setDefaultPreset = useCallback(async (id: string) => {
    if (!currentUserId) return;

    try {
      await supabase
        .from("saved_filters")
        .update({ is_default: false })
        .eq("user_id", currentUserId)
        .eq("entity_type", entityType)
        .eq("is_default", true);

      const { error: updateError } = await supabase
        .from("saved_filters")
        .update({ is_default: true })
        .eq("id", id);

      if (updateError) throw updateError;

      setPresets(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  }, [currentUserId, entityType]);

  const togglePublic = useCallback(async (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;

    try {
      const { error: updateError } = await supabase
        .from("saved_filters")
        .update({ is_public: !preset.isPublic })
        .eq("id", id);

      if (updateError) throw updateError;

      setPresets(prev => prev.map(p => 
        p.id === id ? { ...p, isPublic: !p.isPublic } : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }, [presets]);

  return {
    presets,
    loading,
    error,
    savePreset,
    deletePreset,
    setDefaultPreset,
    togglePublic,
    refetch: fetchPresets,
  };
}

interface UseSavedViewsOptions {
  entityType: string;
  organizationId: string;
  userId?: string;
}

interface UseSavedViewsReturn {
  views: ViewPreset[];
  defaultView: ViewPreset | null;
  loading: boolean;
  error: string | null;
  saveView: (name: string, config: Omit<ViewPreset, "id" | "name" | "isDefault" | "isPublic">) => Promise<void>;
  updateView: (id: string, config: Partial<ViewPreset>) => Promise<void>;
  deleteView: (id: string) => Promise<void>;
  setDefaultView: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing saved view configurations
 */
export function useSavedViews(options: UseSavedViewsOptions): UseSavedViewsReturn {
  const { entityType, organizationId, userId } = options;
  
  const [views, setViews] = useState<ViewPreset[]>([]);
  const [defaultView, setDefaultViewState] = useState<ViewPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  useEffect(() => {
    if (!userId) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setCurrentUserId(user.id);
        }
      });
    }
  }, [userId]);

  const convertToViewPreset = useCallback((row: {
    id: string;
    name: string;
    visible_columns: string[];
    column_order: string[];
    column_widths: Json | null;
    sort_by: string | null;
    sort_order: string | null;
    page_size: number | null;
    is_default: boolean | null;
    is_public: boolean | null;
  }): ViewPreset => ({
    id: row.id,
    name: row.name,
    visibleColumns: row.visible_columns,
    columnOrder: row.column_order,
    columnWidths: row.column_widths as Record<string, number> | undefined,
    sortBy: row.sort_by ?? undefined,
    sortOrder: (row.sort_order as "asc" | "desc") ?? undefined,
    pageSize: row.page_size ?? undefined,
    isDefault: row.is_default ?? false,
    isPublic: row.is_public ?? false,
  }), []);

  const fetchViews = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("saved_views")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("entity_type", entityType)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const viewPresets = (data || []).map(convertToViewPreset);
      setViews(viewPresets);
      
      const defaultPreset = viewPresets.find((v: ViewPreset) => v.isDefault) || null;
      setDefaultViewState(defaultPreset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load views");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, entityType, convertToViewPreset]);

  useEffect(() => {
    if (currentUserId) {
      fetchViews();
    }
  }, [currentUserId, fetchViews]);

  const saveView = useCallback(async (
    name: string,
    config: Omit<ViewPreset, "id" | "name" | "isDefault" | "isPublic">
  ) => {
    if (!currentUserId) {
      setError("User not authenticated");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("saved_views")
        .insert({
          organization_id: organizationId,
          user_id: currentUserId,
          name,
          entity_type: entityType,
          visible_columns: config.visibleColumns,
          column_order: config.columnOrder,
          column_widths: config.columnWidths,
          sort_by: config.sortBy,
          sort_order: config.sortOrder,
          page_size: config.pageSize,
          is_public: false,
          is_default: false,
        });

      if (insertError) throw insertError;
      await fetchViews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save view");
    }
  }, [currentUserId, organizationId, entityType, fetchViews]);

  const updateView = useCallback(async (id: string, config: Partial<ViewPreset>) => {
    try {
      const updates: Record<string, unknown> = {};
      if (config.name !== undefined) updates.name = config.name;
      if (config.visibleColumns !== undefined) updates.visible_columns = config.visibleColumns;
      if (config.columnOrder !== undefined) updates.column_order = config.columnOrder;
      if (config.columnWidths !== undefined) updates.column_widths = config.columnWidths;
      if (config.sortBy !== undefined) updates.sort_by = config.sortBy;
      if (config.sortOrder !== undefined) updates.sort_order = config.sortOrder;
      if (config.pageSize !== undefined) updates.page_size = config.pageSize;

      const { error: updateError } = await supabase
        .from("saved_views")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;
      await fetchViews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update view");
    }
  }, [fetchViews]);

  const deleteView = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("saved_views")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setViews(prev => prev.filter((v: ViewPreset) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete view");
    }
  }, []);

  const setDefaultView = useCallback(async (id: string) => {
    if (!currentUserId) return;

    try {
      await supabase
        .from("saved_views")
        .update({ is_default: false })
        .eq("user_id", currentUserId)
        .eq("entity_type", entityType)
        .eq("is_default", true);

      const { error: updateError } = await supabase
        .from("saved_views")
        .update({ is_default: true })
        .eq("id", id);

      if (updateError) throw updateError;

      const newDefault = views.find((v: ViewPreset) => v.id === id) || null;
      setDefaultViewState(newDefault ? { ...newDefault, isDefault: true } : null);
      
      setViews(prev => prev.map((v: ViewPreset) => ({ ...v, isDefault: v.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default view");
    }
  }, [currentUserId, entityType, views]);

  return {
    views,
    defaultView,
    loading,
    error,
    saveView,
    updateView,
    deleteView,
    setDefaultView,
    refetch: fetchViews,
  };
}
