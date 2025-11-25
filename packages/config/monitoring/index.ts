/**
 * Monitoring and Alerting Configuration
 * Integrates with Sentry, New Relic, and custom alerting
 */

export interface MonitoringConfig {
  sentry?: {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
  };
  newRelic?: {
    licenseKey: string;
    appName: string;
  };
  customAlerts?: {
    webhookUrl: string;
    slackChannel?: string;
  };
}

export interface AlertPayload {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  source: string;
}

// Alert thresholds
export const ALERT_THRESHOLDS = {
  // Stripe/Payment alerts
  PAYMENT_FAILURE_RATE: 0.05, // 5% failure rate
  WEBHOOK_ERROR_RATE: 0.01, // 1% error rate
  CHECKOUT_ABANDONMENT_RATE: 0.7, // 70% abandonment
  
  // API performance
  API_LATENCY_P95_MS: 2000, // 2 seconds
  API_LATENCY_P99_MS: 5000, // 5 seconds
  API_ERROR_RATE: 0.01, // 1% error rate
  
  // Rate limiting
  RATE_LIMIT_TRIGGER_COUNT: 100, // Alert after 100 rate limit hits
  
  // Database
  DB_CONNECTION_POOL_USAGE: 0.8, // 80% pool usage
  DB_QUERY_SLOW_MS: 1000, // 1 second
  
  // Auth
  FAILED_LOGIN_ATTEMPTS: 10, // Per user per hour
  SUSPICIOUS_LOGIN_PATTERNS: 5, // Different locations in short time
};

// Metric types for tracking
export type MetricType = 
  | 'payment_success'
  | 'payment_failure'
  | 'webhook_received'
  | 'webhook_error'
  | 'api_request'
  | 'api_error'
  | 'api_latency'
  | 'rate_limit_hit'
  | 'auth_success'
  | 'auth_failure'
  | 'db_query'
  | 'db_error';

export interface Metric {
  type: MetricType;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

// In-memory metrics buffer (flush to monitoring service periodically)
const metricsBuffer: Metric[] = [];
const MAX_BUFFER_SIZE = 1000;

export function recordMetric(metric: Omit<Metric, 'timestamp'>): void {
  metricsBuffer.push({
    ...metric,
    timestamp: new Date(),
  });
  
  // Prevent memory overflow
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }
}

export function getMetrics(type?: MetricType, since?: Date): Metric[] {
  let metrics = [...metricsBuffer];
  
  if (type) {
    metrics = metrics.filter(m => m.type === type);
  }
  
  if (since) {
    metrics = metrics.filter(m => m.timestamp >= since);
  }
  
  return metrics;
}

export function clearMetrics(): void {
  metricsBuffer.length = 0;
}

// Calculate error rates
export function calculateErrorRate(
  successType: MetricType,
  errorType: MetricType,
  windowMs: number = 60000
): number {
  const since = new Date(Date.now() - windowMs);
  const successes = getMetrics(successType, since).length;
  const errors = getMetrics(errorType, since).length;
  const total = successes + errors;
  
  if (total === 0) return 0;
  return errors / total;
}

// Calculate average latency
export function calculateAverageLatency(windowMs: number = 60000): number {
  const since = new Date(Date.now() - windowMs);
  const latencyMetrics = getMetrics('api_latency', since);
  
  if (latencyMetrics.length === 0) return 0;
  
  const sum = latencyMetrics.reduce((acc, m) => acc + m.value, 0);
  return sum / latencyMetrics.length;
}

// Calculate percentile latency
export function calculatePercentileLatency(
  percentile: number,
  windowMs: number = 60000
): number {
  const since = new Date(Date.now() - windowMs);
  const latencyMetrics = getMetrics('api_latency', since);
  
  if (latencyMetrics.length === 0) return 0;
  
  const sorted = latencyMetrics.map(m => m.value).sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Send alert
export async function sendAlert(
  payload: Omit<AlertPayload, 'timestamp'>,
  config: MonitoringConfig
): Promise<void> {
  const alert: AlertPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };
  
  console.log(`[ALERT] ${alert.type.toUpperCase()}: ${alert.title}`, alert);
  
  // Send to custom webhook if configured
  if (config.customAlerts?.webhookUrl) {
    try {
      await fetch(config.customAlerts.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send alert webhook:', error);
    }
  }
  
  // Send to Slack if configured
  if (config.customAlerts?.slackChannel) {
    try {
      const slackPayload = {
        channel: config.customAlerts.slackChannel,
        text: `*${alert.type.toUpperCase()}*: ${alert.title}`,
        attachments: [
          {
            color: alert.type === 'error' ? 'danger' : alert.type === 'warning' ? 'warning' : 'good',
            text: alert.message,
            fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            })),
            ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
          },
        ],
      };
      
      // Would send to Slack webhook here
      console.log('Slack alert payload:', slackPayload);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

// Check thresholds and send alerts
export async function checkThresholdsAndAlert(config: MonitoringConfig): Promise<void> {
  const windowMs = 5 * 60 * 1000; // 5 minutes
  
  // Check payment failure rate
  const paymentErrorRate = calculateErrorRate('payment_success', 'payment_failure', windowMs);
  if (paymentErrorRate > ALERT_THRESHOLDS.PAYMENT_FAILURE_RATE) {
    await sendAlert({
      type: 'error',
      title: 'High Payment Failure Rate',
      message: `Payment failure rate is ${(paymentErrorRate * 100).toFixed(2)}%, exceeding threshold of ${ALERT_THRESHOLDS.PAYMENT_FAILURE_RATE * 100}%`,
      source: 'payment-monitor',
      metadata: { errorRate: paymentErrorRate },
    }, config);
  }
  
  // Check webhook error rate
  const webhookErrorRate = calculateErrorRate('webhook_received', 'webhook_error', windowMs);
  if (webhookErrorRate > ALERT_THRESHOLDS.WEBHOOK_ERROR_RATE) {
    await sendAlert({
      type: 'error',
      title: 'High Webhook Error Rate',
      message: `Webhook error rate is ${(webhookErrorRate * 100).toFixed(2)}%, exceeding threshold of ${ALERT_THRESHOLDS.WEBHOOK_ERROR_RATE * 100}%`,
      source: 'webhook-monitor',
      metadata: { errorRate: webhookErrorRate },
    }, config);
  }
  
  // Check API latency
  const p95Latency = calculatePercentileLatency(95, windowMs);
  if (p95Latency > ALERT_THRESHOLDS.API_LATENCY_P95_MS) {
    await sendAlert({
      type: 'warning',
      title: 'High API Latency',
      message: `P95 API latency is ${p95Latency}ms, exceeding threshold of ${ALERT_THRESHOLDS.API_LATENCY_P95_MS}ms`,
      source: 'api-monitor',
      metadata: { p95Latency },
    }, config);
  }
  
  // Check API error rate
  const apiErrorRate = calculateErrorRate('api_request', 'api_error', windowMs);
  if (apiErrorRate > ALERT_THRESHOLDS.API_ERROR_RATE) {
    await sendAlert({
      type: 'error',
      title: 'High API Error Rate',
      message: `API error rate is ${(apiErrorRate * 100).toFixed(2)}%, exceeding threshold of ${ALERT_THRESHOLDS.API_ERROR_RATE * 100}%`,
      source: 'api-monitor',
      metadata: { errorRate: apiErrorRate },
    }, config);
  }
}

// Health check endpoint data
export function getHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, { status: string; latency?: number; error?: string }>;
} {
  const windowMs = 60000; // 1 minute
  
  const apiErrorRate = calculateErrorRate('api_request', 'api_error', windowMs);
  const avgLatency = calculateAverageLatency(windowMs);
  const paymentErrorRate = calculateErrorRate('payment_success', 'payment_failure', windowMs);
  
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {
    api: {
      status: apiErrorRate < ALERT_THRESHOLDS.API_ERROR_RATE ? 'healthy' : 'degraded',
      latency: avgLatency,
    },
    payments: {
      status: paymentErrorRate < ALERT_THRESHOLDS.PAYMENT_FAILURE_RATE ? 'healthy' : 'degraded',
    },
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  const anyUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy');
  
  return {
    status: anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
    checks,
  };
}
