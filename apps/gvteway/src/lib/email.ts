import { env } from "./env";
import { log } from '@ghxstship/config';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    log.warn("Resend credentials not configured; skipping email send");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    log.error('Failed to send email', new Error(message));
  }
}
