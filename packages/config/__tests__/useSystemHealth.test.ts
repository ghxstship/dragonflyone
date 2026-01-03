import { describe, it, expect } from 'vitest';
import {
  getHealthStatusColor,
  getHealthStatusLabel,
} from '../hooks/useSystemHealth';

describe('useSystemHealth utilities', () => {
  describe('getHealthStatusColor', () => {
    it('should return success color for healthy status', () => {
      expect(getHealthStatusColor('healthy')).toBe('text-success');
    });

    it('should return warning color for degraded status', () => {
      expect(getHealthStatusColor('degraded')).toBe('text-warning');
    });

    it('should return error color for down status', () => {
      expect(getHealthStatusColor('down')).toBe('text-error');
    });

    it('should return grey color for unknown status', () => {
      // @ts-expect-error - testing unknown status
      expect(getHealthStatusColor('unknown')).toBe('text-text-muted');
    });
  });

  describe('getHealthStatusLabel', () => {
    it('should return "Healthy" for healthy status', () => {
      expect(getHealthStatusLabel('healthy')).toBe('Healthy');
    });

    it('should return "Degraded" for degraded status', () => {
      expect(getHealthStatusLabel('degraded')).toBe('Degraded');
    });

    it('should return "Down" for down status', () => {
      expect(getHealthStatusLabel('down')).toBe('Down');
    });

    it('should return "Unknown" for unknown status', () => {
      // @ts-expect-error - testing unknown status
      expect(getHealthStatusLabel('unknown')).toBe('Unknown');
    });
  });
});
