import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET() {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and person ID
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Get the person ID for the current user
    const { data: person } = await supabase
      .from('legend_people')
      .select('id')
      .eq('organization_id', userOrg.organization_id)
      .eq('email', user.email)
      .single();

    if (!person) {
      return NextResponse.json({ data: [] });
    }

    // Get sagas where user has pending actions
    const { data: participants, error: participantsError } = await supabase
      .from('saga_participants')
      .select('saga_id')
      .eq('person_id', person.id)
      .eq('action_required', true)
      .eq('status', 'active');

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const sagaIds = participants.map(p => p.saga_id);

    // Get the saga instances
    const { data, error } = await supabase
      .from('saga_instances')
      .select(`
        *,
        initiated_by_person:legend_people!initiated_by(id, display_name),
        assigned_to_person:legend_people!assigned_to(id, display_name)
      `)
      .in('id', sagaIds)
      .not('current_state', 'in', '("completed","cancelled","failed")')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
