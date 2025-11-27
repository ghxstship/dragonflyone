import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import crypto from 'crypto';

// Admin UI for notification routing rules and secrets management
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'rules') {
      const { data, error } = await supabase.from('notification_routing_rules').select(`
        *, channel:notification_channels(id, name, type, webhook_url)
      `).order('priority', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rules: data });
    }

    if (type === 'channels') {
      const { data, error } = await supabase.from('notification_channels').select('*')
        .order('name', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Mask webhook URLs for security
      const masked = data?.map(ch => ({
        ...ch,
        webhook_url: ch.webhook_url ? `${ch.webhook_url.substring(0, 30)}...` : null,
        secret_key: ch.secret_key ? '********' : null
      }));

      return NextResponse.json({ channels: masked });
    }

    if (type === 'secrets') {
      const { data, error } = await supabase.from('integration_secrets').select('id, name, type, last_rotated, expires_at')
        .order('name', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ secrets: data });
    }

    // Default: return summary
    const [rulesCount, channelsCount, secretsCount] = await Promise.all([
      supabase.from('notification_routing_rules').select('id', { count: 'exact', head: true }),
      supabase.from('notification_channels').select('id', { count: 'exact', head: true }),
      supabase.from('integration_secrets').select('id', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      summary: {
        rules: rulesCount.count || 0,
        channels: channelsCount.count || 0,
        secrets: secretsCount.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_rule') {
      const { name, event_type, channel_id, conditions, priority, active } = body;

      const { data, error } = await supabase.from('notification_routing_rules').insert({
        name, event_type, channel_id, conditions: conditions || {},
        priority: priority || 100, active: active !== false, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rule: data }, { status: 201 });
    }

    if (action === 'update_rule') {
      const { rule_id, ...updates } = body;

      const { data, error } = await supabase.from('notification_routing_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', rule_id).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rule: data });
    }

    if (action === 'delete_rule') {
      const { rule_id } = body;

      await supabase.from('notification_routing_rules').delete().eq('id', rule_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'create_channel') {
      const { name, type, webhook_url, secret_key, config } = body;

      const { data, error } = await supabase.from('notification_channels').insert({
        name, type, webhook_url, secret_key, config: config || {}, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ channel: data }, { status: 201 });
    }

    if (action === 'update_channel') {
      const { channel_id, ...updates } = body;

      const { data, error } = await supabase.from('notification_channels')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', channel_id).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ channel: data });
    }

    if (action === 'test_channel') {
      const { channel_id } = body;

      const { data: channel } = await supabase.from('notification_channels')
        .select('*').eq('id', channel_id).single();

      if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

      // Send test notification
      try {
        const testPayload = {
          text: '🧪 Test notification from GHXSTSHIP',
          blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: '*Test Notification*\nThis is a test from the GHXSTSHIP notification routing system.' } }
          ]
        };

        const response = await fetch(channel.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return NextResponse.json({ success: true, message: 'Test notification sent' });
      } catch (e) {
        return NextResponse.json({ success: false, error: (e as Error).message });
      }
    }

    if (action === 'rotate_secret') {
      const { secret_id, new_value } = body;

      // Store old value in history
      const { data: oldSecret } = await supabase.from('integration_secrets')
        .select('value').eq('id', secret_id).single();

      if (oldSecret) {
        await supabase.from('secret_rotation_history').insert({
          secret_id, old_value_hash: hashSecret(oldSecret.value), rotated_by: user.id
        });
      }

      // Update with new value
      const { data, error } = await supabase.from('integration_secrets').update({
        value: new_value,
        last_rotated: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      }).eq('id', secret_id).select('id, name, last_rotated, expires_at').single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ secret: data, message: 'Secret rotated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

function hashSecret(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
}
