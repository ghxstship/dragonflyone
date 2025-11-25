// packages/config/notifications/advancing-notifications.ts
import type { ProductionAdvance, AdvanceStatus } from '../types/advancing';

/**
 * Email notification templates for advancing workflows
 */

export interface EmailNotification {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate notification for new request submission
 */
export function generateRequestSubmittedEmail(
  advance: ProductionAdvance,
  reviewerEmails: string[]
): EmailNotification {
  const itemCount = advance.items?.length || 0;
  const cost = advance.estimated_cost
    ? `$${advance.estimated_cost.toLocaleString()}`
    : 'Not specified';

  return {
    to: reviewerEmails,
    subject: `New Advance Request: ${advance.activation_name || advance.team_workspace}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Advance Request Submitted</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Request Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Team/Workspace:</strong> ${advance.team_workspace || 'N/A'}</li>
            <li><strong>Activation:</strong> ${advance.activation_name || 'N/A'}</li>
            <li><strong>Submitted by:</strong> ${advance.submitter?.full_name || 'Unknown'}</li>
            <li><strong>Items:</strong> ${itemCount} item${itemCount !== 1 ? 's' : ''}</li>
            <li><strong>Estimated Cost:</strong> ${cost}</li>
          </ul>
        </div>

        <p>Please review and approve/reject this request in the ATLVS platform.</p>
        
        <a href="${process.env.NEXT_PUBLIC_ATLVS_URL}/advancing/requests/${advance.id}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 20px;">
          Review Request
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification from the Dragonfly One production system.
        </p>
      </div>
    `,
    text: `
New Advance Request Submitted

Team/Workspace: ${advance.team_workspace || 'N/A'}
Activation: ${advance.activation_name || 'N/A'}
Submitted by: ${advance.submitter?.full_name || 'Unknown'}
Items: ${itemCount}
Estimated Cost: ${cost}

Review this request: ${process.env.NEXT_PUBLIC_ATLVS_URL}/advancing/requests/${advance.id}
    `,
  };
}

/**
 * Generate notification for request approval
 */
export function generateRequestApprovedEmail(
  advance: ProductionAdvance
): EmailNotification {
  const submitterEmail = advance.submitter?.email;
  if (!submitterEmail) {
    throw new Error('Submitter email not found');
  }

  const approvedCost = advance.approved_cost || advance.estimated_cost;
  const cost = approvedCost ? `$${approvedCost.toLocaleString()}` : 'Not specified';

  return {
    to: [submitterEmail],
    subject: `Advance Request Approved: ${advance.activation_name || advance.team_workspace}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">✅ Your Advance Request Has Been Approved</h2>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <p><strong>Request Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Team/Workspace:</strong> ${advance.team_workspace || 'N/A'}</li>
            <li><strong>Activation:</strong> ${advance.activation_name || 'N/A'}</li>
            <li><strong>Approved Cost:</strong> ${cost}</li>
            <li><strong>Reviewed by:</strong> ${advance.reviewed_by_user?.full_name || 'System'}</li>
          </ul>
          
          ${
            advance.reviewer_notes
              ? `<p><strong>Reviewer Notes:</strong><br/>${advance.reviewer_notes}</p>`
              : ''
          }
        </div>

        <p>Your request is now ready for fulfillment. The operations team will process your items.</p>
        
        <a href="${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}" 
           style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 20px;">
          View Request
        </a>
      </div>
    `,
    text: `
✅ Your Advance Request Has Been Approved

Team/Workspace: ${advance.team_workspace || 'N/A'}
Activation: ${advance.activation_name || 'N/A'}
Approved Cost: ${cost}
Reviewed by: ${advance.reviewed_by_user?.full_name || 'System'}

${advance.reviewer_notes ? `Notes: ${advance.reviewer_notes}` : ''}

View your request: ${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}
    `,
  };
}

/**
 * Generate notification for request rejection
 */
export function generateRequestRejectedEmail(
  advance: ProductionAdvance
): EmailNotification {
  const submitterEmail = advance.submitter?.email;
  if (!submitterEmail) {
    throw new Error('Submitter email not found');
  }

  return {
    to: [submitterEmail],
    subject: `Advance Request Rejected: ${advance.activation_name || advance.team_workspace}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Your Advance Request Has Been Rejected</h2>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Request Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Team/Workspace:</strong> ${advance.team_workspace || 'N/A'}</li>
            <li><strong>Activation:</strong> ${advance.activation_name || 'N/A'}</li>
            <li><strong>Reviewed by:</strong> ${advance.reviewed_by_user?.full_name || 'System'}</li>
          </ul>
          
          <p><strong>Rejection Reason:</strong><br/>${advance.reviewer_notes || 'No reason provided'}</p>
        </div>

        <p>Please review the feedback and submit a revised request if needed.</p>
        
        <a href="${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 20px;">
          View Request
        </a>
      </div>
    `,
    text: `
❌ Your Advance Request Has Been Rejected

Team/Workspace: ${advance.team_workspace || 'N/A'}
Activation: ${advance.activation_name || 'N/A'}
Reviewed by: ${advance.reviewed_by_user?.full_name || 'System'}

Rejection Reason: ${advance.reviewer_notes || 'No reason provided'}

View your request: ${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}
    `,
  };
}

/**
 * Generate notification for fulfillment completion
 */
export function generateFulfillmentCompleteEmail(
  advance: ProductionAdvance
): EmailNotification {
  const submitterEmail = advance.submitter?.email;
  if (!submitterEmail) {
    throw new Error('Submitter email not found');
  }

  const actualCost = advance.actual_cost
    ? `$${advance.actual_cost.toLocaleString()}`
    : 'Not recorded';

  return {
    to: [submitterEmail],
    subject: `Advance Request Fulfilled: ${advance.activation_name || advance.team_workspace}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">✓ Your Advance Request Has Been Fulfilled</h2>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Request Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Team/Workspace:</strong> ${advance.team_workspace || 'N/A'}</li>
            <li><strong>Activation:</strong> ${advance.activation_name || 'N/A'}</li>
            <li><strong>Actual Cost:</strong> ${actualCost}</li>
          </ul>
        </div>

        <p>All items in your request have been fulfilled. Check the details for item-specific information.</p>
        
        <a href="${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}" 
           style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 20px;">
          View Details
        </a>
      </div>
    `,
    text: `
✓ Your Advance Request Has Been Fulfilled

Team/Workspace: ${advance.team_workspace || 'N/A'}
Activation: ${advance.activation_name || 'N/A'}
Actual Cost: ${actualCost}

View details: ${process.env.NEXT_PUBLIC_COMPVSS_URL}/advancing/${advance.id}
    `,
  };
}

/**
 * Send email notification (to be implemented with your email service)
 */
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    // Integration point for email service (SendGrid, AWS SES, etc.)
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

/**
 * Determine which notification to send based on status change
 */
export function getNotificationForStatusChange(
  advance: ProductionAdvance,
  oldStatus: AdvanceStatus,
  newStatus: AdvanceStatus,
  reviewerEmails?: string[]
): EmailNotification | null {
  switch (newStatus) {
    case 'submitted':
      if (oldStatus === 'draft' && reviewerEmails) {
        return generateRequestSubmittedEmail(advance, reviewerEmails);
      }
      return null;

    case 'approved':
      return generateRequestApprovedEmail(advance);

    case 'rejected':
      return generateRequestRejectedEmail(advance);

    case 'fulfilled':
      return generateFulfillmentCompleteEmail(advance);

    default:
      return null;
  }
}
