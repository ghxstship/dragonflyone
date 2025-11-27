import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Capacity planning and utilization forecasting
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date().toISOString();
    const months = parseInt(searchParams.get('months') || '6');

    // Get all resources
    const { data: employees } = await supabase.from('employees').select('id, first_name, last_name, department, weekly_hours');
    const { data: projects } = await supabase.from('projects').select('*').in('status', ['active', 'planned']);
    const { data: allocations } = await supabase.from('resource_allocations').select('*').gte('end_date', startDate);

    // Calculate capacity by month
    const forecast: any[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(start);
      monthStart.setMonth(monthStart.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthAllocations = allocations?.filter(a => 
        new Date(a.start_date) <= monthEnd && new Date(a.end_date) >= monthStart
      ) || [];

      const totalCapacity = (employees?.length || 0) * 160; // 160 hours/month per employee
      const allocated = monthAllocations.reduce((sum, a) => sum + ((a.allocation_percent || 0) * 1.6), 0);

      forecast.push({
        month: monthStart.toISOString().substring(0, 7),
        total_capacity_hours: totalCapacity,
        allocated_hours: Math.round(allocated),
        available_hours: Math.round(totalCapacity - allocated),
        utilization_percent: Math.round((allocated / totalCapacity) * 100)
      });
    }

    // Department breakdown
    const byDepartment = employees?.reduce((acc: any, emp) => {
      if (!acc[emp.department]) acc[emp.department] = { count: 0, capacity: 0 };
      acc[emp.department].count++;
      acc[emp.department].capacity += emp.weekly_hours * 4;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      forecast,
      by_department: byDepartment,
      total_employees: employees?.length || 0,
      active_projects: projects?.length || 0,
      recommendations: generateRecommendations(forecast)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch capacity data' }, { status: 500 });
  }
}

function generateRecommendations(forecast: any[]): string[] {
  const recommendations: string[] = [];
  
  const overUtilized = forecast.filter(f => f.utilization_percent > 90);
  const underUtilized = forecast.filter(f => f.utilization_percent < 50);

  if (overUtilized.length > 0) {
    recommendations.push(`${overUtilized.length} months show over 90% utilization - consider hiring or reducing scope`);
  }
  if (underUtilized.length > 0) {
    recommendations.push(`${underUtilized.length} months show under 50% utilization - opportunity for new projects`);
  }

  return recommendations;
}
