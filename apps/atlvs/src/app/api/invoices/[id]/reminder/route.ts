export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const sendReminderSchema = z.object({
  message: z.string().optional(),
  cc_emails: z.array(z.string().email()).optional(),
});

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

    const body = await request.json().catch(() => ({}));
    sendReminderSchema.parse(body);

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, client:clients(email, contact_name)')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    if (invoice.status === 'draft') {
      return NextResponse.json({ error: 'Invoice must be sent before sending reminders' }, { status: 400 });
    }

    const { error: reminderError } = await supabase
      .from('invoice_reminders')
      .insert({
        invoice_id: invoiceId,
        sent_at: new Date().toISOString(),
        sent_to: invoice.client?.email,
        sent_by: authResult.user?.id,
      });

    if (reminderError) {
      logger.error('Error recording reminder:', reminderError);
    }

    await supabase
      .from('invoices')
      .update({ 
        last_reminder_at: new Date().toISOString(),
        reminder_count: (invoice.reminder_count || 0) + 1,
      })
      .eq('id', invoiceId);

    logger.info(`Payment reminder sent for invoice ${invoiceId} to ${invoice.client?.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment reminder sent successfully',
    });
  } catch (error) {
    logger.error('Error in POST /api/invoices/[id]/reminder:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
