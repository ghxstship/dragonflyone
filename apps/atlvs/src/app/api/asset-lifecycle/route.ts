import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const replacementPlanSchema = z.object({
  asset_id: z.string().uuid(),
  planned_replacement_date: z.string().datetime(),
  replacement_reason: z.enum(['end_of_life', 'obsolete', 'upgrade', 'damage', 'capacity', 'cost_efficiency']),
  estimated_replacement_cost: z.number().positive(),
  replacement_asset_specs: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  budget_approved: z.boolean().default(false),
  notes: z.string().optional(),
});

const retirementSchema = z.object({
  asset_id: z.string().uuid(),
  retirement_date: z.string().datetime(),
  retirement_reason: z.enum(['end_of_life', 'obsolete', 'damaged_beyond_repair', 'sold', 'donated', 'scrapped', 'lost', 'stolen']),
  disposal_method: z.enum(['sale', 'donation', 'recycling', 'scrap', 'trade_in', 'internal_transfer', 'write_off']).optional(),
  disposal_value: z.number().min(0).optional(),
  disposal_recipient: z.string().optional(),
  documentation: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
  })).optional(),
  notes: z.string().optional(),
});

const transferSchema = z.object({
  asset_id: z.string().uuid(),
  from_project_id: z.string().uuid().optional(),
  to_project_id: z.string().uuid(),
  transfer_date: z.string().datetime(),
  reason: z.string().optional(),
  approved_by: z.string().uuid().optional(),
});

// GET - Get lifecycle data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'replacement_plans' | 'retirements' | 'transfers' | 'lifecycle_analysis' | 'end_of_life'
    const assetId = searchParams.get('asset_id');

    if (type === 'replacement_plans') {
      // Get replacement plans
      let query = supabase
        .from('asset_replacement_plans')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, purchase_date, purchase_price, current_value)
        `)
        .order('planned_replacement_date', { ascending: true });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data: plans, error } = await query;

      if (error) throw error;

      // Enrich with urgency
      const enrichedPlans = plans?.map(plan => {
        const daysUntil = Math.ceil((new Date(plan.planned_replacement_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return {
          ...plan,
          days_until_replacement: daysUntil,
          urgency: daysUntil < 0 ? 'overdue' : daysUntil < 30 ? 'urgent' : daysUntil < 90 ? 'upcoming' : 'planned',
        };
      });

      const totalBudget = enrichedPlans?.reduce((sum, p) => sum + p.estimated_replacement_cost, 0) || 0;
      const approvedBudget = enrichedPlans?.filter(p => p.budget_approved).reduce((sum, p) => sum + p.estimated_replacement_cost, 0) || 0;

      return NextResponse.json({
        plans: enrichedPlans,
        summary: {
          total_plans: enrichedPlans?.length || 0,
          overdue: enrichedPlans?.filter(p => p.urgency === 'overdue').length || 0,
          urgent: enrichedPlans?.filter(p => p.urgency === 'urgent').length || 0,
          total_budget_needed: totalBudget,
          approved_budget: approvedBudget,
          pending_approval: totalBudget - approvedBudget,
        },
      });
    }

    if (type === 'retirements') {
      // Get retired assets
      const { data: retirements, error } = await supabase
        .from('asset_retirements')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, purchase_price)
        `)
        .order('retirement_date', { ascending: false });

      if (error) throw error;

      // Calculate disposal value summary
      const totalDisposalValue = retirements?.reduce((sum, r) => sum + (r.disposal_value || 0), 0) || 0;
      const byMethod = retirements?.reduce((acc: Record<string, { count: number; value: number }>, r) => {
        const method = r.disposal_method || 'unknown';
        if (!acc[method]) acc[method] = { count: 0, value: 0 };
        acc[method].count++;
        acc[method].value += r.disposal_value || 0;
        return acc;
      }, {});

      return NextResponse.json({
        retirements,
        summary: {
          total_retired: retirements?.length || 0,
          total_disposal_value: totalDisposalValue,
          by_disposal_method: byMethod,
        },
      });
    }

    if (type === 'transfers') {
      // Get asset transfers
      let query = supabase
        .from('asset_transfers')
        .select(`
          *,
          asset:assets(id, name, asset_tag),
          from_project:projects!from_project_id(id, name),
          to_project:projects!to_project_id(id, name),
          approver:platform_users!approved_by(id, first_name, last_name)
        `)
        .order('transfer_date', { ascending: false });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data: transfers, error } = await query;

      if (error) throw error;

      return NextResponse.json({ transfers });
    }

    if (type === 'lifecycle_analysis') {
      // Get comprehensive lifecycle analysis
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_tag,
          category,
          purchase_date,
          purchase_price,
          current_value,
          expected_lifespan_years,
          status,
          maintenance:maintenance_records(total_cost),
          checkouts:asset_checkouts(id)
        `);

      if (error) throw error;

      const analysis = assets?.map(asset => {
        const purchaseDate = new Date(asset.purchase_date);
        const ageYears = (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        const expectedLifespan = asset.expected_lifespan_years || 5;
        const remainingLife = expectedLifespan - ageYears;
        const lifespanPercentage = (ageYears / expectedLifespan) * 100;

        const maintenanceRecords = (asset.maintenance as any[]) || [];
        const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (m.total_cost || 0), 0);
        
        const totalCostOfOwnership = (asset.purchase_price || 0) + totalMaintenanceCost;
        const annualCost = ageYears > 0 ? totalCostOfOwnership / ageYears : totalCostOfOwnership;

        const checkoutCount = (asset.checkouts as any[])?.length || 0;

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_tag: asset.asset_tag,
          category: asset.category,
          status: asset.status,
          purchase_price: asset.purchase_price,
          current_value: asset.current_value,
          age_years: Math.round(ageYears * 10) / 10,
          expected_lifespan: expectedLifespan,
          remaining_life_years: Math.round(remainingLife * 10) / 10,
          lifespan_percentage: Math.round(lifespanPercentage),
          total_maintenance_cost: totalMaintenanceCost,
          total_cost_of_ownership: totalCostOfOwnership,
          annual_cost: Math.round(annualCost * 100) / 100,
          usage_count: checkoutCount,
          lifecycle_stage: getLifecycleStage(lifespanPercentage),
          recommendation: getLifecycleRecommendation(lifespanPercentage, remainingLife, totalMaintenanceCost, asset.purchase_price),
        };
      });

      // Sort by remaining life
      analysis?.sort((a, b) => a.remaining_life_years - b.remaining_life_years);

      return NextResponse.json({
        analysis,
        summary: {
          total_assets: analysis?.length || 0,
          end_of_life: analysis?.filter(a => a.lifecycle_stage === 'end_of_life').length || 0,
          aging: analysis?.filter(a => a.lifecycle_stage === 'aging').length || 0,
          mature: analysis?.filter(a => a.lifecycle_stage === 'mature').length || 0,
          new: analysis?.filter(a => a.lifecycle_stage === 'new').length || 0,
        },
      });
    }

    if (type === 'end_of_life') {
      // Get assets approaching end of life
      const { data: assets, error } = await supabase
        .from('assets')
        .select('id, name, asset_tag, category, purchase_date, purchase_price, current_value, expected_lifespan_years, status')
        .not('status', 'in', '("retired", "disposed")');

      if (error) throw error;

      const endOfLifeAssets = assets?.filter(asset => {
        const purchaseDate = new Date(asset.purchase_date);
        const ageYears = (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        const expectedLifespan = asset.expected_lifespan_years || 5;
        const remainingLife = expectedLifespan - ageYears;
        return remainingLife <= 1; // Within 1 year of end of life
      }).map(asset => {
        const purchaseDate = new Date(asset.purchase_date);
        const ageYears = (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        const expectedLifespan = asset.expected_lifespan_years || 5;
        const remainingLife = expectedLifespan - ageYears;
        
        return {
          ...asset,
          age_years: Math.round(ageYears * 10) / 10,
          remaining_life_months: Math.round(remainingLife * 12),
          urgency: remainingLife <= 0 ? 'past_due' : remainingLife <= 0.5 ? 'critical' : 'approaching',
        };
      });

      endOfLifeAssets?.sort((a, b) => a.remaining_life_months - b.remaining_life_months);

      const totalReplacementValue = endOfLifeAssets?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0;

      return NextResponse.json({
        assets: endOfLifeAssets,
        summary: {
          total: endOfLifeAssets?.length || 0,
          past_due: endOfLifeAssets?.filter(a => a.urgency === 'past_due').length || 0,
          critical: endOfLifeAssets?.filter(a => a.urgency === 'critical').length || 0,
          approaching: endOfLifeAssets?.filter(a => a.urgency === 'approaching').length || 0,
          estimated_replacement_budget: totalReplacementValue,
        },
      });
    }

    // Default: return summary
    const [assetsResult, plansResult, retirementsResult] = await Promise.all([
      supabase.from('assets').select('id, status'),
      supabase.from('asset_replacement_plans').select('id, budget_approved, estimated_replacement_cost'),
      supabase.from('asset_retirements').select('id, disposal_value').gte('retirement_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    return NextResponse.json({
      summary: {
        total_assets: assetsResult.data?.length || 0,
        active_replacement_plans: plansResult.data?.length || 0,
        pending_budget_approval: plansResult.data?.filter(p => !p.budget_approved).length || 0,
        retirements_this_year: retirementsResult.data?.length || 0,
        disposal_value_this_year: retirementsResult.data?.reduce((sum, r) => sum + (r.disposal_value || 0), 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Asset lifecycle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create replacement plan, retirement, or transfer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_replacement_plan') {
      const validated = replacementPlanSchema.parse(body.data);

      const { data: plan, error } = await supabase
        .from('asset_replacement_plans')
        .insert({
          ...validated,
          status: 'planned',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ plan }, { status: 201 });
    }

    if (action === 'retire_asset') {
      const validated = retirementSchema.parse(body.data);

      // Create retirement record
      const { data: retirement, error } = await supabase
        .from('asset_retirements')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset status
      await supabase
        .from('assets')
        .update({
          status: 'retired',
          retired_date: validated.retirement_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.asset_id);

      return NextResponse.json({ retirement }, { status: 201 });
    }

    if (action === 'transfer_asset') {
      const validated = transferSchema.parse(body.data);

      const { data: transfer, error } = await supabase
        .from('asset_transfers')
        .insert({
          ...validated,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset's current project
      await supabase
        .from('assets')
        .update({
          current_project_id: validated.to_project_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.asset_id);

      return NextResponse.json({ transfer }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Asset lifecycle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update replacement plan
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'replacement_plan') {
      const { data: plan, error } = await supabase
        .from('asset_replacement_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ plan });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Asset lifecycle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel replacement plan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('plan_id');

    if (!planId) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('asset_replacement_plans')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', planId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Asset lifecycle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper functions
function getLifecycleStage(lifespanPercentage: number): string {
  if (lifespanPercentage >= 100) return 'end_of_life';
  if (lifespanPercentage >= 75) return 'aging';
  if (lifespanPercentage >= 25) return 'mature';
  return 'new';
}

function getLifecycleRecommendation(
  lifespanPercentage: number, 
  remainingLife: number, 
  maintenanceCost: number, 
  purchasePrice: number | null
): string {
  if (remainingLife <= 0) return 'Immediate replacement recommended';
  if (remainingLife <= 0.5) return 'Plan replacement within 6 months';
  if (remainingLife <= 1) return 'Begin replacement planning';
  
  const maintenanceRatio = purchasePrice ? maintenanceCost / purchasePrice : 0;
  if (maintenanceRatio > 0.5) return 'High maintenance cost - consider early replacement';
  
  if (lifespanPercentage >= 75) return 'Monitor closely - approaching end of life';
  if (lifespanPercentage >= 50) return 'Schedule preventive maintenance';
  
  return 'Asset in good lifecycle position';
}
