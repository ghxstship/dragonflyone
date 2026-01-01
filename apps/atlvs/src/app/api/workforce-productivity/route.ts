export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    if (type === 'overview') {
      const { data: timesheets } = await supabase
        .from('workforce_time_entries')
        .select('employee_id, hours, billable_hours, date, project_id')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      const { data: employees } = await supabase
        .from('platform_users')
        .select('id, hourly_rate')
        .eq('status', 'active');

      // Create a map of employee hourly rates
      const rateMap = new Map(employees?.map(e => [e.id, e.hourly_rate || 0]) || []);

      const totalHours = timesheets?.reduce((sum, ts) => sum + ts.hours, 0) || 0;
      const billableHours = timesheets?.reduce((sum, ts) => sum + (ts.billable_hours || 0), 0) || 0;
      const uniqueEmployees = new Set(timesheets?.map(ts => ts.employee_id)).size;

      // Calculate estimated revenue based on billable hours and hourly rates
      const estimatedRevenue = timesheets?.reduce((sum, ts) => {
        const rate = rateMap.get(ts.employee_id) || 0;
        return sum + (ts.billable_hours || 0) * rate;
      }, 0) || 0;

      return NextResponse.json({
        overview: {
          total_hours: Math.round(totalHours * 100) / 100,
          billable_hours: Math.round(billableHours * 100) / 100,
          billable_percentage: totalHours > 0 ? Math.round((billableHours / totalHours) * 10000) / 100 : 0,
          active_employees: uniqueEmployees,
          average_hours_per_employee: uniqueEmployees > 0 ? Math.round((totalHours / uniqueEmployees) * 100) / 100 : 0,
          estimated_revenue: Math.round(estimatedRevenue * 100) / 100,
        },
      });
    }

    if (type === 'employee') {
      const { data: timesheets } = await supabase
        .from('workforce_time_entries')
        .select('employee_id, hours, billable_hours, date, employee:platform_users(id, first_name, last_name)')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      interface EmployeeData { first_name?: string; last_name?: string }
      interface EmployeeProductivity { employee_id: string; employee_name: string; total_hours: number; billable_hours: number }
      const byEmployee: Record<string, EmployeeProductivity> = {};
      timesheets?.forEach(ts => {
        const empId = ts.employee_id;
        if (!byEmployee[empId]) {
          const emp = ts.employee as EmployeeData | null;
          byEmployee[empId] = {
            employee_id: empId,
            employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
            total_hours: 0,
            billable_hours: 0,
          };
        }
        byEmployee[empId].total_hours += ts.hours;
        byEmployee[empId].billable_hours += ts.billable_hours || 0;
      });

      const employees = Object.values(byEmployee).map((emp: EmployeeProductivity) => ({
        ...emp,
        billable_percentage: emp.total_hours > 0 ? Math.round((emp.billable_hours / emp.total_hours) * 10000) / 100 : 0,
      })).sort((a, b) => b.total_hours - a.total_hours);

      return NextResponse.json({ employees });
    }

    if (type === 'department') {
      const { data: timesheets } = await supabase
        .from('workforce_time_entries')
        .select('hours, billable_hours, employee:platform_users(department_id, department:departments(name))')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      interface DeptEmployeeData { department_id?: string; department?: { name?: string } }
      interface DeptProductivity { department_name: string; total_hours: number; billable_hours: number }
      const byDept: Record<string, DeptProductivity> = {};
      timesheets?.forEach(ts => {
        const emp = ts.employee as DeptEmployeeData | null;
        const deptId = emp?.department_id || 'unassigned';
        const deptName = emp?.department?.name || 'Unassigned';
        if (!byDept[deptId]) byDept[deptId] = { department_name: deptName, total_hours: 0, billable_hours: 0 };
        byDept[deptId].total_hours += ts.hours;
        byDept[deptId].billable_hours += ts.billable_hours || 0;
      });

      const departments = Object.values(byDept).map((d: DeptProductivity) => ({
        ...d,
        billable_percentage: d.total_hours > 0 ? Math.round((d.billable_hours / d.total_hours) * 10000) / 100 : 0,
      }));

      return NextResponse.json({ departments });
    }

    if (type === 'trends') {
      const { data: timesheets } = await supabase
        .from('workforce_time_entries')
        .select('hours, billable_hours, date')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      const byWeek: Record<string, { hours: number; billable: number }> = {};
      timesheets?.forEach(ts => {
        const date = new Date(ts.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        if (!byWeek[weekKey]) byWeek[weekKey] = { hours: 0, billable: 0 };
        byWeek[weekKey].hours += ts.hours;
        byWeek[weekKey].billable += ts.billable_hours || 0;
      });

      const trend = Object.entries(byWeek).map(([week, data]) => ({
        week_start: week,
        total_hours: Math.round(data.hours * 100) / 100,
        billable_hours: Math.round(data.billable * 100) / 100,
      })).sort((a, b) => a.week_start.localeCompare(b.week_start));

      return NextResponse.json({ trend });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
