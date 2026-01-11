/**
 * Booking Confirmation Email Template
 * HTML email template for booking confirmations
 */

import type { BookingConfirmation } from '@/ui-v2/patterns/booking/types';

export function generateBookingConfirmationEmail(
  confirmation: BookingConfirmation
): string {
  const { experience, guestDetails, pricing, bookingNumber, paymentDetails } =
    confirmation;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${bookingNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #7B68EE;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background-color: #10B981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
    }
    h1 {
      color: #111827;
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    .booking-number {
      font-size: 14px;
      color: #6B7280;
      font-weight: 600;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #F9FAFB;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .detail-label {
      color: #6B7280;
      font-weight: 500;
    }
    .detail-value {
      color: #111827;
      font-weight: 600;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .pricing-total {
      font-size: 18px;
      font-weight: 700;
      padding-top: 16px;
      border-top: 2px solid #E5E7EB;
    }
    .cta-button {
      display: inline-block;
      background-color: #7B68EE;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
    .next-steps {
      background-color: #EEF2FF;
      border-left: 4px solid #7B68EE;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .next-steps ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✓</div>
      <h1>Booking Confirmed!</h1>
      <p class="booking-number">Booking #${bookingNumber}</p>
    </div>

    <div class="section">
      <div class="section-title">Experience Details</div>
      <div class="detail-row">
        <span class="detail-label">Experience</span>
        <span class="detail-value">${experience.title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Organizer</span>
        <span class="detail-value">${experience.organizerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Dates</span>
        <span class="detail-value">${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location</span>
        <span class="detail-value">${experience.location}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Guest Information</div>
      <div class="detail-row">
        <span class="detail-label">Name</span>
        <span class="detail-value">${guestDetails.firstName} ${guestDetails.lastName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${guestDetails.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-value">${guestDetails.phone}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payment Summary</div>
      <div class="pricing-row">
        <span>Subtotal</span>
        <span>${formatCurrency(pricing.subtotal, pricing.currency)}</span>
      </div>
      ${
        pricing.addOnsTotal > 0
          ? `
      <div class="pricing-row">
        <span>Add-ons</span>
        <span>${formatCurrency(pricing.addOnsTotal, pricing.currency)}</span>
      </div>
      `
          : ''
      }
      <div class="pricing-row">
        <span>Service Fee</span>
        <span>${formatCurrency(pricing.serviceFee, pricing.currency)}</span>
      </div>
      <div class="pricing-row">
        <span>Tax</span>
        <span>${formatCurrency(pricing.tax, pricing.currency)}</span>
      </div>
      ${
        pricing.discount > 0
          ? `
      <div class="pricing-row" style="color: #10B981;">
        <span>Discount</span>
        <span>-${formatCurrency(pricing.discount, pricing.currency)}</span>
      </div>
      `
          : ''
      }
      <div class="pricing-row pricing-total">
        <span>Total Paid</span>
        <span>${formatCurrency(pricing.total, pricing.currency)}</span>
      </div>
      <div class="detail-row" style="margin-top: 12px;">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">${paymentDetails.paymentMethod}</span>
      </div>
    </div>

    <div class="next-steps">
      <strong>What's Next?</strong>
      <ul>
        <li>Check your email for detailed preparation instructions</li>
        <li>Add the experience dates to your calendar</li>
        <li>Review the itinerary and what to bring</li>
        <li>Contact the host if you have any questions</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${confirmation.bookingId}" class="cta-button">
        View Booking Details
      </a>
    </div>

    <div class="footer">
      <p><strong>Need Help?</strong></p>
      <p>Contact us at support@gvteway.com or reply to this email</p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color: #7B68EE;">Terms of Service</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #7B68EE;">Privacy Policy</a>
      </p>
      <p style="margin-top: 16px; color: #9CA3AF; font-size: 12px;">
        © ${new Date().getFullYear()} GVTEWAY. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
