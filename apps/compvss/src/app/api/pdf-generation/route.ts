import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Downloadable PDF generation
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) return NextResponse.json({ error: 'document_id required' }, { status: 400 });

    // Get generated PDFs for document
    const { data, error } = await supabase.from('generated_pdfs').select('*')
      .eq('document_id', documentId).order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ pdfs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const { action } = body;

    if (action === 'generate') {
      const { document_id, document_type, title, content, options } = body;

      // Create PDF generation job
      const { data, error } = await supabase.from('generated_pdfs').insert({
        document_id, document_type, title, status: 'processing',
        options: options || {}, requested_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // In production, this would trigger a PDF generation service
      // For now, simulate completion
      const pdfUrl = `/api/pdf-generation/download/${data.id}`;

      await supabase.from('generated_pdfs').update({
        status: 'completed', pdf_url: pdfUrl, completed_at: new Date().toISOString()
      }).eq('id', data.id);

      return NextResponse.json({ pdf: { ...data, pdf_url: pdfUrl } }, { status: 201 });
    }

    if (action === 'batch_generate') {
      const { document_ids, options } = body;

      const jobs = await Promise.all(document_ids.map(async (docId: string) => {
        const { data } = await supabase.from('generated_pdfs').insert({
          document_id: docId, status: 'queued', options: options || {}, requested_by: user.id
        }).select().single();
        return data;
      }));

      return NextResponse.json({ jobs }, { status: 201 });
    }

    if (action === 'generate_report') {
      const { report_type, filters, title } = body;

      const { data, error } = await supabase.from('generated_pdfs').insert({
        document_type: 'report', title, status: 'processing',
        options: { report_type, filters }, requested_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ job: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
