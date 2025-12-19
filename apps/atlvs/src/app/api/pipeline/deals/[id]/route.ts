import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateDealSchema = z.object({
  name: z.string().min(1).optional(),
  client_id: z.string().uuid().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  value: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const dealId = params.id;

    const { data: deal, error } = await supabase
      .from('pipeline_deals')
      .select(`
        id,
        deal_number,
        name,
        client_id,
        client:clients(id, name, email, phone),
        contact_name,
        contact_email,
        contact_phone,
        stage,
        value,
        probability,
        expected_close_date,
        source,
        notes,
        assigned_to,
        assignee:profiles(id, full_name, email),
        created_at,
        updated_at
      `)
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Get deal activities/history
    const { data: activities } = await supabase
      .from('pipeline_deal_activities')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      deal,
      activities: activities || [],
    });
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
    const dealId = params.id;

    const body = await request.json();
    const validatedData = updateDealSchema.parse(body);

    // Check if deal exists
    const { data: existing, error: existingError } = await supabase
      .from('pipeline_deals')
      .select('id, stage')
      .eq('id', dealId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Track stage change for activity log
    const stageChanged = validatedData.stage && validatedData.stage !== existing.stage;

    const { data: deal, error } = await supabase
      .from('pipeline_deals')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      );
    }

    // Log stage change activity
    if (stageChanged) {
      await supabase.from('pipeline_deal_activities').insert({
        deal_id: dealId,
        activity_type: 'stage_change',
        description: `Stage changed from ${existing.stage} to ${validatedData.stage}`,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      deal,
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
    const dealId = params.id;

    const { error } = await supabase
      .from('pipeline_deals')
      .delete()
      .eq('id', dealId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete deal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
