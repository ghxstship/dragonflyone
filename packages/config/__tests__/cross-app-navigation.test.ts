import { describe, it, expect } from 'vitest';
import {
  APP_CONFIG,
  generateDeepLink,
  parseDeepLink,
  getProductionCrossAppLinks,
  getEventCrossAppLinks,
  isCrossAppLink,
} from '../cross-app-navigation';

describe('cross-app-navigation', () => {
  describe('APP_CONFIG', () => {
    it('should have config for all apps', () => {
      expect(APP_CONFIG.atlvs).toBeDefined();
      expect(APP_CONFIG.compvss).toBeDefined();
      expect(APP_CONFIG.gvteway).toBeDefined();
    });

    it('should have correct display names', () => {
      expect(APP_CONFIG.atlvs.displayName).toBe('ATLVS');
      expect(APP_CONFIG.compvss.displayName).toBe('COMPVSS');
      expect(APP_CONFIG.gvteway.displayName).toBe('GVTEWAY');
    });

    it('should have descriptions for all apps', () => {
      expect(APP_CONFIG.atlvs.description).toBeTruthy();
      expect(APP_CONFIG.compvss.description).toBeTruthy();
      expect(APP_CONFIG.gvteway.description).toBeTruthy();
    });
  });

  describe('generateDeepLink', () => {
    it('should generate basic deep link', () => {
      const url = generateDeepLink({
        app: 'atlvs',
        path: '/dashboard',
      });
      expect(url).toContain('/dashboard');
    });

    it('should include production context for atlvs', () => {
      const url = generateDeepLink({
        app: 'atlvs',
        path: '/overview',
        productionId: 'prod-123',
      });
      expect(url).toContain('/p/prod-123/overview');
    });

    it('should include production context for compvss', () => {
      const url = generateDeepLink({
        app: 'compvss',
        path: '/crew',
        productionId: 'prod-456',
      });
      expect(url).toContain('/p/prod-456/crew');
    });

    it('should include event context for gvteway', () => {
      const url = generateDeepLink({
        app: 'gvteway',
        path: '/tickets',
        eventId: 'event-789',
      });
      expect(url).toContain('/e/event-789/tickets');
    });

    it('should add query parameters', () => {
      const url = generateDeepLink({
        app: 'atlvs',
        path: '/search',
        params: { q: 'test', page: '1' },
      });
      expect(url).toContain('?');
      expect(url).toContain('q=test');
      expect(url).toContain('page=1');
    });

    it('should handle path without leading slash', () => {
      const url = generateDeepLink({
        app: 'atlvs',
        path: 'dashboard',
      });
      expect(url).toContain('/dashboard');
    });
  });

  describe('parseDeepLink', () => {
    it('should parse atlvs URL', () => {
      const result = parseDeepLink('http://localhost:3001/dashboard');
      expect(result).not.toBeNull();
      expect(result?.app).toBe('atlvs');
      expect(result?.path).toBe('/dashboard');
    });

    it('should parse production context', () => {
      const result = parseDeepLink('http://localhost:3001/p/prod-123/overview');
      expect(result).not.toBeNull();
      expect(result?.productionId).toBe('prod-123');
      expect(result?.path).toBe('/overview');
    });

    it('should parse event context', () => {
      const result = parseDeepLink('http://localhost:3003/e/event-456/tickets');
      expect(result).not.toBeNull();
      expect(result?.eventId).toBe('event-456');
      expect(result?.path).toBe('/tickets');
    });

    it('should parse query parameters', () => {
      const result = parseDeepLink('http://localhost:3001/search?q=test&page=2');
      expect(result).not.toBeNull();
      expect(result?.params).toEqual({ q: 'test', page: '2' });
    });

    it('should return null for invalid URL', () => {
      const result = parseDeepLink('not-a-url');
      expect(result).toBeNull();
    });

    it('should return null for unknown app', () => {
      const result = parseDeepLink('http://unknown-app.com/path');
      expect(result).toBeNull();
    });
  });

  describe('getProductionCrossAppLinks', () => {
    it('should return links for production context', () => {
      const links = getProductionCrossAppLinks('prod-123');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should include atlvs links', () => {
      const links = getProductionCrossAppLinks('prod-123');
      const atlvsLinks = links.filter(l => l.app === 'atlvs');
      expect(atlvsLinks.length).toBeGreaterThan(0);
    });

    it('should include compvss links', () => {
      const links = getProductionCrossAppLinks('prod-123');
      const compvssLinks = links.filter(l => l.app === 'compvss');
      expect(compvssLinks.length).toBeGreaterThan(0);
    });

    it('should include production ID in paths', () => {
      const links = getProductionCrossAppLinks('prod-123');
      links.forEach(link => {
        expect(link.path).toContain('prod-123');
      });
    });

    it('should have labels and descriptions', () => {
      const links = getProductionCrossAppLinks('prod-123');
      links.forEach(link => {
        expect(link.label).toBeTruthy();
        expect(link.description).toBeTruthy();
      });
    });
  });

  describe('getEventCrossAppLinks', () => {
    it('should return links for event context', () => {
      const links = getEventCrossAppLinks('event-456');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should include gvteway links', () => {
      const links = getEventCrossAppLinks('event-456');
      const gvtewayLinks = links.filter(l => l.app === 'gvteway');
      expect(gvtewayLinks.length).toBeGreaterThan(0);
    });

    it('should include event ID in paths', () => {
      const links = getEventCrossAppLinks('event-456');
      const gvtewayLinks = links.filter(l => l.app === 'gvteway');
      gvtewayLinks.forEach(link => {
        expect(link.path).toContain('event-456');
      });
    });

    it('should include production links when productionId provided', () => {
      const links = getEventCrossAppLinks('event-456', 'prod-123');
      const atlvsLinks = links.filter(l => l.app === 'atlvs');
      const compvssLinks = links.filter(l => l.app === 'compvss');
      expect(atlvsLinks.length).toBeGreaterThan(0);
      expect(compvssLinks.length).toBeGreaterThan(0);
    });

    it('should not include production links without productionId', () => {
      const links = getEventCrossAppLinks('event-456');
      const atlvsLinks = links.filter(l => l.app === 'atlvs');
      expect(atlvsLinks.length).toBe(0);
    });
  });

  describe('isCrossAppLink', () => {
    it('should return true for different app', () => {
      const url = 'http://localhost:3002/crew';
      expect(isCrossAppLink(url, 'atlvs')).toBe(true);
    });

    it('should return false for same app', () => {
      const url = 'http://localhost:3001/dashboard';
      expect(isCrossAppLink(url, 'atlvs')).toBe(false);
    });

    it('should return false for invalid URL', () => {
      expect(isCrossAppLink('not-a-url', 'atlvs')).toBe(false);
    });

    it('should return false for unknown app URL', () => {
      expect(isCrossAppLink('http://unknown.com/path', 'atlvs')).toBe(false);
    });
  });
});
