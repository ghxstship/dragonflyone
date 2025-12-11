import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const payload = await request.json();

    if (!payload.template_id || !payload.organization_id) {
      return NextResponse.json(
        { error: 'template_id and organization_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('create_advance_from_template', {
      p_template_id: payload.template_id,
      p_organization_id: payload.organization_id,
      p_project_id: payload.project_id || undefined,
      p_team_workspace: payload.team_workspace || undefined,
      p_activation_name: payload.activation_name || undefined,
      p_submitter_id: payload.submitter_id || undefined,
    });

    if (error) {
      log.error('Failed to create advance from template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ advance_id: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating advance from template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
