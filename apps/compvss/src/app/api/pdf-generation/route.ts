export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const generatePdfSchema = z.object({
  action: z.literal('generate'),
  document_id: z.string().uuid(),
  document_type: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  options: z.record(z.unknown()).optional(),
});

const batchGenerateSchema = z.object({
  action: z.literal('batch_generate'),
  document_ids: z.array(z.string().uuid()),
  options: z.record(z.unknown()).optional(),
});

const generateReportSchema = z.object({
  action: z.literal('generate_report'),
  report_type: z.string(),
  filters: z.record(z.unknown()).optional(),
  title: z.string().optional(),
});

const pdfActionSchema = z.union([generatePdfSchema, batchGenerateSchema, generateReportSchema]);

// Downloadable PDF generation
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
    const documentId = searchParams.get('document_id');

    if (!documentId) return NextResponse.json({ error: 'document_id required' }, { status: 400 });

    // Get generated PDFs for document
    const { data, error } = await supabase.from('generated_pdfs').select('*')
      .eq('document_id', documentId).order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ pdfs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const validatedData = pdfActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'generate') {
      const { document_id, document_type, title, content, options } = validatedData as z.infer<typeof generatePdfSchema>;

      // Create PDF generation job
      const { data, error } = await supabase.from('generated_pdfs').insert({
        document_id, document_type, title, content, status: 'processing',
        options: options || {}, requested_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // In production, this would trigger a PDF generation service
      // For now, simulate completion
      const pdfUrl = `/api/pdf-generation/download/${data.id}`;

      await supabase.from('generated_pdfs').update({
        status: 'completed', pdf_url: pdfUrl, completed_at: new Date().toISOString()
      }).eq('id', data.id);

      return NextResponse.json({ pdf: { ...data, pdf_url: pdfUrl } }, { status: 201 });
    }

    if (action === 'batch_generate') {
      const { document_ids, options } = validatedData as z.infer<typeof batchGenerateSchema>;

      const jobs = await Promise.all(document_ids.map(async (docId: string) => {
        const { data } = await supabase.from('generated_pdfs').insert({
          document_id: docId, status: 'queued', options: options || {}, requested_by: user.id
        }).select().single();
        return data;
      }));

      return NextResponse.json({ jobs }, { status: 201 });
    }

    if (action === 'generate_report') {
      const { report_type, filters, title } = validatedData as z.infer<typeof generateReportSchema>;

      const { data, error } = await supabase.from('generated_pdfs').insert({
        document_type: 'report', title, status: 'processing',
        options: { report_type, filters }, requested_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      return NextResponse.json({ job: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
