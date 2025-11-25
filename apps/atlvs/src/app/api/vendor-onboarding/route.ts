import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OnboardingRequestSchema = z.object({
  vendor_name: z.string(),
  vendor_type: z.string(),
  contact_name: z.string(),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('USA'),
  services_offered: z.array(z.string()),
  annual_revenue: z.string().optional(),
  years_in_business: z.number().int().optional(),
  references: z.array(z.object({
    company_name: z.string(),
    contact_name: z.string(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

const QualificationCriteriaSchema = z.object({
  name: z.string(),
  category: z.string(),
  criteria_type: z.enum(['document', 'certification', 'insurance', 'financial', 'reference', 'other']),
  description: z.string().optional(),
  is_required: z.boolean().default(true),
  weight: z.number().min(0).max(100).default(10),
  applies_to_vendor_types: z.array(z.string()).optional(),
});

// GET /api/vendor-onboarding - Get onboarding requests and status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');
    const status = searchParams.get('status');
    const vendorType = searchParams.get('vendor_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (requestId) {
      // Get specific onboarding request with details
      const { data: request, error } = await supabase
        .from('vendor_onboarding_requests')
        .select(`
          *,
          checklist_items:vendor_onboarding_checklist(*),
          documents:vendor_compliance_documents(*),
          evaluations:vendor_qualification_evaluations(*)
        `)
        .eq('id', requestId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get qualification criteria
      const { data: criteria } = await supabase
        .from('vendor_qualification_criteria')
        .select('*')
        .eq('is_active', true);

      // Calculate qualification score
      const evaluations = request.evaluations || [];
      const totalWeight = criteria?.reduce((sum, c) => sum + c.weight, 0) || 0;
      const earnedWeight = evaluations
        .filter((e: any) => e.is_met)
        .reduce((sum: number, e: any) => {
          const criterion = criteria?.find(c => c.id === e.criteria_id);
          return sum + (criterion?.weight || 0);
        }, 0);
      
      const qualificationScore = totalWeight > 0 ? (earnedWeight / totalWeight * 100) : 0;

      return NextResponse.json({
        request: {
          ...request,
          qualification_score: qualificationScore.toFixed(2),
        },
        criteria,
      });
    } else {
      // Get all onboarding requests
      let query = supabase
        .from('vendor_onboarding_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (vendorType) {
        query = query.eq('vendor_type', vendorType);
      }

      const { data: requests, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get summary stats
      const { data: statusCounts } = await supabase
        .from('vendor_onboarding_requests')
        .select('status');

      const counts: Record<string, number> = {};
      statusCounts?.forEach(r => {
        counts[r.status] = (counts[r.status] || 0) + 1;
      });

      return NextResponse.json({
        requests: requests || [],
        total: count || 0,
        status_counts: counts,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 });
  }
}

// POST /api/vendor-onboarding - Create request or process actions
export async function POST(request: NextRequest) {
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
    const action = body.action || 'create_request';

    if (action === 'create_request') {
      const validated = OnboardingRequestSchema.parse(body);

      // Create onboarding request
      const { data: onboardingRequest, error } = await supabase
        .from('vendor_onboarding_requests')
        .insert({
          ...validated,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create checklist items based on vendor type
      const { data: criteria } = await supabase
        .from('vendor_qualification_criteria')
        .select('*')
        .eq('is_active', true);

      const applicableCriteria = criteria?.filter(c => 
        !c.applies_to_vendor_types || 
        c.applies_to_vendor_types.length === 0 ||
        c.applies_to_vendor_types.includes(validated.vendor_type)
      );

      if (applicableCriteria && applicableCriteria.length > 0) {
        const checklistItems = applicableCriteria.map(c => ({
          onboarding_request_id: onboardingRequest.id,
          criteria_id: c.id,
          name: c.name,
          description: c.description,
          is_required: c.is_required,
          status: 'pending',
        }));

        await supabase.from('vendor_onboarding_checklist').insert(checklistItems);
      }

      return NextResponse.json({ request: onboardingRequest }, { status: 201 });
    } else if (action === 'create_criteria') {
      const validated = QualificationCriteriaSchema.parse(body);

      const { data: criteria, error } = await supabase
        .from('vendor_qualification_criteria')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ criteria }, { status: 201 });
    } else if (action === 'evaluate_criteria') {
      const { request_id, criteria_id, is_met, notes, evidence_url } = body;

      const { data: evaluation, error } = await supabase
        .from('vendor_qualification_evaluations')
        .upsert({
          onboarding_request_id: request_id,
          criteria_id,
          is_met,
          notes,
          evidence_url,
          evaluated_by: user.id,
          evaluated_at: new Date().toISOString(),
        }, {
          onConflict: 'onboarding_request_id,criteria_id',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update checklist item
      await supabase
        .from('vendor_onboarding_checklist')
        .update({
          status: is_met ? 'completed' : 'failed',
          completed_at: is_met ? new Date().toISOString() : null,
        })
        .eq('onboarding_request_id', request_id)
        .eq('criteria_id', criteria_id);

      return NextResponse.json({ evaluation });
    } else if (action === 'approve') {
      const { request_id, notes } = body;

      // Get onboarding request
      const { data: onboardingRequest } = await supabase
        .from('vendor_onboarding_requests')
        .select('*')
        .eq('id', request_id)
        .single();

      if (!onboardingRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      // Create vendor record
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: onboardingRequest.vendor_name,
          vendor_type: onboardingRequest.vendor_type,
          contact_name: onboardingRequest.contact_name,
          contact_email: onboardingRequest.contact_email,
          contact_phone: onboardingRequest.contact_phone,
          website: onboardingRequest.website,
          address: onboardingRequest.address,
          city: onboardingRequest.city,
          state: onboardingRequest.state,
          country: onboardingRequest.country,
          services_offered: onboardingRequest.services_offered,
          status: 'active',
          onboarded_at: new Date().toISOString(),
          onboarded_by: user.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (vendorError) {
        return NextResponse.json({ error: vendorError.message }, { status: 500 });
      }

      // Update onboarding request
      const { error } = await supabase
        .from('vendor_onboarding_requests')
        .update({
          status: 'approved',
          vendor_id: vendor.id,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_notes: notes,
        })
        .eq('id', request_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transfer compliance documents to vendor
      await supabase
        .from('vendor_compliance_documents')
        .update({ vendor_id: vendor.id })
        .eq('onboarding_request_id', request_id);

      return NextResponse.json({
        vendor,
        message: 'Vendor approved and created successfully',
      });
    } else if (action === 'reject') {
      const { request_id, reason } = body;

      const { error } = await supabase
        .from('vendor_onboarding_requests')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', request_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Vendor request rejected' });
    } else if (action === 'request_info') {
      const { request_id, items_needed, message } = body;

      const { error } = await supabase
        .from('vendor_onboarding_requests')
        .update({
          status: 'pending_info',
          info_requested_at: new Date().toISOString(),
          info_requested_by: user.id,
          info_items_needed: items_needed,
        })
        .eq('id', request_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, this would send an email to the vendor contact
      return NextResponse.json({ message: 'Information request sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/vendor-onboarding - Update request
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: onboardingRequest, error } = await supabase
      .from('vendor_onboarding_requests')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: onboardingRequest });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
