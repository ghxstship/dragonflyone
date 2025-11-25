import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EmailAccountSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'exchange', 'imap']),
  email_address: z.string().email(),
  display_name: z.string().optional(),
  auto_log: z.boolean().default(true),
  sync_contacts: z.boolean().default(true),
  sync_calendar: z.boolean().default(false),
});

const EmailLogSchema = z.object({
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  subject: z.string(),
  body_preview: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']),
  from_email: z.string().email(),
  to_emails: z.array(z.string().email()),
  cc_emails: z.array(z.string().email()).optional(),
  sent_at: z.string(),
  thread_id: z.string().optional(),
  message_id: z.string().optional(),
  has_attachments: z.boolean().default(false),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string().optional(),
  })).optional(),
});

// GET /api/email-integration - Get email accounts and logs
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
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's connected email accounts
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Get email logs
    let query = supabase
      .from('email_logs')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, company),
        deal:deals(id, name, stage),
        project:projects(id, name)
      `, { count: 'exact' })
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,body_preview.ilike.%${search}%,from_email.ilike.%${search}%`);
    }

    const { data: emails, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by thread if thread_id exists
    const threads: Record<string, any[]> = {};
    emails?.forEach(email => {
      const threadId = email.thread_id || email.id;
      if (!threads[threadId]) {
        threads[threadId] = [];
      }
      threads[threadId].push(email);
    });

    return NextResponse.json({
      accounts: accounts || [],
      emails: emails || [],
      threads: Object.values(threads),
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email data' }, { status: 500 });
  }
}

// POST /api/email-integration - Connect account or log email
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
    const action = body.action || 'log_email';

    if (action === 'connect_account') {
      const validated = EmailAccountSchema.parse(body);

      // In production, this would initiate OAuth flow
      const { data: account, error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.id,
          provider: validated.provider,
          email_address: validated.email_address,
          display_name: validated.display_name,
          auto_log: validated.auto_log,
          sync_contacts: validated.sync_contacts,
          sync_calendar: validated.sync_calendar,
          is_active: true,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        account,
        oauth_url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/email-integration/callback&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly`,
      }, { status: 201 });
    } else if (action === 'log_email') {
      const validated = EmailLogSchema.parse(body);

      // Auto-match contact if not provided
      let contactId = validated.contact_id;
      if (!contactId) {
        const emailToMatch = validated.direction === 'inbound' ? validated.from_email : validated.to_emails[0];
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('email', emailToMatch)
          .single();
        
        if (contact) {
          contactId = contact.id;
        }
      }

      const { data: emailLog, error } = await supabase
        .from('email_logs')
        .insert({
          user_id: user.id,
          contact_id: contactId,
          deal_id: validated.deal_id,
          project_id: validated.project_id,
          subject: validated.subject,
          body_preview: validated.body_preview,
          direction: validated.direction,
          from_email: validated.from_email,
          to_emails: validated.to_emails,
          cc_emails: validated.cc_emails,
          sent_at: validated.sent_at,
          thread_id: validated.thread_id,
          message_id: validated.message_id,
          has_attachments: validated.has_attachments,
          attachments: validated.attachments,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update contact's last_contacted_at
      if (contactId) {
        await supabase
          .from('contacts')
          .update({ last_contacted_at: validated.sent_at })
          .eq('id', contactId);
      }

      return NextResponse.json({ email: emailLog }, { status: 201 });
    } else if (action === 'sync_emails') {
      // Trigger email sync for connected accounts
      const { account_id } = body;

      // In production, this would fetch emails from provider API
      // For now, return success
      return NextResponse.json({ 
        success: true,
        message: 'Email sync initiated',
        account_id,
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

// DELETE /api/email-integration - Disconnect account
export async function DELETE(request: NextRequest) {
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
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('email_accounts')
      .update({ 
        is_active: false,
        disconnected_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
  }
}
