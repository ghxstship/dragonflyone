import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const grantSchema = z.object({
  name: z.string().min(1),
  grantor: z.string().min(1),
  grantor_type: z.enum(['federal', 'state', 'local', 'foundation', 'corporate', 'individual', 'other']),
  grant_number: z.string().optional(),
  amount_awarded: z.number().positive(),
  amount_received: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  purpose: z.string(),
  restrictions: z.string().optional(),
  reporting_requirements: z.string().optional(),
  reporting_frequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'final_only']).optional(),
  project_id: z.string().uuid().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  notes: z.string().optional(),
});

const fundingSourceSchema = z.object({
  name: z.string().min(1),
  source_type: z.enum(['grant', 'donation', 'sponsorship', 'investment', 'loan', 'revenue', 'other']),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  restrictions: z.string().optional(),
  project_id: z.string().uuid().optional(),
  donor_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const expenditureSchema = z.object({
  grant_id: z.string().uuid(),
  amount: z.number().positive(),
  expenditure_date: z.string().datetime(),
  category: z.string(),
  description: z.string(),
  vendor_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  approved_by: z.string().uuid().optional(),
});

// GET - Get grants and funding data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'grants' | 'funding_sources' | 'expenditures' | 'compliance' | 'reports'
    const grantId = searchParams.get('grant_id');
    const status = searchParams.get('status');

    if (type === 'grants') {
      let query = supabase
        .from('grants')
        .select(`
          *,
          project:projects(id, name),
          expenditures:grant_expenditures(amount)
        `)
        .order('end_date', { ascending: true });

      if (status) query = query.eq('status', status);

      const { data: grants, error } = await query;

      if (error) throw error;

      // Calculate spent and remaining amounts
      const enriched = grants?.map(g => {
        const totalSpent = (g.expenditures as any[])?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const remaining = g.amount_awarded - totalSpent;
        const utilizationRate = (totalSpent / g.amount_awarded) * 100;
        const daysRemaining = Math.ceil((new Date(g.end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

        return {
          ...g,
          total_spent: totalSpent,
          remaining_balance: remaining,
          utilization_rate: Math.round(utilizationRate * 100) / 100,
          days_remaining: daysRemaining,
          is_expiring: daysRemaining <= 90 && daysRemaining > 0,
          is_expired: daysRemaining <= 0,
        };
      });

      // Group by status
      const byStatus = {
        active: enriched?.filter(g => g.status === 'active') || [],
        pending: enriched?.filter(g => g.status === 'pending') || [],
        closed: enriched?.filter(g => g.status === 'closed') || [],
      };

      return NextResponse.json({
        grants: enriched,
        by_status: byStatus,
        totals: {
          total_awarded: enriched?.reduce((sum, g) => sum + g.amount_awarded, 0) || 0,
          total_spent: enriched?.reduce((sum, g) => sum + g.total_spent, 0) || 0,
          total_remaining: enriched?.reduce((sum, g) => sum + g.remaining_balance, 0) || 0,
        },
      });
    }

    if (type === 'funding_sources') {
      const { data: sources, error } = await supabase
        .from('funding_sources')
        .select(`
          *,
          project:projects(id, name),
          donor:contacts(id, first_name, last_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by type
      const byType = sources?.reduce((acc: Record<string, { count: number; total: number }>, s) => {
        if (!acc[s.source_type]) acc[s.source_type] = { count: 0, total: 0 };
        acc[s.source_type].count++;
        acc[s.source_type].total += s.amount;
        return acc;
      }, {});

      return NextResponse.json({
        sources,
        by_type: byType,
        total_funding: sources?.reduce((sum, s) => sum + s.amount, 0) || 0,
      });
    }

    if (type === 'expenditures' && grantId) {
      const { data: expenditures, error } = await supabase
        .from('grant_expenditures')
        .select(`
          *,
          vendor:vendors(id, name),
          approver:platform_users(id, first_name, last_name)
        `)
        .eq('grant_id', grantId)
        .order('expenditure_date', { ascending: false });

      if (error) throw error;

      // Get grant details
      const { data: grant } = await supabase
        .from('grants')
        .select('amount_awarded, restrictions')
        .eq('id', grantId)
        .single();

      const totalSpent = expenditures?.reduce((sum, e) => sum + e.amount, 0) || 0;

      // Group by category
      const byCategory = expenditures?.reduce((acc: Record<string, number>, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      return NextResponse.json({
        expenditures,
        by_category: byCategory,
        summary: {
          total_spent: totalSpent,
          budget: grant?.amount_awarded || 0,
          remaining: (grant?.amount_awarded || 0) - totalSpent,
        },
      });
    }

    if (type === 'compliance') {
      // Get compliance status for all active grants
      const { data: grants, error } = await supabase
        .from('grants')
        .select(`
          id,
          name,
          grantor,
          end_date,
          reporting_requirements,
          reporting_frequency,
          reports:grant_reports(id, report_type, due_date, submitted_date, status)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const compliance = grants?.map(g => {
        const reports = (g.reports as any[]) || [];
        const overdueReports = reports.filter(r => 
          r.status !== 'submitted' && new Date(r.due_date) < new Date()
        );
        const upcomingReports = reports.filter(r => 
          r.status !== 'submitted' && 
          new Date(r.due_date) >= new Date() && 
          new Date(r.due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        return {
          grant_id: g.id,
          grant_name: g.name,
          grantor: g.grantor,
          end_date: g.end_date,
          reporting_frequency: g.reporting_frequency,
          total_reports: reports.length,
          submitted_reports: reports.filter(r => r.status === 'submitted').length,
          overdue_reports: overdueReports.length,
          upcoming_reports: upcomingReports.length,
          compliance_status: overdueReports.length > 0 ? 'non_compliant' : 
                            upcomingReports.length > 0 ? 'attention_needed' : 'compliant',
        };
      });

      return NextResponse.json({
        compliance,
        summary: {
          total_grants: compliance?.length || 0,
          compliant: compliance?.filter(c => c.compliance_status === 'compliant').length || 0,
          attention_needed: compliance?.filter(c => c.compliance_status === 'attention_needed').length || 0,
          non_compliant: compliance?.filter(c => c.compliance_status === 'non_compliant').length || 0,
        },
      });
    }

    if (type === 'reports' && grantId) {
      const { data: reports, error } = await supabase
        .from('grant_reports')
        .select('*')
        .eq('grant_id', grantId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ reports });
    }

    // Default: return summary
    const [grantsResult, fundingResult] = await Promise.all([
      supabase.from('grants').select('amount_awarded, status').eq('status', 'active'),
      supabase.from('funding_sources').select('amount, source_type').eq('status', 'active'),
    ]);

    return NextResponse.json({
      summary: {
        active_grants: grantsResult.data?.length || 0,
        total_grant_funding: grantsResult.data?.reduce((sum, g) => sum + g.amount_awarded, 0) || 0,
        funding_sources: fundingResult.data?.length || 0,
        total_other_funding: fundingResult.data?.reduce((sum, f) => sum + f.amount, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Grants error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create grant, funding source, or expenditure
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_grant') {
      const validated = grantSchema.parse(body.data);

      const { data: grant, error } = await supabase
        .from('grants')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create reporting schedule if frequency specified
      if (validated.reporting_frequency) {
        const reports = generateReportingSchedule(
          grant.id,
          validated.start_date,
          validated.end_date,
          validated.reporting_frequency
        );
        
        if (reports.length) {
          await supabase.from('grant_reports').insert(reports);
        }
      }

      return NextResponse.json({ grant }, { status: 201 });
    }

    if (action === 'create_funding_source') {
      const validated = fundingSourceSchema.parse(body.data);

      const { data: source, error } = await supabase
        .from('funding_sources')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ source }, { status: 201 });
    }

    if (action === 'record_expenditure') {
      const validated = expenditureSchema.parse(body.data);

      // Check grant balance
      const { data: grant } = await supabase
        .from('grants')
        .select(`
          amount_awarded,
          expenditures:grant_expenditures(amount)
        `)
        .eq('id', validated.grant_id)
        .single();

      if (!grant) {
        return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
      }

      const totalSpent = (grant.expenditures as any[])?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const remaining = grant.amount_awarded - totalSpent;

      if (validated.amount > remaining) {
        return NextResponse.json({ 
          error: `Expenditure exceeds remaining grant balance of ${remaining}` 
        }, { status: 400 });
      }

      const { data: expenditure, error } = await supabase
        .from('grant_expenditures')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        expenditure,
        remaining_balance: remaining - validated.amount,
      }, { status: 201 });
    }

    if (action === 'submit_report') {
      const { report_id, report_content, attachments } = body.data;

      const { data: report, error } = await supabase
        .from('grant_reports')
        .update({
          status: 'submitted',
          submitted_date: new Date().toISOString(),
          report_content,
          attachments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ report });
    }

    if (action === 'receive_funds') {
      const { grant_id, amount, received_date, notes } = body.data;

      // Update grant received amount
      const { data: grant } = await supabase
        .from('grants')
        .select('amount_received')
        .eq('id', grant_id)
        .single();

      const newReceived = (grant?.amount_received || 0) + amount;

      await supabase
        .from('grants')
        .update({
          amount_received: newReceived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', grant_id);

      // Log the receipt
      await supabase.from('grant_receipts').insert({
        grant_id,
        amount,
        received_date,
        notes,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ 
        success: true,
        total_received: newReceived,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Grants error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update grant or funding source
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'grant') {
      const { data: grant, error } = await supabase
        .from('grants')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ grant });
    }

    if (type === 'funding_source') {
      const { data: source, error } = await supabase
        .from('funding_sources')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ source });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Grants error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Close grant or deactivate funding source
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    if (type === 'grant') {
      const { error } = await supabase
        .from('grants')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'funding_source') {
      const { error } = await supabase
        .from('funding_sources')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Grants error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to generate reporting schedule
function generateReportingSchedule(
  grantId: string,
  startDate: string,
  endDate: string,
  frequency: string
): any[] {
  const reports = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);

  const monthsInterval = {
    monthly: 1,
    quarterly: 3,
    semi_annual: 6,
    annual: 12,
    final_only: 0,
  }[frequency] || 3;

  if (monthsInterval === 0) {
    // Final report only
    reports.push({
      grant_id: grantId,
      report_type: 'final',
      due_date: end.toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  } else {
    let reportNum = 1;
    current.setMonth(current.getMonth() + monthsInterval);
    
    while (current <= end) {
      reports.push({
        grant_id: grantId,
        report_type: 'progress',
        report_number: reportNum,
        due_date: current.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      reportNum++;
      current.setMonth(current.getMonth() + monthsInterval);
    }

    // Add final report
    reports.push({
      grant_id: grantId,
      report_type: 'final',
      due_date: new Date(end.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days after end
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }

  return reports;
}
