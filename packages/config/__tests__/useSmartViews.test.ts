import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSmartViews,
  inferColumnType,
  columnsToDefinitions,
  type ColumnDefinition,
} from '../hooks/useSmartViews';

describe('useSmartViews', () => {
  describe('basic views', () => {
    it('should always include list, grid, and table views', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('list');
      expect(viewIds).toContain('grid');
      expect(viewIds).toContain('table');
    });
  });

  describe('kanban view detection', () => {
    it('should detect kanban view with status field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('kanban');
      expect(result.current.kanbanGroupBy).toBe('status');
    });

    it('should detect kanban view with stage field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'pipeline_stage', label: 'Stage' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.kanbanGroupBy).toBe('pipeline_stage');
    });

    it('should detect kanban view with status type column', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'workflow', label: 'Workflow', type: 'status' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.kanbanGroupBy).toBe('workflow');
    });

    it('should not include kanban without status field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).not.toContain('kanban');
      expect(result.current.kanbanGroupBy).toBeUndefined();
    });
  });

  describe('calendar view detection', () => {
    it('should detect calendar view with date field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'event_date', label: 'Date' },
        { key: 'title', label: 'Title' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('calendar');
      expect(result.current.calendarDateField).toBe('event_date');
      expect(result.current.calendarTitleField).toBe('title');
    });

    it('should detect calendar with created_at field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'created_at', label: 'Created' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.calendarDateField).toBe('created_at');
    });

    it('should detect calendar with date type column', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'scheduled', label: 'Scheduled', type: 'date' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.calendarDateField).toBe('scheduled');
    });
  });

  describe('gantt view detection', () => {
    it('should detect gantt view with start and end dates', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('gantt');
      expect(result.current.ganttStartField).toBe('start_date');
      expect(result.current.ganttEndField).toBe('end_date');
    });

    it('should detect progress field for gantt', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End' },
        { key: 'progress', label: 'Progress' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.ganttProgressField).toBe('progress');
    });

    it('should not include gantt without both start and end dates', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'start_date', label: 'Start' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).not.toContain('gantt');
    });
  });

  describe('timeline view detection', () => {
    it('should detect timeline view with date field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'created_at', label: 'Created' },
        { key: 'description', label: 'Description' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('timeline');
      expect(result.current.timelineDateField).toBe('created_at');
      expect(result.current.timelineDescriptionField).toBe('description');
    });
  });

  describe('map view detection', () => {
    it('should detect map view with lat/lng fields', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('map');
      expect(result.current.mapLatitudeField).toBe('latitude');
      expect(result.current.mapLongitudeField).toBe('longitude');
    });

    it('should detect map view with address field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'address', label: 'Address' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('map');
      expect(result.current.mapAddressField).toBe('address');
    });

    it('should detect map view with venue field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'venue', label: 'Venue' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.mapAddressField).toBe('venue');
    });
  });

  describe('gallery view detection', () => {
    it('should detect gallery view with image field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'image_url', label: 'Image' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('gallery');
      expect(result.current.galleryImageField).toBe('image_url');
    });

    it('should detect gallery with image type column', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'photo', label: 'Photo', type: 'image' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.galleryImageField).toBe('photo');
    });

    it('should detect thumbnail field', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'image_url', label: 'Image' },
        { key: 'thumbnail_url', label: 'Thumbnail' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      expect(result.current.galleryThumbnailField).toBe('thumbnail_url');
    });
  });

  describe('complex column sets', () => {
    it('should detect multiple views for rich data', () => {
      const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End' },
        { key: 'progress', label: 'Progress' },
        { key: 'image_url', label: 'Image' },
        { key: 'latitude', label: 'Lat' },
        { key: 'longitude', label: 'Lng' },
      ];

      const { result } = renderHook(() => useSmartViews(columns));

      const viewIds = result.current.views.map(v => v.id);
      expect(viewIds).toContain('list');
      expect(viewIds).toContain('grid');
      expect(viewIds).toContain('table');
      expect(viewIds).toContain('kanban');
      expect(viewIds).toContain('calendar');
      expect(viewIds).toContain('gantt');
      expect(viewIds).toContain('timeline');
      expect(viewIds).toContain('map');
      expect(viewIds).toContain('gallery');
    });
  });
});

describe('inferColumnType', () => {
  it('should infer status type', () => {
    expect(inferColumnType('status')).toBe('status');
    expect(inferColumnType('pipeline_stage')).toBe('status');
    expect(inferColumnType('order_status')).toBe('status');
  });

  it('should infer date type', () => {
    expect(inferColumnType('created_at')).toBe('date');
    expect(inferColumnType('due_date')).toBe('date');
    expect(inferColumnType('event_date')).toBe('date');
  });

  it('should infer image type', () => {
    expect(inferColumnType('image_url')).toBe('image');
    expect(inferColumnType('photo')).toBe('image');
    expect(inferColumnType('thumbnail')).toBe('image');
  });

  it('should infer location type', () => {
    expect(inferColumnType('latitude')).toBe('location');
    expect(inferColumnType('longitude')).toBe('location');
    expect(inferColumnType('lat')).toBe('location');
  });

  it('should infer currency type', () => {
    expect(inferColumnType('price')).toBe('currency');
    expect(inferColumnType('total_cost')).toBe('currency');
    expect(inferColumnType('budget')).toBe('currency');
  });

  it('should infer percentage type', () => {
    expect(inferColumnType('progress')).toBe('percentage');
    expect(inferColumnType('completion_percent')).toBe('percentage');
  });

  it('should infer email type', () => {
    expect(inferColumnType('email')).toBe('email');
    expect(inferColumnType('contact_email')).toBe('email');
  });

  it('should infer phone type', () => {
    expect(inferColumnType('phone')).toBe('phone');
    expect(inferColumnType('mobile')).toBe('phone');
  });

  it('should infer url type', () => {
    expect(inferColumnType('website')).toBe('url');
    expect(inferColumnType('link')).toBe('url');
    expect(inferColumnType('href')).toBe('url');
  });

  it('should infer boolean type', () => {
    expect(inferColumnType('is_active')).toBe('boolean');
    expect(inferColumnType('has_access')).toBe('boolean');
    expect(inferColumnType('published')).toBe('boolean');
  });

  it('should infer number type', () => {
    expect(inferColumnType('count')).toBe('number');
    expect(inferColumnType('quantity')).toBe('number');
    expect(inferColumnType('user_id')).toBe('number');
  });

  it('should default to string type', () => {
    expect(inferColumnType('name')).toBe('string');
    expect(inferColumnType('description')).toBe('string');
    expect(inferColumnType('random_field')).toBe('string');
  });
});

describe('columnsToDefinitions', () => {
  it('should convert columns with inferred types', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' },
    ];

    const definitions = columnsToDefinitions(columns);

    expect(definitions).toHaveLength(4);
    expect(definitions[0]).toEqual({ key: 'id', label: 'ID', type: 'number' });
    expect(definitions[1]).toEqual({ key: 'name', label: 'Name', type: 'string' });
    expect(definitions[2]).toEqual({ key: 'status', label: 'Status', type: 'status' });
    expect(definitions[3]).toEqual({ key: 'created_at', label: 'Created', type: 'date' });
  });
});
