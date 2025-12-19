/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { getStatusBadgeProps } from '../live-status';

describe('live-status', () => {
  describe('getStatusBadgeProps', () => {
    it('should return correct props for idle status', () => {
      const props = getStatusBadgeProps('idle');
      expect(props.label).toBe('Idle');
      expect(props.variant).toBe('default');
    });

    it('should return correct props for active status', () => {
      const props = getStatusBadgeProps('active');
      expect(props.label).toBe('Active');
      expect(props.variant).toBe('success');
    });

    it('should return correct props for in_progress status', () => {
      const props = getStatusBadgeProps('in_progress');
      expect(props.label).toBe('In Progress');
      expect(props.variant).toBe('info');
    });

    it('should return correct props for pending status', () => {
      const props = getStatusBadgeProps('pending');
      expect(props.label).toBe('Pending');
      expect(props.variant).toBe('warning');
    });

    it('should return correct props for completed status', () => {
      const props = getStatusBadgeProps('completed');
      expect(props.label).toBe('Completed');
      expect(props.variant).toBe('success');
    });

    it('should return correct props for cancelled status', () => {
      const props = getStatusBadgeProps('cancelled');
      expect(props.label).toBe('Cancelled');
      expect(props.variant).toBe('default');
    });

    it('should return correct props for failed status', () => {
      const props = getStatusBadgeProps('failed');
      expect(props.label).toBe('Failed');
      expect(props.variant).toBe('error');
    });

    it('should return correct props for on_hold status', () => {
      const props = getStatusBadgeProps('on_hold');
      expect(props.label).toBe('On Hold');
      expect(props.variant).toBe('warning');
    });

    it('should return correct props for delayed status', () => {
      const props = getStatusBadgeProps('delayed');
      expect(props.label).toBe('Delayed');
      expect(props.variant).toBe('warning');
    });

    it('should return correct props for at_risk status', () => {
      const props = getStatusBadgeProps('at_risk');
      expect(props.label).toBe('At Risk');
      expect(props.variant).toBe('error');
    });

    it('should return correct props for critical status', () => {
      const props = getStatusBadgeProps('critical');
      expect(props.label).toBe('Critical');
      expect(props.variant).toBe('error');
    });

    it('should return idle props for unknown status', () => {
      const props = getStatusBadgeProps('unknown' as any);
      expect(props.label).toBe('Idle');
      expect(props.variant).toBe('default');
    });

    describe('variant groupings', () => {
      it('should use success variant for positive statuses', () => {
        expect(getStatusBadgeProps('active').variant).toBe('success');
        expect(getStatusBadgeProps('completed').variant).toBe('success');
      });

      it('should use warning variant for caution statuses', () => {
        expect(getStatusBadgeProps('pending').variant).toBe('warning');
        expect(getStatusBadgeProps('on_hold').variant).toBe('warning');
        expect(getStatusBadgeProps('delayed').variant).toBe('warning');
      });

      it('should use error variant for critical statuses', () => {
        expect(getStatusBadgeProps('failed').variant).toBe('error');
        expect(getStatusBadgeProps('at_risk').variant).toBe('error');
        expect(getStatusBadgeProps('critical').variant).toBe('error');
      });

      it('should use default variant for neutral statuses', () => {
        expect(getStatusBadgeProps('idle').variant).toBe('default');
        expect(getStatusBadgeProps('cancelled').variant).toBe('default');
      });

      it('should use info variant for informational statuses', () => {
        expect(getStatusBadgeProps('in_progress').variant).toBe('info');
      });
    });
  });
});
