import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Audience flow monitoring and capacity tracking
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    // Get venue zones and capacity
    const { data: zones } = await supabase.from('venue_zones').select('*').eq('event_id', eventId);

    // Get current counts
    const { data: counts } = await supabase.from('zone_counts').select('*')
      .eq('event_id', eventId).order('recorded_at', { ascending: false });

    // Get latest count per zone
    const latestCounts: Record<string, any> = {};
    counts?.forEach(c => {
      if (!latestCounts[c.zone_id]) latestCounts[c.zone_id] = c;
    });

    const zonesWithCounts = zones?.map(z => ({
      ...z,
      current_count: latestCounts[z.id]?.count || 0,
      capacity_percent: Math.round(((latestCounts[z.id]?.count || 0) / z.capacity) * 100),
      status: getCapacityStatus((latestCounts[z.id]?.count || 0) / z.capacity)
    }));

    const totalCapacity = zones?.reduce((s, z) => s + z.capacity, 0) || 0;
    const totalCount = Object.values(latestCounts).reduce((s: number, c: any) => s + c.count, 0);

    return NextResponse.json({
      zones: zonesWithCounts,
      totals: {
        capacity: totalCapacity,
        current: totalCount,
        percent: Math.round((totalCount / totalCapacity) * 100),
        status: getCapacityStatus(totalCount / totalCapacity)
      },
      alerts: zonesWithCounts?.filter(z => z.capacity_percent >= 90) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_id, zone_id, count, count_type } = body;

    const { data, error } = await supabase.from('zone_counts').insert({
      event_id, zone_id, count, count_type: count_type || 'manual',
      recorded_by: user.id, recorded_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Check capacity and alert if needed
    const { data: zone } = await supabase.from('venue_zones').select('capacity, name').eq('id', zone_id).single();
    if (zone && count >= zone.capacity * 0.9) {
      await supabase.from('capacity_alerts').insert({
        event_id, zone_id, zone_name: zone.name, count, capacity: zone.capacity,
        alert_type: count >= zone.capacity ? 'at_capacity' : 'near_capacity'
      });
    }

    return NextResponse.json({ count: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 });
  }
}

function getCapacityStatus(ratio: number): string {
  if (ratio >= 1) return 'at_capacity';
  if (ratio >= 0.9) return 'near_capacity';
  if (ratio >= 0.7) return 'busy';
  return 'normal';
}
