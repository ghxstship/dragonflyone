import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const specialtySchema = z.object({
  specialty_id: z.string().uuid(),
  experience_level: z.enum(['entry', 'intermediate', 'senior', 'expert', 'master']).default('intermediate'),
  years_experience: z.number().int().optional(),
  is_primary: z.boolean().default(false),
  portfolio_url: z.string().url().optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    date: z.string().optional(),
    expires: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    const { data, error } = await supabase
      .from('user_specialties')
      .select(`
        *,
        specialty:specialties(
          id, name, code, description,
          category:specialty_categories(id, name, code)
        )
      `)
      .eq('user_id', params.id)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching user specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user specialties' },
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
    const validated = specialtySchema.parse(body);

    // If setting as primary, unset other primaries
    if (validated.is_primary) {
      await supabase
        .from('user_specialties')
        .update({ is_primary: false })
        .eq('user_id', params.id)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('user_specialties')
      .insert({
        user_id: params.id,
        ...validated,
      })
      .select(`
        *,
        specialty:specialties(
          id, name, code, description,
          category:specialty_categories(id, name, code)
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Specialty already added' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding user specialty:', error);
    return NextResponse.json(
      { error: 'Failed to add user specialty' },
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
    const specialty_id = searchParams.get('specialty_id');

    if (!specialty_id) {
      return NextResponse.json(
        { error: 'specialty_id is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = specialtySchema.partial().parse(body);

    // If setting as primary, unset other primaries
    if (validated.is_primary) {
      await supabase
        .from('user_specialties')
        .update({ is_primary: false })
        .eq('user_id', params.id)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('user_specialties')
      .update(validated)
      .eq('user_id', params.id)
      .eq('specialty_id', specialty_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating user specialty:', error);
    return NextResponse.json(
      { error: 'Failed to update user specialty' },
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
    const specialty_id = searchParams.get('specialty_id');

    if (!specialty_id) {
      return NextResponse.json(
        { error: 'specialty_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_specialties')
      .delete()
      .eq('user_id', params.id)
      .eq('specialty_id', specialty_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user specialty:', error);
    return NextResponse.json(
      { error: 'Failed to remove user specialty' },
      { status: 500 }
    );
  }
}
