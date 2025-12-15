export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Account health scoring with predictive analytics
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    if (clientId) {
      // Get single client health score
      const healthScore = await calculateClientHealth(supabase, clientId);
      return NextResponse.json({ client_id: clientId, ...healthScore });
    }

    // Get all clients with health scores
    const { data: clients } = await supabase.from('contacts').select('id, name, company').eq('type', 'client');
    
    const healthScores = await Promise.all(
      (clients || []).map(async (client) => ({
        client,
        ...await calculateClientHealth(supabase, client.id)
      }))
    );

    // Sort by health score
    healthScores.sort((a, b) => a.score - b.score);

    return NextResponse.json({
      accounts: healthScores,
      at_risk: healthScores.filter(h => h.score < 50),
      healthy: healthScores.filter(h => h.score >= 70),
      average_score: Math.round(healthScores.reduce((s, h) => s + h.score, 0) / healthScores.length)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health scores' }, { status: 500 });
  }
}

async function calculateClientHealth(supabase: SupabaseClient, clientId: string) {
  // Get recent activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentProjects } = await supabase.from('projects').select('id, status')
    .eq('client_id', clientId).gte('created_at', thirtyDaysAgo.toISOString());

  const { data: recentInvoices } = await supabase.from('invoices').select('id, status, amount')
    .eq('client_id', clientId).gte('created_at', thirtyDaysAgo.toISOString());

  const { data: communications } = await supabase.from('communications').select('id')
    .eq('contact_id', clientId).gte('created_at', thirtyDaysAgo.toISOString());

  const { data: npsScores } = await supabase.from('nps_responses').select('score')
    .eq('client_id', clientId).order('created_at', { ascending: false }).limit(3);

  // Calculate component scores
  const engagementScore = Math.min(100, (communications?.length || 0) * 10);
  const projectScore = recentProjects?.length ? 80 : 40;
  const paymentScore = calculatePaymentScore(recentInvoices || []);
  const npsScore = npsScores?.length ? (npsScores.reduce((s: number, n: { score: number }) => s + n.score, 0) / npsScores.length) * 10 : 50;

  // Weighted average
  const score = Math.round(
    engagementScore * 0.25 +
    projectScore * 0.25 +
    paymentScore * 0.30 +
    npsScore * 0.20
  );

  // Predict churn risk
  const churnRisk = score < 40 ? 'high' : score < 60 ? 'medium' : 'low';

  return {
    score,
    churn_risk: churnRisk,
    components: {
      engagement: engagementScore,
      project_activity: projectScore,
      payment_health: paymentScore,
      satisfaction: npsScore
    },
    recommendations: generateRecommendations(score, { engagementScore, projectScore, paymentScore, npsScore }),
    last_calculated: new Date().toISOString()
  };
}

function calculatePaymentScore(invoices: unknown[]): number {
  if (invoices.length === 0) return 70;
  
  const paid = invoices.filter(i => i.status === 'paid').length;
  const overdue = invoices.filter(i => i.status === 'overdue').length;
  
  return Math.max(0, Math.min(100, 100 - (overdue * 20) + (paid * 5)));
}

interface HealthComponents { engagementScore: number; paymentScore: number; npsScore: number }
function generateRecommendations(score: number, components: HealthComponents): string[] {
  const recommendations: string[] = [];

  if (components.engagementScore < 50) {
    recommendations.push('Schedule a check-in call to increase engagement');
  }
  if (components.paymentScore < 60) {
    recommendations.push('Review payment terms and follow up on outstanding invoices');
  }
  if (components.npsScore < 50) {
    recommendations.push('Address satisfaction concerns with account review');
  }
  if (score < 50) {
    recommendations.push('High churn risk - prioritize retention efforts');
  }

  return recommendations;
}
