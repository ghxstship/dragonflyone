import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const insurancePolicySchema = z.object({
  policy_number: z.string().min(1),
  provider: z.string().min(1),
  policy_type: z.enum(['property', 'liability', 'equipment', 'comprehensive', 'transit']),
  coverage_amount: z.number().positive(),
  deductible: z.number().min(0),
  premium_amount: z.number().positive(),
  premium_frequency: z.enum(['monthly', 'quarterly', 'annual']),
  effective_date: z.string().datetime(),
  expiration_date: z.string().datetime(),
  coverage_details: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
});

const assetCoverageSchema = z.object({
  asset_id: z.string().uuid(),
  policy_id: z.string().uuid(),
  coverage_amount: z.number().positive().optional(),
  notes: z.string().optional(),
});

const claimSchema = z.object({
  policy_id: z.string().uuid(),
  asset_id: z.string().uuid().optional(),
  claim_number: z.string().optional(),
  incident_date: z.string().datetime(),
  description: z.string().min(1),
  claim_amount: z.number().positive(),
  damage_type: z.enum(['theft', 'damage', 'loss', 'accident', 'natural_disaster', 'other']),
  incident_location: z.string().optional(),
  police_report_number: z.string().optional(),
  witnesses: z.array(z.string()).optional(),
  photos: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
  })).optional(),
});

// GET - Get insurance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'policies' | 'coverage' | 'claims' | 'expiring' | 'verification'
    const policyId = searchParams.get('policy_id');
    const assetId = searchParams.get('asset_id');

    if (type === 'policies') {
      // Get all insurance policies
      const { data: policies, error } = await supabase
        .from('insurance_policies')
        .select(`
          *,
          covered_assets:asset_insurance_coverage(
            asset_id,
            coverage_amount,
            asset:assets(id, name, asset_tag, category)
          ),
          claims:insurance_claims(id, status, claim_amount)
        `)
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      // Enrich with status
      const enrichedPolicies = policies?.map(policy => {
        const now = new Date();
        const expDate = new Date(policy.expiration_date);
        const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        let status = 'active';
        if (daysUntilExpiry < 0) status = 'expired';
        else if (daysUntilExpiry <= 30) status = 'expiring_soon';
        else if (daysUntilExpiry <= 60) status = 'renewal_due';

        const activeClaims = (policy.claims as any[])?.filter(c => c.status !== 'closed').length || 0;
        const totalClaimAmount = (policy.claims as any[])?.reduce((sum, c) => sum + c.claim_amount, 0) || 0;

        return {
          ...policy,
          status,
          days_until_expiry: daysUntilExpiry,
          covered_asset_count: (policy.covered_assets as any[])?.length || 0,
          active_claims: activeClaims,
          total_claim_amount: totalClaimAmount,
        };
      });

      return NextResponse.json({ policies: enrichedPolicies });
    }

    if (type === 'coverage') {
      // Get coverage for specific asset or all assets
      let query = supabase
        .from('asset_insurance_coverage')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, purchase_price, current_value),
          policy:insurance_policies(id, policy_number, provider, policy_type, expiration_date)
        `);

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data: coverage, error } = await query;

      if (error) throw error;

      // Check for coverage gaps
      const { data: allAssets } = await supabase
        .from('assets')
        .select('id, name, asset_tag, category, purchase_price')
        .gt('purchase_price', 1000); // Only check high-value assets

      const coveredAssetIds = new Set(coverage?.map(c => c.asset_id));
      const uncoveredAssets = allAssets?.filter(a => !coveredAssetIds.has(a.id)) || [];

      return NextResponse.json({
        coverage,
        uncovered_assets: uncoveredAssets,
        coverage_summary: {
          total_covered: coverage?.length || 0,
          total_uncovered: uncoveredAssets.length,
          uncovered_value: uncoveredAssets.reduce((sum, a) => sum + (a.purchase_price || 0), 0),
        },
      });
    }

    if (type === 'claims') {
      // Get insurance claims
      let query = supabase
        .from('insurance_claims')
        .select(`
          *,
          policy:insurance_policies(id, policy_number, provider),
          asset:assets(id, name, asset_tag)
        `)
        .order('incident_date', { ascending: false });

      if (policyId) {
        query = query.eq('policy_id', policyId);
      }
      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data: claims, error } = await query;

      if (error) throw error;

      // Calculate claim statistics
      const stats = {
        total_claims: claims?.length || 0,
        pending: claims?.filter(c => c.status === 'pending').length || 0,
        approved: claims?.filter(c => c.status === 'approved').length || 0,
        denied: claims?.filter(c => c.status === 'denied').length || 0,
        paid: claims?.filter(c => c.status === 'paid').length || 0,
        total_claimed: claims?.reduce((sum, c) => sum + c.claim_amount, 0) || 0,
        total_paid: claims?.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.paid_amount || 0), 0) || 0,
      };

      return NextResponse.json({ claims, statistics: stats });
    }

    if (type === 'expiring') {
      // Get policies expiring soon
      const daysAhead = parseInt(searchParams.get('days') || '60');
      const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      const { data: expiring, error } = await supabase
        .from('insurance_policies')
        .select(`
          *,
          covered_assets:asset_insurance_coverage(count)
        `)
        .lte('expiration_date', futureDate)
        .gte('expiration_date', new Date().toISOString())
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      const enriched = expiring?.map(policy => ({
        ...policy,
        days_until_expiry: Math.ceil((new Date(policy.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      }));

      return NextResponse.json({
        expiring_policies: enriched,
        total: expiring?.length || 0,
      });
    }

    if (type === 'verification' && assetId) {
      // Verify insurance coverage for a specific asset
      const { data: coverage, error } = await supabase
        .from('asset_insurance_coverage')
        .select(`
          *,
          policy:insurance_policies(*)
        `)
        .eq('asset_id', assetId);

      if (error) throw error;

      const { data: asset } = await supabase
        .from('assets')
        .select('id, name, purchase_price, current_value')
        .eq('id', assetId)
        .single();

      const activeCoverage = coverage?.filter(c => {
        const policy = c.policy as any;
        return policy && new Date(policy.expiration_date) > new Date();
      });

      const totalCoverage = activeCoverage?.reduce((sum, c) => sum + (c.coverage_amount || 0), 0) || 0;
      const assetValue = asset?.current_value || asset?.purchase_price || 0;
      const coverageRatio = assetValue > 0 ? (totalCoverage / assetValue) * 100 : 0;

      return NextResponse.json({
        asset,
        coverage: activeCoverage,
        verification: {
          is_covered: activeCoverage && activeCoverage.length > 0,
          total_coverage: totalCoverage,
          asset_value: assetValue,
          coverage_ratio: Math.round(coverageRatio * 100) / 100,
          is_adequately_covered: coverageRatio >= 80,
          recommendation: coverageRatio < 80 ? 'Consider increasing coverage' : 'Coverage adequate',
        },
      });
    }

    // Default: return summary
    const [policiesResult, claimsResult, expiringResult] = await Promise.all([
      supabase.from('insurance_policies').select('id, coverage_amount, premium_amount'),
      supabase.from('insurance_claims').select('id, status, claim_amount'),
      supabase.from('insurance_policies').select('id')
        .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .gte('expiration_date', new Date().toISOString()),
    ]);

    const totalCoverage = policiesResult.data?.reduce((sum, p) => sum + p.coverage_amount, 0) || 0;
    const totalPremiums = policiesResult.data?.reduce((sum, p) => sum + p.premium_amount, 0) || 0;
    const pendingClaims = claimsResult.data?.filter(c => c.status === 'pending').length || 0;

    return NextResponse.json({
      summary: {
        total_policies: policiesResult.data?.length || 0,
        total_coverage: totalCoverage,
        annual_premiums: totalPremiums,
        pending_claims: pendingClaims,
        expiring_soon: expiringResult.data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Asset insurance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create policy, coverage, or claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_policy') {
      const validated = insurancePolicySchema.parse(body.data);

      const { data: policy, error } = await supabase
        .from('insurance_policies')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ policy }, { status: 201 });
    }

    if (action === 'add_coverage') {
      const validated = assetCoverageSchema.parse(body.data);

      // Check if coverage already exists
      const { data: existing } = await supabase
        .from('asset_insurance_coverage')
        .select('id')
        .eq('asset_id', validated.asset_id)
        .eq('policy_id', validated.policy_id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Asset already covered by this policy' }, { status: 409 });
      }

      const { data: coverage, error } = await supabase
        .from('asset_insurance_coverage')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ coverage }, { status: 201 });
    }

    if (action === 'file_claim') {
      const validated = claimSchema.parse(body.data);

      const { data: claim, error } = await supabase
        .from('insurance_claims')
        .insert({
          ...validated,
          status: 'pending',
          filed_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset status if applicable
      if (validated.asset_id && ['theft', 'loss'].includes(validated.damage_type)) {
        await supabase
          .from('assets')
          .update({ 
            status: validated.damage_type === 'theft' ? 'stolen' : 'lost',
            updated_at: new Date().toISOString(),
          })
          .eq('id', validated.asset_id);
      }

      return NextResponse.json({ claim }, { status: 201 });
    }

    if (action === 'bulk_coverage') {
      // Add multiple assets to a policy
      const { policy_id, asset_ids, coverage_amount } = body.data;

      const coverageRecords = asset_ids.map((assetId: string) => ({
        policy_id,
        asset_id: assetId,
        coverage_amount,
        created_at: new Date().toISOString(),
      }));

      const { data: coverage, error } = await supabase
        .from('asset_insurance_coverage')
        .upsert(coverageRecords, { onConflict: 'asset_id,policy_id' })
        .select();

      if (error) throw error;

      return NextResponse.json({ coverage, count: coverage?.length }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Asset insurance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update policy or claim
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'policy') {
      const { data: policy, error } = await supabase
        .from('insurance_policies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ policy });
    }

    if (type === 'claim') {
      const { data: claim, error } = await supabase
        .from('insurance_claims')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ claim });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Asset insurance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove coverage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coverageId = searchParams.get('coverage_id');

    if (!coverageId) {
      return NextResponse.json({ error: 'coverage_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('asset_insurance_coverage')
      .delete()
      .eq('id', coverageId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Asset insurance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
