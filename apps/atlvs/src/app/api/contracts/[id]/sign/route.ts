import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const signSchema = z.object({
  signer_name: z.string().min(1),
  signer_email: z.string().email(),
  signer_title: z.string().optional(),
  signature_data: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
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
    const validatedData = signSchema.parse(body);

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, status, contract_number, booking_id, client_id')
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

    if (contract.status !== 'sent' && contract.status !== 'pending') {
      return NextResponse.json(
        { error: 'Contract is not in a signable state' },
        { status: 400 }
      );
    }

    // Record signature
    const { data: signature, error: signatureError } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: contractId,
        signer_name: validatedData.signer_name,
        signer_email: validatedData.signer_email,
        signer_title: validatedData.signer_title || null,
        signature_data: validatedData.signature_data || null,
        ip_address: validatedData.ip_address || request.headers.get('x-forwarded-for') || null,
        user_agent: validatedData.user_agent || request.headers.get('user-agent') || null,
        signed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (signatureError) {
      return NextResponse.json(
        { error: 'Failed to record signature' },
        { status: 500 }
      );
    }

    // Update contract status
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_by: validatedData.signer_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update contract status' },
        { status: 500 }
      );
    }

    // Update booking status if applicable
    if (contract.booking_id) {
      await supabase
        .from('bookings')
        .update({
          contract_status: 'signed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contract.booking_id);
    }

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      signature: {
        id: signature.id,
        signer_name: signature.signer_name,
        signed_at: signature.signed_at,
      },
      message: 'Contract signed successfully',
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
