import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const DocumentSchema = z.object({
  name: z.string().min(1),
  document_type: z.enum(['contract', 'insurance', 'license', 'permit', 'policy', 'report', 'invoice', 'proposal', 'agreement', 'other']),
  folder_id: z.string().uuid().optional(),
  folder_path: z.string().optional(),
  description: z.string().optional(),
  file_url: z.string().url().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related_entity_type: z.string().optional(),
  related_entity_id: z.string().uuid().optional(),
  expiration_date: z.string().optional(),
  is_template: z.boolean().default(false),
});

// GET /api/documents - List documents
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');
    const documentType = searchParams.get('document_type');
    const status = searchParams.get('status');
    const relatedEntityType = searchParams.get('related_entity_type');
    const relatedEntityId = searchParams.get('related_entity_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('documents')
      .select(`
        *,
        uploaded_by_user:platform_users!uploaded_by(id, full_name),
        folder:document_folders(id, name, path),
        versions:document_versions(id, version_number, file_url, created_at)
      `)
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }
    if (documentType) {
      query = query.eq('document_type', documentType);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (relatedEntityType && relatedEntityId) {
      query = query.eq('related_entity_type', relatedEntityType).eq('related_entity_id', relatedEntityId);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }

    interface DocumentRecord {
      id: string;
      status: string;
      document_type: string;
      file_size: number;
      [key: string]: unknown;
    }
    const documents = (data || []) as unknown as DocumentRecord[];

    const summary = {
      total: documents.length,
      by_type: documents.reduce((acc, d) => {
        acc[d.document_type] = (acc[d.document_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: {
        active: documents.filter(d => d.status === 'active').length,
        archived: documents.filter(d => d.status === 'archived').length,
        draft: documents.filter(d => d.status === 'draft').length,
      },
      total_size: documents.reduce((sum, d) => sum + (d.file_size || 0), 0),
    };

    return NextResponse.json({ documents: data, summary });
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents - Create document
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = DocumentSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        organization_id: organizationId,
        ...validated,
        uploaded_by: userId,
        status: 'active',
        version: 1,
      })
      .select(`
        *,
        uploaded_by_user:platform_users!uploaded_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json(
        { error: 'Failed to create document', details: error.message },
        { status: 500 }
      );
    }

    // Create initial version record
    await supabase.from('document_versions').insert({
      document_id: document.id,
      version_number: 1,
      file_url: validated.file_url,
      file_size: validated.file_size,
      uploaded_by: userId,
      change_notes: 'Initial version',
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/documents - Update documents
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { document_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!document_id) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'archive') {
      updateData.status = 'archived';
    } else if (action === 'restore') {
      updateData.status = 'active';
    } else if (action === 'new_version') {
      // Get current version
      const { data: current } = await supabase
        .from('documents')
        .select('version')
        .eq('id', document_id)
        .single();

      const newVersion = (current?.version || 0) + 1;
      updateData.version = newVersion;
      updateData.file_url = updates?.file_url;
      updateData.file_size = updates?.file_size;

      // Create version record
      await supabase.from('document_versions').insert({
        document_id,
        version_number: newVersion,
        file_url: updates?.file_url,
        file_size: updates?.file_size,
        uploaded_by: userId,
        change_notes: updates?.change_notes,
      });
    } else if (updates) {
      updateData = { ...updateData, ...updates };
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', document_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, document: data });
  } catch (error) {
    console.error('Error in PATCH /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents - Delete document
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete document', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
