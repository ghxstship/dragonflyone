import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Resource utilization reports (people, assets, capital)
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();
    const resourceType = searchParams.get('type'); // 'people', 'assets', 'capital'

    const results: any = {};

    if (!resourceType || resourceType === 'people') {
      const { data: employees } = await supabase.from('employees').select('id, first_name, last_name, department');
      const { data: allocations } = await supabase.from('resource_allocations').select('*')
        .gte('start_date', startDate).lte('end_date', endDate);

      const peopleUtilization = employees?.map(emp => {
        const empAllocations = allocations?.filter(a => a.employee_id === emp.id) || [];
        const totalAllocated = empAllocations.reduce((s, a) => s + (a.allocation_percent || 0), 0);
        return {
          employee: emp,
          utilization_percent: Math.min(totalAllocated, 100),
          projects: empAllocations.length,
          status: totalAllocated > 100 ? 'over' : totalAllocated > 80 ? 'optimal' : 'under'
        };
      });

      results.people = {
        data: peopleUtilization,
        average: Math.round((peopleUtilization?.reduce((s, p) => s + p.utilization_percent, 0) || 0) / (peopleUtilization?.length || 1)),
        over_allocated: peopleUtilization?.filter(p => p.status === 'over').length || 0,
        under_utilized: peopleUtilization?.filter(p => p.utilization_percent < 50).length || 0
      };
    }

    if (!resourceType || resourceType === 'assets') {
      const { data: assets } = await supabase.from('assets').select('id, name, category, status');
      const { data: checkouts } = await supabase.from('asset_checkouts').select('*')
        .gte('checkout_date', startDate).lte('return_date', endDate);

      const assetUtilization = assets?.map(asset => {
        const assetCheckouts = checkouts?.filter(c => c.asset_id === asset.id) || [];
        const daysUsed = assetCheckouts.reduce((s, c) => {
          const start = new Date(c.checkout_date);
          const end = c.return_date ? new Date(c.return_date) : new Date();
          return s + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          asset,
          days_used: daysUsed,
          utilization_percent: Math.round((daysUsed / totalDays) * 100),
          checkouts: assetCheckouts.length
        };
      });

      results.assets = {
        data: assetUtilization,
        average: Math.round((assetUtilization?.reduce((s, a) => s + a.utilization_percent, 0) || 0) / (assetUtilization?.length || 1)),
        idle: assetUtilization?.filter(a => a.utilization_percent < 20).length || 0
      };
    }

    if (!resourceType || resourceType === 'capital') {
      const { data: budgets } = await supabase.from('budgets').select('*')
        .gte('start_date', startDate).lte('end_date', endDate);

      const capitalUtilization = budgets?.map(budget => ({
        budget,
        allocated: budget.total_amount,
        spent: budget.spent_amount || 0,
        utilization_percent: Math.round(((budget.spent_amount || 0) / budget.total_amount) * 100),
        remaining: budget.total_amount - (budget.spent_amount || 0)
      }));

      results.capital = {
        data: capitalUtilization,
        total_allocated: capitalUtilization?.reduce((s, c) => s + c.allocated, 0) || 0,
        total_spent: capitalUtilization?.reduce((s, c) => s + c.spent, 0) || 0,
        average_utilization: Math.round((capitalUtilization?.reduce((s, c) => s + c.utilization_percent, 0) || 0) / (capitalUtilization?.length || 1))
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch utilization data' }, { status: 500 });
  }
}
