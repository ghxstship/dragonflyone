import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email alerts for matching opportunities based on skills
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.from('opportunity_alerts').select('*').eq('user_id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ alerts: data });
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
    const { action } = body;

    if (action === 'create') {
      const { name, skills, categories, locations, min_rate, max_rate, frequency } = body;

      const { data, error } = await supabase.from('opportunity_alerts').insert({
        user_id: user.id, name, skills: skills || [], categories: categories || [],
        locations: locations || [], min_rate, max_rate, frequency: frequency || 'daily', active: true
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ alert: data }, { status: 201 });
    }

    if (action === 'update') {
      const { alert_id, ...updates } = body;

      await supabase.from('opportunity_alerts').update(updates).eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const { alert_id, active } = body;

      await supabase.from('opportunity_alerts').update({ active }).eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { alert_id } = body;

      await supabase.from('opportunity_alerts').delete().eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
