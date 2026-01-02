export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const crewMemberSchema = z.object({
  organization_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  hourly_rate: z.number().optional(),
  day_rate: z.number().optional(),
  availability_status: z.enum(['available', 'busy', 'unavailable', 'on_leave']).default('available'),
  status: z.enum(['active', 'inactive', 'pending', 'terminated']).default('active'),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('crew_members')
      .select(`
        *,
        role:crew_roles(id, name),
        department:departments(id, name)
      `)
      .order('last_name', { ascending: true });

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (departmentId) query = query.eq('department_id', departmentId);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: crew, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ crew });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = crewMemberSchema.parse(body);

    const { data: member, error } = await supabase
      .from('crew_members')
      .insert({
        ...validated,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ crew_member: member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Crew member ID required' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('crew_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ crew_member: member });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Crew member ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('crew_members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
