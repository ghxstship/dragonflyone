import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ComplianceDocumentSchema = z.object({
  vendor_id: z.string().uuid(),
  document_type: z.enum(['w9', 'business_license', 'insurance', 'safety_certification', 'background_check', 'contract', 'nda', 'other']),
  name: z.string(),
  description: z.string().optional(),
  document_url: z.string().url(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
  requires_renewal: z.boolean().default(false),
  renewal_reminder_days: z.number().int().default(30),
  is_required: z.boolean().default(false),
  notes: z.string().optional(),
});

const ComplianceRequirementSchema = z.object({
  name: z.string(),
  document_type: z.enum(['w9', 'business_license', 'insurance', 'safety_certification', 'background_check', 'contract', 'nda', 'other']),
  description: z.string().optional(),
  is_required: z.boolean().default(true),
  applies_to_vendor_types: z.array(z.string()).optional(),
  renewal_frequency_months: z.number().int().optional(),
});

// GET /api/vendor-compliance - Get compliance documents and status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const documentType = searchParams.get('document_type');
    const expiringWithinDays = searchParams.get('expiring_within_days');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (vendorId) {
      // Get compliance status for specific vendor
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id, name, vendor_type')
        .eq('id', vendorId)
        .single();

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }

      // Get all documents for vendor
      const { data: documents } = await supabase
        .from('vendor_compliance_documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('document_type');

      // Get requirements
      const { data: requirements } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('is_active', true);

      // Check compliance status
      const complianceStatus = requirements?.map(req => {
        const matchingDoc = documents?.find(d => 
          d.document_type === req.document_type &&
          (!d.expiration_date || new Date(d.expiration_date) >= new Date())
        );

        const isExpired = matchingDoc?.expiration_date && new Date(matchingDoc.expiration_date) < new Date();
        const daysUntilExpiry = matchingDoc?.expiration_date 
          ? Math.ceil((new Date(matchingDoc.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          requirement: req,
          document: matchingDoc,
          status: !matchingDoc ? 'missing' : isExpired ? 'expired' : 'compliant',
          days_until_expiry: daysUntilExpiry,
          needs_attention: !matchingDoc || isExpired || (daysUntilExpiry !== null && daysUntilExpiry <= 30),
        };
      });

      const isFullyCompliant = complianceStatus?.every(s => s.status === 'compliant');
      const missingCount = complianceStatus?.filter(s => s.status === 'missing').length || 0;
      const expiredCount = complianceStatus?.filter(s => s.status === 'expired').length || 0;

      return NextResponse.json({
        vendor,
        documents: documents || [],
        compliance_status: complianceStatus,
        summary: {
          is_compliant: isFullyCompliant,
          missing_documents: missingCount,
          expired_documents: expiredCount,
          total_requirements: requirements?.length || 0,
        },
      });
    } else {
      // Get all compliance documents with filters
      let query = supabase
        .from('vendor_compliance_documents')
        .select(`
          *,
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      if (expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(expiringWithinDays));
        query = query.lte('expiration_date', futureDate.toISOString().split('T')[0]);
        query = query.gte('expiration_date', new Date().toISOString().split('T')[0]);
      }

      if (status === 'expired') {
        query = query.lt('expiration_date', new Date().toISOString().split('T')[0]);
      }

      const { data: documents, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get vendors with compliance issues
      const { data: allVendors } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('is_active', true);

      const { data: allDocs } = await supabase
        .from('vendor_compliance_documents')
        .select('vendor_id, document_type, expiration_date');

      const { data: requirements } = await supabase
        .from('compliance_requirements')
        .select('document_type')
        .eq('is_active', true)
        .eq('is_required', true);

      const requiredTypes = requirements?.map(r => r.document_type) || [];

      const vendorsWithIssues = allVendors?.filter(v => {
        const vendorDocs = allDocs?.filter(d => d.vendor_id === v.id);
        const hasAllRequired = requiredTypes.every(type => 
          vendorDocs?.some(d => 
            d.document_type === type && 
            (!d.expiration_date || new Date(d.expiration_date) >= new Date())
          )
        );
        return !hasAllRequired;
      });

      return NextResponse.json({
        documents: documents || [],
        total: count || 0,
        vendors_with_issues: vendorsWithIssues?.length || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 });
  }
}

// POST /api/vendor-compliance - Create document or requirement
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
    const action = body.action || 'upload_document';

    if (action === 'upload_document') {
      const validated = ComplianceDocumentSchema.parse(body);

      const { data: document, error } = await supabase
        .from('vendor_compliance_documents')
        .insert({
          ...validated,
          status: 'active',
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Schedule renewal reminder if applicable
      if (validated.requires_renewal && validated.expiration_date) {
        const reminderDate = new Date(validated.expiration_date);
        reminderDate.setDate(reminderDate.getDate() - validated.renewal_reminder_days);

        await supabase.from('scheduled_notifications').insert({
          user_id: user.id,
          type: 'compliance_renewal',
          title: 'Compliance Document Expiring',
          message: `${validated.name} for vendor expires in ${validated.renewal_reminder_days} days`,
          link: `/vendors/${validated.vendor_id}/compliance`,
          scheduled_for: reminderDate.toISOString(),
          reference_type: 'compliance_document',
          reference_id: document.id,
        });
      }

      return NextResponse.json({ document }, { status: 201 });
    } else if (action === 'create_requirement') {
      const validated = ComplianceRequirementSchema.parse(body);

      const { data: requirement, error } = await supabase
        .from('compliance_requirements')
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
    } else if (action === 'request_document') {
      const { vendor_id, document_type, message, due_date } = body;

      // Get vendor contact
      const { data: vendor } = await supabase
        .from('vendors')
        .select('name, contact_email')
        .eq('id', vendor_id)
        .single();

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }

      // Create request record
      const { data: request, error } = await supabase
        .from('compliance_document_requests')
        .insert({
          vendor_id,
          document_type,
          message,
          due_date,
          status: 'sent',
          requested_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, this would send an email to the vendor
      return NextResponse.json({
        request,
        message: `Document request sent to ${vendor.name}`,
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

// PATCH /api/vendor-compliance - Update document
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: document, error } = await supabase
      .from('vendor_compliance_documents')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/vendor-compliance - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('vendor_compliance_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
