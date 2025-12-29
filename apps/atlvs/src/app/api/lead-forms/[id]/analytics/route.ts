import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const formId = params.id;
    const { searchParams } = new URL(request.url);

    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('lead_capture_forms')
      .select('id, name, submissions_count, created_at')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Lead form not found' },
        { status: 404 }
      );
    }

    // Get all submissions for this form
    const { data: submissions } = await supabase
      .from('lead_form_submissions')
      .select('id, status, submitted_at, converted_at, source, utm_source, utm_medium')
      .eq('form_id', formId);

    // Get submissions in period
    const submissionsInPeriod = submissions?.filter(
      s => new Date(s.submitted_at) >= startDate
    ) || [];

    // Calculate metrics
    const totalSubmissions = submissions?.length || 0;
    const periodSubmissions = submissionsInPeriod.length;
    const convertedSubmissions = submissions?.filter(s => s.status === 'converted').length || 0;
    const conversionRate = totalSubmissions > 0 ? (convertedSubmissions / totalSubmissions) * 100 : 0;

    // Submissions count from form record
    const recordedSubmissions = form.submissions_count || 0;
    const formConversionRate = recordedSubmissions > 0 ? (convertedSubmissions / recordedSubmissions) * 100 : 0;

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {};
    submissions?.forEach((s) => {
      const source = s.source || s.utm_source || 'direct';
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
    });

    // Daily submissions for trend
    const dailySubmissions: Record<string, number> = {};
    submissionsInPeriod.forEach((s) => {
      const date = new Date(s.submitted_at).toISOString().split('T')[0];
      dailySubmissions[date] = (dailySubmissions[date] || 0) + 1;
    });

    // Convert to array for chart
    const trend = Object.entries(dailySubmissions)
      .map(([date, count]) => ({ date, submissions: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    submissions?.forEach((s) => {
      statusBreakdown[s.status] = (statusBreakdown[s.status] || 0) + 1;
    });

    // Average time to conversion
    const convertedWithTime = submissions?.filter(s => s.converted_at && s.submitted_at) || [];
    let avgConversionTime = 0;
    if (convertedWithTime.length > 0) {
      const totalTime = convertedWithTime.reduce((sum, s) => {
        const submitted = new Date(s.submitted_at).getTime();
        const converted = new Date(s.converted_at!).getTime();
        return sum + (converted - submitted);
      }, 0);
      avgConversionTime = totalTime / convertedWithTime.length / (1000 * 60 * 60 * 24); // in days
    }

    return NextResponse.json({
      form: { id: form.id, name: form.name },
      metrics: {
        total_submissions: totalSubmissions,
        period_submissions: periodSubmissions,
        view_count: viewCount,
        form_conversion_rate: parseFloat(formConversionRate.toFixed(2)),
        lead_conversion_rate: parseFloat(conversionRate.toFixed(2)),
        converted_count: convertedSubmissions,
        avg_conversion_days: parseFloat(avgConversionTime.toFixed(1)),
      },
      source_breakdown: Object.entries(sourceBreakdown).map(([source, count]) => ({
        source,
        count,
        percentage: totalSubmissions > 0 ? parseFloat(((count / totalSubmissions) * 100).toFixed(1)) : 0,
      })),
      status_breakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
        status,
        count,
      })),
      trend,
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
