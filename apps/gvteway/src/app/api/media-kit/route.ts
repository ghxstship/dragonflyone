import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const mediaKitSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  press_contact_name: z.string(),
  press_contact_email: z.string().email(),
  press_contact_phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'press_releases' && eventId) {
      const { data: releases, error } = await supabase
        .from('press_releases')
        .select('*')
        .eq('event_id', eventId)
        .order('release_date', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ press_releases: releases });
    }

    if (type === 'assets' && eventId) {
      const { data: assets, error } = await supabase
        .from('media_kit_assets')
        .select('*')
        .eq('event_id', eventId)
        .order('asset_type');

      if (error) throw error;
      return NextResponse.json({ assets });
    }

    if (eventId) {
      const { data: mediaKit, error } = await supabase
        .from('media_kits')
        .select(`
          *,
          assets:media_kit_assets(*),
          press_releases:press_releases(*)
        `)
        .eq('event_id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json({ media_kit: mediaKit });
    }

    return NextResponse.json({ error: 'event_id required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_kit') {
      const validated = mediaKitSchema.parse(body.data);

      const { data: kit, error } = await supabase
        .from('media_kits')
        .insert({
          ...validated,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ media_kit: kit }, { status: 201 });
    }

    if (action === 'add_asset') {
      const { event_id, asset_type, title, url, thumbnail_url, description } = body.data;

      const { data: asset, error } = await supabase
        .from('media_kit_assets')
        .insert({
          event_id,
          asset_type,
          title,
          url,
          thumbnail_url,
          description,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ asset }, { status: 201 });
    }

    if (action === 'create_press_release') {
      const { event_id, title, content, release_date, embargo_until } = body.data;

      const { data: release, error } = await supabase
        .from('press_releases')
        .insert({
          event_id,
          title,
          content,
          release_date: release_date || new Date().toISOString(),
          embargo_until,
          status: embargo_until ? 'embargoed' : 'published',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ press_release: release }, { status: 201 });
    }

    if (action === 'distribute') {
      const { press_release_id, recipients } = body.data;

      // Log distribution
      const distributions = recipients.map((email: string) => ({
        press_release_id,
        recipient_email: email,
        sent_at: new Date().toISOString(),
        status: 'sent',
      }));

      const { data, error } = await supabase
        .from('press_release_distributions')
        .insert(distributions)
        .select();

      if (error) throw error;

      // Update press release
      await supabase
        .from('press_releases')
        .update({ distributed_at: new Date().toISOString() })
        .eq('id', press_release_id);

      return NextResponse.json({ distributed: data?.length }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'kit') {
      const { data, error } = await supabase
        .from('media_kits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ media_kit: data });
    }

    if (type === 'release') {
      const { data, error } = await supabase
        .from('press_releases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ press_release: data });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (type === 'asset') {
      const { error } = await supabase.from('media_kit_assets').delete().eq('id', id);
      if (error) throw error;
    } else if (type === 'release') {
      const { error } = await supabase.from('press_releases').delete().eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
