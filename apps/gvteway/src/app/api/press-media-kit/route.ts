import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Media kit and press release distribution
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      const { data } = await supabase.from('media_kits').select(`
        *, assets:media_kit_assets(id, type, title, url, description),
        press_releases:press_releases(id, title, publish_date, status)
      `).eq('event_id', eventId).single();

      return NextResponse.json({ media_kit: data });
    }

    const { data, error } = await supabase.from('press_releases').select('*')
      .order('publish_date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ press_releases: data });
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

    if (action === 'create_media_kit') {
      const { event_id, description, contact_info, assets } = body;

      const { data, error } = await supabase.from('media_kits').insert({
        event_id, description, contact_info, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (assets?.length) {
        await supabase.from('media_kit_assets').insert(
          assets.map((a: any) => ({ media_kit_id: data.id, type: a.type, title: a.title, url: a.url, description: a.description }))
        );
      }

      return NextResponse.json({ media_kit: data }, { status: 201 });
    }

    if (action === 'create_press_release') {
      const { event_id, title, content, publish_date, distribution_list } = body;

      const { data, error } = await supabase.from('press_releases').insert({
        event_id, title, content, publish_date,
        distribution_list: distribution_list || [], status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ press_release: data }, { status: 201 });
    }

    if (action === 'distribute') {
      const { press_release_id, channels } = body;

      await supabase.from('press_releases').update({
        status: 'distributed', distributed_at: new Date().toISOString(),
        distribution_channels: channels
      }).eq('id', press_release_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
