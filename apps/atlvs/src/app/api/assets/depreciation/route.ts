import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const depreciationSchema = z.object({
  asset_id: z.string().uuid(),
  method: z.enum(['straight_line', 'declining_balance', 'sum_of_years', 'units_of_production']),
  purchase_price: z.number().positive(),
  salvage_value: z.number().nonnegative(),
  useful_life_years: z.number().positive(),
  useful_life_units: z.number().optional(), // For units of production
  depreciation_rate: z.number().optional(), // For declining balance
  start_date: z.string(),
  fiscal_year_end: z.string().optional()
});

// GET - Calculate depreciation or list schedules
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const action = searchParams.get('action');
    const year = searchParams.get('year');

    if (action === 'calculate' && asset_id) {
      // Get asset depreciation schedule
      const { data: schedule } = await supabase
        .from('asset_depreciation')
        .select('*')
        .eq('asset_id', asset_id)
        .single();

      if (!schedule) {
        return NextResponse.json({ error: 'Depreciation schedule not found' }, { status: 404 });
      }

      const depreciationData = calculateDepreciation(schedule, year ? parseInt(year) : null);

      return NextResponse.json({
        asset_id,
        method: schedule.method,
        depreciation_schedule: depreciationData.schedule,
        current_book_value: depreciationData.currentBookValue,
        accumulated_depreciation: depreciationData.accumulatedDepreciation,
        annual_depreciation: depreciationData.annualDepreciation
      });
    }

    // List all depreciation schedules
    const { data, error } = await supabase
      .from('asset_depreciation')
      .select(`
        *,
        assets (
          id,
          name,
          asset_type,
          purchase_date,
          current_value
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedules: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'depreciation:list', resource: 'asset_depreciation' }
  }
);

// POST - Create depreciation schedule
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = depreciationSchema.parse(body);

    // Calculate initial depreciation schedule
    const schedule = calculateDepreciation(validated, null);

    const { data: depSchedule, error } = await supabase
      .from('asset_depreciation')
      .insert({
        ...validated,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update asset with depreciation info
    await supabase
      .from('assets')
      .update({
        depreciation_method: validated.method,
        purchase_price: validated.purchase_price,
        current_value: schedule.currentBookValue
      })
      .eq('id', validated.asset_id);

    return NextResponse.json({
      schedule: depSchedule,
      depreciation_data: schedule,
      message: 'Depreciation schedule created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: depreciationSchema,
    audit: { action: 'depreciation:create', resource: 'asset_depreciation' }
  }
);

// Helper function to calculate depreciation
function calculateDepreciation(config: any, targetYear: number | null) {
  const startDate = new Date(config.start_date);
  const currentYear = targetYear || new Date().getFullYear();
  const yearsElapsed = currentYear - startDate.getFullYear();
  
  const depreciableAmount = config.purchase_price - config.salvage_value;
  let accumulatedDepreciation = 0;
  let annualDepreciation = 0;
  
  interface DepreciationEntry {
    year: number;
    depreciation_expense: number;
    accumulated_depreciation: number;
    book_value: number;
  }
  const scheduleData: DepreciationEntry[] = [];

  switch (config.method) {
    case 'straight_line':
      // Annual depreciation = (Cost - Salvage) / Useful Life
      annualDepreciation = depreciableAmount / config.useful_life_years;
      
      for (let year = 0; year < config.useful_life_years; year++) {
        const yearNum = startDate.getFullYear() + year;
        const depreciation = Math.min(annualDepreciation, depreciableAmount - accumulatedDepreciation);
        accumulatedDepreciation += depreciation;
        const bookValue = config.purchase_price - accumulatedDepreciation;
        
        scheduleData.push({
          year: yearNum,
          depreciation_expense: depreciation,
          accumulated_depreciation: accumulatedDepreciation,
          book_value: bookValue
        });
      }
      break;

    case 'declining_balance':
      // Typically 200% (double declining) or 150%
      const rate = config.depreciation_rate || 2.0;
      const depreciationRate = rate / config.useful_life_years;
      let bookValue = config.purchase_price;
      
      for (let year = 0; year < config.useful_life_years; year++) {
        const yearNum = startDate.getFullYear() + year;
        const depreciation = Math.max(
          bookValue * depreciationRate,
          bookValue - config.salvage_value
        );
        accumulatedDepreciation += depreciation;
        bookValue -= depreciation;
        
        scheduleData.push({
          year: yearNum,
          depreciation_expense: depreciation,
          accumulated_depreciation: accumulatedDepreciation,
          book_value: Math.max(bookValue, config.salvage_value)
        });
        
        if (bookValue <= config.salvage_value) break;
      }
      break;

    case 'sum_of_years':
      // Sum of years digits method
      const sumOfYears = (config.useful_life_years * (config.useful_life_years + 1)) / 2;
      
      for (let year = 0; year < config.useful_life_years; year++) {
        const yearNum = startDate.getFullYear() + year;
        const remainingLife = config.useful_life_years - year;
        const depreciation = (remainingLife / sumOfYears) * depreciableAmount;
        accumulatedDepreciation += depreciation;
        
        scheduleData.push({
          year: yearNum,
          depreciation_expense: depreciation,
          accumulated_depreciation: accumulatedDepreciation,
          book_value: config.purchase_price - accumulatedDepreciation
        });
      }
      break;

    case 'units_of_production':
      // Would require actual usage data
      // Simplified calculation for demonstration
      annualDepreciation = depreciableAmount / config.useful_life_years;
      accumulatedDepreciation = Math.min(
        annualDepreciation * yearsElapsed,
        depreciableAmount
      );
      break;
  }

  const currentBookValue = config.purchase_price - accumulatedDepreciation;

  return {
    schedule: scheduleData,
    currentBookValue: Math.max(currentBookValue, config.salvage_value),
    accumulatedDepreciation,
    annualDepreciation: annualDepreciation || (scheduleData.length > 0 ? scheduleData[0].depreciation_expense : 0)
  };
}

// PUT - Update depreciation schedule
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('asset_depreciation')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Recalculate and update asset value
    const schedule = calculateDepreciation(data, null);
    await supabase
      .from('assets')
      .update({ current_value: schedule.currentBookValue })
      .eq('id', data.asset_id);

    return NextResponse.json({ schedule: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'depreciation:update', resource: 'asset_depreciation' }
  }
);
