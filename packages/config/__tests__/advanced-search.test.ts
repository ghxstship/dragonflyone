import { describe, it, expect } from 'vitest';
import type {
  SearchFilter,
  SearchQuery,
  SearchResult,
  SavedSearch,
  SearchHistory,
} from '../advanced-search';

describe('advanced-search', () => {
  describe('SearchFilter interface', () => {
    it('should have all required fields', () => {
      const filter: SearchFilter = {
        field: 'status',
        operator: 'eq',
        value: 'active',
      };

      expect(filter.field).toBe('status');
      expect(filter.operator).toBe('eq');
      expect(filter.value).toBe('active');
    });

    it('should support all operators', () => {
      const operators: SearchFilter['operator'][] = [
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'not'
      ];
      expect(operators.length).toBe(11);
    });

    it('should support equality operator', () => {
      const filter: SearchFilter = {
        field: 'category',
        operator: 'eq',
        value: 'music',
      };
      expect(filter.operator).toBe('eq');
    });

    it('should support comparison operators', () => {
      const gtFilter: SearchFilter = { field: 'price', operator: 'gt', value: 100 };
      const lteFilter: SearchFilter = { field: 'quantity', operator: 'lte', value: 50 };
      
      expect(gtFilter.operator).toBe('gt');
      expect(lteFilter.operator).toBe('lte');
    });

    it('should support pattern matching operators', () => {
      const likeFilter: SearchFilter = { field: 'name', operator: 'like', value: '%concert%' };
      const ilikeFilter: SearchFilter = { field: 'title', operator: 'ilike', value: '%MUSIC%' };
      
      expect(likeFilter.operator).toBe('like');
      expect(ilikeFilter.operator).toBe('ilike');
    });

    it('should support in operator for arrays', () => {
      const filter: SearchFilter = {
        field: 'status',
        operator: 'in',
        value: ['active', 'pending', 'completed'],
      };
      expect(filter.operator).toBe('in');
      expect(filter.value).toContain('active');
    });
  });

  describe('SearchQuery interface', () => {
    it('should have all required fields', () => {
      const query: SearchQuery = {
        query: 'concert',
        filters: [],
      };

      expect(query.query).toBe('concert');
      expect(query.filters).toEqual([]);
    });

    it('should support optional entity types', () => {
      const query: SearchQuery = {
        query: 'music',
        filters: [],
        entityTypes: ['events', 'projects', 'venues'],
      };

      expect(query.entityTypes?.length).toBe(3);
      expect(query.entityTypes).toContain('events');
    });

    it('should support sorting options', () => {
      const query: SearchQuery = {
        query: 'festival',
        filters: [],
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      expect(query.sortBy).toBe('created_at');
      expect(query.sortOrder).toBe('desc');
    });

    it('should support pagination', () => {
      const query: SearchQuery = {
        query: 'event',
        filters: [],
        limit: 20,
        offset: 40,
      };

      expect(query.limit).toBe(20);
      expect(query.offset).toBe(40);
    });

    it('should support multiple filters', () => {
      const query: SearchQuery = {
        query: 'concert',
        filters: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'price', operator: 'lte', value: 100 },
          { field: 'category', operator: 'in', value: ['music', 'festival'] },
        ],
      };

      expect(query.filters.length).toBe(3);
    });
  });

  describe('SearchResult interface', () => {
    it('should have all required fields', () => {
      const result: SearchResult = {
        id: 'result-123',
        entity_type: 'event',
        entity_id: 'event-456',
        title: 'Summer Concert',
        score: 0.95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(result.id).toBe('result-123');
      expect(result.entity_type).toBe('event');
      expect(result.title).toBe('Summer Concert');
      expect(result.score).toBe(0.95);
    });

    it('should support optional description', () => {
      const result: SearchResult = {
        id: 'result-123',
        entity_type: 'project',
        entity_id: 'proj-456',
        title: 'Festival Planning',
        description: 'Annual music festival planning project',
        score: 0.85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(result.description).toBe('Annual music festival planning project');
    });

    it('should support optional metadata', () => {
      const result: SearchResult = {
        id: 'result-123',
        entity_type: 'venue',
        entity_id: 'venue-789',
        title: 'Stadium Arena',
        metadata: {
          capacity: 50000,
          location: 'New York',
          type: 'outdoor',
        },
        score: 0.75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(result.metadata?.capacity).toBe(50000);
      expect(result.metadata?.location).toBe('New York');
    });
  });

  describe('SavedSearch interface', () => {
    it('should have all required fields', () => {
      const saved: SavedSearch = {
        id: 'saved-123',
        user_id: 'user-456',
        name: 'Active Events',
        query: {
          query: 'event',
          filters: [{ field: 'status', operator: 'eq', value: 'active' }],
        },
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(saved.id).toBe('saved-123');
      expect(saved.name).toBe('Active Events');
      expect(saved.is_public).toBe(false);
    });

    it('should support optional description', () => {
      const saved: SavedSearch = {
        id: 'saved-123',
        user_id: 'user-456',
        name: 'My Searches',
        description: 'Frequently used search for active events',
        query: { query: '', filters: [] },
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(saved.description).toBe('Frequently used search for active events');
    });
  });

  describe('SearchHistory interface', () => {
    it('should have all required fields', () => {
      const history: SearchHistory = {
        id: 'history-123',
        user_id: 'user-456',
        query: 'concert tickets',
        filters: [],
        result_count: 42,
        executed_at: new Date().toISOString(),
      };

      expect(history.id).toBe('history-123');
      expect(history.query).toBe('concert tickets');
      expect(history.result_count).toBe(42);
    });

    it('should track filters used', () => {
      const history: SearchHistory = {
        id: 'history-456',
        user_id: 'user-789',
        query: 'music',
        filters: [
          { field: 'category', operator: 'eq', value: 'rock' },
          { field: 'price', operator: 'lte', value: 50 },
        ],
        result_count: 15,
        executed_at: new Date().toISOString(),
      };

      expect(history.filters.length).toBe(2);
    });
  });
});
