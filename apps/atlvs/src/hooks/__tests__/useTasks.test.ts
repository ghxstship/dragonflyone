import { describe, it, expect } from 'vitest';
import type { ScheduleTask, Contingency } from '../useTasks';

describe('useTasks', () => {
  describe('ScheduleTask interface', () => {
    it('should have all required fields', () => {
      const task: ScheduleTask = {
        id: 'task-123',
        production_id: 'prod-456',
        title: 'Stage Setup',
        task_type: 'setup',
        priority: 'high',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(task.id).toBe('task-123');
      expect(task.production_id).toBe('prod-456');
      expect(task.title).toBe('Stage Setup');
      expect(task.task_type).toBe('setup');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
    });

    it('should support all task types', () => {
      const types: ScheduleTask['task_type'][] = ['setup', 'rehearsal', 'performance', 'teardown', 'meeting', 'other'];
      expect(types.length).toBe(6);
    });

    it('should support all priority levels', () => {
      const priorities: ScheduleTask['priority'][] = ['low', 'medium', 'high', 'critical'];
      expect(priorities.length).toBe(4);
    });

    it('should support all status values', () => {
      const statuses: ScheduleTask['status'][] = ['pending', 'in_progress', 'completed', 'cancelled', 'blocked'];
      expect(statuses.length).toBe(5);
    });

    it('should support setup task type', () => {
      const task: ScheduleTask = {
        id: 'task-1',
        production_id: 'prod-1',
        title: 'Lighting Rig Setup',
        task_type: 'setup',
        priority: 'high',
        status: 'in_progress',
        created_at: '',
        updated_at: '',
      };
      expect(task.task_type).toBe('setup');
    });

    it('should support rehearsal task type', () => {
      const task: ScheduleTask = {
        id: 'task-2',
        production_id: 'prod-1',
        title: 'Full Band Rehearsal',
        task_type: 'rehearsal',
        priority: 'medium',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(task.task_type).toBe('rehearsal');
    });

    it('should support optional fields', () => {
      const task: ScheduleTask = {
        id: 'task-1',
        production_id: 'prod-1',
        show_id: 'show-1',
        title: 'Sound Check',
        description: 'Full sound check for all performers',
        task_type: 'rehearsal',
        priority: 'high',
        status: 'pending',
        assigned_to: 'user-123',
        department: 'Audio',
        start_time: '2025-01-15T14:00:00Z',
        end_time: '2025-01-15T16:00:00Z',
        due_date: '2025-01-15',
        dependencies: ['task-0'],
        notes: 'Ensure all microphones are tested',
        created_at: '',
        updated_at: '',
      };

      expect(task.show_id).toBe('show-1');
      expect(task.description).toBeDefined();
      expect(task.assigned_to).toBe('user-123');
      expect(task.department).toBe('Audio');
      expect(task.dependencies?.length).toBe(1);
    });

    it('should support joined data', () => {
      const task: ScheduleTask = {
        id: 'task-1',
        production_id: 'prod-1',
        title: 'Stage Setup',
        task_type: 'setup',
        priority: 'high',
        status: 'in_progress',
        created_at: '',
        updated_at: '',
        assignee: { id: 'user-1', first_name: 'John', last_name: 'Smith' },
        show: { id: 'show-1', title: 'Main Event' },
      };

      expect(task.assignee?.first_name).toBe('John');
      expect(task.show?.title).toBe('Main Event');
    });
  });

  describe('Contingency interface', () => {
    it('should have all required fields', () => {
      const contingency: Contingency = {
        id: 'cont-123',
        production_id: 'prod-456',
        title: 'Rain Plan',
        trigger_condition: 'Weather forecast shows >50% chance of rain',
        response_plan: 'Move event to indoor venue B',
        category: 'weather',
        severity: 'high',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(contingency.id).toBe('cont-123');
      expect(contingency.title).toBe('Rain Plan');
      expect(contingency.category).toBe('weather');
      expect(contingency.severity).toBe('high');
      expect(contingency.status).toBe('active');
    });

    it('should support all categories', () => {
      const categories: Contingency['category'][] = [
        'weather', 'technical', 'safety', 'medical', 'security', 'staffing', 'vendor', 'other'
      ];
      expect(categories.length).toBe(8);
    });

    it('should support all severity levels', () => {
      const severities: Contingency['severity'][] = ['low', 'medium', 'high', 'critical'];
      expect(severities.length).toBe(4);
    });

    it('should support all status values', () => {
      const statuses: Contingency['status'][] = ['active', 'triggered', 'resolved', 'archived'];
      expect(statuses.length).toBe(4);
    });

    it('should support weather category', () => {
      const contingency: Contingency = {
        id: 'cont-1',
        production_id: 'prod-1',
        title: 'Extreme Heat Plan',
        trigger_condition: 'Temperature exceeds 100F',
        response_plan: 'Increase water stations, add cooling tents',
        category: 'weather',
        severity: 'high',
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      expect(contingency.category).toBe('weather');
    });

    it('should support technical category', () => {
      const contingency: Contingency = {
        id: 'cont-2',
        production_id: 'prod-1',
        title: 'Power Failure Plan',
        trigger_condition: 'Main power grid failure',
        response_plan: 'Switch to backup generators',
        category: 'technical',
        severity: 'critical',
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      expect(contingency.category).toBe('technical');
    });

    it('should support medical category', () => {
      const contingency: Contingency = {
        id: 'cont-3',
        production_id: 'prod-1',
        title: 'Mass Casualty Plan',
        trigger_condition: 'Multiple injuries reported',
        response_plan: 'Activate emergency medical services',
        category: 'medical',
        severity: 'critical',
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      expect(contingency.category).toBe('medical');
    });

    it('should support optional fields', () => {
      const contingency: Contingency = {
        id: 'cont-1',
        production_id: 'prod-1',
        title: 'Vendor No-Show Plan',
        description: 'Plan for when primary vendor fails to deliver',
        trigger_condition: 'Vendor not on-site by T-2 hours',
        response_plan: 'Contact backup vendor, adjust timeline',
        category: 'vendor',
        severity: 'medium',
        status: 'active',
        owner_id: 'user-1',
        backup_owner_id: 'user-2',
        notification_list: ['user-3', 'user-4'],
        resources_required: ['Backup vendor contact', 'Emergency budget'],
        estimated_impact: '2 hour delay',
        created_at: '',
        updated_at: '',
      };

      expect(contingency.owner_id).toBe('user-1');
      expect(contingency.notification_list?.length).toBe(2);
      expect(contingency.resources_required?.length).toBe(2);
    });

    it('should track triggered contingencies', () => {
      const contingency: Contingency = {
        id: 'cont-1',
        production_id: 'prod-1',
        title: 'Rain Plan',
        trigger_condition: 'Rain starts',
        response_plan: 'Move indoors',
        category: 'weather',
        severity: 'high',
        status: 'triggered',
        triggered_at: '2025-01-15T14:00:00Z',
        created_at: '',
        updated_at: '',
      };

      expect(contingency.status).toBe('triggered');
      expect(contingency.triggered_at).toBeDefined();
    });
  });
});
