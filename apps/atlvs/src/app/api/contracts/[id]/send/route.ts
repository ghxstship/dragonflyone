import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const sendSchema = z.object({
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1),
  message: z.string().optional(),
  cc_emails: z.array(z.string().email()).optional(),
  expires_in_days: z.number().min(1).max(90).default(30),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const contractId = params.id;

    const body = await request.json();
    const validatedData = sendSchema.parse(body);

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, status, contract_number, booking_id')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    if (contract.status === 'signed') {
      return NextResponse.json(
        { error: 'Contract has already been signed' },
        { status: 400 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expires_in_days);

    // Update contract
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_to_email: validatedData.recipient_email,
        sent_to_name: validatedData.recipient_name,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update contract' },
        { status: 500 }
      );
    }

    // TODO: Integrate with email service to actually send the contract
    // For now, we just update the status

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: `Contract sent to ${validatedData.recipient_email}`,
      expires_at: expiresAt.toISOString(),
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
