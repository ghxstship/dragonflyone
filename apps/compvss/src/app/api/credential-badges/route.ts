import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const badgeSchema = z.object({
  crew_member_id: z.string().uuid(),
  event_id: z.string().uuid(),
  badge_type: z.enum(['crew', 'artist', 'vip', 'media', 'vendor', 'security', 'production']),
  access_level: z.enum(['all_access', 'backstage', 'stage', 'foh', 'limited']),
  valid_from: z.string().datetime(),
  valid_to: z.string().datetime(),
  photo_url: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const crewMemberId = searchParams.get('crew_member_id');
    const type = searchParams.get('type');

    let query = supabase
      .from('credential_badges')
      .select(`
        *,
        crew_member:platform_users(id, first_name, last_name, email),
        event:events(id, name, start_date)
      `)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);

    const { data: badges, error } = await query;
    if (error) throw error;

    if (type === 'summary' && eventId) {
      const byType = badges?.reduce((acc: Record<string, number>, b) => {
        acc[b.badge_type] = (acc[b.badge_type] || 0) + 1;
        return acc;
      }, {});

      const byAccess = badges?.reduce((acc: Record<string, number>, b) => {
        acc[b.access_level] = (acc[b.access_level] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        badges,
        summary: {
          total: badges?.length || 0,
          by_type: byType,
          by_access_level: byAccess,
          active: badges?.filter(b => new Date(b.valid_to) > new Date()).length || 0,
        },
      });
    }

    return NextResponse.json({ badges });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'bulk_create') {
      const { event_id, crew_members, badge_type, access_level, valid_from, valid_to } = body.data;

      const badges = crew_members.map((crewId: string) => ({
        crew_member_id: crewId,
        event_id,
        badge_type,
        access_level,
        valid_from,
        valid_to,
        status: 'active',
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('credential_badges')
        .insert(badges)
        .select();

      if (error) throw error;
      return NextResponse.json({ badges: data, count: data?.length }, { status: 201 });
    }

    const validated = badgeSchema.parse(body);

    // Generate badge number
    const badgeNumber = `${validated.badge_type.toUpperCase().substring(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

    const { data: badge, error } = await supabase
      .from('credential_badges')
      .insert({
        ...validated,
        badge_number: badgeNumber,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ badge }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'revoke') {
      const { data, error } = await supabase
        .from('credential_badges')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ badge: data });
    }

    if (action === 'check_in') {
      const { data, error } = await supabase
        .from('credential_badges')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ badge: data });
    }

    const { data, error } = await supabase
      .from('credential_badges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ badge: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('credential_badges').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
