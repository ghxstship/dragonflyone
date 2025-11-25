import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DocumentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  document_type: z.enum(['contract', 'agreement', 'nda', 'sow', 'invoice', 'proposal', 'other']),
  file_url: z.string(),
  project_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  signers: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.string().optional(),
    order: z.number().default(1),
  })),
  fields: z.array(z.object({
    field_type: z.enum(['signature', 'initials', 'date', 'text', 'checkbox']),
    page: z.number(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    signer_index: z.number(),
    required: z.boolean().default(true),
  })).optional(),
  expiration_date: z.string().optional(),
  reminder_days: z.number().default(3),
});

// GET /api/documents/e-signature - Get documents and signature status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const action = searchParams.get('action');
    const status = searchParams.get('status');

    if (action === 'pending_signatures') {
      // Get documents pending user's signature
      const { data: pending } = await supabase
        .from('document_signers')
        .select(`
          *,
          document:documents(id, title, document_type, created_at, expiration_date)
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      return NextResponse.json({ pending: pending || [] });
    }

    if (action === 'audit_trail' && documentId) {
      const { data: auditTrail } = await supabase
        .from('document_audit_trail')
        .select('*')
        .eq('document_id', documentId)
        .order('timestamp', { ascending: true });

      return NextResponse.json({ audit_trail: auditTrail || [] });
    }

    if (documentId) {
      const { data: document } = await supabase
        .from('documents')
        .select(`
          *,
          signers:document_signers(*),
          fields:document_fields(*)
        `)
        .eq('id', documentId)
        .single();

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      return NextResponse.json({ document });
    }

    // List documents
    let query = supabase
      .from('documents')
      .select(`
        *,
        signers:document_signers(email, name, status, signed_at)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: documents } = await query;

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents/e-signature - Create document or sign
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = DocumentSchema.parse(body);

      // Create document
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          title: validated.title,
          description: validated.description,
          document_type: validated.document_type,
          file_url: validated.file_url,
          project_id: validated.project_id,
          deal_id: validated.deal_id,
          expiration_date: validated.expiration_date,
          reminder_days: validated.reminder_days,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create signers
      const signerRecords = validated.signers.map((signer, index) => ({
        document_id: document.id,
        email: signer.email,
        name: signer.name,
        role: signer.role,
        signing_order: signer.order || index + 1,
        status: 'pending',
        access_token: generateAccessToken(),
      }));

      await supabase.from('document_signers').insert(signerRecords);

      // Create fields if provided
      if (validated.fields && validated.fields.length > 0) {
        const fieldRecords = validated.fields.map(field => ({
          document_id: document.id,
          ...field,
        }));

        await supabase.from('document_fields').insert(fieldRecords);
      }

      // Log audit trail
      await logAuditEvent(document.id, 'document_created', user.id, {
        title: validated.title,
        signers_count: validated.signers.length,
      });

      return NextResponse.json({ document }, { status: 201 });
    } else if (action === 'send') {
      const { document_id } = body;

      // Update document status
      await supabase
        .from('documents')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', document_id);

      // Get signers
      const { data: signers } = await supabase
        .from('document_signers')
        .select('*')
        .eq('document_id', document_id)
        .order('signing_order');

      // Send notifications to first signer(s)
      const firstOrder = signers?.[0]?.signing_order || 1;
      const firstSigners = signers?.filter(s => s.signing_order === firstOrder) || [];

      for (const signer of firstSigners) {
        // Get user by email
        const { data: signerUser } = await supabase
          .from('platform_users')
          .select('id')
          .eq('email', signer.email)
          .single();

        if (signerUser) {
          await supabase.from('unified_notifications').insert({
            user_id: signerUser.id,
            title: 'Document Signature Required',
            message: `Please sign: ${body.document_title || 'Document'}`,
            type: 'action_required',
            priority: 'high',
            source_platform: 'atlvs',
            source_entity_type: 'document',
            source_entity_id: document_id,
            link: `/documents/sign/${document_id}?token=${signer.access_token}`,
          });
        }

        // In production, also send email
      }

      await logAuditEvent(document_id, 'document_sent', user.id, {
        recipients: firstSigners.map(s => s.email),
      });

      return NextResponse.json({ success: true, sent_to: firstSigners.length });
    } else if (action === 'sign') {
      const { document_id, access_token, signature_data, field_values } = body;

      // Verify access token
      const { data: signer } = await supabase
        .from('document_signers')
        .select('*')
        .eq('document_id', document_id)
        .eq('access_token', access_token)
        .eq('status', 'pending')
        .single();

      if (!signer) {
        return NextResponse.json({ error: 'Invalid or expired signing link' }, { status: 403 });
      }

      // Generate signature hash
      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ signature_data, timestamp: Date.now(), email: signer.email }))
        .digest('hex');

      // Update signer record
      await supabase
        .from('document_signers')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signature_data,
          signature_hash: signatureHash,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        })
        .eq('id', signer.id);

      // Save field values
      if (field_values) {
        for (const [fieldId, value] of Object.entries(field_values)) {
          await supabase
            .from('document_fields')
            .update({ value })
            .eq('id', fieldId);
        }
      }

      // Log audit event
      await logAuditEvent(document_id, 'document_signed', null, {
        signer_email: signer.email,
        signer_name: signer.name,
        signature_hash: signatureHash,
      });

      // Check if all signers have signed
      const { data: allSigners } = await supabase
        .from('document_signers')
        .select('status, signing_order')
        .eq('document_id', document_id);

      const allSigned = allSigners?.every(s => s.status === 'signed');

      if (allSigned) {
        // Complete document
        await supabase
          .from('documents')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', document_id);

        await logAuditEvent(document_id, 'document_completed', null, {});
      } else {
        // Notify next signer
        const pendingSigners = allSigners?.filter(s => s.status === 'pending') || [];
        if (pendingSigners.length > 0) {
          const nextOrder = Math.min(...pendingSigners.map(s => s.signing_order));
          const nextSigners = await supabase
            .from('document_signers')
            .select('*')
            .eq('document_id', document_id)
            .eq('signing_order', nextOrder)
            .eq('status', 'pending');

          // Send notifications to next signers
          for (const nextSigner of nextSigners.data || []) {
            const { data: nextUser } = await supabase
              .from('platform_users')
              .select('id')
              .eq('email', nextSigner.email)
              .single();

            if (nextUser) {
              await supabase.from('unified_notifications').insert({
                user_id: nextUser.id,
                title: 'Document Ready for Your Signature',
                message: 'A document is now ready for your signature',
                type: 'action_required',
                priority: 'high',
                source_platform: 'atlvs',
                source_entity_type: 'document',
                source_entity_id: document_id,
              });
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        document_status: allSigned ? 'completed' : 'pending',
      });
    } else if (action === 'decline') {
      const { document_id, access_token, reason } = body;

      // Verify access token
      const { data: signer } = await supabase
        .from('document_signers')
        .select('*')
        .eq('document_id', document_id)
        .eq('access_token', access_token)
        .single();

      if (!signer) {
        return NextResponse.json({ error: 'Invalid signing link' }, { status: 403 });
      }

      // Update signer and document
      await supabase
        .from('document_signers')
        .update({
          status: 'declined',
          decline_reason: reason,
        })
        .eq('id', signer.id);

      await supabase
        .from('documents')
        .update({ status: 'declined' })
        .eq('id', document_id);

      await logAuditEvent(document_id, 'document_declined', null, {
        signer_email: signer.email,
        reason,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'void') {
      const { document_id, reason } = body;

      await supabase
        .from('documents')
        .update({
          status: 'voided',
          void_reason: reason,
          voided_at: new Date().toISOString(),
          voided_by: user.id,
        })
        .eq('id', document_id);

      await logAuditEvent(document_id, 'document_voided', user.id, { reason });

      return NextResponse.json({ success: true });
    } else if (action === 'send_reminder') {
      const { document_id } = body;

      const { data: pendingSigners } = await supabase
        .from('document_signers')
        .select('*')
        .eq('document_id', document_id)
        .eq('status', 'pending');

      for (const signer of pendingSigners || []) {
        const { data: signerUser } = await supabase
          .from('platform_users')
          .select('id')
          .eq('email', signer.email)
          .single();

        if (signerUser) {
          await supabase.from('unified_notifications').insert({
            user_id: signerUser.id,
            title: 'Signature Reminder',
            message: 'You have a document waiting for your signature',
            type: 'action_required',
            priority: 'high',
            source_platform: 'atlvs',
            source_entity_type: 'document',
            source_entity_id: document_id,
          });
        }
      }

      await logAuditEvent(document_id, 'reminder_sent', user.id, {
        recipients: pendingSigners?.map(s => s.email) || [],
      });

      return NextResponse.json({ success: true, reminders_sent: pendingSigners?.length || 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper functions
function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function logAuditEvent(documentId: string, eventType: string, userId: string | null, metadata: any) {
  await supabase.from('document_audit_trail').insert({
    document_id: documentId,
    event_type: eventType,
    user_id: userId,
    metadata,
    timestamp: new Date().toISOString(),
  });
}
