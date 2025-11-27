import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Talent pool development
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('pool_id');
    const skills = searchParams.get('skills');

    if (poolId) {
      const { data } = await supabase.from('talent_pools').select(`
        *, members:talent_pool_members(
          candidate:platform_users(id, first_name, last_name, email),
          skills, rating, notes
        )
      `).eq('id', poolId).single();

      return NextResponse.json({ pool: data });
    }

    let query = supabase.from('talent_pools').select(`
      *, member_count:talent_pool_members(count)
    `);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ pools: data });
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
    const { action } = body;

    if (action === 'create_pool') {
      const { name, description, criteria, tags } = body;

      const { data, error } = await supabase.from('talent_pools').insert({
        name, description, criteria: criteria || {},
        tags: tags || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ pool: data }, { status: 201 });
    }

    if (action === 'add_candidate') {
      const { pool_id, candidate_id, skills, rating, notes, source } = body;

      const { data, error } = await supabase.from('talent_pool_members').insert({
        pool_id, candidate_id, skills: skills || [], rating, notes,
        source: source || 'manual', added_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ member: data }, { status: 201 });
    }

    if (action === 'update_candidate') {
      const { member_id, rating, notes, status } = body;

      await supabase.from('talent_pool_members').update({
        rating, notes, status, updated_at: new Date().toISOString()
      }).eq('id', member_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'search') {
      const { skills, min_rating, availability } = body;

      let query = supabase.from('talent_pool_members').select(`
        *, candidate:platform_users(id, first_name, last_name, email),
        pool:talent_pools(name)
      `);

      if (min_rating) query = query.gte('rating', min_rating);

      const { data } = await query;

      // Filter by skills
      let filtered: typeof data = data || [];
      if (skills?.length) {
        filtered = (data || []).filter(m => skills.some((s: string) => m.skills?.includes(s)));
      }

      return NextResponse.json({ candidates: filtered });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
