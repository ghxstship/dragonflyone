import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const capacityConfigSchema = z.object({
  layout_name: z.string().min(1),
  layout_type: z.enum(['theater', 'banquet', 'classroom', 'reception', 'boardroom', 'u_shape', 'custom']),
  capacity: z.number().min(1),
  min_guests: z.number().min(1).optional(),
  max_guests: z.number().min(1).optional(),
  description: z.string().optional(),
  floor_plan_url: z.string().url().optional(),
  is_default: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;

    const { data: configs, error } = await supabase
      .from('space_capacity_configs')
      .select('*')
      .eq('space_id', spaceId)
      .order('layout_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch capacity configs' },
        { status: 500 }
      );
    }

    const defaultConfig = configs?.find(c => c.is_default);

    return NextResponse.json({
      configs: configs || [],
      default_config: defaultConfig || null,
      count: configs?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;

    const body = await request.json();
    const validatedData = capacityConfigSchema.parse(body);

    // Check if space exists
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('id')
      .eq('id', spaceId)
      .single();

    if (spaceError || !space) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await supabase
        .from('space_capacity_configs')
        .update({ is_default: false })
        .eq('space_id', spaceId);
    }

    const { data: config, error } = await supabase
      .from('space_capacity_configs')
      .insert({
        space_id: spaceId,
        layout_name: validatedData.layout_name,
        layout_type: validatedData.layout_type,
        capacity: validatedData.capacity,
        min_guests: validatedData.min_guests || null,
        max_guests: validatedData.max_guests || validatedData.capacity,
        description: validatedData.description || null,
        floor_plan_url: validatedData.floor_plan_url || null,
        is_default: validatedData.is_default,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create capacity config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
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
