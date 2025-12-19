import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  event_type: z.string().optional(),
  introduction: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  line_items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().default(1),
    unit_price: z.number(),
    category: z.string().optional(),
  })).optional(),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('event_type');
    const activeOnly = searchParams.get('active_only') !== 'false';

    let query = supabase
      .from('proposal_templates')
      .select(`
        id,
        name,
        description,
        event_type,
        introduction,
        terms_and_conditions,
        line_items,
        is_default,
        is_active,
        usage_count,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    const defaultTemplate = templates?.find(t => t.is_default);

    // Group by event type
    const byEventType: Record<string, typeof templates> = {};
    templates?.forEach((template) => {
      const type = template.event_type || 'General';
      if (!byEventType[type]) {
        byEventType[type] = [];
      }
      byEventType[type].push(template);
    });

    return NextResponse.json({
      templates: templates || [],
      default_template: defaultTemplate || null,
      by_event_type: byEventType,
      count: templates?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = templateSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await supabase
        .from('proposal_templates')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data: template, error } = await supabase
      .from('proposal_templates')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        event_type: validatedData.event_type || null,
        introduction: validatedData.introduction || null,
        terms_and_conditions: validatedData.terms_and_conditions || null,
        line_items: validatedData.line_items || [],
        is_default: validatedData.is_default,
        is_active: validatedData.is_active,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
