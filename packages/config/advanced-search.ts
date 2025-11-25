/**
 * Advanced Search & Filter System
 * Universal search with faceted filters, saved searches, and search history
 */

import { createClient } from '@supabase/supabase-js';

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
  value: any;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilter[];
  entityTypes?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  query: SearchQuery;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters: SearchFilter[];
  result_count: number;
  executed_at: string;
}

/**
 * Advanced Search Engine
 * Provides universal search with filters, ranking, and relevance scoring
 */
export class AdvancedSearchEngine {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Execute universal search across multiple entity types
   */
  async search(searchQuery: SearchQuery): Promise<{
    results: SearchResult[];
    total: number;
    facets?: Record<string, Array<{ value: string; count: number }>>;
  }> {
    const {
      query,
      filters,
      entityTypes,
      sortBy = 'score',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = searchQuery;

    try {
      // Build the search query using full-text search
      let dbQuery = this.supabase
        .from('search_index')
        .select('*', { count: 'exact' });

      // Apply text search if query provided
      if (query && query.trim()) {
        dbQuery = dbQuery.textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english',
        });
      }

      // Apply entity type filter
      if (entityTypes && entityTypes.length > 0) {
        dbQuery = dbQuery.in('entity_type', entityTypes);
      }

      // Apply custom filters
      for (const filter of filters) {
        switch (filter.operator) {
          case 'eq':
            dbQuery = dbQuery.eq(filter.field, filter.value);
            break;
          case 'neq':
            dbQuery = dbQuery.neq(filter.field, filter.value);
            break;
          case 'gt':
            dbQuery = dbQuery.gt(filter.field, filter.value);
            break;
          case 'gte':
            dbQuery = dbQuery.gte(filter.field, filter.value);
            break;
          case 'lt':
            dbQuery = dbQuery.lt(filter.field, filter.value);
            break;
          case 'lte':
            dbQuery = dbQuery.lte(filter.field, filter.value);
            break;
          case 'like':
            dbQuery = dbQuery.like(filter.field, filter.value);
            break;
          case 'ilike':
            dbQuery = dbQuery.ilike(filter.field, filter.value);
            break;
          case 'in':
            dbQuery = dbQuery.in(filter.field, filter.value);
            break;
          case 'is':
            dbQuery = dbQuery.is(filter.field, filter.value);
            break;
        }
      }

      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) {
        throw new Error(error.message);
      }

      const results: SearchResult[] = (data || []).map((row: any) => ({
        id: row.id,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        title: row.title,
        description: row.description,
        metadata: row.metadata,
        score: row.score || 1.0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return {
        results,
        total: count || 0,
      };
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(
    partialQuery: string,
    entityTypes?: string[],
    limit: number = 10
  ): Promise<string[]> {
    let query = this.supabase
      .from('search_index')
      .select('title')
      .ilike('title', `${partialQuery}%`)
      .limit(limit);

    if (entityTypes && entityTypes.length > 0) {
      query = query.in('entity_type', entityTypes);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => row.title);
  }

  /**
   * Save search for later use
   */
  async saveSearch(
    userId: string,
    name: string,
    query: SearchQuery,
    description?: string,
    isPublic: boolean = false
  ): Promise<{ success: boolean; search?: SavedSearch; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          name,
          description,
          query,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        search: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description,
          query: data.query,
          is_public: data.is_public,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get saved searches for a user
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      query: row.query,
      is_public: row.is_public,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Record search history
   */
  async recordSearch(
    userId: string,
    query: string,
    filters: SearchFilter[],
    resultCount: number
  ): Promise<void> {
    await this.supabase.from('search_history').insert({
      user_id: userId,
      query,
      filters,
      result_count: resultCount,
      executed_at: new Date().toISOString(),
    });
  }

  /**
   * Get recent search history
   */
  async getSearchHistory(userId: string, limit: number = 20): Promise<SearchHistory[]> {
    const { data, error } = await this.supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      query: row.query,
      filters: row.filters,
      result_count: row.result_count,
      executed_at: row.executed_at,
    }));
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Build full-text search index for an entity
   */
  async indexEntity(
    entityType: string,
    entityId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    searchableText?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Combine all searchable text
      const allText = [
        title,
        description,
        ...(searchableText || []),
        JSON.stringify(metadata || {}),
      ]
        .filter(Boolean)
        .join(' ');

      const { error } = await this.supabase.from('search_index').upsert({
        entity_type: entityType,
        entity_id: entityId,
        title,
        description,
        metadata,
        search_text: allText,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove entity from search index
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('search_index')
      .delete()
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    return !error;
  }

  /**
   * Reindex all entities of a type
   */
  async reindexEntityType(
    entityType: string,
    fetchFunction: () => Promise<Array<{
      id: string;
      title: string;
      description?: string;
      metadata?: Record<string, any>;
    }>>
  ): Promise<{ success: boolean; indexed: number; error?: string }> {
    try {
      const entities = await fetchFunction();
      let indexed = 0;

      for (const entity of entities) {
        const result = await this.indexEntity(
          entityType,
          entity.id,
          entity.title,
          entity.description,
          entity.metadata
        );

        if (result.success) {
          indexed++;
        }
      }

      return { success: true, indexed };
    } catch (error: any) {
      return { success: false, indexed: 0, error: error.message };
    }
  }
}

/**
 * Export advanced search utilities
 */
export const advancedSearch = {
  createEngine: (supabase: ReturnType<typeof createClient>) => new AdvancedSearchEngine(supabase),
};

export default advancedSearch;
