export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SubmissionSchema = z.object({
  data: z.record(z.any()),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = SubmissionSchema.parse(body);

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

    // Get IP and user agent from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
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
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (leadError) {
      console.error('Failed to create lead from submission:', leadError.message);
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
            .from('leads')
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
              .from('leads')
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
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
