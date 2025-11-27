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

const photoSchema = z.object({
  event_id: z.string().uuid(),
  booth_id: z.string().uuid().optional(),
  photo_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  user_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  share_platforms: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');

    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('photo_booth_templates')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return NextResponse.json({ templates });
    }

    if (type === 'booths' && eventId) {
      const { data: booths, error } = await supabase
        .from('photo_booths')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return NextResponse.json({ booths });
    }

    let query = supabase
      .from('photo_booth_photos')
      .select(`*, user:platform_users(id, first_name, last_name), template:photo_booth_templates(id, name)`)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('user_id', userId);

    const { data: photos, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ photos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'capture') {
      const validated = photoSchema.parse(body.data);

      const { data: photo, error } = await supabase
        .from('photo_booth_photos')
        .insert({
          ...validated,
          shared: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ photo }, { status: 201 });
    }

    if (action === 'share') {
      const { photo_id, platforms } = body;

      // Update share status
      await supabase
        .from('photo_booth_photos')
        .update({ shared: true, shared_to: platforms, shared_at: new Date().toISOString() })
        .eq('id', photo_id);

      // Log share activity
      for (const platform of platforms) {
        await supabase.from('photo_booth_shares').insert({
          photo_id,
          platform,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, shared_to: platforms });
    }

    if (action === 'create_template') {
      const { name, overlay_url, frame_url, filters, event_id } = body.data;

      const { data: template, error } = await supabase
        .from('photo_booth_templates')
        .insert({
          name,
          overlay_url,
          frame_url,
          filters,
          event_id,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ template }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('photo_booth_photos').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
