import { withAuth, PlatformRole } from '@ghxstship/config';
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

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Queue email for contract delivery
    await supabase.from('email_queue').insert({
      template: 'contract_sent',
      to_email: validatedData.recipient_email,
      cc_emails: validatedData.cc_emails || [],
      subject: `Contract ${contract.contract_number} - Action Required`,
      metadata: {
        contract_id: contractId,
        contract_number: contract.contract_number,
        recipient_name: validatedData.recipient_name,
        custom_message: validatedData.message,
        expires_at: expiresAt.toISOString(),
        booking_id: contract.booking_id,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // Create notification record
    await supabase.from('notifications').insert({
      type: 'contract_sent',
      title: 'Contract Sent',
      message: `Contract ${contract.contract_number} has been sent to ${validatedData.recipient_name} (${validatedData.recipient_email})`,
      metadata: {
        contract_id: contractId,
        contract_number: contract.contract_number,
        recipient_email: validatedData.recipient_email,
        expires_at: expiresAt.toISOString(),
      },
      read: false,
      created_at: new Date().toISOString(),
    });

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
