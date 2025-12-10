import { describe, it, expect } from 'vitest';
import type { Equipment } from '../useEquipment';

describe('useEquipment', () => {
  describe('Equipment interface', () => {
    it('should have all required fields', () => {
      const equipment: Equipment = {
        id: 'equip-123',
        name: 'RED Komodo Camera',
        type: 'camera',
        status: 'available',
        condition: 'excellent',
        created_at: new Date().toISOString(),
      };

      expect(equipment.id).toBe('equip-123');
      expect(equipment.name).toBe('RED Komodo Camera');
      expect(equipment.type).toBe('camera');
      expect(equipment.status).toBe('available');
      expect(equipment.condition).toBe('excellent');
    });

    it('should support all equipment types', () => {
      const types: Equipment['type'][] = ['camera', 'lighting', 'audio', 'grip', 'electric', 'other'];
      expect(types.length).toBe(6);
    });

    it('should support all status values', () => {
      const statuses: Equipment['status'][] = ['available', 'in_use', 'maintenance', 'retired'];
      expect(statuses.length).toBe(4);
    });

    it('should support all condition values', () => {
      const conditions: Equipment['condition'][] = ['excellent', 'good', 'fair', 'poor'];
      expect(conditions.length).toBe(4);
    });

    it('should support camera type', () => {
      const equipment: Equipment = {
        id: 'equip-1',
        name: 'ARRI Alexa Mini',
        type: 'camera',
        status: 'in_use',
        condition: 'excellent',
        serial_number: 'K1234567',
        created_at: '',
      };
      expect(equipment.type).toBe('camera');
    });

    it('should support lighting type', () => {
      const equipment: Equipment = {
        id: 'equip-2',
        name: 'ARRI SkyPanel S60',
        type: 'lighting',
        status: 'available',
        condition: 'good',
        created_at: '',
      };
      expect(equipment.type).toBe('lighting');
    });

    it('should support audio type', () => {
      const equipment: Equipment = {
        id: 'equip-3',
        name: 'Sennheiser MKH 416',
        type: 'audio',
        status: 'available',
        condition: 'excellent',
        created_at: '',
      };
      expect(equipment.type).toBe('audio');
    });

    it('should support grip type', () => {
      const equipment: Equipment = {
        id: 'equip-4',
        name: 'C-Stand',
        type: 'grip',
        status: 'available',
        condition: 'good',
        created_at: '',
      };
      expect(equipment.type).toBe('grip');
    });

    it('should support maintenance status', () => {
      const equipment: Equipment = {
        id: 'equip-1',
        name: 'Broken Lens',
        type: 'camera',
        status: 'maintenance',
        condition: 'poor',
        last_maintenance: '2025-01-01',
        next_maintenance: '2025-02-01',
        created_at: '',
      };
      expect(equipment.status).toBe('maintenance');
      expect(equipment.last_maintenance).toBeDefined();
    });

    it('should support retired status', () => {
      const equipment: Equipment = {
        id: 'equip-1',
        name: 'Old Camera',
        type: 'camera',
        status: 'retired',
        condition: 'poor',
        created_at: '',
      };
      expect(equipment.status).toBe('retired');
    });

    it('should support optional purchase info', () => {
      const equipment: Equipment = {
        id: 'equip-1',
        name: 'New Lens',
        type: 'camera',
        status: 'available',
        condition: 'excellent',
        purchase_date: '2025-01-01',
        purchase_price: 5000,
        created_at: '',
      };
      expect(equipment.purchase_date).toBe('2025-01-01');
      expect(equipment.purchase_price).toBe(5000);
    });

    it('should support optional assignment', () => {
      const equipment: Equipment = {
        id: 'equip-1',
        name: 'Camera Package',
        type: 'camera',
        status: 'in_use',
        condition: 'excellent',
        assigned_to: 'user-123',
        location: 'Stage A',
        created_at: '',
      };
      expect(equipment.assigned_to).toBe('user-123');
      expect(equipment.location).toBe('Stage A');
    });

    it('should track equipment inventory', () => {
      const inventory: Equipment[] = [
        { id: 'e1', name: 'Camera 1', type: 'camera', status: 'available', condition: 'excellent', created_at: '' },
        { id: 'e2', name: 'Camera 2', type: 'camera', status: 'in_use', condition: 'good', created_at: '' },
        { id: 'e3', name: 'Light 1', type: 'lighting', status: 'available', condition: 'excellent', created_at: '' },
        { id: 'e4', name: 'Mic 1', type: 'audio', status: 'maintenance', condition: 'fair', created_at: '' },
      ];

      const available = inventory.filter((e) => e.status === 'available').length;
      const inUse = inventory.filter((e) => e.status === 'in_use').length;
      const cameras = inventory.filter((e) => e.type === 'camera').length;

      expect(available).toBe(2);
      expect(inUse).toBe(1);
      expect(cameras).toBe(2);
    });
  });
});
