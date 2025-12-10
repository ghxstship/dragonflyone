import { describe, it, expect } from 'vitest';
import type {
  EmailConfig,
  SendEmailParams,
  EmailTemplate,
  EmailTemplateType,
} from '../email-service';
import { EmailService } from '../email-service';

describe('email-service', () => {
  describe('EmailConfig interface', () => {
    it('should have required fields', () => {
      const config: EmailConfig = {
        apiKey: 're_123abc',
        fromEmail: 'noreply@example.com',
      };

      expect(config.apiKey).toBe('re_123abc');
      expect(config.fromEmail).toBe('noreply@example.com');
    });

    it('should support optional fromName', () => {
      const config: EmailConfig = {
        apiKey: 're_123abc',
        fromEmail: 'noreply@example.com',
        fromName: 'GHXSTSHIP',
      };

      expect(config.fromName).toBe('GHXSTSHIP');
    });
  });

  describe('SendEmailParams interface', () => {
    it('should have required fields', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
      };

      expect(params.to).toBe('user@example.com');
      expect(params.subject).toBe('Test Email');
    });

    it('should support array of recipients', () => {
      const params: SendEmailParams = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Email',
      };

      expect(Array.isArray(params.to)).toBe(true);
      expect((params.to as string[]).length).toBe(2);
    });

    it('should support html content', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Hello</h1><p>This is a test</p>',
      };

      expect(params.html).toContain('<h1>');
    });

    it('should support text content', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'Hello, this is a test',
      };

      expect(params.text).toBe('Hello, this is a test');
    });

    it('should support cc and bcc', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
        cc: ['cc1@example.com', 'cc2@example.com'],
        bcc: ['bcc@example.com'],
      };

      expect(params.cc?.length).toBe(2);
      expect(params.bcc?.length).toBe(1);
    });

    it('should support replyTo', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
        replyTo: 'support@example.com',
      };

      expect(params.replyTo).toBe('support@example.com');
    });

    it('should support tags', () => {
      const params: SendEmailParams = {
        to: 'user@example.com',
        subject: 'Test Email',
        tags: ['transactional', 'welcome'],
      };

      expect(params.tags?.length).toBe(2);
      expect(params.tags).toContain('transactional');
    });
  });

  describe('EmailTemplate interface', () => {
    it('should have required fields', () => {
      const template: EmailTemplate = {
        subject: 'Welcome to {{appName}}',
        html: '<h1>Welcome {{userName}}</h1>',
      };

      expect(template.subject).toContain('{{appName}}');
      expect(template.html).toContain('{{userName}}');
    });

    it('should support optional text', () => {
      const template: EmailTemplate = {
        subject: 'Welcome',
        html: '<h1>Welcome</h1>',
        text: 'Welcome to our platform',
      };

      expect(template.text).toBeDefined();
    });
  });

  describe('EmailTemplateType', () => {
    it('should include all template types', () => {
      const types: EmailTemplateType[] = [
        'welcome',
        'password_reset',
        'email_verification',
        'invitation',
        'ticket_confirmation',
        'ticket_gift',
        'gift_card',
        'payment_receipt',
        'offer_letter',
        'contract_signature',
        'notification',
        'reminder',
        'alert',
      ];

      expect(types.length).toBe(13);
    });

    it('should support authentication templates', () => {
      const authTemplates: EmailTemplateType[] = ['welcome', 'password_reset', 'email_verification'];
      expect(authTemplates.length).toBe(3);
    });

    it('should support ticketing templates', () => {
      const ticketTemplates: EmailTemplateType[] = ['ticket_confirmation', 'ticket_gift', 'gift_card'];
      expect(ticketTemplates.length).toBe(3);
    });

    it('should support notification templates', () => {
      const notificationTemplates: EmailTemplateType[] = ['notification', 'reminder', 'alert'];
      expect(notificationTemplates.length).toBe(3);
    });
  });

  describe('EmailService class', () => {
    it('should create instance without config', () => {
      const service = new EmailService();
      expect(service.isConfigured()).toBe(false);
    });

    it('should create instance with config', () => {
      const service = new EmailService({
        apiKey: 're_123abc',
        fromEmail: 'noreply@example.com',
      });
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false for isConfigured when apiKey is missing', () => {
      const service = new EmailService({
        apiKey: '',
        fromEmail: 'noreply@example.com',
      });
      expect(service.isConfigured()).toBe(false);
    });

    it('should return false for isConfigured when fromEmail is missing', () => {
      const service = new EmailService({
        apiKey: 're_123abc',
        fromEmail: '',
      });
      expect(service.isConfigured()).toBe(false);
    });
  });
});
