import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import crypto from 'crypto';

const NotificationConfigSchema = z.object({
  platform: z.enum(['slack', 'teams', 'email']),
  webhook_url: z.string().url().optional(),
  channel_id: z.string().optional(),
  event_types: z.array(z.string()),
  filters: z.record(z.any()).optional(),
  throttle_minutes: z.number().int().min(0).default(0),
  privacy_filter: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

const NotificationPayloadSchema = z.object({
  event_type: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).default('info'),
  link: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/integrations/slack-teams - Get notification configs
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    let query = supabase
      .from('notification_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: configs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get available event types
    const eventTypes = [
      { key: 'deal_created', name: 'Deal Created', category: 'sales' },
      { key: 'deal_won', name: 'Deal Won', category: 'sales' },
      { key: 'deal_lost', name: 'Deal Lost', category: 'sales' },
      { key: 'invoice_overdue', name: 'Invoice Overdue', category: 'finance' },
      { key: 'payment_received', name: 'Payment Received', category: 'finance' },
      { key: 'budget_alert', name: 'Budget Alert', category: 'finance' },
      { key: 'project_started', name: 'Project Started', category: 'production' },
      { key: 'project_completed', name: 'Project Completed', category: 'production' },
      { key: 'incident_reported', name: 'Incident Reported', category: 'safety' },
      { key: 'crew_assigned', name: 'Crew Assigned', category: 'production' },
      { key: 'ticket_sold', name: 'Ticket Sold', category: 'ticketing' },
      { key: 'event_sold_out', name: 'Event Sold Out', category: 'ticketing' },
      { key: 'guest_feedback', name: 'Guest Feedback', category: 'experience' },
      { key: 'asset_maintenance', name: 'Asset Maintenance Due', category: 'assets' },
      { key: 'contract_expiring', name: 'Contract Expiring', category: 'procurement' },
    ];

    return NextResponse.json({
      configs: configs || [],
      event_types: eventTypes,
      platforms: ['slack', 'teams', 'email'],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
}

// POST /api/integrations/slack-teams - Create config or send notification
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_config';

    if (action === 'create_config') {
      const validated = NotificationConfigSchema.parse(body);

      const { data: config, error } = await supabase
        .from('notification_configs')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ config }, { status: 201 });
    } else if (action === 'send_notification') {
      const validated = NotificationPayloadSchema.parse(body);

      // Get active configs for this event type
      const { data: configs } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('is_active', true)
        .contains('event_types', [validated.event_type]);

      if (!configs || configs.length === 0) {
        return NextResponse.json({ 
          message: 'No active configs for this event type',
          sent: 0,
        });
      }

      const results = await Promise.all(
        configs.map(async (config) => {
          // Check throttling
          if (config.throttle_minutes > 0) {
            const { data: lastSent } = await supabase
              .from('notification_logs')
              .select('sent_at')
              .eq('config_id', config.id)
              .eq('event_type', validated.event_type)
              .order('sent_at', { ascending: false })
              .limit(1)
              .single();

            if (lastSent) {
              const lastSentTime = new Date(lastSent.sent_at).getTime();
              const throttleMs = config.throttle_minutes * 60 * 1000;
              if (Date.now() - lastSentTime < throttleMs) {
                return { config_id: config.id, skipped: true, reason: 'throttled' };
              }
            }
          }

          // Apply privacy filter if enabled
          let message = validated.message;
          if (config.privacy_filter) {
            message = message.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
            message = message.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
            message = message.replace(/\$[\d,]+(\.\d{2})?/g, '[AMOUNT]');
          }

          // Generate signed deep link
          const deepLink = validated.link 
            ? generateSignedLink(validated.link)
            : null;

          // Send to platform
          let success = false;
          let error = null;

          try {
            if (config.platform === 'slack' && config.webhook_url) {
              success = await sendSlackNotification(config.webhook_url, {
                title: validated.title,
                message,
                severity: validated.severity,
                link: deepLink,
              });
            } else if (config.platform === 'teams' && config.webhook_url) {
              success = await sendTeamsNotification(config.webhook_url, {
                title: validated.title,
                message,
                severity: validated.severity,
                link: deepLink,
              });
            } else if (config.platform === 'email') {
              // Email would be handled by a separate email service
              success = true;
            }
          } catch (e: any) {
            error = e.message;
          }

          // Log the notification
          await supabase.from('notification_logs').insert({
            config_id: config.id,
            event_type: validated.event_type,
            payload: validated,
            success,
            error_message: error,
            sent_at: new Date().toISOString(),
          });

          return { config_id: config.id, success, error };
        })
      );

      const successCount = results.filter(r => r.success).length;

      return NextResponse.json({
        sent: successCount,
        total: results.length,
        results,
      });
    } else if (action === 'test_webhook') {
      const { platform, webhook_url } = body;

      const testPayload = {
        title: 'GHXSTSHIP Test Notification',
        message: 'This is a test notification from GHXSTSHIP platform.',
        severity: 'info',
        link: null,
      };

      let success = false;
      let error = null;

      try {
        if (platform === 'slack') {
          success = await sendSlackNotification(webhook_url, testPayload);
        } else if (platform === 'teams') {
          success = await sendTeamsNotification(webhook_url, testPayload);
        }
      } catch (e: any) {
        error = e.message;
      }

      return NextResponse.json({ success, error });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/integrations/slack-teams - Update config
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('config_id');

    if (!configId) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: config, error } = await supabase
      .from('notification_configs')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}

// DELETE /api/integrations/slack-teams - Delete config
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('config_id');

    if (!configId) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notification_configs')
      .delete()
      .eq('id', configId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}

// Helper functions
function generateSignedLink(url: string): string {
  const timestamp = Date.now();
  const secret = process.env.LINK_SIGNING_SECRET || 'default-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${url}:${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${timestamp}&_s=${signature}`;
}

async function sendSlackNotification(
  webhookUrl: string,
  payload: { title: string; message: string; severity: string; link: string | null }
): Promise<boolean> {
  const colorMap: Record<string, string> = {
    info: '#36a64f',
    warning: '#ff9800',
    error: '#f44336',
    critical: '#9c27b0',
  };

  const slackPayload = {
    attachments: [
      {
        color: colorMap[payload.severity] || colorMap.info,
        title: payload.title,
        text: payload.message,
        footer: 'GHXSTSHIP Platform',
        ts: Math.floor(Date.now() / 1000),
        ...(payload.link && {
          actions: [
            {
              type: 'button',
              text: 'View Details',
              url: payload.link,
            },
          ],
        }),
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });

  return response.ok;
}

async function sendTeamsNotification(
  webhookUrl: string,
  payload: { title: string; message: string; severity: string; link: string | null }
): Promise<boolean> {
  const colorMap: Record<string, string> = {
    info: '36a64f',
    warning: 'ff9800',
    error: 'f44336',
    critical: '9c27b0',
  };

  const teamsPayload = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: colorMap[payload.severity] || colorMap.info,
    summary: payload.title,
    sections: [
      {
        activityTitle: payload.title,
        text: payload.message,
        facts: [
          {
            name: 'Severity',
            value: payload.severity.toUpperCase(),
          },
          {
            name: 'Time',
            value: new Date().toISOString(),
          },
        ],
      },
    ],
    ...(payload.link && {
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View Details',
          targets: [
            {
              os: 'default',
              uri: payload.link,
            },
          ],
        },
      ],
    }),
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamsPayload),
  });

  return response.ok;
}
