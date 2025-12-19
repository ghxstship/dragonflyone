import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  event_type: z.string().optional(),
  description: z.string().optional().nullable(),
  default_duration_hours: z.number().min(1).optional().nullable(),
  default_setup_hours: z.number().min(0).optional().nullable(),
  default_breakdown_hours: z.number().min(0).optional().nullable(),
  default_guest_count: z.number().min(1).optional().nullable(),
  line_items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    unit_price: z.number(),
    quantity: z.number().default(1),
    is_required: z.boolean().default(false),
  })).optional(),
  checklist_items: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const { data: template, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const body = await request.json();
    const validatedData = updateTemplateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    const { data: template, error } = await supabase
      .from('booking_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('booking_templates')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
