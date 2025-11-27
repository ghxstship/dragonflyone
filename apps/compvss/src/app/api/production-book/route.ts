import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Production book generation and distribution
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, action, recipients, format } = body;

    if (action === 'generate') {
      // Generate and store production book
      const { data, error } = await supabase.from('production_books').insert({
        project_id, generated_by: user.id, format: format || 'pdf',
        status: 'generating', generated_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // In production, trigger PDF generation job
      return NextResponse.json({ book: data, message: 'Generation started' }, { status: 201 });
    }

    if (action === 'distribute') {
      // Distribute to recipients
      const { data: book } = await supabase.from('production_books').select('*')
        .eq('project_id', project_id).order('generated_at', { ascending: false }).limit(1).single();

      if (!book) return NextResponse.json({ error: 'No production book found' }, { status: 404 });

      // Create distribution records
      const distributions = recipients.map((r: any) => ({
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
