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

// VR experiences (virtual tour, backstage access)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const venueId = searchParams.get('venue_id');
    const type = searchParams.get('type');

    let query = supabase.from('vr_experiences').select('*').eq('status', 'active');

    if (eventId) query = query.eq('event_id', eventId);
    if (venueId) query = query.eq('venue_id', venueId);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      experiences: data,
      types: ['venue_tour', 'backstage_access', 'concert_replay', 'meet_greet', '360_video']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch VR experiences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, experience_id } = body;

    if (action === 'start_session') {
      const { data: experience } = await supabase.from('vr_experiences').select('*').eq('id', experience_id).single();
      
      if (!experience) return NextResponse.json({ error: 'Experience not found' }, { status: 404 });

      // Check if user has access (premium content)
      if (experience.is_premium) {
        const { data: access } = await supabase.from('user_vr_access').select('*')
          .eq('user_id', user.id).eq('experience_id', experience_id).single();

        if (!access) {
          return NextResponse.json({ error: 'Premium access required', requires_purchase: true }, { status: 403 });
        }
      }

      const { data: session } = await supabase.from('vr_sessions').insert({
        user_id: user.id, experience_id, started_at: new Date().toISOString(), status: 'active'
      }).select().single();

      return NextResponse.json({
        session,
        experience,
        stream_url: experience.stream_url,
        config: experience.vr_config
      });
    }

    if (action === 'end_session') {
      await supabase.from('vr_sessions').update({
        ended_at: new Date().toISOString(), status: 'completed',
        duration_seconds: body.duration, interactions: body.interactions || []
      }).eq('id', body.session_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'purchase_access') {
      await supabase.from('user_vr_access').insert({
        user_id: user.id, experience_id, purchased_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Access granted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
