import { describe, it, expect } from 'vitest';
import {
  getStatusVariant,
  getBadgeVariant,
  getSeverityVariant,
  getSyncStatusVariant,
} from '../status-utils';

describe('status-utils', () => {
  describe('getStatusVariant', () => {
    describe('success states', () => {
      it('should return success for completed', () => {
        expect(getStatusVariant('completed')).toBe('success');
      });

      it('should return success for done', () => {
        expect(getStatusVariant('done')).toBe('success');
      });

      it('should return success for approved', () => {
        expect(getStatusVariant('approved')).toBe('success');
      });

      it('should return success for active', () => {
        expect(getStatusVariant('active')).toBe('success');
      });

      it('should return success for on_track', () => {
        expect(getStatusVariant('on_track')).toBe('success');
      });

      it('should return success for available', () => {
        expect(getStatusVariant('available')).toBe('success');
      });
    });

    describe('error states', () => {
      it('should return error for error', () => {
        expect(getStatusVariant('error')).toBe('error');
      });

      it('should return error for failed', () => {
        expect(getStatusVariant('failed')).toBe('error');
      });

      it('should return error for rejected', () => {
        expect(getStatusVariant('rejected')).toBe('error');
      });

      it('should return error for overdue', () => {
        expect(getStatusVariant('overdue')).toBe('error');
      });

      it('should return error for critical', () => {
        expect(getStatusVariant('critical')).toBe('error');
      });
    });

    describe('warning states', () => {
      it('should return warning for warning', () => {
        expect(getStatusVariant('warning')).toBe('warning');
      });

      it('should return warning for at_risk', () => {
        expect(getStatusVariant('at_risk')).toBe('warning');
      });

      it('should return warning for delayed', () => {
        expect(getStatusVariant('delayed')).toBe('warning');
      });

      it('should return warning for in_review', () => {
        expect(getStatusVariant('in_review')).toBe('warning');
      });
    });

    describe('info states', () => {
      it('should return info for tracking', () => {
        expect(getStatusVariant('tracking')).toBe('info');
      });

      it('should return info for in_progress', () => {
        expect(getStatusVariant('in_progress')).toBe('info');
      });

      it('should return info for processing', () => {
        expect(getStatusVariant('processing')).toBe('info');
      });
    });

    describe('active states', () => {
      it('should return active for scheduled', () => {
        expect(getStatusVariant('scheduled')).toBe('active');
      });

      it('should return active for confirmed', () => {
        expect(getStatusVariant('confirmed')).toBe('active');
      });

      it('should return active for assigned', () => {
        expect(getStatusVariant('assigned')).toBe('active');
      });
    });

    describe('inactive states', () => {
      it('should return inactive for inactive', () => {
        expect(getStatusVariant('inactive')).toBe('inactive');
      });

      it('should return inactive for archived', () => {
        expect(getStatusVariant('archived')).toBe('inactive');
      });

      it('should return inactive for cancelled', () => {
        expect(getStatusVariant('cancelled')).toBe('inactive');
      });

      it('should return inactive for closeout', () => {
        expect(getStatusVariant('closeout')).toBe('inactive');
      });
    });

    describe('neutral states', () => {
      it('should return neutral for draft', () => {
        expect(getStatusVariant('draft')).toBe('neutral');
      });

      it('should return neutral for unknown', () => {
        expect(getStatusVariant('unknown')).toBe('neutral');
      });
    });

    describe('default behavior', () => {
      it('should return pending for unrecognized status', () => {
        expect(getStatusVariant('something_random')).toBe('pending');
      });

      it('should handle case insensitivity', () => {
        expect(getStatusVariant('COMPLETED')).toBe('success');
        expect(getStatusVariant('Failed')).toBe('error');
      });

      it('should handle underscores and hyphens', () => {
        expect(getStatusVariant('in-progress')).toBe('info');
        expect(getStatusVariant('at-risk')).toBe('warning');
      });
    });
  });

  describe('getBadgeVariant', () => {
    it('should return solid for active states', () => {
      expect(getBadgeVariant('active')).toBe('solid');
      expect(getBadgeVariant('completed')).toBe('solid');
      expect(getBadgeVariant('approved')).toBe('solid');
      expect(getBadgeVariant('on_track')).toBe('solid');
    });

    it('should return outline for pending states', () => {
      expect(getBadgeVariant('pending')).toBe('outline');
      expect(getBadgeVariant('draft')).toBe('outline');
      expect(getBadgeVariant('scheduled')).toBe('outline');
      expect(getBadgeVariant('under')).toBe('outline');
    });

    it('should return ghost for other states', () => {
      expect(getBadgeVariant('unknown')).toBe('ghost');
      expect(getBadgeVariant('random')).toBe('ghost');
    });

    it('should handle case insensitivity', () => {
      expect(getBadgeVariant('ACTIVE')).toBe('solid');
      expect(getBadgeVariant('Pending')).toBe('outline');
    });
  });

  describe('getSeverityVariant', () => {
    it('should return error for critical', () => {
      expect(getSeverityVariant('critical')).toBe('error');
    });

    it('should return error for high', () => {
      expect(getSeverityVariant('high')).toBe('error');
    });

    it('should return warning for medium', () => {
      expect(getSeverityVariant('medium')).toBe('warning');
    });

    it('should return info for low', () => {
      expect(getSeverityVariant('low')).toBe('info');
    });

    it('should return neutral for unknown severity', () => {
      expect(getSeverityVariant('unknown')).toBe('neutral');
      expect(getSeverityVariant('none')).toBe('neutral');
    });

    it('should handle case insensitivity', () => {
      expect(getSeverityVariant('CRITICAL')).toBe('error');
      expect(getSeverityVariant('Medium')).toBe('warning');
    });
  });

  describe('getSyncStatusVariant', () => {
    it('should return success for synced', () => {
      expect(getSyncStatusVariant('synced')).toBe('success');
    });

    it('should return success for connected', () => {
      expect(getSyncStatusVariant('connected')).toBe('success');
    });

    it('should return info for syncing', () => {
      expect(getSyncStatusVariant('syncing')).toBe('info');
    });

    it('should return info for in_progress', () => {
      expect(getSyncStatusVariant('in_progress')).toBe('info');
    });

    it('should return pending for pending', () => {
      expect(getSyncStatusVariant('pending')).toBe('pending');
    });

    it('should return error for failed', () => {
      expect(getSyncStatusVariant('failed')).toBe('error');
    });

    it('should return error for blocked', () => {
      expect(getSyncStatusVariant('blocked')).toBe('error');
    });

    it('should return neutral for unknown status', () => {
      expect(getSyncStatusVariant('unknown')).toBe('neutral');
    });

    it('should handle case insensitivity', () => {
      expect(getSyncStatusVariant('SYNCED')).toBe('success');
      expect(getSyncStatusVariant('Failed')).toBe('error');
    });
  });
});
