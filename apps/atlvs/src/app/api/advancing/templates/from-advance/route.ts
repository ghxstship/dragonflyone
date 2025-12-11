import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const payload = await request.json();

    if (!payload.advance_id || !payload.name) {
      return NextResponse.json(
        { error: 'advance_id and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('create_template_from_advance', {
      p_advance_id: payload.advance_id,
      p_template_name: payload.name,
      p_description: payload.description || undefined,
      p_category: payload.category || undefined,
      p_is_global: payload.is_global || false,
      p_created_by: payload.created_by || undefined,
    });

    if (error) {
      log.error('Failed to create template from advance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: template } = await supabase
      .from('advance_templates')
      .select('*')
      .eq('id', data)
      .single();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating template from advance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
