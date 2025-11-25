import crypto from 'crypto';

/**
 * Webhook signature verification utilities for GHXSTSHIP integrations
 * Supports HMAC-SHA256 signature verification with timestamp validation
 */

export interface WebhookVerificationOptions {
  /** The raw request body as a string */
  payload: string;
  /** The signature from the webhook header */
  signature: string;
  /** The webhook secret key */
  secret: string;
  /** Optional timestamp from header for replay protection */
  timestamp?: string;
  /** Maximum age in seconds for timestamp validation (default: 300 = 5 minutes) */
  maxAge?: number;
}

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  timestamp?: Date;
}

/**
 * Verify HMAC-SHA256 webhook signature
 */
export function verifyWebhookSignature(options: WebhookVerificationOptions): WebhookVerificationResult {
  const { payload, signature, secret, timestamp, maxAge = 300 } = options;

  try {
    // Validate timestamp if provided (replay protection)
    if (timestamp) {
      const webhookTime = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      
      if (isNaN(webhookTime)) {
        return { valid: false, error: 'Invalid timestamp format' };
      }
      
      if (now - webhookTime > maxAge) {
        return { valid: false, error: 'Webhook timestamp too old' };
      }
      
      if (webhookTime > now + 60) {
        return { valid: false, error: 'Webhook timestamp in future' };
      }
    }

    // Compute expected signature
    const signedPayload = timestamp ? `${timestamp}.${payload}` : payload;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Signature length mismatch' };
    }

    const valid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    return {
      valid,
      error: valid ? undefined : 'Signature mismatch',
      timestamp: timestamp ? new Date(parseInt(timestamp, 10) * 1000) : undefined
    };
  } catch (error) {
    return { valid: false, error: `Verification failed: ${(error as Error).message}` };
  }
}

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(payload: string, secret: string, includeTimestamp = true): {
  signature: string;
  timestamp?: string;
  header: string;
} {
  const timestamp = includeTimestamp ? Math.floor(Date.now() / 1000).toString() : undefined;
  const signedPayload = timestamp ? `${timestamp}.${payload}` : payload;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  const header = timestamp 
    ? `t=${timestamp},v1=${signature}`
    : `v1=${signature}`;

  return { signature, timestamp, header };
}

/**
 * Parse webhook signature header (format: t=timestamp,v1=signature)
 */
export function parseWebhookHeader(header: string): { timestamp?: string; signature?: string } {
  const parts = header.split(',');
  const result: { timestamp?: string; signature?: string } = {};

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') result.timestamp = value;
    if (key === 'v1') result.signature = value;
  }

  return result;
}

/**
 * Express/Next.js middleware for webhook verification
 */
export function createWebhookMiddleware(secret: string) {
  return async (req: any, res: any, next: () => void) => {
    const signatureHeader = req.headers['x-ghxstship-signature'] || req.headers['x-webhook-signature'];
    
    if (!signatureHeader) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    const { timestamp, signature } = parseWebhookHeader(signatureHeader);
    
    if (!signature) {
      return res.status(401).json({ error: 'Invalid signature header format' });
    }

    // Get raw body
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const result = verifyWebhookSignature({
      payload: rawBody,
      signature,
      secret,
      timestamp
    });

    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    next();
  };
}
