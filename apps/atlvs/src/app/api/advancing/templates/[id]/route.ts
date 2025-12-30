import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  template_type: z.string().optional(),
  is_global: z.boolean().optional(),
  is_active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

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
    const validatedData = updateTemplateSchema.parse(payload);

    const { data, error } = await supabase
      .from('advance_templates')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        template_type: validatedData.template_type,
        is_global: validatedData.is_global,
        is_active: validatedData.is_active,
        tags: validatedData.tags,
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
