import { describe, it, expect } from 'vitest';
import { formatDeviceInfo, formatLocation, getDeviceIcon, sessionKeys } from '../../hooks/useSessions';
import type { UserSession } from '../../hooks/useSessions';

// Mock session data
const mockSession: UserSession = {
  id: 'session-123',
  device_type: 'desktop',
  device_name: 'Chrome on MacOS',
  browser: 'Chrome 120',
  os: 'MacOS 14.2',
  ip_address: '192.168.1.100',
  city: 'Los Angeles',
  region: 'California',
  country: 'United States',
  is_current: true,
  status: 'active',
  created_at: '2025-01-04T10:00:00Z',
  last_active_at: '2025-01-04T15:00:00Z',
  expires_at: '2025-01-11T10:00:00Z',
};

describe('sessionKeys', () => {
  it('should generate correct query keys', () => {
    expect(sessionKeys.all).toEqual(['sessions']);
    expect(sessionKeys.list()).toEqual(['sessions', 'list']);
    expect(sessionKeys.detail('123')).toEqual(['sessions', 'detail', '123']);
  });

  it('should generate unique keys for different session IDs', () => {
    const key1 = sessionKeys.detail('abc');
    const key2 = sessionKeys.detail('xyz');
    expect(key1).not.toEqual(key2);
    expect(key1[2]).toBe('abc');
    expect(key2[2]).toBe('xyz');
  });
});

describe('formatDeviceInfo', () => {
  it('should return device_name when available', () => {
    const session: UserSession = {
      ...mockSession,
      device_name: 'Chrome on MacOS',
    };
    expect(formatDeviceInfo(session)).toBe('Chrome on MacOS');
  });

  it('should format browser and OS when device_name is null', () => {
    const session: UserSession = {
      ...mockSession,
      device_name: null,
      browser: 'Firefox 120',
      os: 'Windows 11',
    };
    expect(formatDeviceInfo(session)).toBe('Firefox 120 on Windows 11');
  });

  it('should return "Unknown device" when no info available', () => {
    const session: UserSession = {
      ...mockSession,
      device_name: null,
      browser: null,
      os: null,
    };
    expect(formatDeviceInfo(session)).toBe('Unknown device');
  });

  it('should handle browser only', () => {
    const session: UserSession = {
      ...mockSession,
      device_name: null,
      browser: 'Safari 17',
      os: null,
    };
    expect(formatDeviceInfo(session)).toBe('Safari 17');
  });

  it('should handle OS only', () => {
    const session: UserSession = {
      ...mockSession,
      device_name: null,
      browser: null,
      os: 'Linux',
    };
    expect(formatDeviceInfo(session)).toBe('on Linux');
  });
});

describe('formatLocation', () => {
  it('should format full location', () => {
    const session: UserSession = {
      ...mockSession,
      city: 'Los Angeles',
      region: 'California',
      country: 'United States',
    };
    expect(formatLocation(session)).toBe('Los Angeles, California, United States');
  });

  it('should handle partial location - city and country', () => {
    const session: UserSession = {
      ...mockSession,
      city: 'London',
      region: null,
      country: 'United Kingdom',
    };
    expect(formatLocation(session)).toBe('London, United Kingdom');
  });

  it('should handle partial location - country only', () => {
    const session: UserSession = {
      ...mockSession,
      city: null,
      region: null,
      country: 'Germany',
    };
    expect(formatLocation(session)).toBe('Germany');
  });

  it('should handle partial location - city only', () => {
    const session: UserSession = {
      ...mockSession,
      city: 'Tokyo',
      region: null,
      country: null,
    };
    expect(formatLocation(session)).toBe('Tokyo');
  });

  it('should return "Unknown location" when no info available', () => {
    const session: UserSession = {
      ...mockSession,
      city: null,
      region: null,
      country: null,
    };
    expect(formatLocation(session)).toBe('Unknown location');
  });
});

describe('getDeviceIcon', () => {
  it('should return Monitor for desktop', () => {
    expect(getDeviceIcon('desktop')).toBe('Monitor');
    expect(getDeviceIcon('DESKTOP')).toBe('Monitor');
    expect(getDeviceIcon('Desktop')).toBe('Monitor');
  });

  it('should return Smartphone for mobile', () => {
    expect(getDeviceIcon('mobile')).toBe('Smartphone');
    expect(getDeviceIcon('MOBILE')).toBe('Smartphone');
    expect(getDeviceIcon('Mobile')).toBe('Smartphone');
  });

  it('should return Tablet for tablet', () => {
    expect(getDeviceIcon('tablet')).toBe('Tablet');
    expect(getDeviceIcon('TABLET')).toBe('Tablet');
    expect(getDeviceIcon('Tablet')).toBe('Tablet');
  });

  it('should return HelpCircle for unknown types', () => {
    expect(getDeviceIcon('unknown')).toBe('HelpCircle');
    expect(getDeviceIcon('other')).toBe('HelpCircle');
    expect(getDeviceIcon('')).toBe('HelpCircle');
    expect(getDeviceIcon('smartwatch')).toBe('HelpCircle');
    expect(getDeviceIcon('tv')).toBe('HelpCircle');
  });
});
