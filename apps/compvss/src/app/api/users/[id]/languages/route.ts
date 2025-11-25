import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const languageSchema = z.object({
  language_id: z.string().uuid(),
  proficiency_level: z.enum(['native', 'fluent', 'professional', 'conversational', 'basic']),
  is_primary: z.boolean().default(false),
  can_translate: z.boolean().default(false),
  can_interpret: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('user_languages')
      .select(`
        *,
        language:languages(id, code, name, native_name)
      `)
      .eq('user_id', params.id)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching user languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user languages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = languageSchema.parse(body);

    // If setting as primary, unset other primaries
    if (validated.is_primary) {
      await supabase
        .from('user_languages')
        .update({ is_primary: false })
        .eq('user_id', params.id)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('user_languages')
      .insert({
        user_id: params.id,
        ...validated,
      })
      .select(`
        *,
        language:languages(id, code, name, native_name)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Language already added' },
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
    console.error('Error adding user language:', error);
    return NextResponse.json(
      { error: 'Failed to add user language' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const language_id = searchParams.get('language_id');

    if (!language_id) {
      return NextResponse.json(
        { error: 'language_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_languages')
      .delete()
      .eq('user_id', params.id)
      .eq('language_id', language_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user language:', error);
    return NextResponse.json(
      { error: 'Failed to remove user language' },
      { status: 500 }
    );
  }
}
