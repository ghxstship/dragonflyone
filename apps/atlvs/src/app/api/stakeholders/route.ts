import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('stakeholders')
      .select(`
        *,
        stakeholder_projects (
          project_id,
          projects (id, name)
        )
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('stakeholder_projects.project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stakeholders = data?.map(s => ({
      ...s,
      projects: s.stakeholder_projects?.map((sp: any) => sp.project_id) || [],
    })) || [];

    return NextResponse.json({ stakeholders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, organization, permission_level, projects } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create stakeholder
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('stakeholders')
      .insert({
        name,
        email,
        role,
        organization,
        permission_level: permission_level || 'view',
        status: 'invited',
      })
      .select()
      .single();

    if (stakeholderError) {
      return NextResponse.json({ error: stakeholderError.message }, { status: 500 });
    }

    // Link to projects if provided
    if (projects && projects.length > 0) {
      const projectLinks = projects.map((projectId: string) => ({
        stakeholder_id: stakeholder.id,
        project_id: projectId,
      }));

      await supabase.from('stakeholder_projects').insert(projectLinks);
    }

    // TODO: Send invitation email

    return NextResponse.json({ stakeholder }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Stakeholder ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('stakeholders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stakeholder: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Stakeholder ID required' }, { status: 400 });
    }

    // Delete project links first
    await supabase.from('stakeholder_projects').delete().eq('stakeholder_id', id);

    // Delete stakeholder
    const { error } = await supabase.from('stakeholders').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
