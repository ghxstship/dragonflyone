import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Automated Risk Detection API
 * AI-powered risk assessment for production projects
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const projectId = searchParams.get('project_id');

    if (type === 'risk_categories') {
      const categories = [
        { id: 'safety', name: 'Safety & Health', weight: 1.5, indicators: ['incident_history', 'compliance_gaps', 'hazard_reports'] },
        { id: 'schedule', name: 'Schedule Risk', weight: 1.2, indicators: ['milestone_delays', 'resource_conflicts', 'weather_forecast'] },
        { id: 'budget', name: 'Budget Risk', weight: 1.3, indicators: ['cost_overruns', 'vendor_issues', 'scope_creep'] },
        { id: 'crew', name: 'Crew & Staffing', weight: 1.1, indicators: ['availability', 'skill_gaps', 'certification_expiry'] },
        { id: 'equipment', name: 'Equipment & Technical', weight: 1.2, indicators: ['maintenance_due', 'failure_history', 'backup_availability'] },
        { id: 'vendor', name: 'Vendor & Supply Chain', weight: 1.0, indicators: ['delivery_delays', 'quality_issues', 'contract_disputes'] },
        { id: 'weather', name: 'Weather & Environmental', weight: 1.1, indicators: ['forecast', 'historical_patterns', 'contingency_plans'] },
        { id: 'regulatory', name: 'Regulatory & Compliance', weight: 1.4, indicators: ['permit_status', 'inspection_schedule', 'violation_history'] }
      ];
      return NextResponse.json({ categories });
    }

    if (type === 'project_risks' && projectId) {
      const { data, error } = await supabase
        .from('project_risks')
        .select(`
          *,
          mitigations:risk_mitigations(*)
        `)
        .eq('project_id', projectId)
        .order('risk_score', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ risks: data });
    }

    if (type === 'risk_assessment' && projectId) {
      // Run automated risk assessment
      const assessment = await runRiskAssessment(projectId);
      return NextResponse.json({ assessment });
    }

    if (type === 'alerts') {
      const { data, error } = await supabase
        .from('risk_alerts')
        .select(`
          *,
          project:projects(id, name),
          risk:project_risks(id, title, category)
        `)
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alerts: data });
    }

    if (type === 'dashboard') {
      // Get risk dashboard data
      const [highRisks, activeAlerts, recentAssessments] = await Promise.all([
        supabase.from('project_risks').select('*').gte('risk_score', 7).eq('status', 'open'),
        supabase.from('risk_alerts').select('*').eq('status', 'active'),
        supabase.from('risk_assessments').select('*').order('assessed_at', { ascending: false }).limit(10)
      ]);

      // Group by category
      const byCategory = (highRisks.data || []).reduce((acc: Record<string, number>, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        dashboard: {
          high_risk_count: highRisks.data?.length || 0,
          active_alerts: activeAlerts.data?.length || 0,
          by_category: byCategory,
          recent_assessments: recentAssessments.data
        }
      });
    }

    // Default summary
    const [totalRisks, openRisks] = await Promise.all([
      supabase.from('project_risks').select('id', { count: 'exact', head: true }),
      supabase.from('project_risks').select('id', { count: 'exact', head: true }).eq('status', 'open')
    ]);

    return NextResponse.json({
      summary: {
        total_risks: totalRisks.count || 0,
        open_risks: openRisks.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch risk data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'run_assessment') {
      const { project_id } = body;
      const assessment = await runRiskAssessment(project_id);
      return NextResponse.json({ assessment });
    }

    if (action === 'create_risk') {
      const { project_id, title, description, category, likelihood, impact, owner_id } = body;

      const riskScore = calculateRiskScore(likelihood, impact);

      const { data, error } = await supabase
        .from('project_risks')
        .insert({
          project_id,
          title,
          description,
          category,
          likelihood,
          impact,
          risk_score: riskScore,
          owner_id,
          status: 'open',
          identified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create alert if high risk
      if (riskScore >= 7) {
        await createRiskAlert(data.id, project_id, 'high', `High risk identified: ${title}`);
      }

      return NextResponse.json({ risk: data }, { status: 201 });
    }

    if (action === 'update_risk') {
      const { risk_id, likelihood, impact, status, notes } = body;

      const riskScore = likelihood && impact ? calculateRiskScore(likelihood, impact) : undefined;

      const { data, error } = await supabase
        .from('project_risks')
        .update({
          likelihood,
          impact,
          risk_score: riskScore,
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', risk_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ risk: data });
    }

    if (action === 'add_mitigation') {
      const { risk_id, title, description, owner_id, due_date, cost_estimate } = body;

      const { data, error } = await supabase
        .from('risk_mitigations')
        .insert({
          risk_id,
          title,
          description,
          owner_id,
          due_date,
          cost_estimate,
          status: 'planned'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ mitigation: data }, { status: 201 });
    }

    if (action === 'acknowledge_alert') {
      const { alert_id, acknowledged_by } = body;

      const { data, error } = await supabase
        .from('risk_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data });
    }

    if (action === 'resolve_alert') {
      const { alert_id, resolved_by, resolution } = body;

      const { data, error } = await supabase
        .from('risk_alerts')
        .update({
          status: 'resolved',
          resolved_by,
          resolution,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data });
    }

    if (action === 'schedule_assessment') {
      const { project_id, frequency, next_run } = body;

      const { data, error } = await supabase
        .from('risk_assessment_schedules')
        .upsert({
          project_id,
          frequency,
          next_run,
          enabled: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ schedule: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process risk request' }, { status: 500 });
  }
}

function calculateRiskScore(likelihood: number, impact: number): number {
  // Risk score = likelihood * impact (both on 1-5 scale, result 1-25, normalized to 1-10)
  return Math.round((likelihood * impact) / 2.5);
}

async function runRiskAssessment(projectId: string) {
  // Get project data
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      crew_assignments:crew_assignments(*),
      schedules:schedules(*),
      budget:project_budgets(*)
    `)
    .eq('id', projectId)
    .single();

  if (!project) {
    throw new Error('Project not found');
  }

  const risks: any[] = [];
  const now = new Date();

  // Schedule risk analysis
  const scheduleRisks = analyzeScheduleRisks(project);
  risks.push(...scheduleRisks);

  // Crew risk analysis
  const crewRisks = analyzeCrewRisks(project);
  risks.push(...crewRisks);

  // Budget risk analysis
  const budgetRisks = analyzeBudgetRisks(project);
  risks.push(...budgetRisks);

  // Store assessment
  const { data: assessment } = await supabase
    .from('risk_assessments')
    .insert({
      project_id: projectId,
      assessed_at: now.toISOString(),
      overall_score: calculateOverallScore(risks),
      risk_count: risks.length,
      high_risk_count: risks.filter(r => r.risk_score >= 7).length,
      findings: risks
    })
    .select()
    .single();

  // Create/update project risks
  for (const risk of risks) {
    await supabase.from('project_risks').upsert({
      project_id: projectId,
      title: risk.title,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      risk_score: risk.risk_score,
      description: risk.description,
      status: 'open',
      source: 'automated',
      identified_at: now.toISOString()
    });
  }

  return {
    ...assessment,
    risks
  };
}

function analyzeScheduleRisks(project: any): any[] {
  const risks = [];
  const now = new Date();

  // Check for approaching deadlines
  if (project.end_date) {
    const endDate = new Date(project.end_date);
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd < 7 && daysUntilEnd > 0) {
      risks.push({
        title: 'Approaching deadline',
        category: 'schedule',
        likelihood: 4,
        impact: 4,
        risk_score: 6,
        description: `Project ends in ${daysUntilEnd} days`
      });
    }
  }

  // Check for schedule conflicts
  const schedules = project.schedules || [];
  if (schedules.length > 0) {
    // Simplified conflict detection
    const hasConflicts = schedules.some((s: any, i: number) =>
      schedules.slice(i + 1).some((s2: any) =>
        s.start_time < s2.end_time && s.end_time > s2.start_time
      )
    );

    if (hasConflicts) {
      risks.push({
        title: 'Schedule conflicts detected',
        category: 'schedule',
        likelihood: 5,
        impact: 3,
        risk_score: 6,
        description: 'Overlapping schedule items found'
      });
    }
  }

  return risks;
}

function analyzeCrewRisks(project: any): any[] {
  const risks = [];
  const assignments = project.crew_assignments || [];

  // Check for understaffing
  if (assignments.length < 5) {
    risks.push({
      title: 'Potential understaffing',
      category: 'crew',
      likelihood: 3,
      impact: 3,
      risk_score: 4,
      description: `Only ${assignments.length} crew members assigned`
    });
  }

  // Check for unconfirmed assignments
  const unconfirmed = assignments.filter((a: any) => a.status !== 'confirmed');
  if (unconfirmed.length > 0) {
    risks.push({
      title: 'Unconfirmed crew assignments',
      category: 'crew',
      likelihood: 4,
      impact: 3,
      risk_score: 5,
      description: `${unconfirmed.length} crew members not yet confirmed`
    });
  }

  return risks;
}

function analyzeBudgetRisks(project: any): any[] {
  const risks = [];
  const budget = project.budget?.[0];

  if (budget) {
    const spent = budget.spent || 0;
    const total = budget.total || 1;
    const percentSpent = (spent / total) * 100;

    if (percentSpent > 90) {
      risks.push({
        title: 'Budget nearly exhausted',
        category: 'budget',
        likelihood: 5,
        impact: 4,
        risk_score: 8,
        description: `${percentSpent.toFixed(1)}% of budget spent`
      });
    } else if (percentSpent > 75) {
      risks.push({
        title: 'Budget consumption high',
        category: 'budget',
        likelihood: 3,
        impact: 3,
        risk_score: 4,
        description: `${percentSpent.toFixed(1)}% of budget spent`
      });
    }
  }

  return risks;
}

function calculateOverallScore(risks: any[]): number {
  if (risks.length === 0) return 0;
  const totalScore = risks.reduce((sum, r) => sum + r.risk_score, 0);
  return Math.round((totalScore / risks.length) * 10) / 10;
}

async function createRiskAlert(riskId: string, projectId: string, severity: string, message: string) {
  await supabase.from('risk_alerts').insert({
    risk_id: riskId,
    project_id: projectId,
    severity,
    message,
    status: 'active',
    created_at: new Date().toISOString()
  });
}
