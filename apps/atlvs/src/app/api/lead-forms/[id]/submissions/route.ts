import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const formId = params.id;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if form exists
    const { data: form, error: formError } = await supabase
      .from('lead_capture_forms')
      .select('id, name')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Lead form not found' },
        { status: 404 }
      );
    }

    // Build query for submissions
    let query = supabase
      .from('lead_form_submissions')
      .select('*', { count: 'exact' })
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('submitted_at', startDate);
    }
    if (endDate) {
      query = query.lte('submitted_at', endDate);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: submissions, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Calculate status breakdown
    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      closed: 0,
    };

    const { data: allSubmissions } = await supabase
      .from('lead_form_submissions')
      .select('status')
      .eq('form_id', formId);

    allSubmissions?.forEach((s) => {
      if (statusCounts[s.status] !== undefined) {
        statusCounts[s.status]++;
      }
    });

    return NextResponse.json({
      form: { id: form.id, name: form.name },
      submissions: submissions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
      status_breakdown: statusCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
