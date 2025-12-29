export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const generateSchema = z.object({
  project_id: z.string().uuid(),
  action: z.literal('generate'),
  format: z.enum(['pdf', 'html', 'docx']).optional(),
});

const distributeSchema = z.object({
  project_id: z.string().uuid(),
  action: z.literal('distribute'),
  recipients: z.array(z.object({
    user_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
  })),
});

const productionBookActionSchema = z.union([generateSchema, distributeSchema]);

// Production book generation and distribution
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    // Gather all production book data
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: schedule } = await supabase.from('schedules').select('*').eq('project_id', projectId);
    const { data: crew } = await supabase.from('crew_assignments').select('*, crew:platform_users(*)').eq('project_id', projectId);
    const { data: equipment } = await supabase.from('equipment_assignments').select('*, equipment:equipment(*)').eq('project_id', projectId);
    const { data: contacts } = await supabase.from('project_contacts').select('*').eq('project_id', projectId);
    const { data: runOfShow } = await supabase.from('run_of_show').select('*').eq('project_id', projectId);

    const productionBook = {
      project,
      schedule,
      crew,
      equipment,
      contacts,
      run_of_show: runOfShow,
      generated_at: new Date().toISOString()
    };

    return NextResponse.json({ production_book: productionBook });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate production book' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = productionBookActionSchema.parse(body);
    const { project_id, action } = validatedData;

    if (action === 'generate') {
      const { format } = validatedData as z.infer<typeof generateSchema>;
      // Generate and store production book
      const { data, error } = await supabase.from('production_books').insert({
        project_id, generated_by: user.id, format: format || 'pdf',
        status: 'generating', generated_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // In production, trigger PDF generation job
      return NextResponse.json({ book: data, message: 'Generation started' }, { status: 201 });
    }

    if (action === 'distribute') {
      const { recipients } = validatedData as z.infer<typeof distributeSchema>;
      // Distribute to recipients
      const { data: book } = await supabase.from('production_books').select('*')
        .eq('project_id', project_id).order('generated_at', { ascending: false }).limit(1).single();

      if (!book) return NextResponse.json({ error: 'No production book found' }, { status: 404 });

      // Create distribution records
      const distributions = recipients.map((r) => ({
        book_id: book.id, recipient_id: r.user_id, recipient_email: r.email,
        sent_at: new Date().toISOString(), status: 'sent'
      }));

      await supabase.from('book_distributions').insert(distributions);

      // Send notifications
      for (const r of recipients) {
        await supabase.from('notifications').insert({
          user_id: r.user_id, type: 'production_book',
          title: 'Production Book Available',
          message: 'A new production book has been shared with you.',
          reference_id: book.id
        });
      }

      return NextResponse.json({ success: true, distributed_to: recipients.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
