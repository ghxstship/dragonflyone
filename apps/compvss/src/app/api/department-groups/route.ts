import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const groupSchema = z.object({
  department_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  group_type: z.enum(['team', 'committee', 'working_group', 'task_force', 'project_team', 'leadership']).default('team'),
  parent_group_id: z.string().uuid().optional(),
  lead_user_id: z.string().uuid().optional(),
  visibility: z.enum(['public', 'department', 'private']).default('department'),
  settings: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get('department_id');
    const group_type = searchParams.get('group_type');
    const visibility = searchParams.get('visibility');
    const include_members = searchParams.get('include_members') === 'true';

    let selectQuery = `
      *,
      department:departments(id, name, code),
      lead:platform_users!lead_user_id(id, email, full_name),
      parent_group:department_groups!parent_group_id(id, name)
    `;

    if (include_members) {
      selectQuery += `,
        members:group_memberships(
          id, role, responsibilities, joined_at,
          user:platform_users(id, email, full_name, avatar_url)
        )
      `;
    }

    let query = supabase
      .from('department_groups')
      .select(selectQuery)
      .eq('is_active', true);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }
    if (group_type) {
      query = query.eq('group_type', group_type);
    }
    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching department groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = groupSchema.parse(body);

    // Verify department exists
    const { data: department } = await supabase
      .from('departments')
      .select('id')
      .eq('id', validated.department_id)
      .single();

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('department_groups')
      .insert({
        ...validated,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // If lead_user_id provided, add them as lead member
    if (validated.lead_user_id) {
      await supabase
        .from('group_memberships')
        .insert({
          group_id: data.id,
          user_id: validated.lead_user_id,
          role: 'lead',
        });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating department group:', error);
    return NextResponse.json(
      { error: 'Failed to create department group' },
      { status: 500 }
    );
  }
}
