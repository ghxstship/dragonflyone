import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const capacityConfigSchema = z.object({
  event_id: z.string().uuid(),
  total_capacity: z.number().int().positive(),
  zones: z.array(z.object({
    zone_name: z.string(),
    capacity: z.number().int().positive(),
    current_occupancy: z.number().int().nonnegative().default(0)
  })),
  safety_threshold: z.number().min(0).max(100).default(90),
  alert_thresholds: z.object({
    warning: z.number().default(75),
    critical: z.number().default(90),
    full: z.number().default(95)
  }).optional(),
  enable_waitlist: z.boolean().default(true)
});

// GET - Get capacity status or history
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const action = searchParams.get('action');

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    if (action === 'realtime_status') {
      // Get real-time capacity status
      const status = await getRealTimeCapacity(event_id);
      return NextResponse.json({ status });
    }

    if (action === 'history') {
      // Get capacity history over time
      const { data: history } = await supabase
        .from('capacity_logs')
        .select('*')
        .eq('event_id', event_id)
        .order('logged_at', { ascending: true })
        .limit(1000);

      return NextResponse.json({ history });
    }

    if (action === 'analytics') {
      // Get capacity analytics
      const analytics = await getCapacityAnalytics(event_id);
      return NextResponse.json({ analytics });
    }

    // Get capacity configuration
    const { data: config, error } = await supabase
      .from('capacity_configurations')
      .select(`
        *,
        events (
          id,
          name,
          date,
          venue_id,
          venues (
            name,
            max_capacity
          )
        )
      `)
      .eq('event_id', event_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'capacity:view', resource: 'capacity_management' }
  }
);

// POST - Configure capacity or log entry/exit
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'log_entry') {
      const { event_id, zone_name, count } = body;

      // Update zone occupancy
      const { data: config } = await supabase
        .from('capacity_configurations')
        .select('zones')
        .eq('event_id', event_id)
        .single();

      if (!config) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }

      const zones = config.zones.map((zone: any) => {
        if (zone.zone_name === zone_name) {
          return {
            ...zone,
            current_occupancy: Math.min(zone.current_occupancy + count, zone.capacity)
          };
        }
        return zone;
      });

      await supabase
        .from('capacity_configurations')
        .update({ zones })
        .eq('event_id', event_id);

      // Log the entry
      await supabase.from('capacity_logs').insert({
        event_id,
        zone_name,
        action: 'entry',
        count,
        logged_at: new Date().toISOString()
      });

      // Check if threshold reached
      const totalOccupancy = zones.reduce((sum: number, z: any) => sum + z.current_occupancy, 0);
      const totalCapacity = zones.reduce((sum: number, z: any) => sum + z.capacity, 0);
      const percentage = (totalOccupancy / totalCapacity) * 100;

      if (percentage >= 90) {
        await sendCapacityAlert(event_id, 'critical', percentage);
      }

      return NextResponse.json({
        message: 'Entry logged',
        current_occupancy: totalOccupancy,
        capacity_percentage: percentage
      });
    }

    if (action === 'log_exit') {
      const { event_id, zone_name, count } = body;

      const { data: config } = await supabase
        .from('capacity_configurations')
        .select('zones')
        .eq('event_id', event_id)
        .single();

      if (!config) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }

      const zones = config.zones.map((zone: any) => {
        if (zone.zone_name === zone_name) {
          return {
            ...zone,
            current_occupancy: Math.max(zone.current_occupancy - count, 0)
          };
        }
        return zone;
      });

      await supabase
        .from('capacity_configurations')
        .update({ zones })
        .eq('event_id', event_id);

      await supabase.from('capacity_logs').insert({
        event_id,
        zone_name,
        action: 'exit',
        count,
        logged_at: new Date().toISOString()
      });

      return NextResponse.json({ message: 'Exit logged' });
    }

    // Configure capacity
    const validated = capacityConfigSchema.parse(body);

    const { data: config, error } = await supabase
      .from('capacity_configurations')
      .insert({
        ...validated,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      config,
      message: 'Capacity configuration created'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'capacity:configure', resource: 'capacity_management' }
  }
);

// Helper functions
async function getRealTimeCapacity(eventId: string) {
  const { data: config } = await supabase
    .from('capacity_configurations')
    .select('*')
    .eq('event_id', eventId)
    .single();

  if (!config) return null;

  const totalOccupancy = config.zones.reduce((sum: number, z: any) => sum + z.current_occupancy, 0);
  const totalCapacity = config.total_capacity;
  const percentage = (totalOccupancy / totalCapacity) * 100;

  let status = 'normal';
  if (percentage >= config.alert_thresholds?.full || 95) status = 'full';
  else if (percentage >= config.alert_thresholds?.critical || 90) status = 'critical';
  else if (percentage >= config.alert_thresholds?.warning || 75) status = 'warning';

  return {
    total_capacity: totalCapacity,
    current_occupancy: totalOccupancy,
    available_capacity: totalCapacity - totalOccupancy,
    occupancy_percentage: percentage,
    status,
    zones: config.zones,
    timestamp: new Date().toISOString()
  };
}

async function getCapacityAnalytics(eventId: string) {
  const { data: logs } = await supabase
    .from('capacity_logs')
    .select('*')
    .eq('event_id', eventId)
    .order('logged_at', { ascending: true });

  if (!logs || logs.length === 0) {
    return {
      peak_occupancy: 0,
      peak_time: null,
      average_occupancy: 0,
      total_entries: 0,
      total_exits: 0
    };
  }

  const entries = logs.filter((l: any) => l.action === 'entry');
  const exits = logs.filter((l: any) => l.action === 'exit');

  // Calculate running occupancy
  let currentOccupancy = 0;
  let peakOccupancy = 0;
  let peakTime = null;
  const occupancies = [];

  for (const log of logs) {
    if (log.action === 'entry') {
      currentOccupancy += log.count;
    } else {
      currentOccupancy -= log.count;
    }

    if (currentOccupancy > peakOccupancy) {
      peakOccupancy = currentOccupancy;
      peakTime = log.logged_at;
    }

    occupancies.push(currentOccupancy);
  }

  const avgOccupancy = occupancies.reduce((sum, o) => sum + o, 0) / occupancies.length;

  return {
    peak_occupancy: peakOccupancy,
    peak_time: peakTime,
    average_occupancy: Math.round(avgOccupancy),
    total_entries: entries.reduce((sum: number, e: any) => sum + e.count, 0),
    total_exits: exits.reduce((sum: number, e: any) => sum + e.count, 0),
    occupancy_trend: occupancies
  };
}

async function sendCapacityAlert(eventId: string, level: string, percentage: number) {
  // Send alert to event organizers
  const { data: event } = await supabase
    .from('events')
    .select('name, created_by')
    .eq('id', eventId)
    .single();

  if (!event) return;

  await supabase.from('notifications').insert({
    user_id: event.created_by,
    type: 'capacity_alert',
    title: `${level.toUpperCase()} Capacity Alert`,
    message: `${event.name} is at ${percentage.toFixed(1)}% capacity`,
    metadata: { event_id: eventId, level, percentage },
    priority: level === 'critical' ? 'high' : 'medium'
  });
}

// PUT - Update capacity configuration
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { event_id, updates } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('capacity_configurations')
      .update(updates)
      .eq('event_id', event_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'capacity:update', resource: 'capacity_management' }
  }
);

// DELETE - Reset capacity counters
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    // Reset all zone occupancy to 0
    const { data: config } = await supabase
      .from('capacity_configurations')
      .select('zones')
      .eq('event_id', event_id)
      .single();

    if (config) {
      const resetZones = config.zones.map((zone: any) => ({
        ...zone,
        current_occupancy: 0
      }));

      await supabase
        .from('capacity_configurations')
        .update({ zones: resetZones })
        .eq('event_id', event_id);
    }

    return NextResponse.json({ message: 'Capacity counters reset' });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'capacity:reset', resource: 'capacity_management' }
  }
);
