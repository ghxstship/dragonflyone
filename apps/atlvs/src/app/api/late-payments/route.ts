export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const applyPenaltySchema = z.object({
  invoice_id: z.string().uuid(),
  action: z.literal('apply_penalty'),
  penalty_amount: z.number().min(0),
  notes: z.string().optional(),
});

const sendReminderSchema = z.object({
  invoice_id: z.string().uuid(),
  action: z.literal('send_reminder'),
  notes: z.string().optional(),
});

const latePaymentActionSchema = z.union([applyPenaltySchema, sendReminderSchema]);

// Late payment tracking and penalty calculation
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const daysOverdue = parseInt(searchParams.get('days_overdue') || '0');

    const today = new Date().toISOString().split('T')[0];

    const query = supabase.from('invoices').select(`
      *, client:contacts(id, name, email)
    `).eq('status', 'sent').lt('due_date', today);

    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate days overdue and penalties
    const overdueInvoices = data?.map(inv => {
      const dueDate = new Date(inv.due_date);
      const daysLate = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const penaltyRate = inv.late_fee_percent || 1.5; // Default 1.5% per month
      const penalty = (inv.amount * penaltyRate / 100) * Math.ceil(daysLate / 30);

      return { ...inv, days_overdue: daysLate, calculated_penalty: Math.round(penalty * 100) / 100 };
    }).filter(inv => inv.days_overdue >= daysOverdue) || [];

    const totalOverdue = overdueInvoices.reduce((s, i) => s + i.amount, 0);
    const totalPenalties = overdueInvoices.reduce((s, i) => s + i.calculated_penalty, 0);

    return NextResponse.json({
      overdue_invoices: overdueInvoices,
      summary: {
        count: overdueInvoices.length,
        total_overdue: totalOverdue,
        total_penalties: totalPenalties,
        aging: {
          '1_30': overdueInvoices.filter(i => i.days_overdue <= 30).length,
          '31_60': overdueInvoices.filter(i => i.days_overdue > 30 && i.days_overdue <= 60).length,
          '61_90': overdueInvoices.filter(i => i.days_overdue > 60 && i.days_overdue <= 90).length,
          'over_90': overdueInvoices.filter(i => i.days_overdue > 90).length
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch late payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = latePaymentActionSchema.parse(body);
    const { invoice_id, action } = validatedData;

    if (action === 'apply_penalty') {
      const { penalty_amount, notes } = validatedData as z.infer<typeof applyPenaltySchema>;
      const { data: invoice } = await supabase.from('invoices').select('*').eq('id', invoice_id).single();
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

      await supabase.from('invoice_penalties').insert({
        invoice_id, amount: penalty_amount, applied_by: user.id, notes
      });

      await supabase.from('invoices').update({
        amount: invoice.amount + penalty_amount, has_penalty: true
      }).eq('id', invoice_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'send_reminder') {
      await supabase.from('payment_reminders').insert({
        invoice_id, sent_by: user.id, sent_at: new Date().toISOString(), notes
      });

      // In production, trigger email notification
      return NextResponse.json({ success: true, message: 'Reminder sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
