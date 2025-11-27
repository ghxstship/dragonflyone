import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const testSchema = z.object({
  name: z.string().min(1),
  test_type: z.enum(['landing_page', 'pricing', 'checkout', 'email', 'cta']),
  event_id: z.string().uuid().optional(),
  variants: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(100),
    config: z.record(z.any()),
  })),
  goal: z.enum(['conversion', 'revenue', 'engagement', 'clicks']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('test_id');
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'results' && testId) {
      const { data: test } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      const { data: impressions } = await supabase
        .from('ab_test_impressions')
        .select('variant_id')
        .eq('test_id', testId);

      const { data: conversions } = await supabase
        .from('ab_test_conversions')
        .select('variant_id, revenue')
        .eq('test_id', testId);

      // Calculate stats per variant
      const variantStats = test?.variants?.map((variant: any) => {
        const variantImpressions = impressions?.filter(i => i.variant_id === variant.id).length || 0;
        const variantConversions = conversions?.filter(c => c.variant_id === variant.id) || [];
        const conversionCount = variantConversions.length;
        const totalRevenue = variantConversions.reduce((sum, c) => sum + (c.revenue || 0), 0);

        return {
          variant_id: variant.id,
          variant_name: variant.name,
          impressions: variantImpressions,
          conversions: conversionCount,
          conversion_rate: variantImpressions > 0 ? (conversionCount / variantImpressions * 100).toFixed(2) : 0,
          total_revenue: totalRevenue,
          avg_revenue_per_conversion: conversionCount > 0 ? (totalRevenue / conversionCount).toFixed(2) : 0,
        };
      });

      // Determine winner
      const winner = variantStats?.reduce((best: any, current: any) => {
        if (!best) return current;
        return parseFloat(current.conversion_rate) > parseFloat(best.conversion_rate) ? current : best;
      }, null);

      return NextResponse.json({
        test,
        results: variantStats,
        winner,
        statistical_significance: calculateSignificance(variantStats),
      });
    }

    if (type === 'assign') {
      const userId = searchParams.get('user_id');

      // Get active tests
      const { data: tests } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('status', 'active')
        .or(`event_id.is.null,event_id.eq.${eventId}`);

      const assignments: Record<string, any> = {};

      for (const test of tests || []) {
        // Check existing assignment
        const { data: existing } = await supabase
          .from('ab_test_assignments')
          .select('variant_id')
          .eq('test_id', test.id)
          .eq('user_id', userId)
          .single();

        if (existing) {
          const variant = test.variants.find((v: any) => v.id === existing.variant_id);
          assignments[test.id] = { test_id: test.id, variant };
        } else {
          // Assign based on weights
          const variant = selectVariant(test.variants);
          await supabase.from('ab_test_assignments').insert({
            test_id: test.id,
            user_id: userId,
            variant_id: variant.id,
            assigned_at: new Date().toISOString(),
          });
          assignments[test.id] = { test_id: test.id, variant };
        }
      }

      return NextResponse.json({ assignments });
    }

    let query = supabase.from('ab_tests').select('*').order('created_at', { ascending: false });
    if (eventId) query = query.eq('event_id', eventId);

    const { data: tests, error } = await query;
    if (error) throw error;

    return NextResponse.json({ tests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      const validated = testSchema.parse(body.data);

      // Add IDs to variants
      const variants = validated.variants.map((v, i) => ({
        ...v,
        id: `variant_${i}`,
      }));

      const { data: test, error } = await supabase
        .from('ab_tests')
        .insert({
          ...validated,
          variants,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ test }, { status: 201 });
    }

    if (action === 'record_impression') {
      const { test_id, variant_id, user_id } = body.data;

      const { data, error } = await supabase
        .from('ab_test_impressions')
        .insert({
          test_id,
          variant_id,
          user_id,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ impression: data }, { status: 201 });
    }

    if (action === 'record_conversion') {
      const { test_id, variant_id, user_id, revenue } = body.data;

      const { data, error } = await supabase
        .from('ab_test_conversions')
        .insert({
          test_id,
          variant_id,
          user_id,
          revenue,
          converted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ conversion: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action } = body;

    if (action === 'start') {
      const { data, error } = await supabase
        .from('ab_tests')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ test: data });
    }

    if (action === 'stop') {
      const { data, error } = await supabase
        .from('ab_tests')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ test: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function selectVariant(variants: any[]): any {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }

  return variants[0];
}

function calculateSignificance(stats: any[]): string {
  if (!stats || stats.length < 2) return 'insufficient_data';

  const sorted = [...stats].sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate));
  const best = sorted[0];
  const second = sorted[1];

  if (best.impressions < 100 || second.impressions < 100) return 'insufficient_data';

  const diff = parseFloat(best.conversion_rate) - parseFloat(second.conversion_rate);
  if (diff > 5) return 'high';
  if (diff > 2) return 'moderate';
  return 'low';
}
