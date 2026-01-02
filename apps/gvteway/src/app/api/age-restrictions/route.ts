export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



const ageRestrictionSchema = z.object({
  event_id: z.string().uuid(),
  minimum_age: z.number().min(0).optional(),
  restriction_type: z.enum(['all_ages', '18+', '21+', 'family', 'custom']),
  content_warnings: z.array(z.string()).optional(),
  verification_required: z.boolean().default(false),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    // If no event_id, return list of all restrictions
    if (!eventId) {
      const { data, error, count } = await supabase
        .from('event_age_restrictions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          return NextResponse.json({ restrictions: [], total: 0 });
        }
        throw error;
      }
      return NextResponse.json({ restrictions: data || [], total: count || 0 });
    }

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ restriction: null });
      }
      throw error;
    }

    return NextResponse.json({ restriction });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ restriction: null });
    }
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = ageRestrictionSchema.parse(body);

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .insert({ ...validated, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ restriction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: restriction, error } = await supabase
      .from('event_age_restrictions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ restriction: null });
      }
      throw error;
    }
    return NextResponse.json({ restriction });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ restriction: null });
    }
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}
