import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const awardSchema = z.object({
  quote_id: z.string().uuid(),
  notes: z.string().optional(),
  create_order: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const rfpId = params.id;

    const body = await request.json();
    const validatedData = awardSchema.parse(body);

    // Check if RFP exists
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('id, status, organization_id')
      .eq('id', rfpId)
      .single();

    if (rfpError || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    if (rfp.status === 'awarded' || rfp.status === 'closed') {
      return NextResponse.json(
        { error: 'RFP has already been awarded or closed' },
        { status: 400 }
      );
    }

    // Get the quote
    const { data: quote, error: quoteError } = await supabase
      .from('rfp_quotes')
      .select(`
        id,
        rfp_vendor_id,
        total_amount,
        items,
        rfp_vendor:rfp_vendors(
          vendor_profile_id
        )
      `)
      .eq('id', validatedData.quote_id)
      .eq('rfp_id', rfpId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Create award record
    const { data: award, error: awardError } = await supabase
      .from('rfp_awards')
      .insert({
        rfp_id: rfpId,
        quote_id: validatedData.quote_id,
        vendor_profile_id: quote.rfp_vendor?.vendor_profile_id,
        awarded_amount: quote.total_amount,
        notes: validatedData.notes || null,
        awarded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (awardError) {
      return NextResponse.json(
        { error: 'Failed to create award' },
        { status: 500 }
      );
    }

    // Update RFP status
    await supabase
      .from('rfps')
      .update({
        status: 'awarded',
        awarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', rfpId);

    // Update winning quote status
    await supabase
      .from('rfp_quotes')
      .update({ status: 'accepted' })
      .eq('id', validatedData.quote_id);

    // Update other quotes as declined
    await supabase
      .from('rfp_quotes')
      .update({ status: 'declined' })
      .eq('rfp_id', rfpId)
      .neq('id', validatedData.quote_id);

    return NextResponse.json({
      success: true,
      award,
      message: 'RFP awarded successfully',
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
