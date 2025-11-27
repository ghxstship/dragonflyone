import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Risk register with mitigation plans and owner assignment
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase.from('project_risks').select(`
      *, owner:platform_users(id, first_name, last_name),
      mitigations:risk_mitigations(id, action, status, due_date)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('risk_score', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate risk matrix
    const riskMatrix = {
      high: data?.filter(r => r.risk_score >= 15) || [],
      medium: data?.filter(r => r.risk_score >= 8 && r.risk_score < 15) || [],
      low: data?.filter(r => r.risk_score < 8) || []
    };

    return NextResponse.json({
      risks: data,
      risk_matrix: riskMatrix,
      summary: {
        total: data?.length || 0,
        open: data?.filter(r => r.status === 'open').length || 0,
        mitigated: data?.filter(r => r.status === 'mitigated').length || 0,
        closed: data?.filter(r => r.status === 'closed').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch risks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, title, description, category, probability, impact, owner_id, mitigation_plan } = body;

    const riskScore = probability * impact;

    const { data: risk, error } = await supabase.from('project_risks').insert({
      project_id, title, description, category,
      probability, impact, risk_score: riskScore,
      owner_id, status: 'open', identified_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add mitigation plan if provided
    if (mitigation_plan) {
      await supabase.from('risk_mitigations').insert({
        risk_id: risk.id, action: mitigation_plan, status: 'planned'
      });
    }

    return NextResponse.json({ risk }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create risk' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'add_mitigation') {
      const { mitigation_action, due_date, assigned_to } = body;
      await supabase.from('risk_mitigations').insert({
        risk_id: id, action: mitigation_action, due_date, assigned_to, status: 'planned'
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update_status') {
      const { status, resolution_notes } = body;
      await supabase.from('project_risks').update({
        status, resolution_notes, resolved_at: status === 'closed' ? new Date().toISOString() : null
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    if (action === 'reassess') {
      const { probability, impact } = body;
      await supabase.from('project_risks').update({
        probability, impact, risk_score: probability * impact,
        last_assessed: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
