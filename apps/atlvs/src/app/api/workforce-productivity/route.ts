import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    if (type === 'overview') {
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('employee_id, hours, billable_hours, date, project_id')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      const { data: employees } = await supabase
        .from('platform_users')
        .select('id, hourly_rate')
        .eq('status', 'active');

      const totalHours = timesheets?.reduce((sum, ts) => sum + ts.hours, 0) || 0;
      const billableHours = timesheets?.reduce((sum, ts) => sum + (ts.billable_hours || 0), 0) || 0;
      const uniqueEmployees = new Set(timesheets?.map(ts => ts.employee_id)).size;

      return NextResponse.json({
        overview: {
          total_hours: Math.round(totalHours * 100) / 100,
          billable_hours: Math.round(billableHours * 100) / 100,
          billable_percentage: totalHours > 0 ? Math.round((billableHours / totalHours) * 10000) / 100 : 0,
          active_employees: uniqueEmployees,
          average_hours_per_employee: uniqueEmployees > 0 ? Math.round((totalHours / uniqueEmployees) * 100) / 100 : 0,
        },
      });
    }

    if (type === 'employee') {
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('employee_id, hours, billable_hours, date, employee:platform_users(id, first_name, last_name)')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      const byEmployee: Record<string, any> = {};
      timesheets?.forEach(ts => {
        const empId = ts.employee_id;
        if (!byEmployee[empId]) {
          const emp = ts.employee as any;
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

      const employees = Object.values(byEmployee).map((emp: any) => ({
        ...emp,
        billable_percentage: emp.total_hours > 0 ? Math.round((emp.billable_hours / emp.total_hours) * 10000) / 100 : 0,
      })).sort((a, b) => b.total_hours - a.total_hours);

      return NextResponse.json({ employees });
    }

    if (type === 'department') {
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('hours, billable_hours, employee:platform_users(department_id, department:departments(name))')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .eq('status', 'approved');

      const byDept: Record<string, any> = {};
      timesheets?.forEach(ts => {
        const emp = ts.employee as any;
        const deptId = emp?.department_id || 'unassigned';
        const deptName = emp?.department?.name || 'Unassigned';
        if (!byDept[deptId]) byDept[deptId] = { department_name: deptName, total_hours: 0, billable_hours: 0 };
        byDept[deptId].total_hours += ts.hours;
        byDept[deptId].billable_hours += ts.billable_hours || 0;
      });

      const departments = Object.values(byDept).map((d: any) => ({
        ...d,
        billable_percentage: d.total_hours > 0 ? Math.round((d.billable_hours / d.total_hours) * 10000) / 100 : 0,
      }));

      return NextResponse.json({ departments });
    }

    if (type === 'trends') {
      const { data: timesheets } = await supabase
        .from('timesheets')
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
