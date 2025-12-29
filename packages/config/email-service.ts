/**
 * Email Service
 * Centralized email sending with templates for all apps
 */

import { logger } from './logger';

// =============================================================================
// TYPES
// =============================================================================

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: string[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export type EmailTemplateType =
  | 'welcome'
  | 'password_reset'
  | 'email_verification'
  | 'invitation'
  | 'ticket_confirmation'
  | 'ticket_gift'
  | 'gift_card'
  | 'payment_receipt'
  | 'offer_letter'
  | 'contract_signature'
  | 'notification'
  | 'reminder'
  | 'alert';

// =============================================================================
// EMAIL SERVICE
// =============================================================================

export class EmailService {
  private config: EmailConfig | null = null;

  constructor(config?: EmailConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Initialize with environment variables
   */
  static fromEnv(): EmailService {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      return new EmailService();
    }

    return new EmailService({
      apiKey,
      fromEmail,
      fromName: 'GHXSTSHIP',
    });
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.config !== null && !!this.config.apiKey && !!this.config.fromEmail;
  }

  /**
   * Send an email
   */
  async send(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('[EmailService] Not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config!.fromName
            ? `${this.config!.fromName} <${this.config!.fromEmail}>`
            : this.config!.fromEmail,
          to: Array.isArray(params.to) ? params.to : [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
          reply_to: params.replyTo,
          cc: params.cc,
          bcc: params.bcc,
          tags: params.tags?.map(tag => ({ name: tag })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[EmailService] Failed to send', undefined, { errorText });
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[EmailService] Error', undefined, { message });
      return { success: false, error: message };
    }
  }

  /**
   * Send using a template
   */
  async sendTemplate(
    templateType: EmailTemplateType,
    to: string | string[],
    variables: Record<string, string>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const template = this.getTemplate(templateType, variables);
    return this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Get email template with variables replaced
   */
  private getTemplate(type: EmailTemplateType, vars: Record<string, string>): EmailTemplate {
    const templates: Record<EmailTemplateType, EmailTemplate> = {
      welcome: {
        subject: `Welcome to GHXSTSHIP, ${vars.name || 'there'}!`,
        html: this.wrapHtml(`
          <h1>Welcome to GHXSTSHIP</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>Thank you for joining GHXSTSHIP. We're excited to have you on board!</p>
          <p>Get started by exploring your dashboard.</p>
          <a href="${vars.dashboardUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Go to Dashboard</a>
        `),
      },
      password_reset: {
        subject: 'Reset Your Password',
        html: this.wrapHtml(`
          <h1>Password Reset Request</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${vars.resetUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Reset Password</a>
          <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        `),
      },
      email_verification: {
        subject: 'Verify Your Email',
        html: this.wrapHtml(`
          <h1>Verify Your Email</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${vars.verifyUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Verify Email</a>
        `),
      },
      invitation: {
        subject: `You've been invited to join ${vars.organizationName || 'GHXSTSHIP'}`,
        html: this.wrapHtml(`
          <h1>You're Invited!</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>${vars.inviterName || 'Someone'} has invited you to join ${vars.organizationName || 'their organization'} on GHXSTSHIP.</p>
          <a href="${vars.inviteUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Accept Invitation</a>
          <p>This invitation will expire in 7 days.</p>
        `),
      },
      ticket_confirmation: {
        subject: `Your tickets for ${vars.eventName || 'the event'}`,
        html: this.wrapHtml(`
          <h1>Ticket Confirmation</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>Your tickets for <strong>${vars.eventName || 'the event'}</strong> have been confirmed!</p>
          <p><strong>Order #:</strong> ${vars.orderNumber || 'N/A'}</p>
          <p><strong>Quantity:</strong> ${vars.quantity || '1'}</p>
          <p><strong>Date:</strong> ${vars.eventDate || 'TBD'}</p>
          <p><strong>Venue:</strong> ${vars.venueName || 'TBD'}</p>
          <a href="${vars.ticketUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">View Tickets</a>
        `),
      },
      ticket_gift: {
        subject: `${vars.senderName || 'Someone'} sent you tickets to ${vars.eventName || 'an event'}!`,
        html: this.wrapHtml(`
          <h1>You've Received a Gift!</h1>
          <p>Hi ${vars.recipientName || 'there'},</p>
          <p><strong>${vars.senderName || 'Someone'}</strong> has gifted you tickets to <strong>${vars.eventName || 'an event'}</strong>!</p>
          ${vars.message ? `<p><em>"${vars.message}"</em></p>` : ''}
          <p><strong>Date:</strong> ${vars.eventDate || 'TBD'}</p>
          <p><strong>Venue:</strong> ${vars.venueName || 'TBD'}</p>
          <a href="${vars.claimUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Claim Your Tickets</a>
        `),
      },
      gift_card: {
        subject: `${vars.senderName || 'Someone'} sent you a gift card!`,
        html: this.wrapHtml(`
          <h1>You've Received a Gift Card!</h1>
          <p>Hi ${vars.recipientName || 'there'},</p>
          <p><strong>${vars.senderName || 'Someone'}</strong> has sent you a $${vars.amount || '0'} gift card!</p>
          ${vars.message ? `<p><em>"${vars.message}"</em></p>` : ''}
          <p><strong>Gift Card Code:</strong> ${vars.code || 'N/A'}</p>
          <a href="${vars.redeemUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Redeem Gift Card</a>
        `),
      },
      payment_receipt: {
        subject: `Receipt for your purchase - Order #${vars.orderNumber || 'N/A'}`,
        html: this.wrapHtml(`
          <h1>Payment Receipt</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>Thank you for your purchase!</p>
          <p><strong>Order #:</strong> ${vars.orderNumber || 'N/A'}</p>
          <p><strong>Amount:</strong> $${vars.amount || '0.00'}</p>
          <p><strong>Date:</strong> ${vars.date || new Date().toLocaleDateString()}</p>
          <a href="${vars.receiptUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">View Receipt</a>
        `),
      },
      offer_letter: {
        subject: `Offer Letter from ${vars.organizationName || 'GHXSTSHIP'}`,
        html: this.wrapHtml(`
          <h1>Offer Letter</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>Congratulations! ${vars.organizationName || 'We'} would like to extend an offer for the position of <strong>${vars.position || 'Team Member'}</strong>.</p>
          <p>Please review and sign the attached offer letter.</p>
          <a href="${vars.signUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Review & Sign</a>
          <p>This offer expires on ${vars.expiryDate || 'N/A'}.</p>
        `),
      },
      contract_signature: {
        subject: `Contract ready for signature - ${vars.contractName || 'Document'}`,
        html: this.wrapHtml(`
          <h1>Contract Ready for Signature</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>A contract is ready for your signature:</p>
          <p><strong>${vars.contractName || 'Document'}</strong></p>
          <a href="${vars.signUrl || '#'}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">Sign Contract</a>
        `),
      },
      notification: {
        subject: vars.subject || 'Notification from GHXSTSHIP',
        html: this.wrapHtml(`
          <h1>${vars.title || 'Notification'}</h1>
          <p>${vars.message || ''}</p>
          ${vars.actionUrl ? `<a href="${vars.actionUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">${vars.actionText || 'View'}</a>` : ''}
        `),
      },
      reminder: {
        subject: `Reminder: ${vars.title || 'Action Required'}`,
        html: this.wrapHtml(`
          <h1>Reminder</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p>${vars.message || 'This is a reminder.'}</p>
          ${vars.actionUrl ? `<a href="${vars.actionUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:4px;">${vars.actionText || 'Take Action'}</a>` : ''}
        `),
      },
      alert: {
        subject: `Alert: ${vars.title || 'Important Notice'}`,
        html: this.wrapHtml(`
          <h1 style="color:#ef4444;">Alert</h1>
          <p>Hi ${vars.name || 'there'},</p>
          <p><strong>${vars.message || 'This is an important alert.'}</strong></p>
          ${vars.actionUrl ? `<a href="${vars.actionUrl}" style="display:inline-block;padding:12px 24px;background:#ef4444;color:white;text-decoration:none;border-radius:4px;">${vars.actionText || 'Take Action'}</a>` : ''}
        `),
      },
    };

    return templates[type];
  }

  /**
   * Wrap HTML content in email template
   */
  private wrapHtml(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:20px;">
  ${content}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
  <p style="color:#6b7280;font-size:12px;">
    This email was sent by GHXSTSHIP. If you have questions, please contact support.
  </p>
</body>
</html>
    `.trim();
  }
}

// =============================================================================
// SINGLETON & HELPERS
// =============================================================================

let emailService: EmailService | null = null;

/**
 * Get the email service instance
 */
export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = EmailService.fromEnv();
  }
  return emailService;
}

/**
 * Send a simple email
 */
export async function sendEmail(params: SendEmailParams) {
  return getEmailService().send(params);
}

/**
 * Send a templated email
 */
export async function sendTemplateEmail(
  template: EmailTemplateType,
  to: string | string[],
  variables: Record<string, string>
) {
  return getEmailService().sendTemplate(template, to, variables);
}
