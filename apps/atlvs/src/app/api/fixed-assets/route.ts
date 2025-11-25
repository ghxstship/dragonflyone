import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const fixedAssetSchema = z.object({
  name: z.string().min(1),
  asset_number: z.string().optional(),
  category: z.enum(['land', 'buildings', 'equipment', 'vehicles', 'furniture', 'computers', 'leasehold_improvements', 'intangible']),
  description: z.string().optional(),
  acquisition_date: z.string().datetime(),
  acquisition_cost: z.number().positive(),
  useful_life_years: z.number().positive(),
  salvage_value: z.number().min(0).default(0),
  depreciation_method: z.enum(['straight_line', 'declining_balance', 'sum_of_years', 'units_of_production']),
  depreciation_rate: z.number().optional(),
  location: z.string().optional(),
  department_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  serial_number: z.string().optional(),
  warranty_expiration: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const disposalSchema = z.object({
  asset_id: z.string().uuid(),
  disposal_date: z.string().datetime(),
  disposal_method: z.enum(['sale', 'trade_in', 'scrap', 'donation', 'theft', 'write_off']),
  disposal_amount: z.number().min(0),
  disposal_reason: z.string().optional(),
  buyer_info: z.string().optional(),
});

// GET - Get fixed asset data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'assets' | 'depreciation' | 'schedule' | 'register' | 'disposed'
    const category = searchParams.get('category');
    const assetId = searchParams.get('asset_id');

    if (type === 'assets') {
      let query = supabase
        .from('fixed_assets')
        .select(`
          *,
          department:departments(id, name),
          vendor:vendors(id, name)
        `)
        .eq('status', 'active')
        .order('acquisition_date', { ascending: false });

      if (category) query = query.eq('category', category);

      const { data: assets, error } = await query;

      if (error) throw error;

      // Calculate current values
      const enrichedAssets = assets?.map(asset => {
        const depreciation = calculateDepreciation(asset);
        return {
          ...asset,
          accumulated_depreciation: depreciation.accumulated,
          current_book_value: depreciation.bookValue,
          monthly_depreciation: depreciation.monthly,
          remaining_life_months: depreciation.remainingMonths,
        };
      });

      // Group by category
      const byCategory = enrichedAssets?.reduce((acc: Record<string, { count: number; cost: number; bookValue: number }>, a) => {
        if (!acc[a.category]) acc[a.category] = { count: 0, cost: 0, bookValue: 0 };
        acc[a.category].count++;
        acc[a.category].cost += a.acquisition_cost;
        acc[a.category].bookValue += a.current_book_value;
        return acc;
      }, {});

      return NextResponse.json({
        assets: enrichedAssets,
        by_category: byCategory,
        totals: {
          total_cost: enrichedAssets?.reduce((sum, a) => sum + a.acquisition_cost, 0) || 0,
          total_book_value: enrichedAssets?.reduce((sum, a) => sum + a.current_book_value, 0) || 0,
          total_accumulated_depreciation: enrichedAssets?.reduce((sum, a) => sum + a.accumulated_depreciation, 0) || 0,
        },
      });
    }

    if (type === 'depreciation' && assetId) {
      // Get depreciation history for an asset
      const { data: asset } = await supabase
        .from('fixed_assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      const { data: entries, error } = await supabase
        .from('depreciation_entries')
        .select('*')
        .eq('asset_id', assetId)
        .order('period_end', { ascending: false });

      if (error) throw error;

      const depreciation = calculateDepreciation(asset);

      return NextResponse.json({
        asset,
        entries,
        current_status: {
          accumulated_depreciation: depreciation.accumulated,
          current_book_value: depreciation.bookValue,
          monthly_depreciation: depreciation.monthly,
          remaining_life_months: depreciation.remainingMonths,
          fully_depreciated: depreciation.bookValue <= asset.salvage_value,
        },
      });
    }

    if (type === 'schedule') {
      // Get depreciation schedule for all assets
      const period = searchParams.get('period') || new Date().toISOString().substring(0, 7);

      const { data: assets, error } = await supabase
        .from('fixed_assets')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const schedule = assets?.map(asset => {
        const depreciation = calculateDepreciation(asset);
        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_number: asset.asset_number,
          category: asset.category,
          acquisition_cost: asset.acquisition_cost,
          accumulated_depreciation: depreciation.accumulated,
          book_value: depreciation.bookValue,
          period_depreciation: depreciation.monthly,
          fully_depreciated: depreciation.bookValue <= asset.salvage_value,
        };
      });

      const totalPeriodDepreciation = schedule?.filter(s => !s.fully_depreciated).reduce((sum, s) => sum + s.period_depreciation, 0) || 0;

      return NextResponse.json({
        period,
        schedule,
        total_period_depreciation: totalPeriodDepreciation,
        total_book_value: schedule?.reduce((sum, s) => sum + s.book_value, 0) || 0,
      });
    }

    if (type === 'register') {
      // Get fixed asset register (comprehensive list)
      const { data: assets, error } = await supabase
        .from('fixed_assets')
        .select(`
          *,
          department:departments(id, name),
          disposals:asset_disposals(disposal_date, disposal_amount, disposal_method)
        `)
        .order('asset_number', { ascending: true });

      if (error) throw error;

      const register = assets?.map(asset => {
        const depreciation = calculateDepreciation(asset);
        const disposal = (asset.disposals as any[])?.[0];
        
        return {
          asset_number: asset.asset_number,
          name: asset.name,
          category: asset.category,
          acquisition_date: asset.acquisition_date,
          acquisition_cost: asset.acquisition_cost,
          useful_life_years: asset.useful_life_years,
          salvage_value: asset.salvage_value,
          depreciation_method: asset.depreciation_method,
          accumulated_depreciation: depreciation.accumulated,
          book_value: depreciation.bookValue,
          status: asset.status,
          disposal_date: disposal?.disposal_date,
          disposal_amount: disposal?.disposal_amount,
          gain_loss: disposal ? disposal.disposal_amount - depreciation.bookValue : null,
        };
      });

      return NextResponse.json({ register });
    }

    if (type === 'disposed') {
      // Get disposed assets
      const { data: disposals, error } = await supabase
        .from('asset_disposals')
        .select(`
          *,
          asset:fixed_assets(id, name, asset_number, category, acquisition_cost)
        `)
        .order('disposal_date', { ascending: false });

      if (error) throw error;

      const totalProceeds = disposals?.reduce((sum, d) => sum + d.disposal_amount, 0) || 0;
      const totalGainLoss = disposals?.reduce((sum, d) => sum + (d.gain_loss || 0), 0) || 0;

      return NextResponse.json({
        disposals,
        summary: {
          total_disposed: disposals?.length || 0,
          total_proceeds: totalProceeds,
          net_gain_loss: totalGainLoss,
        },
      });
    }

    // Default: return summary
    const { data: assets } = await supabase
      .from('fixed_assets')
      .select('acquisition_cost, status, category');

    const activeAssets = assets?.filter(a => a.status === 'active') || [];
    const totalCost = activeAssets.reduce((sum, a) => sum + a.acquisition_cost, 0);

    return NextResponse.json({
      summary: {
        total_assets: activeAssets.length,
        total_acquisition_cost: totalCost,
        categories: [...new Set(activeAssets.map(a => a.category))].length,
      },
    });
  } catch (error: any) {
    console.error('Fixed assets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create asset, record depreciation, or dispose
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_asset') {
      const validated = fixedAssetSchema.parse(body.data);

      // Generate asset number if not provided
      let assetNumber = validated.asset_number;
      if (!assetNumber) {
        const { count } = await supabase.from('fixed_assets').select('*', { count: 'exact', head: true });
        assetNumber = `FA-${String((count || 0) + 1).padStart(6, '0')}`;
      }

      const { data: asset, error } = await supabase
        .from('fixed_assets')
        .insert({
          ...validated,
          asset_number: assetNumber,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial ledger entry
      await supabase.from('ledger_entries').insert({
        entry_date: validated.acquisition_date,
        description: `Fixed asset acquisition - ${validated.name}`,
        debit: validated.acquisition_cost,
        credit: 0,
        account_type: 'asset',
        reference_type: 'fixed_asset',
        reference_id: asset.id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ asset }, { status: 201 });
    }

    if (action === 'record_depreciation') {
      // Record monthly depreciation for all assets
      const period = body.data.period || new Date().toISOString().substring(0, 7);
      const periodStart = `${period}-01`;
      const periodEnd = new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]), 0).toISOString().split('T')[0];

      // Check if depreciation already recorded for this period
      const { data: existing } = await supabase
        .from('depreciation_entries')
        .select('id')
        .eq('period_start', periodStart)
        .limit(1);

      if (existing?.length) {
        return NextResponse.json({ error: 'Depreciation already recorded for this period' }, { status: 409 });
      }

      const { data: assets } = await supabase
        .from('fixed_assets')
        .select('*')
        .eq('status', 'active');

      const entries = [];
      let totalDepreciation = 0;

      for (const asset of assets || []) {
        const depreciation = calculateDepreciation(asset);
        
        if (depreciation.bookValue > asset.salvage_value) {
          const monthlyAmount = Math.min(depreciation.monthly, depreciation.bookValue - asset.salvage_value);
          
          entries.push({
            asset_id: asset.id,
            period_start: periodStart,
            period_end: periodEnd,
            depreciation_amount: monthlyAmount,
            accumulated_after: depreciation.accumulated + monthlyAmount,
            book_value_after: depreciation.bookValue - monthlyAmount,
            created_at: new Date().toISOString(),
          });

          totalDepreciation += monthlyAmount;
        }
      }

      if (entries.length) {
        await supabase.from('depreciation_entries').insert(entries);

        // Create summary ledger entry
        await supabase.from('ledger_entries').insert({
          entry_date: periodEnd,
          description: `Monthly depreciation - ${period}`,
          debit: totalDepreciation,
          credit: 0,
          account_type: 'expense',
          reference_type: 'depreciation',
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        period,
        assets_depreciated: entries.length,
        total_depreciation: totalDepreciation,
      }, { status: 201 });
    }

    if (action === 'dispose_asset') {
      const validated = disposalSchema.parse(body.data);

      // Get asset details
      const { data: asset } = await supabase
        .from('fixed_assets')
        .select('*')
        .eq('id', validated.asset_id)
        .single();

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      const depreciation = calculateDepreciation(asset);
      const gainLoss = validated.disposal_amount - depreciation.bookValue;

      // Create disposal record
      const { data: disposal, error } = await supabase
        .from('asset_disposals')
        .insert({
          ...validated,
          book_value_at_disposal: depreciation.bookValue,
          accumulated_depreciation: depreciation.accumulated,
          gain_loss: gainLoss,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset status
      await supabase
        .from('fixed_assets')
        .update({
          status: 'disposed',
          disposal_date: validated.disposal_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.asset_id);

      // Create ledger entries for disposal
      // Remove asset from books
      await supabase.from('ledger_entries').insert([
        {
          entry_date: validated.disposal_date,
          description: `Asset disposal - ${asset.name} (accumulated depreciation)`,
          debit: depreciation.accumulated,
          credit: 0,
          account_type: 'contra_asset',
          reference_type: 'disposal',
          reference_id: disposal.id,
          created_at: new Date().toISOString(),
        },
        {
          entry_date: validated.disposal_date,
          description: `Asset disposal - ${asset.name} (proceeds)`,
          debit: validated.disposal_amount,
          credit: 0,
          account_type: 'asset',
          reference_type: 'disposal',
          reference_id: disposal.id,
          created_at: new Date().toISOString(),
        },
        {
          entry_date: validated.disposal_date,
          description: `Asset disposal - ${asset.name} (original cost)`,
          debit: 0,
          credit: asset.acquisition_cost,
          account_type: 'asset',
          reference_type: 'disposal',
          reference_id: disposal.id,
          created_at: new Date().toISOString(),
        },
      ]);

      // Record gain or loss
      if (gainLoss !== 0) {
        await supabase.from('ledger_entries').insert({
          entry_date: validated.disposal_date,
          description: `Asset disposal ${gainLoss > 0 ? 'gain' : 'loss'} - ${asset.name}`,
          debit: gainLoss < 0 ? Math.abs(gainLoss) : 0,
          credit: gainLoss > 0 ? gainLoss : 0,
          account_type: gainLoss > 0 ? 'revenue' : 'expense',
          reference_type: 'disposal',
          reference_id: disposal.id,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        disposal,
        gain_loss: gainLoss,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Fixed assets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update asset
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: asset, error } = await supabase
      .from('fixed_assets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ asset });
  } catch (error: any) {
    console.error('Fixed assets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to calculate depreciation
function calculateDepreciation(asset: any): {
  accumulated: number;
  bookValue: number;
  monthly: number;
  remainingMonths: number;
} {
  const acquisitionDate = new Date(asset.acquisition_date);
  const monthsOwned = Math.floor((Date.now() - acquisitionDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  const totalMonths = asset.useful_life_years * 12;
  const depreciableAmount = asset.acquisition_cost - asset.salvage_value;

  let accumulated = 0;
  let monthly = 0;

  switch (asset.depreciation_method) {
    case 'straight_line':
      monthly = depreciableAmount / totalMonths;
      accumulated = Math.min(monthly * monthsOwned, depreciableAmount);
      break;

    case 'declining_balance':
      const rate = asset.depreciation_rate || (2 / asset.useful_life_years);
      let bookValue = asset.acquisition_cost;
      for (let i = 0; i < Math.min(monthsOwned, totalMonths); i++) {
        const monthlyDep = (bookValue * rate) / 12;
        if (bookValue - monthlyDep < asset.salvage_value) {
          accumulated += bookValue - asset.salvage_value;
          break;
        }
        accumulated += monthlyDep;
        bookValue -= monthlyDep;
      }
      monthly = (asset.acquisition_cost - accumulated) * rate / 12;
      break;

    case 'sum_of_years':
      const sumOfYears = (asset.useful_life_years * (asset.useful_life_years + 1)) / 2;
      const yearsOwned = monthsOwned / 12;
      for (let year = 1; year <= Math.min(Math.ceil(yearsOwned), asset.useful_life_years); year++) {
        const yearFraction = year <= yearsOwned ? 1 : yearsOwned - Math.floor(yearsOwned);
        const yearDepreciation = (depreciableAmount * (asset.useful_life_years - year + 1)) / sumOfYears;
        accumulated += yearDepreciation * yearFraction;
      }
      const currentYear = Math.ceil(yearsOwned);
      monthly = currentYear <= asset.useful_life_years 
        ? (depreciableAmount * (asset.useful_life_years - currentYear + 1)) / sumOfYears / 12 
        : 0;
      break;

    default:
      monthly = depreciableAmount / totalMonths;
      accumulated = Math.min(monthly * monthsOwned, depreciableAmount);
  }

  accumulated = Math.round(accumulated * 100) / 100;
  monthly = Math.round(monthly * 100) / 100;
  const bookValue = Math.max(asset.acquisition_cost - accumulated, asset.salvage_value);
  const remainingMonths = Math.max(0, totalMonths - monthsOwned);

  return { accumulated, bookValue, monthly, remainingMonths };
}
