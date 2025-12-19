import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const moveSchema = z.object({
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  reason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const dealId = params.id;

    const body = await request.json();
    const validatedData = moveSchema.parse(body);

    // Get current deal
    const { data: existing, error: existingError } = await supabase
      .from('pipeline_deals')
      .select('id, stage, name')
      .eq('id', dealId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    if (existing.stage === validatedData.stage) {
      return NextResponse.json(
        { error: 'Deal is already in this stage' },
        { status: 400 }
      );
    }

    const previousStage = existing.stage;

    // Update deal stage
    const updateData: Record<string, unknown> = {
      stage: validatedData.stage,
      updated_at: new Date().toISOString(),
    };

    // Set closed_at if moving to closed stage
    if (validatedData.stage === 'closed_won' || validatedData.stage === 'closed_lost') {
      updateData.closed_at = new Date().toISOString();
      updateData.close_reason = validatedData.reason || null;
    }

    // Update probability based on stage
    const stageProbabilities: Record<string, number> = {
      lead: 10,
      qualified: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0,
    };
    updateData.probability = stageProbabilities[validatedData.stage] || 0;

    const { data: deal, error } = await supabase
      .from('pipeline_deals')
      .update(updateData)
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to move deal' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('pipeline_deal_activities').insert({
      deal_id: dealId,
      activity_type: 'stage_change',
      description: `Moved from ${previousStage} to ${validatedData.stage}${validatedData.reason ? `: ${validatedData.reason}` : ''}`,
      metadata: {
        previous_stage: previousStage,
        new_stage: validatedData.stage,
        reason: validatedData.reason || null,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      deal,
      message: `Deal moved to ${validatedData.stage}`,
      previous_stage: previousStage,
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
