import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

/**
 * IoT Integration API for Smart Venues
 * Manages connected devices, sensors, and automation for venues
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const venueId = searchParams.get('venue_id');
    const deviceId = searchParams.get('device_id');

    if (type === 'device_types') {
      const deviceTypes = [
        { id: 'access_control', name: 'Access Control', category: 'security', metrics: ['scans', 'denials', 'battery'] },
        { id: 'crowd_sensor', name: 'Crowd Density Sensor', category: 'safety', metrics: ['density', 'flow_rate', 'temperature'] },
        { id: 'environmental', name: 'Environmental Sensor', category: 'comfort', metrics: ['temperature', 'humidity', 'co2', 'noise'] },
        { id: 'pos_terminal', name: 'POS Terminal', category: 'commerce', metrics: ['transactions', 'uptime', 'queue_length'] },
        { id: 'digital_signage', name: 'Digital Signage', category: 'display', metrics: ['uptime', 'content_plays'] },
        { id: 'lighting', name: 'Smart Lighting', category: 'ambiance', metrics: ['power', 'brightness', 'color'] },
        { id: 'hvac', name: 'HVAC System', category: 'comfort', metrics: ['temperature', 'humidity', 'power'] },
        { id: 'parking', name: 'Parking Sensor', category: 'logistics', metrics: ['occupancy', 'turnover'] },
        { id: 'audio', name: 'Audio System', category: 'production', metrics: ['volume', 'zones', 'alerts'] },
        { id: 'emergency', name: 'Emergency System', category: 'safety', metrics: ['status', 'last_test', 'alerts'] }
      ];
      return NextResponse.json({ device_types: deviceTypes });
    }

    if (type === 'devices') {
      let query = supabase
        .from('iot_devices')
        .select(`
          *,
          venue:venues(id, name),
          latest_reading:iot_readings(*)
        `)
        .order('name', { ascending: true });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ devices: data });
    }

    if (type === 'device' && deviceId) {
      const { data, error } = await supabase
        .from('iot_devices')
        .select(`
          *,
          venue:venues(id, name),
          readings:iot_readings(*)
        `)
        .eq('id', deviceId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ device: data });
    }

    if (type === 'readings') {
      let query = supabase
        .from('iot_readings')
        .select(`
          *,
          device:iot_devices(id, name, device_type)
        `)
        .order('recorded_at', { ascending: false });

      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ readings: data });
    }

    if (type === 'alerts') {
      const { data, error } = await supabase
        .from('iot_alerts')
        .select(`
          *,
          device:iot_devices(id, name, venue_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alerts: data });
    }

    if (type === 'automations') {
      let query = supabase
        .from('iot_automations')
        .select(`
          *,
          trigger_device:iot_devices!trigger_device_id(id, name),
          action_device:iot_devices!action_device_id(id, name)
        `);

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ automations: data });
    }

    if (type === 'venue_dashboard' && venueId) {
      // Get comprehensive venue IoT status
      const [devices, alerts, readings] = await Promise.all([
        supabase.from('iot_devices').select('*').eq('venue_id', venueId),
        supabase.from('iot_alerts').select('*').eq('venue_id', venueId).eq('status', 'active'),
        supabase.from('iot_readings')
          .select('*, device:iot_devices(device_type)')
          .eq('venue_id', venueId)
          .order('recorded_at', { ascending: false })
          .limit(50)
      ]);

      // Aggregate by device type
      const byType = (devices.data || []).reduce((acc: Record<string, any>, d) => {
        if (!acc[d.device_type]) {
          acc[d.device_type] = { count: 0, online: 0, offline: 0 };
        }
        acc[d.device_type].count++;
        if (d.status === 'online') acc[d.device_type].online++;
        else acc[d.device_type].offline++;
        return acc;
      }, {});

      return NextResponse.json({
        dashboard: {
          total_devices: devices.data?.length || 0,
          online_devices: devices.data?.filter(d => d.status === 'online').length || 0,
          active_alerts: alerts.data?.length || 0,
          by_type: byType,
          recent_readings: readings.data
        }
      });
    }

    // Default summary
    const [deviceCount, alertCount] = await Promise.all([
      supabase.from('iot_devices').select('id', { count: 'exact', head: true }),
      supabase.from('iot_alerts').select('id', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    return NextResponse.json({
      summary: {
        total_devices: deviceCount.count || 0,
        active_alerts: alertCount.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch IoT data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'register_device') {
      const { venue_id, name, device_type, serial_number, location, config } = body;

      // Generate device token
      const deviceToken = `iot_${Date.now()}_${Math.random().toString(36).substr(2, 24)}`;

      const { data, error } = await supabase
        .from('iot_devices')
        .insert({
          venue_id,
          name,
          device_type,
          serial_number,
          location,
          config: config || {},
          device_token: deviceToken,
          status: 'offline',
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ device: data }, { status: 201 });
    }

    if (action === 'update_device') {
      const { device_id, name, location, config, status } = body;

      const { data, error } = await supabase
        .from('iot_devices')
        .update({
          name,
          location,
          config,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', device_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ device: data });
    }

    if (action === 'record_reading') {
      const { device_id, metrics, venue_id } = body;

      const { data, error } = await supabase
        .from('iot_readings')
        .insert({
          device_id,
          venue_id,
          metrics,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update device last_seen
      await supabase
        .from('iot_devices')
        .update({ last_seen: new Date().toISOString(), status: 'online' })
        .eq('id', device_id);

      // Check for alert conditions
      await checkAlertConditions(device_id, metrics);

      return NextResponse.json({ reading: data });
    }

    if (action === 'create_alert') {
      const { device_id, venue_id, alert_type, severity, message } = body;

      const { data, error } = await supabase
        .from('iot_alerts')
        .insert({
          device_id,
          venue_id,
          alert_type,
          severity,
          message,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data }, { status: 201 });
    }

    if (action === 'acknowledge_alert') {
      const { alert_id, acknowledged_by } = body;

      const { data, error } = await supabase
        .from('iot_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data });
    }

    if (action === 'resolve_alert') {
      const { alert_id, resolved_by, resolution_notes } = body;

      const { data, error } = await supabase
        .from('iot_alerts')
        .update({
          status: 'resolved',
          resolved_by,
          resolution_notes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data });
    }

    if (action === 'create_automation') {
      const { venue_id, name, trigger_device_id, trigger_condition, action_device_id, action_command } = body;

      const { data, error } = await supabase
        .from('iot_automations')
        .insert({
          venue_id,
          name,
          trigger_device_id,
          trigger_condition,
          action_device_id,
          action_command,
          enabled: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ automation: data }, { status: 201 });
    }

    if (action === 'send_command') {
      const { device_id, command, parameters } = body;

      // Log command
      const { data, error } = await supabase
        .from('iot_commands')
        .insert({
          device_id,
          command,
          parameters: parameters || {},
          status: 'pending',
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, would send to device via MQTT/WebSocket
      return NextResponse.json({ command: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process IoT request' }, { status: 500 });
  }
}

async function checkAlertConditions(deviceId: string, metrics: Record<string, number>) {
  // Get device and its alert thresholds
  const { data: device } = await supabase
    .from('iot_devices')
    .select('*, venue_id, config')
    .eq('id', deviceId)
    .single();

  if (!device?.config?.alert_thresholds) return;

  const thresholds = device.config.alert_thresholds;

  for (const [metric, value] of Object.entries(metrics)) {
    const threshold = thresholds[metric];
    if (!threshold) continue;

    let shouldAlert = false;
    let severity = 'warning';

    if (threshold.max !== undefined && value > threshold.max) {
      shouldAlert = true;
      severity = threshold.critical_max && value > threshold.critical_max ? 'critical' : 'warning';
    }

    if (threshold.min !== undefined && value < threshold.min) {
      shouldAlert = true;
      severity = threshold.critical_min && value < threshold.critical_min ? 'critical' : 'warning';
    }

    if (shouldAlert) {
      await supabase.from('iot_alerts').insert({
        device_id: deviceId,
        venue_id: device.venue_id,
        alert_type: `${metric}_threshold`,
        severity,
        message: `${metric} value ${value} exceeded threshold`,
        status: 'active',
        created_at: new Date().toISOString()
      });
    }
  }
}
