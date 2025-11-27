import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Equipment operation manuals with video tutorials
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipment_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('equipment_manuals').select(`
      *, videos:manual_videos(id, title, url, duration_seconds)
    `);

    if (equipmentId) query = query.eq('equipment_id', equipmentId);
    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,manufacturer.ilike.%${search}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ manuals: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { equipment_id, title, manufacturer, model, category, pdf_url, quick_start_url, videos } = body;

    const { data, error } = await supabase.from('equipment_manuals').insert({
      equipment_id, title, manufacturer, model, category, pdf_url, quick_start_url
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (videos?.length) {
      await supabase.from('manual_videos').insert(
        videos.map((v: any) => ({ manual_id: data.id, title: v.title, url: v.url, duration_seconds: v.duration }))
      );
    }

    return NextResponse.json({ manual: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
