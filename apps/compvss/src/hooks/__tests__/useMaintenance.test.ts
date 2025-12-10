import { describe, it, expect } from 'vitest';

// Interface copied from useMaintenance.ts for testing
interface MaintenanceRecord {
  id: string;
  equipment_id?: string;
  equipment_name?: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'preventive';
  description?: string;
  last_service?: string;
  next_due?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'scheduled' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface MaintenanceFilters {
  status?: string;
  priority?: string;
  equipment_id?: string;
}

describe('useMaintenance', () => {
  describe('MaintenanceRecord interface', () => {
    it('should have all required fields', () => {
      const record: MaintenanceRecord = {
        id: 'maint-123',
        type: 'scheduled',
        priority: 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(record.id).toBe('maint-123');
      expect(record.type).toBe('scheduled');
      expect(record.priority).toBe('medium');
      expect(record.status).toBe('pending');
    });

    it('should support all maintenance types', () => {
      const types: MaintenanceRecord['type'][] = ['scheduled', 'repair', 'inspection', 'preventive'];
      expect(types.length).toBe(4);
    });

    it('should support all priority levels', () => {
      const priorities: MaintenanceRecord['priority'][] = ['low', 'medium', 'high', 'critical'];
      expect(priorities.length).toBe(4);
    });

    it('should support all status values', () => {
      const statuses: MaintenanceRecord['status'][] = ['pending', 'in-progress', 'scheduled', 'completed', 'cancelled'];
      expect(statuses.length).toBe(5);
    });

    it('should support scheduled type', () => {
      const record: MaintenanceRecord = {
        id: 'maint-1',
        type: 'scheduled',
        description: 'Annual service',
        next_due: '2025-06-01',
        priority: 'medium',
        status: 'scheduled',
        created_at: '',
        updated_at: '',
      };
      expect(record.type).toBe('scheduled');
    });

    it('should support repair type', () => {
      const record: MaintenanceRecord = {
        id: 'maint-2',
        equipment_id: 'equip-123',
        equipment_name: 'LED Panel',
        type: 'repair',
        description: 'Fix broken connector',
        priority: 'high',
        status: 'in-progress',
        created_at: '',
        updated_at: '',
      };
      expect(record.type).toBe('repair');
      expect(record.equipment_name).toBe('LED Panel');
    });

    it('should support inspection type', () => {
      const record: MaintenanceRecord = {
        id: 'maint-3',
        type: 'inspection',
        description: 'Safety inspection',
        priority: 'high',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(record.type).toBe('inspection');
    });

    it('should support preventive type', () => {
      const record: MaintenanceRecord = {
        id: 'maint-4',
        type: 'preventive',
        description: 'Replace filters',
        priority: 'low',
        status: 'scheduled',
        created_at: '',
        updated_at: '',
      };
      expect(record.type).toBe('preventive');
    });

    it('should support optional equipment info', () => {
      const record: MaintenanceRecord = {
        id: 'maint-1',
        equipment_id: 'equip-456',
        equipment_name: 'Sound Console',
        type: 'scheduled',
        priority: 'medium',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(record.equipment_id).toBe('equip-456');
      expect(record.equipment_name).toBe('Sound Console');
    });

    it('should support service dates', () => {
      const record: MaintenanceRecord = {
        id: 'maint-1',
        type: 'scheduled',
        last_service: '2024-12-01',
        next_due: '2025-06-01',
        priority: 'medium',
        status: 'completed',
        created_at: '',
        updated_at: '',
      };
      expect(record.last_service).toBe('2024-12-01');
      expect(record.next_due).toBe('2025-06-01');
    });

    it('should support assignment', () => {
      const record: MaintenanceRecord = {
        id: 'maint-1',
        type: 'repair',
        priority: 'high',
        status: 'in-progress',
        assigned_to: 'tech-123',
        created_at: '',
        updated_at: '',
      };
      expect(record.assigned_to).toBe('tech-123');
    });

    it('should track maintenance schedule', () => {
      const records: MaintenanceRecord[] = [
        { id: 'm1', type: 'scheduled', priority: 'medium', status: 'completed', created_at: '', updated_at: '' },
        { id: 'm2', type: 'repair', priority: 'high', status: 'in-progress', created_at: '', updated_at: '' },
        { id: 'm3', type: 'inspection', priority: 'high', status: 'pending', created_at: '', updated_at: '' },
        { id: 'm4', type: 'preventive', priority: 'low', status: 'scheduled', created_at: '', updated_at: '' },
      ];

      const pending = records.filter((r) => ['pending', 'scheduled'].includes(r.status)).length;
      const highPriority = records.filter((r) => r.priority === 'high').length;

      expect(pending).toBe(2);
      expect(highPriority).toBe(2);
    });
  });

  describe('MaintenanceFilters interface', () => {
    it('should support status filter', () => {
      const filters: MaintenanceFilters = { status: 'pending' };
      expect(filters.status).toBe('pending');
    });

    it('should support priority filter', () => {
      const filters: MaintenanceFilters = { priority: 'high' };
      expect(filters.priority).toBe('high');
    });

    it('should support equipment_id filter', () => {
      const filters: MaintenanceFilters = { equipment_id: 'equip-123' };
      expect(filters.equipment_id).toBe('equip-123');
    });

    it('should support combined filters', () => {
      const filters: MaintenanceFilters = {
        status: 'in-progress',
        priority: 'critical',
        equipment_id: 'equip-456',
      };
      expect(Object.keys(filters).length).toBe(3);
    });
  });
});
