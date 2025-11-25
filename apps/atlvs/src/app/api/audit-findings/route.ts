import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const auditFindingSchema = z.object({
  audit_type: z.enum(['internal', 'external', 'regulatory', 'financial', 'operational', 'compliance', 'security']),
  audit_date: z.string(),
  auditor_name: z.string().optional(),
  auditor_organization: z.string().optional(),
  finding_type: z.enum(['observation', 'minor_nonconformity', 'major_nonconformity', 'opportunity_for_improvement', 'best_practice']),
  title: z.string().min(1),
  description: z.string().min(1),
  affected_area: z.string().optional(),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
  preventive_action: z.string().optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

// GET /api/audit-findings - List audit findings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const auditType = searchParams.get('audit_type');
    const findingType = searchParams.get('finding_type');
    const assignedTo = searchParams.get('assigned_to');

    let query = supabase
      .from('audit_findings')
      .select(`
        *,
        assigned_to_user:platform_users!assigned_to(id, full_name),
        verified_by_user:platform_users!verified_by(id, full_name),
        created_by_user:platform_users!created_by(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (auditType) {
      query = query.eq('audit_type', auditType);
    }
    if (findingType) {
      query = query.eq('finding_type', findingType);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit findings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit findings', details: error.message },
        { status: 500 }
      );
    }

    interface FindingRecord {
      id: string;
      status: string;
      audit_type: string;
      finding_type: string;
      due_date: string;
      [key: string]: unknown;
    }
    const findings = (data || []) as unknown as FindingRecord[];

    const now = new Date();
    const summary = {
      total: findings.length,
      by_status: {
        open: findings.filter(f => f.status === 'open').length,
        in_progress: findings.filter(f => f.status === 'in_progress').length,
        pending_verification: findings.filter(f => f.status === 'pending_verification').length,
        closed: findings.filter(f => f.status === 'closed').length,
        overdue: findings.filter(f => f.status === 'overdue').length,
      },
      by_type: {
        major_nonconformity: findings.filter(f => f.finding_type === 'major_nonconformity').length,
        minor_nonconformity: findings.filter(f => f.finding_type === 'minor_nonconformity').length,
        observation: findings.filter(f => f.finding_type === 'observation').length,
        opportunity_for_improvement: findings.filter(f => f.finding_type === 'opportunity_for_improvement').length,
      },
      by_audit_type: findings.reduce((acc, f) => {
        acc[f.audit_type] = (acc[f.audit_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      overdue_count: findings.filter(f => {
        if (!f.due_date || f.status === 'closed') return false;
        return new Date(f.due_date) < now;
      }).length,
    };

    return NextResponse.json({ findings: data, summary });
  } catch (error) {
    console.error('Error in GET /api/audit-findings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/audit-findings - Create audit finding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = auditFindingSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: finding, error } = await supabase
      .from('audit_findings')
      .insert({
        organization_id: organizationId,
        ...validated,
        created_by: userId,
        status: 'open',
      })
      .select(`
        *,
        assigned_to_user:platform_users!assigned_to(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating audit finding:', error);
      return NextResponse.json(
        { error: 'Failed to create audit finding', details: error.message },
        { status: 500 }
      );
    }

    // Notify assigned user
    if (validated.assigned_to) {
      await supabase.from('notifications').insert({
        user_id: validated.assigned_to,
        type: 'audit_finding_assigned',
        title: 'Audit Finding Assigned',
        message: `You have been assigned to address: ${validated.title}`,
        data: { finding_id: finding.id },
      });
    }

    return NextResponse.json(finding, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/audit-findings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/audit-findings - Update audit finding
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { finding_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!finding_id) {
      return NextResponse.json({ error: 'finding_id is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'start_work':
        updateData.status = 'in_progress';
        break;
      case 'submit_for_verification':
        updateData.status = 'pending_verification';
        break;
      case 'verify':
        updateData.status = 'closed';
        updateData.verified_by = userId;
        updateData.verified_at = new Date().toISOString();
        break;
      case 'reject_verification':
        updateData.status = 'in_progress';
        break;
      case 'reassign':
        if (!updates?.assigned_to) {
          return NextResponse.json({ error: 'assigned_to is required' }, { status: 400 });
        }
        updateData.assigned_to = updates.assigned_to;
        break;
      default:
        if (updates) {
          updateData = { ...updateData, ...updates };
        }
    }

    const { data, error } = await supabase
      .from('audit_findings')
      .update(updateData)
      .eq('id', finding_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update audit finding', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, finding: data });
  } catch (error) {
    console.error('Error in PATCH /api/audit-findings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
