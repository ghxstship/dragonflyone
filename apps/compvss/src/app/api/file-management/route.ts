import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FileSchema = z.object({
  project_id: z.string().uuid(),
  folder_id: z.string().uuid().optional(),
  name: z.string(),
  type: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  mime_type: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_stakeholder_visible: z.boolean().default(false),
});

const FolderSchema = z.object({
  project_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/file-management - Get files and folders
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const folderId = searchParams.get('folder_id');
    const fileId = searchParams.get('file_id');
    const search = searchParams.get('search');
    const fileType = searchParams.get('type');

    if (fileId) {
      // Get specific file with versions
      const { data: file, error } = await supabase
        .from('project_documents')
        .select(`
          *,
          versions:document_versions(*),
          uploaded_by_user:platform_users!project_documents_uploaded_by_fkey(first_name, last_name)
        `)
        .eq('id', fileId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ file });
    } else if (projectId) {
      // Get folders
      let foldersQuery = supabase
        .from('project_folders')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (folderId) {
        foldersQuery = foldersQuery.eq('parent_id', folderId);
      } else {
        foldersQuery = foldersQuery.is('parent_id', null);
      }

      const { data: folders } = await foldersQuery;

      // Get files
      let filesQuery = supabase
        .from('project_documents')
        .select(`
          *,
          uploaded_by_user:platform_users!project_documents_uploaded_by_fkey(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (folderId) {
        filesQuery = filesQuery.eq('folder_id', folderId);
      } else {
        filesQuery = filesQuery.is('folder_id', null);
      }

      if (search) {
        filesQuery = filesQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (fileType) {
        filesQuery = filesQuery.eq('type', fileType);
      }

      const { data: files } = await filesQuery;

      // Get folder path (breadcrumb)
      type FolderBreadcrumb = { id: string; name: string; parent_id: string | null };
      let breadcrumb: FolderBreadcrumb[] = [];
      if (folderId) {
        let currentFolderId: string | null = folderId;
        while (currentFolderId) {
          const { data: folderData } = await supabase
            .from('project_folders')
            .select('id, name, parent_id')
            .eq('id', currentFolderId)
            .single() as { data: FolderBreadcrumb | null };
          
          if (folderData) {
            breadcrumb.unshift(folderData);
            currentFolderId = folderData.parent_id;
          } else {
            break;
          }
        }
      }

      // Get storage stats
      const { data: allFiles } = await supabase
        .from('project_documents')
        .select('size')
        .eq('project_id', projectId);

      const totalSize = allFiles?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
      const fileCount = allFiles?.length || 0;

      return NextResponse.json({
        folders: folders || [],
        files: files || [],
        breadcrumb,
        stats: {
          total_files: fileCount,
          total_size: totalSize,
          total_size_formatted: formatBytes(totalSize),
        },
      });
    }

    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

// POST /api/file-management - Create file or folder
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
    const action = body.action || 'upload_file';

    if (action === 'upload_file') {
      const validated = FileSchema.parse(body);

      // Check for existing file with same name in folder
      const { data: existing } = await supabase
        .from('project_documents')
        .select('id, version')
        .eq('project_id', validated.project_id)
        .eq('folder_id', validated.folder_id || null)
        .eq('name', validated.name)
        .single();

      if (existing) {
        // Create new version
        const newVersion = (existing.version || 1) + 1;

        // Save current version to history
        await supabase.from('document_versions').insert({
          document_id: existing.id,
          version: existing.version || 1,
          url: body.previous_url,
          size: body.previous_size,
          created_by: user.id,
        });

        // Update document
        const { data: file, error } = await supabase
          .from('project_documents')
          .update({
            url: validated.url,
            size: validated.size,
            version: newVersion,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ file, version: newVersion, is_update: true });
      } else {
        // Create new file
        const { data: file, error } = await supabase
          .from('project_documents')
          .insert({
            ...validated,
            version: 1,
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ file }, { status: 201 });
      }
    } else if (action === 'create_folder') {
      const validated = FolderSchema.parse(body);

      const { data: folder, error } = await supabase
        .from('project_folders')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ folder }, { status: 201 });
    } else if (action === 'copy') {
      const { file_id, destination_folder_id, destination_project_id } = body;

      const { data: originalFile } = await supabase
        .from('project_documents')
        .select('*')
        .eq('id', file_id)
        .single();

      if (!originalFile) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const { data: copiedFile, error } = await supabase
        .from('project_documents')
        .insert({
          project_id: destination_project_id || originalFile.project_id,
          folder_id: destination_folder_id,
          name: `Copy of ${originalFile.name}`,
          type: originalFile.type,
          size: originalFile.size,
          url: originalFile.url,
          mime_type: originalFile.mime_type,
          description: originalFile.description,
          tags: originalFile.tags,
          version: 1,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ file: copiedFile }, { status: 201 });
    } else if (action === 'move') {
      const { file_id, destination_folder_id } = body;

      const { data: file, error } = await supabase
        .from('project_documents')
        .update({
          folder_id: destination_folder_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ file });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/file-management - Update file or folder
export async function PATCH(request: NextRequest) {
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
    const fileId = searchParams.get('file_id');
    const folderId = searchParams.get('folder_id');

    const body = await request.json();

    if (fileId) {
      const { data: file, error } = await supabase
        .from('project_documents')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', fileId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ file });
    } else if (folderId) {
      const { data: folder, error } = await supabase
        .from('project_folders')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', folderId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ folder });
    }

    return NextResponse.json({ error: 'File ID or Folder ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/file-management - Delete file or folder
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('file_id');
    const folderId = searchParams.get('folder_id');

    if (fileId) {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', fileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'File deleted' });
    } else if (folderId) {
      // Check if folder has contents
      const { data: files } = await supabase
        .from('project_documents')
        .select('id')
        .eq('folder_id', folderId)
        .limit(1);

      const { data: subfolders } = await supabase
        .from('project_folders')
        .select('id')
        .eq('parent_id', folderId)
        .limit(1);

      if ((files && files.length > 0) || (subfolders && subfolders.length > 0)) {
        return NextResponse.json({ error: 'Folder is not empty' }, { status: 400 });
      }

      const { error } = await supabase
        .from('project_folders')
        .delete()
        .eq('id', folderId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Folder deleted' });
    }

    return NextResponse.json({ error: 'File ID or Folder ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
