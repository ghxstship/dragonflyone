import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const campaignSchema = z.object({
  artist_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  name: z.string().min(1),
  content_type: z.enum(['post', 'story', 'reel', 'video']),
  suggested_content: z.string(),
  hashtags: z.array(z.string()).optional(),
  target_platforms: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'assets') {
      let query = supabase
        .from('amplification_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (artistId) query = query.eq('artist_id', artistId);
      if (eventId) query = query.eq('event_id', eventId);

      const { data: assets, error } = await query;
      if (error) throw error;

      return NextResponse.json({ assets });
    }

    let query = supabase
      .from('amplification_campaigns')
      .select(`*, artist:artists(id, name), shares:amplification_shares(*)`)
      .order('created_at', { ascending: false });

    if (artistId) query = query.eq('artist_id', artistId);
    if (eventId) query = query.eq('event_id', eventId);

    const { data: campaigns, error } = await query;
    if (error) throw error;

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_asset') {
      const { artist_id, event_id, asset_type, url, thumbnail_url, caption } = body.data;

      const { data: asset, error } = await supabase
        .from('amplification_assets')
        .insert({
          artist_id,
          event_id,
          asset_type,
          url,
          thumbnail_url,
          caption,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ asset }, { status: 201 });
    }

    if (action === 'track_share') {
      const { campaign_id, platform, shared_by } = body;

      const { data: share, error } = await supabase
        .from('amplification_shares')
        .insert({
          campaign_id,
          platform,
          shared_by,
          shared_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ share }, { status: 201 });
    }

    const validated = campaignSchema.parse(body);

    const { data: campaign, error } = await supabase
      .from('amplification_campaigns')
      .insert({
        ...validated,
        status: 'active',
        share_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: campaign, error } = await supabase
      .from('amplification_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
