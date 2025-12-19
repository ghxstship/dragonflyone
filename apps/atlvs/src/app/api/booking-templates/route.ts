import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  event_type: z.string(),
  description: z.string().optional(),
  default_duration_hours: z.number().min(1).optional(),
  default_setup_hours: z.number().min(0).optional(),
  default_breakdown_hours: z.number().min(0).optional(),
  default_guest_count: z.number().min(1).optional(),
  line_items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    unit_price: z.number(),
    quantity: z.number().default(1),
    is_required: z.boolean().default(false),
  })).optional(),
  checklist_items: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('event_type');
    const isActive = searchParams.get('is_active') !== 'false';

    let query = supabase
      .from('booking_templates')
      .select(`
        id,
        name,
        event_type,
        description,
        default_duration_hours,
        default_setup_hours,
        default_breakdown_hours,
        default_guest_count,
        line_items,
        checklist_items,
        is_active,
        usage_count,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (isActive) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    // Group by event type
    const byEventType: Record<string, typeof templates> = {};
    templates?.forEach((template) => {
      if (!byEventType[template.event_type]) {
        byEventType[template.event_type] = [];
      }
      byEventType[template.event_type].push(template);
    });

    return NextResponse.json({
      templates: templates || [],
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
    const validatedData = createTemplateSchema.parse(body);

    const { data: template, error } = await supabase
      .from('booking_templates')
      .insert({
        name: validatedData.name,
        event_type: validatedData.event_type,
        description: validatedData.description || null,
        default_duration_hours: validatedData.default_duration_hours || 4,
        default_setup_hours: validatedData.default_setup_hours || 1,
        default_breakdown_hours: validatedData.default_breakdown_hours || 1,
        default_guest_count: validatedData.default_guest_count || null,
        line_items: validatedData.line_items || [],
        checklist_items: validatedData.checklist_items || [],
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
