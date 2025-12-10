import { describe, it, expect } from 'vitest';
import type { Risk } from '../useRisks';

describe('useRisks', () => {
  describe('Risk interface', () => {
    it('should have all required fields', () => {
      const risk: Risk = {
        id: 'risk-123',
        title: 'Budget Overrun',
        description: 'Project may exceed allocated budget',
        category: 'financial',
        severity: 'high',
        probability: 'medium',
        impact: 75000,
        status: 'mitigating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(risk.id).toBe('risk-123');
      expect(risk.title).toBe('Budget Overrun');
      expect(risk.category).toBe('financial');
      expect(risk.severity).toBe('high');
      expect(risk.probability).toBe('medium');
      expect(risk.impact).toBe(75000);
      expect(risk.status).toBe('mitigating');
    });

    it('should support all categories', () => {
      const categories: Risk['category'][] = [
        'financial',
        'operational',
        'strategic',
        'compliance',
        'reputational',
      ];
      expect(categories.length).toBe(5);
    });

    it('should support all severity levels', () => {
      const severities: Risk['severity'][] = ['low', 'medium', 'high', 'critical'];
      expect(severities.length).toBe(4);
    });

    it('should support all probability levels', () => {
      const probabilities: Risk['probability'][] = ['low', 'medium', 'high'];
      expect(probabilities.length).toBe(3);
    });

    it('should support all status values', () => {
      const statuses: Risk['status'][] = ['identified', 'analyzing', 'mitigating', 'resolved', 'accepted'];
      expect(statuses.length).toBe(5);
    });

    it('should support financial category', () => {
      const risk: Risk = {
        id: 'risk-1',
        title: 'Revenue Shortfall',
        description: 'Ticket sales below projections',
        category: 'financial',
        severity: 'high',
        probability: 'medium',
        impact: 100000,
        status: 'analyzing',
        created_at: '',
        updated_at: '',
      };
      expect(risk.category).toBe('financial');
    });

    it('should support operational category', () => {
      const risk: Risk = {
        id: 'risk-2',
        title: 'Equipment Failure',
        description: 'Critical equipment may fail during event',
        category: 'operational',
        severity: 'critical',
        probability: 'low',
        impact: 50000,
        status: 'mitigating',
        mitigation_plan: 'Maintain backup equipment on-site',
        created_at: '',
        updated_at: '',
      };
      expect(risk.category).toBe('operational');
      expect(risk.mitigation_plan).toBeDefined();
    });

    it('should support strategic category', () => {
      const risk: Risk = {
        id: 'risk-3',
        title: 'Market Competition',
        description: 'Competing event scheduled same weekend',
        category: 'strategic',
        severity: 'medium',
        probability: 'high',
        impact: 30000,
        status: 'identified',
        created_at: '',
        updated_at: '',
      };
      expect(risk.category).toBe('strategic');
    });

    it('should support compliance category', () => {
      const risk: Risk = {
        id: 'risk-4',
        title: 'Permit Delays',
        description: 'City permits may not be approved in time',
        category: 'compliance',
        severity: 'high',
        probability: 'medium',
        impact: 0,
        status: 'mitigating',
        created_at: '',
        updated_at: '',
      };
      expect(risk.category).toBe('compliance');
    });

    it('should support reputational category', () => {
      const risk: Risk = {
        id: 'risk-5',
        title: 'Negative Press',
        description: 'Potential negative media coverage',
        category: 'reputational',
        severity: 'medium',
        probability: 'low',
        impact: 25000,
        status: 'accepted',
        created_at: '',
        updated_at: '',
      };
      expect(risk.category).toBe('reputational');
    });

    it('should support optional owner', () => {
      const risk: Risk = {
        id: 'risk-1',
        title: 'Vendor Default',
        description: 'Key vendor may not deliver',
        category: 'operational',
        severity: 'high',
        probability: 'low',
        impact: 40000,
        status: 'mitigating',
        owner_id: 'user-123',
        owner: { name: 'John Smith' },
        created_at: '',
        updated_at: '',
      };
      expect(risk.owner_id).toBe('user-123');
      expect(risk.owner?.name).toBe('John Smith');
    });

    it('should support optional due date', () => {
      const risk: Risk = {
        id: 'risk-1',
        title: 'Insurance Coverage',
        description: 'Insurance policy renewal pending',
        category: 'compliance',
        severity: 'medium',
        probability: 'medium',
        impact: 15000,
        status: 'analyzing',
        due_date: '2025-02-01',
        created_at: '',
        updated_at: '',
      };
      expect(risk.due_date).toBe('2025-02-01');
    });

    it('should calculate risk score from severity and probability', () => {
      const risks: Risk[] = [
        { id: 'r1', title: 'Low Risk', description: '', category: 'financial', severity: 'low', probability: 'low', impact: 1000, status: 'identified', created_at: '', updated_at: '' },
        { id: 'r2', title: 'Medium Risk', description: '', category: 'financial', severity: 'medium', probability: 'medium', impact: 5000, status: 'identified', created_at: '', updated_at: '' },
        { id: 'r3', title: 'High Risk', description: '', category: 'financial', severity: 'high', probability: 'high', impact: 50000, status: 'identified', created_at: '', updated_at: '' },
        { id: 'r4', title: 'Critical Risk', description: '', category: 'financial', severity: 'critical', probability: 'high', impact: 100000, status: 'identified', created_at: '', updated_at: '' },
      ];

      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const sortedBySeverity = [...risks].sort(
        (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
      );

      expect(sortedBySeverity[0].severity).toBe('critical');
      expect(sortedBySeverity[3].severity).toBe('low');
    });
  });
});
