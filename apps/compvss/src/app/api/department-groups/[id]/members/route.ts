import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const memberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['lead', 'co_lead', 'member', 'advisor', 'observer']).default('member'),
  responsibilities: z.string().optional(),
});

const updateMemberSchema = z.object({
  role: z.enum(['lead', 'co_lead', 'member', 'advisor', 'observer']).optional(),
  responsibilities: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        user:platform_users(id, email, full_name, avatar_url, platform_roles)
      `)
      .eq('group_id', params.id)
      .order('role');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = memberSchema.parse(body);

    // Check if user is already a member
    const { data: existing } = await supabase
      .from('group_memberships')
      .select('id')
      .eq('group_id', params.id)
      .eq('user_id', validated.user_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('group_memberships')
      .insert({
        group_id: params.id,
        ...validated,
      })
      .select(`
        *,
        user:platform_users(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id query parameter required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateMemberSchema.parse(body);

    const { data, error } = await supabase
      .from('group_memberships')
      .update(validated)
      .eq('group_id', params.id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Membership not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating group member:', error);
    return NextResponse.json(
      { error: 'Failed to update group member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id query parameter required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', params.id)
      .eq('user_id', user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}
