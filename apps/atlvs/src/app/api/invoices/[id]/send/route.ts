export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { id: invoiceId } = await params;

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, client:clients(email, contact_name)')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'draft') {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (updateError) {
        logger.error('Error updating invoice status:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const viewToken = Buffer.from(`${invoiceId}:${Date.now()}`).toString('base64url');
    
    const { error: tokenError } = await supabase
      .from('invoices')
      .update({ view_token: viewToken })
      .eq('id', invoiceId);

    if (tokenError) {
      logger.error('Error setting view token:', tokenError);
    }

    logger.info(`Invoice ${invoiceId} sent to ${invoice.client?.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      view_url: `/pay/${viewToken}`,
    });
  } catch (error) {
    logger.error('Error in POST /api/invoices/[id]/send:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
