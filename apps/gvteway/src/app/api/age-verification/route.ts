export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR, PlatformRole.GVTEWAY_VENUE_MANAGER,
  PlatformRole.GVTEWAY_MEMBER_EXTRA, PlatformRole.GVTEWAY_MEMBER_PLUS, PlatformRole.GVTEWAY_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



// Age verification requirements
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      const { data } = await supabase.from('event_age_requirements').select('*').eq('event_id', eventId).single();
      return NextResponse.json({ requirements: data });
    }

    const { data, error } = await supabase.from('age_verification_methods').select('*');
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ methods: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ methods: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = authResult.user;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'set_requirements') {
      const { event_id, min_age, verification_method, id_required, wristband_policy } = body;

      const { data, error } = await supabase.from('event_age_requirements').upsert({
        event_id, min_age, verification_method, id_required,
        wristband_policy, updated_by: user.id
      }, { onConflict: 'event_id' }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ requirements: data });
    }

    if (action === 'verify') {
      const { user_id, event_id, birth_date, id_type, id_number } = body;

      // Calculate age
      const birthDate = new Date(birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

      // Get event requirements
      const { data: req } = await supabase.from('event_age_requirements').select('min_age').eq('event_id', event_id).single();

      const verified = age >= (req?.min_age || 0);

      // Log verification
      await supabase.from('age_verifications').insert({
        user_id, event_id, birth_date, id_type, id_number_hash: id_number ? btoa(id_number) : null,
        calculated_age: age, verified, verified_at: new Date().toISOString()
      });

      return NextResponse.json({ verified, age, min_age: req?.min_age });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
