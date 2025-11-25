import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateSchema = z.object({
  version_number: z.string().min(1).max(20).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional().nullable(),
  document_url: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'pending_review', 'approved', 'active', 'archived']).optional(),
  requires_acknowledgment: z.boolean().optional(),
  acknowledgment_deadline_days: z.number().int().optional(),
  change_summary: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('handbook_versions')
      .select(`
        *,
        created_by_user:platform_users!created_by(id, email, full_name),
        approved_by_user:platform_users!approved_by(id, email, full_name),
        sections:handbook_sections(
          id, section_number, title, content, content_type, sort_order, 
          is_required_reading, estimated_read_time_minutes, attachments,
          parent_section_id
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Handbook not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get acknowledgment stats
    const { count: totalAcknowledged } = await supabase
      .from('employee_acknowledgments')
      .select('*', { count: 'exact', head: true })
      .eq('handbook_version_id', params.id);

    const { count: totalUsers } = await supabase
      .from('platform_users')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      data,
      stats: {
        acknowledged: totalAcknowledged || 0,
        total_users: totalUsers || 0,
        acknowledgment_rate: totalUsers ? ((totalAcknowledged || 0) / totalUsers * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching handbook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handbook' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    // If approving, set approved_by and approved_at
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('handbook_versions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Handbook not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating handbook:', error);
    return NextResponse.json(
      { error: 'Failed to update handbook' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by archiving
    const { error } = await supabase
      .from('handbook_versions')
      .update({ status: 'archived' })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving handbook:', error);
    return NextResponse.json(
      { error: 'Failed to archive handbook' },
      { status: 500 }
    );
  }
}
