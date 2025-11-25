import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const approveSchema = z.object({
  reviewer_notes: z.string().optional(),
  approved_cost: z.number().optional(),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;
      const payload = context.validated;
      const userId = context.user?.id;

      // Check if advance exists and is in reviewable status
      const { data: advance, error: fetchError } = await supabase
        .from('production_advances')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !advance) {
        return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
      }

      if (advance.status !== 'submitted' && advance.status !== 'under_review') {
        return NextResponse.json({ 
          error: 'Advance must be in submitted or under_review status to approve' 
        }, { status: 400 });
      }

      // Update advance to approved
      const { data: updatedAdvance, error: updateError } = await supabase
        .from('production_advances')
        .update({
          status: 'approved',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: payload.reviewer_notes,
          estimated_cost: payload.approved_cost || advance.estimated_cost,
        })
        .eq('id', id)
        .select(`
          *,
          items:production_advance_items(*),
          submitter:platform_users!submitter_id(id, full_name, email)
        `)
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        advance: updatedAdvance,
        message: 'Advance approved successfully'
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: approveSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'advances:approve', resource: 'advances' },
  }
);
