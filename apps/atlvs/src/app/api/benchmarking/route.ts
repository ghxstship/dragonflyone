import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const BenchmarkSchema = z.object({
  name: z.string(),
  category: z.enum(['financial', 'operational', 'workforce', 'sales', 'customer', 'asset']),
  metric_name: z.string(),
  industry: z.string(),
  region: z.string().optional(),
  company_size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  benchmark_value: z.number(),
  unit: z.string(),
  percentile_25: z.number().optional(),
  percentile_50: z.number().optional(),
  percentile_75: z.number().optional(),
  percentile_90: z.number().optional(),
  source: z.string().optional(),
  effective_date: z.string(),
  notes: z.string().optional(),
});

// GET /api/benchmarking - Get benchmarks and comparisons
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');
    const metricName = searchParams.get('metric_name');
    const compareToOrg = searchParams.get('compare_to_org') === 'true';

    // Get benchmarks
    let query = supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (metricName) {
      query = query.eq('metric_name', metricName);
    }

    const { data: benchmarks, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get organization metrics for comparison if requested
    let orgMetrics: Record<string, number> | null = null;
    let comparisons: any[] | null = null;

    if (compareToOrg) {
      // Calculate organization's current metrics
      orgMetrics = await calculateOrgMetrics();

      // Compare to benchmarks
      comparisons = benchmarks?.map(benchmark => {
        const orgValue = orgMetrics?.[benchmark.metric_name];
        if (orgValue === undefined) {
          return {
            benchmark,
            org_value: null,
            comparison: 'no_data',
          };
        }

        let percentile = 'below_25';
        if (benchmark.percentile_90 && orgValue >= benchmark.percentile_90) {
          percentile = 'top_10';
        } else if (benchmark.percentile_75 && orgValue >= benchmark.percentile_75) {
          percentile = 'top_25';
        } else if (benchmark.percentile_50 && orgValue >= benchmark.percentile_50) {
          percentile = 'above_median';
        } else if (benchmark.percentile_25 && orgValue >= benchmark.percentile_25) {
          percentile = 'below_median';
        }

        const variance = benchmark.benchmark_value !== 0 
          ? ((orgValue - benchmark.benchmark_value) / benchmark.benchmark_value * 100).toFixed(2)
          : 0;

        return {
          benchmark,
          org_value: orgValue,
          percentile,
          variance_percent: variance,
          is_above_benchmark: orgValue >= benchmark.benchmark_value,
        };
      });
    }

    // Get available industries and categories
    const { data: industries } = await supabase
      .from('industry_benchmarks')
      .select('industry')
      .eq('is_active', true);

    const uniqueIndustries = [...new Set(industries?.map(i => i.industry))];

    const categories = ['financial', 'operational', 'workforce', 'sales', 'customer', 'asset'];

    return NextResponse.json({
      benchmarks: benchmarks || [],
      comparisons,
      org_metrics: orgMetrics,
      filters: {
        industries: uniqueIndustries,
        categories,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch benchmarks' }, { status: 500 });
  }
}

// POST /api/benchmarking - Create benchmark or run analysis
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_benchmark';

    if (action === 'create_benchmark') {
      const validated = BenchmarkSchema.parse(body);

      const { data: benchmark, error } = await supabase
        .from('industry_benchmarks')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ benchmark }, { status: 201 });
    } else if (action === 'run_analysis') {
      const { metrics, industry, period } = body;

      // Get relevant benchmarks
      const { data: benchmarks } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry', industry)
        .eq('is_active', true)
        .in('metric_name', metrics);

      // Calculate org metrics
      const orgMetrics = await calculateOrgMetrics(period);

      // Generate analysis
      const analysis = {
        period,
        industry,
        metrics_analyzed: metrics.length,
        results: benchmarks?.map(b => {
          const orgValue = orgMetrics?.[b.metric_name];
          const variance = b.benchmark_value !== 0 && orgValue !== undefined
            ? ((orgValue - b.benchmark_value) / b.benchmark_value * 100)
            : null;

          return {
            metric: b.metric_name,
            category: b.category,
            benchmark_value: b.benchmark_value,
            org_value: orgValue,
            variance_percent: variance?.toFixed(2),
            status: orgValue === undefined ? 'no_data' 
              : orgValue >= b.benchmark_value ? 'above' : 'below',
            recommendations: generateRecommendations(b.metric_name, orgValue, b.benchmark_value),
          };
        }),
        summary: {
          above_benchmark: 0,
          below_benchmark: 0,
          no_data: 0,
        },
      };

      // Calculate summary
      analysis.results?.forEach(r => {
        if (r.status === 'above') analysis.summary.above_benchmark++;
        else if (r.status === 'below') analysis.summary.below_benchmark++;
        else analysis.summary.no_data++;
      });

      // Save analysis
      await supabase.from('benchmark_analyses').insert({
        user_id: user.id,
        industry,
        period,
        results: analysis,
      });

      return NextResponse.json({ analysis });
    } else if (action === 'get_recommendations') {
      const { category } = body;

      // Get benchmarks where org is below
      const orgMetrics = await calculateOrgMetrics();
      
      const { data: benchmarks } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

      const recommendations = benchmarks?.filter(b => {
        const orgValue = orgMetrics?.[b.metric_name];
        return orgValue !== undefined && orgValue < b.benchmark_value;
      }).map(b => ({
        metric: b.metric_name,
        current_value: orgMetrics?.[b.metric_name],
        benchmark_value: b.benchmark_value,
        gap: b.benchmark_value - (orgMetrics?.[b.metric_name] || 0),
        improvement_needed_percent: ((b.benchmark_value - (orgMetrics?.[b.metric_name] || 0)) / b.benchmark_value * 100).toFixed(2),
        recommendations: generateRecommendations(b.metric_name, orgMetrics?.[b.metric_name], b.benchmark_value),
      }));

      return NextResponse.json({
        category,
        recommendations: recommendations || [],
        total_gaps: recommendations?.length || 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to calculate organization metrics
async function calculateOrgMetrics(period?: string): Promise<Record<string, number>> {
  const metrics: Record<string, number> = {};

  // Financial metrics
  const { data: revenue } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('status', 'paid');
  
  const totalRevenue = revenue?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('status', 'approved');
  
  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  metrics['gross_margin'] = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0;
  metrics['revenue_per_employee'] = 0; // Would calculate from employee count

  // Operational metrics
  const { data: projects } = await supabase
    .from('projects')
    .select('status, budget, actual_cost');

  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const onBudgetProjects = completedProjects.filter(p => (p.actual_cost || 0) <= (p.budget || 0));
  
  metrics['project_on_budget_rate'] = completedProjects.length > 0 
    ? (onBudgetProjects.length / completedProjects.length * 100) : 0;

  // Customer metrics
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, value');

  const wonDeals = deals?.filter(d => d.stage === 'closed_won') || [];
  const lostDeals = deals?.filter(d => d.stage === 'closed_lost') || [];
  
  metrics['win_rate'] = (wonDeals.length + lostDeals.length) > 0 
    ? (wonDeals.length / (wonDeals.length + lostDeals.length) * 100) : 0;

  metrics['average_deal_size'] = wonDeals.length > 0 
    ? wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length : 0;

  // Asset metrics
  const { data: assets } = await supabase
    .from('assets')
    .select('status, purchase_price');

  const activeAssets = assets?.filter(a => a.status === 'active') || [];
  metrics['asset_utilization'] = assets?.length ? (activeAssets.length / assets.length * 100) : 0;

  return metrics;
}

// Helper function to generate recommendations
function generateRecommendations(metricName: string, orgValue: number | undefined, benchmarkValue: number): string[] {
  const recommendations: string[] = [];

  if (orgValue === undefined) {
    recommendations.push('Start tracking this metric to enable benchmarking');
    return recommendations;
  }

  const gap = benchmarkValue - orgValue;
  const gapPercent = (gap / benchmarkValue * 100);

  switch (metricName) {
    case 'gross_margin':
      if (gapPercent > 10) {
        recommendations.push('Review pricing strategy to improve margins');
        recommendations.push('Analyze cost structure for optimization opportunities');
        recommendations.push('Consider renegotiating vendor contracts');
      } else {
        recommendations.push('Fine-tune pricing on high-volume products/services');
      }
      break;
    case 'win_rate':
      if (gapPercent > 15) {
        recommendations.push('Implement sales training programs');
        recommendations.push('Review qualification criteria for leads');
        recommendations.push('Analyze lost deals for common patterns');
      } else {
        recommendations.push('Focus on improving proposal quality');
      }
      break;
    case 'project_on_budget_rate':
      if (gapPercent > 10) {
        recommendations.push('Improve project estimation processes');
        recommendations.push('Implement more frequent budget reviews');
        recommendations.push('Add contingency buffers to project budgets');
      }
      break;
    case 'asset_utilization':
      if (gapPercent > 20) {
        recommendations.push('Review asset allocation processes');
        recommendations.push('Consider disposing of underutilized assets');
        recommendations.push('Implement asset sharing across departments');
      }
      break;
    default:
      recommendations.push(`Improve ${metricName} by ${gapPercent.toFixed(1)}% to meet industry benchmark`);
  }

  return recommendations;
}
