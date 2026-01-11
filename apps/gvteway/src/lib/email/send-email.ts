/**
 * Email Sending Service
 * Wrapper for sending emails using Resend or other providers
 */

import { generateBookingConfirmationEmail } from './templates/booking-confirmation';
import type { BookingConfirmation } from '@/ui-v2/patterns/booking/types';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using the configured email provider
 * This is a placeholder implementation - replace with your actual email service
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'GVTEWAY <noreply@gvteway.com>',
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Option 1: Using Resend (recommended)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return { success: true };
    }

    // Option 2: Using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from.match(/<(.+)>/)?.[1] || from },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to send email');
      }

      return { success: true };
    }

    // Development mode: Log email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email (Development Mode):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('---');
      return { success: true };
    }

    throw new Error('No email service configured');
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send booking confirmation email to guest
 */
export async function sendBookingConfirmationEmail(
  confirmation: BookingConfirmation
): Promise<{ success: boolean; error?: string }> {
  const html = generateBookingConfirmationEmail(confirmation);

  return sendEmail({
    to: confirmation.guestDetails.email,
    subject: `Booking Confirmed: ${confirmation.experience.title} - ${confirmation.bookingNumber}`,
    html,
  });
}

/**
 * Send booking notification to organizer
 */
export async function sendOrganizerBookingNotification(
  confirmation: BookingConfirmation,
  organizerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7B68EE; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .detail { margin: 10px 0; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Booking Received!</h2>
      <p>Booking #${confirmation.bookingNumber}</p>
    </div>
    <div class="content">
      <h3>${confirmation.experience.title}</h3>

      <div class="detail">
        <span class="label">Guest:</span>
        ${confirmation.guestDetails.firstName} ${confirmation.guestDetails.lastName}
      </div>
      <div class="detail">
        <span class="label">Email:</span>
        ${confirmation.guestDetails.email}
      </div>
      <div class="detail">
        <span class="label">Phone:</span>
        ${confirmation.guestDetails.phone}
      </div>
      <div class="detail">
        <span class="label">Dates:</span>
        ${confirmation.experience.startDate.toLocaleDateString()} - ${confirmation.experience.endDate.toLocaleDateString()}
      </div>
      <div class="detail">
        <span class="label">Total:</span>
        ${formatCurrency(confirmation.pricing.total, confirmation.pricing.currency)}
      </div>
      ${
        confirmation.guestDetails.specialRequests
          ? `
      <div class="detail">
        <span class="label">Special Requests:</span>
        ${confirmation.guestDetails.specialRequests}
      </div>
      `
          : ''
      }

      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${confirmation.bookingId}"
           style="background-color: #7B68EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Booking Details
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: organizerEmail,
    subject: `New Booking: ${confirmation.experience.title} - ${confirmation.bookingNumber}`,
    html,
  });
}
