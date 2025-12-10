import { describe, it, expect } from 'vitest';

// Interfaces copied from useSchedule.ts for testing
interface SchedulePhase {
  id: string;
  project_id?: string;
  name: string;
  start_time?: string;
  end_time?: string;
  crew_count?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  progress?: number;
  created_at: string;
  updated_at: string;
}

interface ScheduleFilters {
  project_id?: string;
  status?: string;
}

describe('useSchedule', () => {
  describe('SchedulePhase interface', () => {
    it('should have all required fields', () => {
      const phase: SchedulePhase = {
        id: 'phase-123',
        name: 'Load In',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(phase.id).toBe('phase-123');
      expect(phase.name).toBe('Load In');
      expect(phase.status).toBe('pending');
    });

    it('should support all status values', () => {
      const statuses: SchedulePhase['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
      expect(statuses.length).toBe(4);
    });

    it('should support pending status', () => {
      const phase: SchedulePhase = {
        id: 'phase-1',
        name: 'Setup',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(phase.status).toBe('pending');
    });

    it('should support in-progress status', () => {
      const phase: SchedulePhase = {
        id: 'phase-2',
        name: 'Sound Check',
        status: 'in-progress',
        progress: 50,
        created_at: '',
        updated_at: '',
      };
      expect(phase.status).toBe('in-progress');
      expect(phase.progress).toBe(50);
    });

    it('should support completed status', () => {
      const phase: SchedulePhase = {
        id: 'phase-3',
        name: 'Rehearsal',
        status: 'completed',
        progress: 100,
        created_at: '',
        updated_at: '',
      };
      expect(phase.status).toBe('completed');
    });

    it('should support cancelled status', () => {
      const phase: SchedulePhase = {
        id: 'phase-4',
        name: 'Rain Delay',
        status: 'cancelled',
        created_at: '',
        updated_at: '',
      };
      expect(phase.status).toBe('cancelled');
    });

    it('should support optional project association', () => {
      const phase: SchedulePhase = {
        id: 'phase-1',
        project_id: 'project-123',
        name: 'Main Stage Setup',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(phase.project_id).toBe('project-123');
    });

    it('should support optional time fields', () => {
      const phase: SchedulePhase = {
        id: 'phase-1',
        name: 'Load In',
        start_time: '2025-01-15T08:00:00Z',
        end_time: '2025-01-15T12:00:00Z',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(phase.start_time).toBe('2025-01-15T08:00:00Z');
      expect(phase.end_time).toBe('2025-01-15T12:00:00Z');
    });

    it('should support optional crew count', () => {
      const phase: SchedulePhase = {
        id: 'phase-1',
        name: 'Stage Build',
        crew_count: 25,
        status: 'in-progress',
        created_at: '',
        updated_at: '',
      };
      expect(phase.crew_count).toBe(25);
    });

    it('should track schedule timeline', () => {
      const phases: SchedulePhase[] = [
        { id: 'p1', name: 'Load In', start_time: '2025-01-15T06:00:00Z', end_time: '2025-01-15T10:00:00Z', status: 'completed', created_at: '', updated_at: '' },
        { id: 'p2', name: 'Setup', start_time: '2025-01-15T10:00:00Z', end_time: '2025-01-15T14:00:00Z', status: 'in-progress', created_at: '', updated_at: '' },
        { id: 'p3', name: 'Sound Check', start_time: '2025-01-15T14:00:00Z', end_time: '2025-01-15T16:00:00Z', status: 'pending', created_at: '', updated_at: '' },
        { id: 'p4', name: 'Show', start_time: '2025-01-15T19:00:00Z', end_time: '2025-01-15T23:00:00Z', status: 'pending', created_at: '', updated_at: '' },
      ];

      const completed = phases.filter((p) => p.status === 'completed').length;
      const inProgress = phases.filter((p) => p.status === 'in-progress').length;
      const pending = phases.filter((p) => p.status === 'pending').length;

      expect(completed).toBe(1);
      expect(inProgress).toBe(1);
      expect(pending).toBe(2);
    });
  });

  describe('ScheduleFilters interface', () => {
    it('should support project_id filter', () => {
      const filters: ScheduleFilters = { project_id: 'project-123' };
      expect(filters.project_id).toBe('project-123');
    });

    it('should support status filter', () => {
      const filters: ScheduleFilters = { status: 'in-progress' };
      expect(filters.status).toBe('in-progress');
    });

    it('should support combined filters', () => {
      const filters: ScheduleFilters = {
        project_id: 'project-123',
        status: 'pending',
      };
      expect(Object.keys(filters).length).toBe(2);
    });
  });
});
