export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const UpdateRoleSchema = z.object({
  role_code: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:role_definitions(code, platform, description, level, hierarchy_rank),
        user:platform_users(id, full_name, email),
        organization:organizations(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User role not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user_role: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateRoleSchema.parse(body);

    if (validatedData.role_code) {
      const { data: existingRole } = await supabase
        .from('role_definitions')
        .select('code')
        .eq('code', validatedData.role_code)
        .single();

      if (!existingRole) {
        return NextResponse.json({ error: 'Invalid role code' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        role:role_definitions(code, platform, description, level, hierarchy_rank),
        user:platform_users(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User role not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user_role: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user role' }, { status: 500 });
  }
}
