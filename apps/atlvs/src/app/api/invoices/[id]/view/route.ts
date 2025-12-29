export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  try {
    const { id: tokenOrId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Token-based access is public (for clients viewing their invoices)
    // Direct ID access requires authentication
    if (!token) {
      const authResult = await withAuth(request);
      if (authResult instanceof NextResponse) return authResult;
      
      const userRoles = authResult.user?.platformRoles || [];
      if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 });
      }
    }

    let query = supabase
      .from('invoices')
      .select(`
        id, invoice_number, status, subtotal, tax, total_amount,
        due_date, issue_date, notes, terms,
        metadata,
        client:clients(id, company_name, contact_name, email, address),
        organization:organizations(id, name, logo_url, address)
      `);

    if (token) {
      query = query.eq('view_token', token);
    } else {
      query = query.eq('id', tokenOrId);
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update metadata to track when invoice was viewed (if status is 'sent')
    if (invoice.status === 'sent') {
      const currentMetadata = (invoice.metadata as Record<string, unknown>) || {};
      await supabase
        .from('invoices')
        .update({ 
          metadata: { ...currentMetadata, viewed_at: new Date().toISOString() },
          status: 'viewed'
        })
        .eq('id', invoice.id);
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    logger.error('Error in GET /api/invoices/[id]/view:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
