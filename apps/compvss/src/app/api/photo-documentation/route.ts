import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const photoSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  phase: z.string().min(1),
  category: z.string().optional(),
  photo_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  caption: z.string().optional(),
  location: z.string().optional(),
  taken_at: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const phase = searchParams.get('phase');

    let query = supabase
      .from('photo_documentation')
      .select(`
        *,
        taken_by_user:platform_users(id, first_name, last_name)
      `)
      .order('taken_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (eventId) query = query.eq('event_id', eventId);
    if (phase) query = query.eq('phase', phase);

    const { data: photos, error } = await query;
    if (error) throw error;

    // Group by phase
    const byPhase = photos?.reduce((acc: Record<string, any[]>, p) => {
      if (!acc[p.phase]) acc[p.phase] = [];
      acc[p.phase].push(p);
      return acc;
    }, {});

    return NextResponse.json({
      photos,
      by_phase: byPhase,
      total: photos?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'bulk_upload') {
      const { photos, project_id, event_id, phase, taken_by } = body.data;

      const photoRecords = photos.map((p: any) => ({
        project_id,
        event_id,
        phase,
        photo_url: p.url,
        thumbnail_url: p.thumbnail,
        caption: p.caption,
        taken_at: p.taken_at || new Date().toISOString(),
        taken_by,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('photo_documentation')
        .insert(photoRecords)
        .select();

      if (error) throw error;
      return NextResponse.json({ photos: data, count: data?.length }, { status: 201 });
    }

    const validated = photoSchema.parse(body);
    const takenBy = body.taken_by;

    const { data: photo, error } = await supabase
      .from('photo_documentation')
      .insert({
        ...validated,
        taken_by: takenBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('photo_documentation').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
