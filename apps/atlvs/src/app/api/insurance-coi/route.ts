import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const COISchema = z.object({
  vendor_id: z.string().uuid().optional(),
  contractor_id: z.string().uuid().optional(),
  policy_holder_name: z.string(),
  policy_holder_type: z.enum(['vendor', 'contractor', 'subcontractor', 'venue', 'other']),
  insurance_company: z.string(),
  policy_number: z.string(),
  policy_type: z.enum(['general_liability', 'workers_comp', 'auto', 'professional', 'umbrella', 'property', 'other']),
  coverage_amount: z.number().positive(),
  deductible: z.number().optional(),
  effective_date: z.string(),
  expiration_date: z.string(),
  additional_insured: z.boolean().default(false),
  waiver_of_subrogation: z.boolean().default(false),
  certificate_url: z.string().url().optional(),
  agent_name: z.string().optional(),
  agent_phone: z.string().optional(),
  agent_email: z.string().email().optional(),
  notes: z.string().optional(),
});

const COIRequirementSchema = z.object({
  name: z.string(),
  policy_type: z.enum(['general_liability', 'workers_comp', 'auto', 'professional', 'umbrella', 'property', 'other']),
  minimum_coverage: z.number().positive(),
  additional_insured_required: z.boolean().default(false),
  waiver_of_subrogation_required: z.boolean().default(false),
  applies_to: z.array(z.enum(['vendor', 'contractor', 'subcontractor', 'venue'])),
  project_types: z.array(z.string()).optional(),
});

// GET /api/insurance-coi - Get COIs and requirements
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coiId = searchParams.get('coi_id');
    const vendorId = searchParams.get('vendor_id');
    const contractorId = searchParams.get('contractor_id');
    const expiringWithinDays = searchParams.get('expiring_within_days');
    const status = searchParams.get('status');
    const policyType = searchParams.get('policy_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (coiId) {
      // Get specific COI
      const { data: coi, error } = await supabase
        .from('insurance_certificates')
        .select(`
          *,
          vendor:vendors(id, name),
          verifications:coi_verifications(*)
        `)
        .eq('id', coiId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ coi });
    } else {
      // Get COIs with filters
      let query = supabase
        .from('insurance_certificates')
        .select(`
          *,
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('expiration_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      if (contractorId) {
        query = query.eq('contractor_id', contractorId);
      }

      if (policyType) {
        query = query.eq('policy_type', policyType);
      }

      if (status === 'expired') {
        query = query.lt('expiration_date', new Date().toISOString().split('T')[0]);
      } else if (status === 'active') {
        query = query.gte('expiration_date', new Date().toISOString().split('T')[0]);
      }

      if (expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(expiringWithinDays));
        query = query.lte('expiration_date', futureDate.toISOString().split('T')[0]);
        query = query.gte('expiration_date', new Date().toISOString().split('T')[0]);
      }

      const { data: cois, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate days until expiration
      const coisWithExpiry = cois?.map(c => {
        const expDate = new Date(c.expiration_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...c,
          days_until_expiry: daysUntilExpiry,
          is_expired: daysUntilExpiry < 0,
          needs_renewal: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
        };
      });

      // Get summary stats
      const expiredCount = coisWithExpiry?.filter(c => c.is_expired).length || 0;
      const expiringIn30Days = coisWithExpiry?.filter(c => c.needs_renewal).length || 0;
      const activeCount = coisWithExpiry?.filter(c => !c.is_expired).length || 0;

      // Get requirements
      const { data: requirements } = await supabase
        .from('coi_requirements')
        .select('*')
        .eq('is_active', true);

      return NextResponse.json({
        cois: coisWithExpiry || [],
        total: count || 0,
        summary: {
          active: activeCount,
          expired: expiredCount,
          expiring_in_30_days: expiringIn30Days,
        },
        requirements: requirements || [],
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch COI data' }, { status: 500 });
  }
}

// POST /api/insurance-coi - Create COI or requirement
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const action = body.action || 'create_coi';

    if (action === 'create_coi') {
      const validated = COISchema.parse(body);

      const { data: coi, error } = await supabase
        .from('insurance_certificates')
        .insert({
          ...validated,
          verification_status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Schedule expiration reminder
      const reminderDate = new Date(validated.expiration_date);
      reminderDate.setDate(reminderDate.getDate() - 30);

      await supabase.from('scheduled_notifications').insert({
        user_id: user.id,
        type: 'coi_expiration',
        title: 'Insurance Certificate Expiring',
        message: `${validated.policy_type} policy for ${validated.policy_holder_name} expires in 30 days`,
        link: `/insurance/coi/${coi.id}`,
        scheduled_for: reminderDate.toISOString(),
        reference_type: 'insurance_certificate',
        reference_id: coi.id,
      });

      return NextResponse.json({ coi }, { status: 201 });
    } else if (action === 'create_requirement') {
      const validated = COIRequirementSchema.parse(body);

      const { data: requirement, error } = await supabase
        .from('coi_requirements')
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

      return NextResponse.json({ requirement }, { status: 201 });
    } else if (action === 'verify') {
      const { coi_id, verification_result, notes, verified_coverage, verified_dates } = body;

      // Create verification record
      const { data: verification, error: verifyError } = await supabase
        .from('coi_verifications')
        .insert({
          coi_id,
          verification_result,
          notes,
          verified_coverage,
          verified_dates,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (verifyError) {
        return NextResponse.json({ error: verifyError.message }, { status: 500 });
      }

      // Update COI status
      const { data: coi, error } = await supabase
        .from('insurance_certificates')
        .update({
          verification_status: verification_result,
          last_verified_at: new Date().toISOString(),
          last_verified_by: user.id,
        })
        .eq('id', coi_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ coi, verification });
    } else if (action === 'request_renewal') {
      const { coi_id, contact_email, message } = body;

      // Get COI details
      const { data: coi } = await supabase
        .from('insurance_certificates')
        .select('*')
        .eq('id', coi_id)
        .single();

      if (!coi) {
        return NextResponse.json({ error: 'COI not found' }, { status: 404 });
      }

      // Create renewal request record
      const { data: request, error } = await supabase
        .from('coi_renewal_requests')
        .insert({
          coi_id,
          requested_by: user.id,
          contact_email: contact_email || coi.agent_email,
          message,
          status: 'sent',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, this would send an email to the agent/vendor
      return NextResponse.json({ 
        request,
        message: 'Renewal request sent',
      });
    } else if (action === 'check_compliance') {
      const { vendor_id, contractor_id, project_type } = body;

      // Get requirements
      let requirementsQuery = supabase
        .from('coi_requirements')
        .select('*')
        .eq('is_active', true);

      if (project_type) {
        requirementsQuery = requirementsQuery.contains('project_types', [project_type]);
      }

      const { data: requirements } = await requirementsQuery;

      // Get current COIs
      let coisQuery = supabase
        .from('insurance_certificates')
        .select('*')
        .gte('expiration_date', new Date().toISOString().split('T')[0]);

      if (vendor_id) {
        coisQuery = coisQuery.eq('vendor_id', vendor_id);
      }

      if (contractor_id) {
        coisQuery = coisQuery.eq('contractor_id', contractor_id);
      }

      const { data: cois } = await coisQuery;

      // Check compliance
      const complianceResults = requirements?.map(req => {
        const matchingCoi = cois?.find(c => 
          c.policy_type === req.policy_type &&
          c.coverage_amount >= req.minimum_coverage &&
          (!req.additional_insured_required || c.additional_insured) &&
          (!req.waiver_of_subrogation_required || c.waiver_of_subrogation)
        );

        return {
          requirement: req,
          is_compliant: !!matchingCoi,
          matching_coi: matchingCoi,
          issues: !matchingCoi ? [
            `Missing or insufficient ${req.policy_type} coverage`,
            req.additional_insured_required && !matchingCoi?.additional_insured ? 'Additional insured endorsement required' : null,
            req.waiver_of_subrogation_required && !matchingCoi?.waiver_of_subrogation ? 'Waiver of subrogation required' : null,
          ].filter(Boolean) : [],
        };
      });

      const isFullyCompliant = complianceResults?.every(r => r.is_compliant);

      return NextResponse.json({
        is_compliant: isFullyCompliant,
        results: complianceResults,
        missing_requirements: complianceResults?.filter(r => !r.is_compliant).map(r => r.requirement),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/insurance-coi - Update COI
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coiId = searchParams.get('coi_id');

    if (!coiId) {
      return NextResponse.json({ error: 'COI ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: coi, error } = await supabase
      .from('insurance_certificates')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', coiId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coi });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update COI' }, { status: 500 });
  }
}
