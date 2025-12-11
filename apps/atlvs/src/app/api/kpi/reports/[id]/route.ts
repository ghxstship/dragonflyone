export const dynamic = 'force-dynamic';

import { log } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface KpiReport {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  kpi_codes: string[];
  category: string | null;
  filters: Record<string, unknown>;
  is_global: boolean;
  is_user_copy: boolean;
  source_report_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/kpi/reports/[id]
 * Get a specific KPI report by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kpi_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Report not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    const report = data as KpiReport;

    // Check if favorited by current user
    const { data: { user } } = await supabase.auth.getUser();
    let isFavorited = false;
    
    if (user) {
      const { data: favorite } = await supabase
        .from('kpi_report_favorites')
        .select('id')
        .eq('report_id', id)
        .eq('user_id', user.id)
        .single();
      
      isFavorited = !!favorite;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        is_favorited: isFavorited
      }
    });
  } catch (error) {
    log.error('Error fetching KPI report:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI report' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/kpi/reports/[id]
 * Update a KPI report (only user copies can be edited)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if report exists and user can edit it
    const { data: existingData, error: fetchError } = await supabase
      .from('kpi_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const existingReport = existingData as KpiReport;

    // Only allow editing user copies or reports created by the user
    if (existingReport.is_global && existingReport.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit global reports. Duplicate it first to create your own copy.' },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      kpi_codes,
      category,
      filters
    } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (kpi_codes !== undefined) updateData.kpi_codes = kpi_codes;
    if (category !== undefined) updateData.category = category;
    if (filters !== undefined) updateData.filters = filters;

    const { data, error } = await supabase
      .from('kpi_reports')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    log.error('Error updating KPI report:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to update KPI report' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kpi/reports/[id]
 * Delete a KPI report (only user copies can be deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if report exists and user can delete it
    const { data: existingData, error: fetchError } = await supabase
      .from('kpi_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const existingReport = existingData as KpiReport;

    // Only allow deleting user copies
    if (existingReport.is_global) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete global reports' },
        { status: 403 }
      );
    }

    // Only allow deleting own reports
    if (existingReport.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete reports created by other users' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('kpi_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    log.error('Error deleting KPI report:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to delete KPI report' },
      { status: 500 }
    );
  }
}
