import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/ai/predictive-analytics - Predictive analytics for all modules
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetModule = searchParams.get('module');
    const action = searchParams.get('action');

    if (targetModule === 'crm') {
      if (action === 'lead_scoring') {
        // Score leads based on engagement and fit
        const { data: leads } = await supabase
          .from('contacts')
          .select('id, email, company, created_at, last_activity_at, total_revenue, engagement_score')
          .eq('type', 'lead');

        const scoredLeads = leads?.map(lead => {
          let score = 50; // Base score

          // Engagement recency
          if (lead.last_activity_at) {
            const daysSinceActivity = (Date.now() - new Date(lead.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActivity < 7) score += 20;
            else if (daysSinceActivity < 30) score += 10;
            else if (daysSinceActivity > 90) score -= 20;
          }

          // Previous revenue
          if (lead.total_revenue && lead.total_revenue > 0) {
            score += Math.min(20, lead.total_revenue / 1000);
          }

          // Engagement score
          if (lead.engagement_score) {
            score += lead.engagement_score * 0.1;
          }

          return {
            ...lead,
            predictive_score: Math.min(100, Math.max(0, Math.round(score))),
            conversion_probability: Math.min(100, Math.round(score * 0.8)),
            recommended_action: score > 70 ? 'high_priority_follow_up' :
                               score > 50 ? 'nurture_campaign' : 'low_priority',
          };
        }).sort((a, b) => b.predictive_score - a.predictive_score);

        return NextResponse.json({ leads: scoredLeads || [] });
      }

      if (action === 'churn_prediction') {
        const { data: customers } = await supabase
          .from('contacts')
          .select('id, email, company, last_activity_at, total_revenue, created_at')
          .eq('type', 'customer');

        const churnPredictions = customers?.map(customer => {
          const daysSinceActivity = customer.last_activity_at
            ? (Date.now() - new Date(customer.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
            : 365;

          const customerAge = (Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24);

          // Churn probability calculation
          let churnProb = 10; // Base

          if (daysSinceActivity > 90) churnProb += 40;
          else if (daysSinceActivity > 60) churnProb += 25;
          else if (daysSinceActivity > 30) churnProb += 10;

          // New customers are more likely to churn
          if (customerAge < 90) churnProb += 15;

          return {
            customer_id: customer.id,
            email: customer.email,
            company: customer.company,
            days_since_activity: Math.round(daysSinceActivity),
            churn_probability: Math.min(100, churnProb),
            risk_level: churnProb > 60 ? 'high' : churnProb > 30 ? 'medium' : 'low',
            revenue_at_risk: customer.total_revenue || 0,
            recommended_action: churnProb > 60 ? 'immediate_outreach' :
                               churnProb > 30 ? 're_engagement_campaign' : 'monitor',
          };
        }).sort((a, b) => b.churn_probability - a.churn_probability);

        return NextResponse.json({
          predictions: churnPredictions || [],
          summary: {
            high_risk: churnPredictions?.filter(c => c.risk_level === 'high').length || 0,
            total_revenue_at_risk: churnPredictions?.filter(c => c.risk_level === 'high')
              .reduce((sum, c) => sum + c.revenue_at_risk, 0) || 0,
          },
        });
      }

      if (action === 'deal_forecast') {
        const { data: deals } = await supabase
          .from('deals')
          .select('id, name, value, stage, probability, expected_close_date, created_at')
          .not('stage', 'in', '("closed_won","closed_lost")');

        const dealForecasts = deals?.map(deal => {
          const daysOpen = (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24);
          const daysUntilClose = deal.expected_close_date
            ? (new Date(deal.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            : 30;

          // Adjust probability based on age and stage
          let adjustedProb = deal.probability || 50;

          // Deals open too long have lower probability
          if (daysOpen > 90) adjustedProb *= 0.7;
          else if (daysOpen > 60) adjustedProb *= 0.85;

          // Stage-based adjustments
          const stageMultipliers: Record<string, number> = {
            lead: 0.6,
            qualified: 0.8,
            proposal: 1.0,
            negotiation: 1.1,
          };
          adjustedProb *= stageMultipliers[deal.stage] || 1.0;

          return {
            deal_id: deal.id,
            name: deal.name,
            value: deal.value,
            stage: deal.stage,
            original_probability: deal.probability,
            adjusted_probability: Math.min(100, Math.round(adjustedProb)),
            expected_value: Math.round((deal.value || 0) * (adjustedProb / 100)),
            days_open: Math.round(daysOpen),
            days_until_close: Math.round(daysUntilClose),
            risk_factors: getRiskFactors(daysOpen, daysUntilClose, deal.stage),
          };
        });

        return NextResponse.json({
          deals: dealForecasts || [],
          pipeline_forecast: {
            total_pipeline: deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
            weighted_pipeline: dealForecasts?.reduce((sum, d) => sum + d.expected_value, 0) || 0,
          },
        });
      }
    }

    if (targetModule === 'finance') {
      if (action === 'cash_flow_prediction') {
        // Get receivables
        const { data: receivables } = await supabase
          .from('invoices')
          .select('total_amount, due_date, status')
          .eq('status', 'pending')
          .gte('due_date', new Date().toISOString());

        // Get payables
        const { data: payables } = await supabase
          .from('bills')
          .select('amount, due_date, status')
          .eq('status', 'pending')
          .gte('due_date', new Date().toISOString());

        // Project by week
        const weeks = 12;
        const projection = [];
        const now = new Date();

        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

          const weekReceivables = receivables?.filter(r => {
            const due = new Date(r.due_date);
            return due >= weekStart && due < weekEnd;
          }).reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

          const weekPayables = payables?.filter(p => {
            const due = new Date(p.due_date);
            return due >= weekStart && due < weekEnd;
          }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

          projection.push({
            week: i + 1,
            week_start: weekStart.toISOString().slice(0, 10),
            inflows: weekReceivables,
            outflows: weekPayables,
            net: weekReceivables - weekPayables,
          });
        }

        // Calculate running balance
        let balance = 0;
        projection.forEach(week => {
          balance += week.net;
          (week as any).projected_balance = balance;
        });

        return NextResponse.json({
          projection,
          summary: {
            total_receivables: receivables?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0,
            total_payables: payables?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
            lowest_balance_week: projection.reduce((min, w) => (w as any).projected_balance < (min as any).projected_balance ? w : min),
          },
        });
      }

      if (action === 'expense_anomalies') {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('id, category, amount, expense_date, description')
          .gte('expense_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        // Group by category
        const categoryStats: Record<string, { values: number[]; mean: number; stdDev: number }> = {};

        expenses?.forEach(exp => {
          const cat = exp.category || 'other';
          if (!categoryStats[cat]) categoryStats[cat] = { values: [], mean: 0, stdDev: 0 };
          categoryStats[cat].values.push(exp.amount || 0);
        });

        // Calculate stats
        Object.values(categoryStats).forEach(stats => {
          stats.mean = stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
          stats.stdDev = Math.sqrt(
            stats.values.reduce((sum, v) => sum + Math.pow(v - stats.mean, 2), 0) / stats.values.length
          );
        });

        // Find anomalies
        const anomalies = expenses?.filter(exp => {
          const cat = exp.category || 'other';
          const stats = categoryStats[cat];
          if (!stats || stats.stdDev === 0) return false;

          const zScore = Math.abs((exp.amount - stats.mean) / stats.stdDev);
          return zScore > 2;
        }).map(exp => ({
          ...exp,
          category_average: categoryStats[exp.category || 'other']?.mean || 0,
          deviation_percent: ((exp.amount - (categoryStats[exp.category || 'other']?.mean || 0)) /
                            (categoryStats[exp.category || 'other']?.mean || 1) * 100).toFixed(1),
        }));

        return NextResponse.json({ anomalies: anomalies || [] });
      }
    }

    if (targetModule === 'projects') {
      if (action === 'completion_prediction') {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, start_date, end_date, budget, actual_cost, progress, status')
          .eq('status', 'active');

        const predictions = projects?.map(project => {
          const totalDays = (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24);
          const daysElapsed = (Date.now() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24);
          const expectedProgress = (daysElapsed / totalDays) * 100;
          const actualProgress = project.progress || 0;

          // Predict completion date
          const progressRate = actualProgress / Math.max(1, daysElapsed);
          const remainingProgress = 100 - actualProgress;
          const daysToComplete = progressRate > 0 ? remainingProgress / progressRate : totalDays;
          const predictedEndDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);

          // Budget prediction
          const costRate = (project.actual_cost || 0) / Math.max(1, actualProgress);
          const predictedTotalCost = costRate * 100;

          return {
            project_id: project.id,
            name: project.name,
            expected_progress: Math.round(expectedProgress),
            actual_progress: actualProgress,
            schedule_variance: Math.round(actualProgress - expectedProgress),
            original_end_date: project.end_date,
            predicted_end_date: predictedEndDate.toISOString().slice(0, 10),
            days_variance: Math.round((predictedEndDate.getTime() - new Date(project.end_date).getTime()) / (1000 * 60 * 60 * 24)),
            budget: project.budget,
            predicted_cost: Math.round(predictedTotalCost),
            cost_variance: Math.round(predictedTotalCost - (project.budget || 0)),
            risk_level: actualProgress < expectedProgress - 20 ? 'high' :
                       actualProgress < expectedProgress - 10 ? 'medium' : 'low',
          };
        });

        return NextResponse.json({ predictions: predictions || [] });
      }

      if (action === 'resource_bottlenecks') {
        const { data: assignments } = await supabase
          .from('project_assignments')
          .select(`
            employee_id, hours_allocated,
            employee:employees(first_name, last_name, skills)
          `)
          .gte('end_date', new Date().toISOString());

        // Calculate utilization per employee
        const utilization: Record<string, { name: string; hours: number; skills: string[] }> = {};

        assignments?.forEach(a => {
          if (!utilization[a.employee_id]) {
            utilization[a.employee_id] = {
              name: `${(a.employee as any)?.first_name} ${(a.employee as any)?.last_name}`,
              hours: 0,
              skills: (a.employee as any)?.skills || [],
            };
          }
          utilization[a.employee_id].hours += a.hours_allocated || 0;
        });

        const bottlenecks = Object.entries(utilization)
          .filter(([_, data]) => data.hours > 160) // Over 100% utilization
          .map(([id, data]) => ({
            employee_id: id,
            name: data.name,
            allocated_hours: data.hours,
            utilization_percent: Math.round((data.hours / 160) * 100),
            skills: data.skills,
            overload_hours: data.hours - 160,
          }))
          .sort((a, b) => b.utilization_percent - a.utilization_percent);

        return NextResponse.json({ bottlenecks });
      }
    }

    if (targetModule === 'events') {
      if (action === 'attendance_prediction') {
        const { data: events } = await supabase
          .from('events')
          .select('id, name, event_date, capacity, tickets_sold, genres, venue_city')
          .eq('status', 'published')
          .gte('event_date', new Date().toISOString())
          .lte('event_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString());

        const predictions = events?.map(event => {
          const daysUntil = (new Date(event.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          const currentSellThrough = (event.tickets_sold || 0) / (event.capacity || 1);

          // Predict final attendance
          const expectedSellThrough = Math.min(1, currentSellThrough + (0.3 * (1 - currentSellThrough) * (daysUntil / 30)));
          const predictedAttendance = Math.round((event.capacity || 0) * expectedSellThrough);

          // No-show prediction (typically 5-15%)
          const noShowRate = 0.1;
          const predictedActualAttendance = Math.round(predictedAttendance * (1 - noShowRate));

          return {
            event_id: event.id,
            name: event.name,
            event_date: event.event_date,
            capacity: event.capacity,
            tickets_sold: event.tickets_sold,
            predicted_final_sales: predictedAttendance,
            predicted_attendance: predictedActualAttendance,
            predicted_no_shows: predictedAttendance - predictedActualAttendance,
            sell_through_prediction: Math.round(expectedSellThrough * 100),
          };
        });

        return NextResponse.json({ predictions: predictions || [] });
      }
    }

    return NextResponse.json({ error: 'Invalid module or action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}

function getRiskFactors(daysOpen: number, daysUntilClose: number, stage: string): string[] {
  const risks: string[] = [];

  if (daysOpen > 90) risks.push('Deal aging - open for over 90 days');
  if (daysUntilClose < 0) risks.push('Past expected close date');
  if (stage === 'lead' && daysOpen > 30) risks.push('Stuck in lead stage');
  if (daysUntilClose < 7 && stage !== 'negotiation') risks.push('Close date approaching but not in negotiation');

  return risks;
}
