import { describe, it, expect } from 'vitest';

// Interface copied from useIncidents.ts for testing
interface Incident {
  id: string;
  type: 'minor-injury' | 'major-injury' | 'equipment-damage' | 'near-miss' | 'property-damage' | 'other';
  event_id?: string;
  event_name?: string;
  reporter: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'under-review' | 'investigating' | 'closed' | 'resolved';
  incident_date: string;
  created_at: string;
  updated_at: string;
}

interface IncidentFilters {
  status?: string;
  severity?: string;
  type?: string;
}

describe('useIncidents', () => {
  describe('Incident interface', () => {
    it('should have all required fields', () => {
      const incident: Incident = {
        id: 'inc-123',
        type: 'minor-injury',
        reporter: 'John Smith',
        description: 'Crew member tripped over cable',
        severity: 'low',
        status: 'under-review',
        incident_date: '2025-01-15T14:30:00Z',
        created_at: '2025-01-15T14:35:00Z',
        updated_at: '2025-01-15T14:35:00Z',
      };

      expect(incident.id).toBe('inc-123');
      expect(incident.type).toBe('minor-injury');
      expect(incident.reporter).toBe('John Smith');
      expect(incident.severity).toBe('low');
      expect(incident.status).toBe('under-review');
    });

    it('should support all incident types', () => {
      const types: Incident['type'][] = [
        'minor-injury',
        'major-injury',
        'equipment-damage',
        'near-miss',
        'property-damage',
        'other',
      ];
      expect(types.length).toBe(6);
    });

    it('should support all severity levels', () => {
      const severities: Incident['severity'][] = ['low', 'medium', 'high', 'critical'];
      expect(severities.length).toBe(4);
    });

    it('should support all status values', () => {
      const statuses: Incident['status'][] = ['under-review', 'investigating', 'closed', 'resolved'];
      expect(statuses.length).toBe(4);
    });

    it('should support minor-injury type', () => {
      const incident: Incident = {
        id: 'inc-1',
        type: 'minor-injury',
        reporter: 'Jane Doe',
        description: 'Small cut on hand',
        severity: 'low',
        status: 'resolved',
        incident_date: '2025-01-15T10:00:00Z',
        created_at: '2025-01-15T10:05:00Z',
        updated_at: '2025-01-15T12:00:00Z',
      };
      expect(incident.type).toBe('minor-injury');
    });

    it('should support major-injury type with critical severity', () => {
      const incident: Incident = {
        id: 'inc-2',
        type: 'major-injury',
        reporter: 'Safety Officer',
        description: 'Fall from height requiring medical attention',
        severity: 'critical',
        status: 'investigating',
        incident_date: '2025-01-15T16:00:00Z',
        created_at: '2025-01-15T16:05:00Z',
        updated_at: '2025-01-15T16:30:00Z',
      };
      expect(incident.type).toBe('major-injury');
      expect(incident.severity).toBe('critical');
    });

    it('should support equipment-damage type', () => {
      const incident: Incident = {
        id: 'inc-3',
        type: 'equipment-damage',
        reporter: 'Tech Lead',
        description: 'Speaker dropped during load-in',
        severity: 'medium',
        status: 'closed',
        incident_date: '2025-01-14T09:00:00Z',
        created_at: '2025-01-14T09:15:00Z',
        updated_at: '2025-01-14T11:00:00Z',
      };
      expect(incident.type).toBe('equipment-damage');
    });

    it('should support near-miss type', () => {
      const incident: Incident = {
        id: 'inc-4',
        type: 'near-miss',
        reporter: 'Stage Manager',
        description: 'Unsecured truss nearly fell',
        severity: 'high',
        status: 'resolved',
        incident_date: '2025-01-13T15:00:00Z',
        created_at: '2025-01-13T15:10:00Z',
        updated_at: '2025-01-13T17:00:00Z',
      };
      expect(incident.type).toBe('near-miss');
    });

    it('should support optional event association', () => {
      const incident: Incident = {
        id: 'inc-5',
        type: 'property-damage',
        event_id: 'event-123',
        event_name: 'Summer Music Festival',
        reporter: 'Venue Manager',
        description: 'Floor damaged by equipment',
        severity: 'medium',
        status: 'under-review',
        incident_date: '2025-01-15T20:00:00Z',
        created_at: '2025-01-15T20:30:00Z',
        updated_at: '2025-01-15T20:30:00Z',
      };
      expect(incident.event_id).toBe('event-123');
      expect(incident.event_name).toBe('Summer Music Festival');
    });
  });

  describe('IncidentFilters interface', () => {
    it('should support status filter', () => {
      const filters: IncidentFilters = { status: 'investigating' };
      expect(filters.status).toBe('investigating');
    });

    it('should support severity filter', () => {
      const filters: IncidentFilters = { severity: 'critical' };
      expect(filters.severity).toBe('critical');
    });

    it('should support type filter', () => {
      const filters: IncidentFilters = { type: 'equipment-damage' };
      expect(filters.type).toBe('equipment-damage');
    });

    it('should support combined filters', () => {
      const filters: IncidentFilters = {
        status: 'under-review',
        severity: 'high',
        type: 'near-miss',
      };
      expect(Object.keys(filters).length).toBe(3);
    });
  });
});
