export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Layer 6 Edge Case: File upload size limits (5MB max per file, 20MB total)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total

// Layer 6 Edge Case: Duplicate detection window (24 hours)
const DUPLICATE_DETECTION_HOURS = 24;

const SubmissionSchema = z.object({
  data: z.record(z.any()),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  referrer: z.string().optional(),
  page_url: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    size: z.number().max(MAX_FILE_SIZE, 'File size exceeds 5MB limit'),
    type: z.string(),
  })).optional(),
});

// Layer 6 Edge Case: Check for duplicate submissions
async function checkDuplicateSubmission(
  formId: string,
  email: string | undefined,
  ipAddress: string
): Promise<boolean> {
  if (!email) return false;

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - DUPLICATE_DETECTION_HOURS);

  const { data } = await supabase
    .from('lead_form_submissions')
    .select('id')
    .eq('form_id', formId)
    .gte('created_at', cutoffTime.toISOString())
    .or(`data->email.eq.${email},ip_address.eq.${ipAddress}`)
    .limit(1);

  return (data?.length || 0) > 0;
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
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

    const { id } = params;
    const body = await request.json();
    const validatedData = SubmissionSchema.parse(body);

    // Get IP and user agent from headers (moved up for duplicate check)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Layer 6 Edge Case: Check total file size
    if (validatedData.files && validatedData.files.length > 0) {
      const totalSize = validatedData.files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: 'Total file size exceeds 20MB limit' },
          { status: 400 }
        );
      }
    }

    // Layer 6 Edge Case: Check for duplicate submission
    const formDataEmail = validatedData.data?.email as string | undefined;
    const isDuplicate = await checkDuplicateSubmission(id, formDataEmail, ip);
    if (isDuplicate) {
      return NextResponse.json(
        { 
          error: 'Duplicate submission detected',
          message: 'It looks like you have already submitted this form recently. Please wait before submitting again.'
        },
        { status: 429 }
      );
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('lead_capture_forms')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    // Get user agent (IP already captured above for duplicate check)
    const userAgent = request.headers.get('user-agent') || '';

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('lead_form_submissions')
      .insert({
        form_id: id,
        data: validatedData.data,
        utm_source: validatedData.utm_source,
        utm_medium: validatedData.utm_medium,
        utm_campaign: validatedData.utm_campaign,
        utm_params: {
          utm_source: validatedData.utm_source,
          utm_medium: validatedData.utm_medium,
          utm_campaign: validatedData.utm_campaign,
        },
        referrer: validatedData.referrer,
        ip_address: ip,
        user_agent: userAgent,
        source: 'web_form',
      })
      .select()
      .single();

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 });
    }

    // Auto-create lead if form settings allow
    const settings = form.settings || {};
    const formData = validatedData.data;
    
    // Create lead from submission
    const leadData = {
      organization_id: form.organization_id,
      contact_id: null,
      source: settings.default_lead_source || 'website',
      source_detail: `Form: ${form.name}`,
      status: 'new',
      title: formData.event_type || formData.inquiry_type || 'Website Inquiry',
      description: formData.message || formData.notes || '',
      event_type: formData.event_type,
      event_date: formData.event_date || null,
      guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
      assigned_to: settings.default_assigned_to || null,
      metadata: {
        form_submission_id: submission.id,
        form_name: form.name,
        submitted_data: formData,
      },
    };

    const { data: lead, error: leadError } = await supabase
      .from('contacts')
      .insert(leadData)
      .select()
      .single();

    if (leadError) {
      // Continue - submission saved successfully, lead creation is optional
    }

    if (lead) {
      // Update submission with lead_id
      await supabase
        .from('lead_form_submissions')
        .update({ lead_id: lead.id })
        .eq('id', submission.id);

      // Create or find contact
      if (formData.email) {
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('organization_id', form.organization_id)
          .eq('email', formData.email)
          .single();

        if (existingContact) {
          await supabase
            .from('contacts')
            .update({ contact_id: existingContact.id })
            .eq('id', lead.id);
        } else {
          const { data: newContact } = await supabase
            .from('contacts')
            .insert({
              organization_id: form.organization_id,
              first_name: formData.first_name || formData.name?.split(' ')[0] || '',
              last_name: formData.last_name || formData.name?.split(' ').slice(1).join(' ') || '',
              email: formData.email,
              phone: formData.phone || null,
              company: formData.company || formData.organization || null,
              source: 'lead_form',
            })
            .select()
            .single();

          if (newContact) {
            await supabase
              .from('contacts')
              .update({ contact_id: newContact.id })
              .eq('id', lead.id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: settings.success_message || 'Thank you for your inquiry!',
      redirect_url: form.redirect_url,
      submission_id: submission.id,
      lead_id: lead?.id,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
