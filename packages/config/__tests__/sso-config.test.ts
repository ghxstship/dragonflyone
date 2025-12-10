import { describe, it, expect } from 'vitest';
import {
  SSO_PROVIDERS,
  validateSAMLConfig,
  validateOIDCConfig,
  SAMLConfig,
  OIDCConfig,
} from '../sso-config';

describe('sso-config', () => {
  describe('SSO_PROVIDERS', () => {
    it('should have saml provider', () => {
      expect(SSO_PROVIDERS.saml).toBeDefined();
      expect(SSO_PROVIDERS.saml.name).toBe('SAML 2.0');
    });

    it('should have oidc provider', () => {
      expect(SSO_PROVIDERS.oidc).toBeDefined();
      expect(SSO_PROVIDERS.oidc.name).toBe('OpenID Connect');
    });

    it('should have azure provider', () => {
      expect(SSO_PROVIDERS.azure).toBeDefined();
      expect(SSO_PROVIDERS.azure.name).toBe('Microsoft Entra ID');
    });

    it('should have okta provider', () => {
      expect(SSO_PROVIDERS.okta).toBeDefined();
      expect(SSO_PROVIDERS.okta.name).toBe('Okta');
    });

    it('should have google-workspace provider', () => {
      expect(SSO_PROVIDERS['google-workspace']).toBeDefined();
      expect(SSO_PROVIDERS['google-workspace'].name).toBe('Google Workspace');
    });

    it('should have icons for all providers', () => {
      Object.values(SSO_PROVIDERS).forEach(provider => {
        expect(provider.icon).toBeDefined();
        expect(typeof provider.icon).toBe('string');
      });
    });

    it('should have descriptions for all providers', () => {
      Object.values(SSO_PROVIDERS).forEach(provider => {
        expect(provider.description).toBeDefined();
        expect(typeof provider.description).toBe('string');
      });
    });
  });

  describe('validateSAMLConfig', () => {
    const validConfig: SAMLConfig = {
      entityId: 'https://example.com/saml/entity',
      acsUrl: 'https://example.com/saml/acs',
      idpMetadataUrl: 'https://idp.example.com/metadata',
    };

    it('should validate correct SAML config', () => {
      const result = validateSAMLConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require entityId', () => {
      const config: SAMLConfig = { ...validConfig, entityId: '' };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entity ID is required');
    });

    it('should require acsUrl', () => {
      const config: SAMLConfig = { ...validConfig, acsUrl: '' };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Assertion Consumer Service URL is required');
    });

    it('should require HTTPS for acsUrl', () => {
      const config: SAMLConfig = { ...validConfig, acsUrl: 'http://example.com/acs' };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ACS URL must use HTTPS');
    });

    it('should require either idpMetadataUrl or idpCertificate', () => {
      const config: SAMLConfig = {
        entityId: 'https://example.com/entity',
        acsUrl: 'https://example.com/acs',
      };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Either IDP Metadata URL or IDP Certificate is required');
    });

    it('should accept idpCertificate instead of idpMetadataUrl', () => {
      const config: SAMLConfig = {
        entityId: 'https://example.com/entity',
        acsUrl: 'https://example.com/acs',
        idpCertificate: '-----BEGIN CERTIFICATE-----...',
      };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should return multiple errors', () => {
      const config: SAMLConfig = {
        entityId: '',
        acsUrl: '',
      };
      const result = validateSAMLConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateOIDCConfig', () => {
    const validConfig: OIDCConfig = {
      clientId: 'client-123',
      clientSecret: 'secret-456',
      issuerUrl: 'https://idp.example.com',
    };

    it('should validate correct OIDC config', () => {
      const result = validateOIDCConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require clientId', () => {
      const config: OIDCConfig = { ...validConfig, clientId: '' };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client ID is required');
    });

    it('should require clientSecret', () => {
      const config: OIDCConfig = { ...validConfig, clientSecret: '' };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client Secret is required');
    });

    it('should require issuerUrl', () => {
      const config: OIDCConfig = { ...validConfig, issuerUrl: '' };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Issuer URL is required');
    });

    it('should require HTTPS for issuerUrl', () => {
      const config: OIDCConfig = { ...validConfig, issuerUrl: 'http://idp.example.com' };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Issuer URL must use HTTPS');
    });

    it('should return multiple errors', () => {
      const config: OIDCConfig = {
        clientId: '',
        clientSecret: '',
        issuerUrl: '',
      };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept optional scopes', () => {
      const config: OIDCConfig = {
        ...validConfig,
        scopes: ['openid', 'profile', 'email'],
      };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should accept optional claimMapping', () => {
      const config: OIDCConfig = {
        ...validConfig,
        claimMapping: {
          email: 'email',
          name: 'name',
          groups: 'groups',
        },
      };
      const result = validateOIDCConfig(config);
      expect(result.valid).toBe(true);
    });
  });
});
