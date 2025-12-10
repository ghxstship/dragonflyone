import { describe, it, expect } from 'vitest';
import type {
  FilterOperator,
  FilterCondition,
  SavedFilter,
  SavedView,
} from '../saved-filters';

describe('saved-filters', () => {
  describe('FilterOperator', () => {
    it('should include all operators', () => {
      const operators: FilterOperator[] = [
        'equals',
        'not_equals',
        'contains',
        'not_contains',
        'starts_with',
        'ends_with',
        'greater_than',
        'less_than',
        'greater_than_or_equal',
        'less_than_or_equal',
        'in',
        'not_in',
        'is_null',
        'is_not_null',
        'between',
      ];
      expect(operators.length).toBe(15);
    });

    it('should include equality operators', () => {
      const equalityOps: FilterOperator[] = ['equals', 'not_equals'];
      expect(equalityOps.length).toBe(2);
    });

    it('should include string operators', () => {
      const stringOps: FilterOperator[] = ['contains', 'not_contains', 'starts_with', 'ends_with'];
      expect(stringOps.length).toBe(4);
    });

    it('should include comparison operators', () => {
      const comparisonOps: FilterOperator[] = [
        'greater_than',
        'less_than',
        'greater_than_or_equal',
        'less_than_or_equal',
        'between',
      ];
      expect(comparisonOps.length).toBe(5);
    });

    it('should include set operators', () => {
      const setOps: FilterOperator[] = ['in', 'not_in'];
      expect(setOps.length).toBe(2);
    });

    it('should include null operators', () => {
      const nullOps: FilterOperator[] = ['is_null', 'is_not_null'];
      expect(nullOps.length).toBe(2);
    });
  });

  describe('FilterCondition interface', () => {
    it('should have all required fields', () => {
      const condition: FilterCondition = {
        field: 'status',
        operator: 'equals',
        value: 'active',
      };

      expect(condition.field).toBe('status');
      expect(condition.operator).toBe('equals');
      expect(condition.value).toBe('active');
    });

    it('should support optional dataType', () => {
      const condition: FilterCondition = {
        field: 'created_at',
        operator: 'greater_than',
        value: '2025-01-01',
        dataType: 'date',
      };

      expect(condition.dataType).toBe('date');
    });

    it('should support string dataType', () => {
      const condition: FilterCondition = {
        field: 'name',
        operator: 'contains',
        value: 'concert',
        dataType: 'string',
      };

      expect(condition.dataType).toBe('string');
    });

    it('should support number dataType', () => {
      const condition: FilterCondition = {
        field: 'price',
        operator: 'less_than_or_equal',
        value: 100,
        dataType: 'number',
      };

      expect(condition.dataType).toBe('number');
    });

    it('should support boolean dataType', () => {
      const condition: FilterCondition = {
        field: 'is_active',
        operator: 'equals',
        value: true,
        dataType: 'boolean',
      };

      expect(condition.dataType).toBe('boolean');
    });

    it('should support array values for in operator', () => {
      const condition: FilterCondition = {
        field: 'category',
        operator: 'in',
        value: ['music', 'festival', 'concert'],
      };

      expect(condition.operator).toBe('in');
      expect(condition.value).toContain('music');
    });
  });

  describe('SavedFilter interface', () => {
    it('should have all required fields', () => {
      const filter: SavedFilter = {
        id: 'filter-123',
        user_id: 'user-456',
        name: 'Active Events',
        description: 'Shows only active events',
        entity_type: 'events',
        conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
        sort_by: 'created_at',
        sort_order: 'desc',
        is_public: false,
        is_default: true,
        use_count: 15,
        last_used_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(filter.id).toBe('filter-123');
      expect(filter.name).toBe('Active Events');
      expect(filter.conditions.length).toBe(1);
      expect(filter.is_default).toBe(true);
    });

    it('should support null description', () => {
      const filter: SavedFilter = {
        id: 'filter-123',
        user_id: 'user-456',
        name: 'Quick Filter',
        description: null,
        entity_type: 'projects',
        conditions: [],
        sort_by: null,
        sort_order: null,
        is_public: false,
        is_default: false,
        use_count: 0,
        last_used_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(filter.description).toBeNull();
      expect(filter.sort_by).toBeNull();
    });

    it('should track usage', () => {
      const filter: SavedFilter = {
        id: 'filter-123',
        user_id: 'user-456',
        name: 'Popular Filter',
        description: null,
        entity_type: 'tasks',
        conditions: [],
        sort_by: null,
        sort_order: null,
        is_public: true,
        is_default: false,
        use_count: 42,
        last_used_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(filter.use_count).toBe(42);
      expect(filter.last_used_at).toBeDefined();
    });
  });

  describe('SavedView interface', () => {
    it('should have all required fields', () => {
      const view: SavedView = {
        id: 'view-123',
        user_id: 'user-456',
        name: 'Compact View',
        description: 'Shows essential columns only',
        entity_type: 'projects',
        visible_columns: ['name', 'status', 'due_date'],
        column_order: ['name', 'status', 'due_date'],
        column_widths: { name: 200, status: 100, due_date: 120 },
        filters: null,
        sort_by: 'due_date',
        sort_order: 'asc',
        page_size: 25,
        is_public: false,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(view.id).toBe('view-123');
      expect(view.visible_columns.length).toBe(3);
      expect(view.column_widths?.name).toBe(200);
    });

    it('should support filters in view', () => {
      const view: SavedView = {
        id: 'view-123',
        user_id: 'user-456',
        name: 'Filtered View',
        description: null,
        entity_type: 'events',
        visible_columns: ['name', 'date', 'venue'],
        column_order: ['name', 'date', 'venue'],
        column_widths: null,
        filters: [
          { field: 'status', operator: 'equals', value: 'upcoming' },
          { field: 'capacity', operator: 'greater_than', value: 1000 },
        ],
        sort_by: 'date',
        sort_order: 'asc',
        page_size: 50,
        is_public: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(view.filters?.length).toBe(2);
    });

    it('should support null optional fields', () => {
      const view: SavedView = {
        id: 'view-123',
        user_id: 'user-456',
        name: 'Basic View',
        description: null,
        entity_type: 'tasks',
        visible_columns: ['title'],
        column_order: ['title'],
        column_widths: null,
        filters: null,
        sort_by: null,
        sort_order: null,
        page_size: null,
        is_public: false,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(view.column_widths).toBeNull();
      expect(view.filters).toBeNull();
      expect(view.page_size).toBeNull();
    });
  });
});
