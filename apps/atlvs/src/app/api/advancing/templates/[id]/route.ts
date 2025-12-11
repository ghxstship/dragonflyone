import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const { data: template, error } = await supabase
      .from('advance_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      log.error('Failed to fetch advance template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: items } = await supabase
      .from('advance_template_items')
      .select('*')
      .eq('template_id', id)
      .order('display_order');

    return NextResponse.json({ 
      template: {
        ...template,
        items: items || [],
        item_count: items?.length || 0,
      }
    });
  } catch (error) {
    log.error('Unexpected error fetching advance template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const payload = await request.json();

    const { data, error } = await supabase
      .from('advance_templates')
      .update({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        template_type: payload.template_type,
        is_global: payload.is_global,
        is_active: payload.is_active,
        tags: payload.tags,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      log.error('Failed to update advance template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    log.error('Unexpected error updating advance template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const { error } = await supabase
      .from('advance_templates')
      .delete()
      .eq('id', id);

    if (error) {
      log.error('Failed to delete advance template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    log.error('Unexpected error deleting advance template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
