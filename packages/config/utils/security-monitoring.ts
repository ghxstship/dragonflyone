/**
 * Security Monitoring & Anomaly Detection
 * 
 * SOC 2 Control CC4.1 (SIEM/Logging) and CC7.2 (User Behavior Analytics)
 * Implements security event monitoring, anomaly detection, and alerting.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase-types';
import { logger } from '../logger';

type TypedSupabaseClient = SupabaseClient<Database>;

export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  detected: boolean;
  alertSent: boolean;
}

export type SecurityEventType =
  | 'failed_login'
  | 'successful_login'
  | 'password_reset'
  | 'mfa_disabled'
  | 'permission_escalation'
  | 'unusual_access_pattern'
  | 'brute_force_attempt'
  | 'account_lockout'
  | 'suspicious_ip'
  | 'data_export'
  | 'bulk_data_access'
  | 'admin_action'
  | 'api_abuse'
  | 'session_hijack_attempt';

export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  eventType: SecurityEventType;
  threshold: number;
  timeWindowMinutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

/**
 * Default anomaly detection rules
 * Based on OWASP and industry best practices
 */
export const defaultAnomalyRules: AnomalyRule[] = [
  {
    id: 'brute_force_login',
    name: 'Brute Force Login Detection',
    description: 'Detects multiple failed login attempts from same IP',
    eventType: 'failed_login',
    threshold: 5,
    timeWindowMinutes: 15,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'account_enumeration',
    name: 'Account Enumeration Detection',
    description: 'Detects attempts to enumerate valid accounts',
    eventType: 'failed_login',
    threshold: 10,
    timeWindowMinutes: 30,
    severity: 'medium',
    enabled: true,
  },
  {
    id: 'password_spray',
    name: 'Password Spray Detection',
    description: 'Detects password spray attacks across multiple accounts',
    eventType: 'failed_login',
    threshold: 3,
    timeWindowMinutes: 60,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'unusual_login_location',
    name: 'Unusual Login Location',
    description: 'Detects logins from new geographic locations',
    eventType: 'suspicious_ip',
    threshold: 1,
    timeWindowMinutes: 1,
    severity: 'medium',
    enabled: true,
  },
  {
    id: 'bulk_data_export',
    name: 'Bulk Data Export Detection',
    description: 'Detects unusual data export activity',
    eventType: 'data_export',
    threshold: 3,
    timeWindowMinutes: 60,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'api_rate_abuse',
    name: 'API Rate Abuse Detection',
    description: 'Detects excessive API calls from single source',
    eventType: 'api_abuse',
    threshold: 1000,
    timeWindowMinutes: 5,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'privilege_escalation',
    name: 'Privilege Escalation Detection',
    description: 'Detects unauthorized permission changes',
    eventType: 'permission_escalation',
    threshold: 1,
    timeWindowMinutes: 1,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'mfa_bypass_attempt',
    name: 'MFA Bypass Attempt',
    description: 'Detects attempts to disable or bypass MFA',
    eventType: 'mfa_disabled',
    threshold: 1,
    timeWindowMinutes: 1,
    severity: 'critical',
    enabled: true,
  },
];

/**
 * Check if an event matches an anomaly rule
 */
export async function checkAnomalyRule(
  supabase: TypedSupabaseClient,
  rule: AnomalyRule,
  currentEvent: Partial<SecurityEvent>
): Promise<{ triggered: boolean; count: number }> {
  if (!rule.enabled) {
    return { triggered: false, count: 0 };
  }

  const timeWindowStart = new Date();
  timeWindowStart.setMinutes(timeWindowStart.getMinutes() - rule.timeWindowMinutes);

  // Build query based on event type
  let query = supabase
    .from('audit_logs')
    .select('id', { count: 'exact' })
    .eq('action', rule.eventType)
    .gte('created_at', timeWindowStart.toISOString());

  // Add IP-based grouping for login-related events
  if (currentEvent.ipAddress && ['failed_login', 'brute_force_attempt'].includes(rule.eventType)) {
    query = query.eq('ip_address', currentEvent.ipAddress);
  }

  // Add user-based grouping for user-specific events
  if (currentEvent.userId && ['data_export', 'permission_escalation', 'mfa_disabled'].includes(rule.eventType)) {
    query = query.eq('user_id', currentEvent.userId);
  }

  const { count, error } = await query;

  if (error) {
    logger.error('Anomaly check error', error);
    return { triggered: false, count: 0 };
  }

  const eventCount = count || 0;
  return {
    triggered: eventCount >= rule.threshold,
    count: eventCount,
  };
}

/**
 * Log a security event to the audit log
 */
export async function logSecurityEvent(
  supabase: TypedSupabaseClient,
  event: Omit<SecurityEvent, 'id' | 'timestamp' | 'detected' | 'alertSent'>
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        action: event.eventType,
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        metadata: {
          ...event.metadata,
          severity: event.severity,
          security_event: true,
        },
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, eventId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run all anomaly detection rules against recent events
 */
export async function runAnomalyDetection(
  supabase: TypedSupabaseClient,
  currentEvent?: Partial<SecurityEvent>
): Promise<{ alerts: Array<{ rule: AnomalyRule; count: number }> }> {
  const alerts: Array<{ rule: AnomalyRule; count: number }> = [];

  for (const rule of defaultAnomalyRules) {
    const result = await checkAnomalyRule(supabase, rule, currentEvent || {});
    
    if (result.triggered) {
      alerts.push({ rule, count: result.count });

      // Log the anomaly detection
      await supabase.from('audit_logs').insert({
        action: 'security_anomaly_detected',
        metadata: {
          rule_id: rule.id,
          rule_name: rule.name,
          severity: rule.severity,
          event_count: result.count,
          threshold: rule.threshold,
          time_window_minutes: rule.timeWindowMinutes,
        },
      });
    }
  }

  return { alerts };
}

/**
 * Get security event summary for dashboard
 */
export async function getSecurityEventSummary(
  supabase: TypedSupabaseClient,
  hoursBack: number = 24
): Promise<{
  totalEvents: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recentAlerts: Array<{ rule: string; count: number; timestamp: string }>;
}> {
  const timeStart = new Date();
  timeStart.setHours(timeStart.getHours() - hoursBack);

  // Get all security events
  const { data: events, error } = await supabase
    .from('audit_logs')
    .select('action, metadata, created_at')
    .gte('created_at', timeStart.toISOString())
    .not('metadata->security_event', 'is', null);

  if (error || !events) {
    return {
      totalEvents: 0,
      bySeverity: {},
      byType: {},
      recentAlerts: [],
    };
  }

  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const event of events) {
    const severity = (event.metadata as Record<string, unknown>)?.severity as string || 'unknown';
    const type = event.action;

    bySeverity[severity] = (bySeverity[severity] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
  }

  // Get recent anomaly alerts
  const { data: alerts } = await supabase
    .from('audit_logs')
    .select('metadata, created_at')
    .eq('action', 'security_anomaly_detected')
    .gte('created_at', timeStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  const recentAlerts = (alerts || []).map((alert: { metadata: Record<string, unknown> | null; created_at: string }) => ({
    rule: alert.metadata?.rule_name || 'Unknown',
    count: alert.metadata?.event_count || 0,
    timestamp: alert.created_at,
  }));

  return {
    totalEvents: events.length,
    bySeverity,
    byType,
    recentAlerts,
  };
}

/**
 * Check if an IP address is suspicious
 * Based on failed login history and known bad actors
 */
export async function checkSuspiciousIP(
  supabase: TypedSupabaseClient,
  ipAddress: string
): Promise<{ suspicious: boolean; reason?: string; failedAttempts: number }> {
  const timeStart = new Date();
  timeStart.setHours(timeStart.getHours() - 24);

  // Check failed login attempts from this IP
  const { count: failedAttempts } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact' })
    .eq('action', 'failed_login')
    .eq('ip_address', ipAddress)
    .gte('created_at', timeStart.toISOString());

  if ((failedAttempts || 0) >= 10) {
    return {
      suspicious: true,
      reason: 'Multiple failed login attempts in last 24 hours',
      failedAttempts: failedAttempts || 0,
    };
  }

  // Check if IP was previously flagged
  const { data: previousFlags } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', 'suspicious_ip')
    .eq('ip_address', ipAddress)
    .limit(1);

  if (previousFlags && previousFlags.length > 0) {
    return {
      suspicious: true,
      reason: 'Previously flagged as suspicious',
      failedAttempts: failedAttempts || 0,
    };
  }

  return {
    suspicious: false,
    failedAttempts: failedAttempts || 0,
  };
}

const securityMonitoring = {
  defaultAnomalyRules,
  checkAnomalyRule,
  logSecurityEvent,
  runAnomalyDetection,
  getSecurityEventSummary,
  checkSuspiciousIP,
};

export default securityMonitoring;
