import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Weather contingency planning guides
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event_type');
    const weatherCondition = searchParams.get('condition');

    let query = supabase.from('weather_contingency_plans').select(`
      *, triggers:contingency_triggers(id, condition, threshold, action)
    `);

    if (eventType) query = query.eq('event_type', eventType);
    if (weatherCondition) query = query.contains('weather_conditions', [weatherCondition]);

    const { data, error } = await query.order('event_type', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ plans: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_type, title, weather_conditions, decision_timeline, communication_plan, triggers } = body;

    const { data, error } = await supabase.from('weather_contingency_plans').insert({
      event_type, title, weather_conditions: weather_conditions || [],
      decision_timeline, communication_plan, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (triggers?.length) {
      await supabase.from('contingency_triggers').insert(
        triggers.map((t: any) => ({
          plan_id: data.id, condition: t.condition,
          threshold: t.threshold, action: t.action
        }))
      );
    }

    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
