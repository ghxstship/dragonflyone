/**
 * Document Management System
 * File uploads, versioning, access control, and metadata management
 */

import { createClient } from '@supabase/supabase-js';

export type DocumentType =
  | 'contract'
  | 'invoice'
  | 'receipt'
  | 'agreement'
  | 'report'
  | 'presentation'
  | 'spreadsheet'
  | 'image'
  | 'video'
  | 'audio'
  | 'other';

export type AccessLevel = 'private' | 'team' | 'organization' | 'public';

export interface Document {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentType;
  entity_type?: string;
  entity_id?: string;
  version: number;
  parent_id?: string;
  access_level: AccessLevel;
  tags: string[];
  metadata: Record<string, any>;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_path: string;
  file_size: number;
  change_summary?: string;
  uploaded_by: string;
  created_at: string;
}

/**
 * Document Manager
 * Handles document uploads, versioning, and access control
 */
export class DocumentManager {
  constructor(
    private supabase: ReturnType<typeof createClient>,
    private storageBucket: string = 'documents'
  ) {}

  /**
   * Upload a new document
   */
  async uploadDocument(
    file: File,
    metadata: {
      name: string;
      description?: string;
      documentType: DocumentType;
      entityType?: string;
      entityId?: string;
      accessLevel?: AccessLevel;
      tags?: string[];
      customMetadata?: Record<string, any>;
      userId: string;
    }
  ): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${metadata.userId}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Create document record
      const { data, error } = await this.supabase
        .from('documents')
        .insert({
          name: metadata.name,
          description: metadata.description,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          document_type: metadata.documentType,
          entity_type: metadata.entityType,
          entity_id: metadata.entityId,
          version: 1,
          access_level: metadata.accessLevel || 'private',
          tags: metadata.tags || [],
          metadata: metadata.customMetadata || {},
          uploaded_by: metadata.userId,
        })
        .select()
        .single();

      if (error) {
        // Cleanup uploaded file
        await this.supabase.storage.from(this.storageBucket).remove([filePath]);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        document: {
          id: data.id,
          name: data.name,
          description: data.description,
          file_path: data.file_path,
          file_size: data.file_size,
          mime_type: data.mime_type,
          document_type: data.document_type,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          version: data.version,
          parent_id: data.parent_id,
          access_level: data.access_level,
          tags: data.tags,
          metadata: data.metadata,
          uploaded_by: data.uploaded_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload new version of existing document
   */
  async uploadVersion(
    documentId: string,
    file: File,
    changeSummary: string,
    userId: string
  ): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      // Get existing document
      const { data: existingDoc, error: fetchError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !existingDoc) {
        return { success: false, error: 'Document not found' };
      }

      // Generate file path for new version
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${timestamp}_v${existingDoc.version + 1}_${sanitizedName}`;

      // Upload new file
      const { error: uploadError } = await this.supabase.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Archive old version
      await this.supabase.from('document_versions').insert({
        document_id: documentId,
        version: existingDoc.version,
        file_path: existingDoc.file_path,
        file_size: existingDoc.file_size,
        change_summary: changeSummary,
        uploaded_by: userId,
      });

      // Update document with new version
      const { data, error } = await this.supabase
        .from('documents')
        .update({
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          version: existingDoc.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        // Cleanup uploaded file
        await this.supabase.storage.from(this.storageBucket).remove([filePath]);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        document: {
          id: data.id,
          name: data.name,
          description: data.description,
          file_path: data.file_path,
          file_size: data.file_size,
          mime_type: data.mime_type,
          document_type: data.document_type,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          version: data.version,
          parent_id: data.parent_id,
          access_level: data.access_level,
          tags: data.tags,
          metadata: data.metadata,
          uploaded_by: data.uploaded_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get document with signed URL
   */
  async getDocument(
    documentId: string
  ): Promise<{ document?: Document; downloadUrl?: string; error?: string }> {
    const { data: doc, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !doc) {
      return { error: 'Document not found' };
    }

    // Generate signed URL (expires in 1 hour)
    const { data: urlData, error: urlError } = await this.supabase.storage
      .from(this.storageBucket)
      .createSignedUrl(doc.file_path, 3600);

    if (urlError) {
      return { error: urlError.message };
    }

    return {
      document: {
        id: doc.id,
        name: doc.name,
        description: doc.description,
        file_path: doc.file_path,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        document_type: doc.document_type,
        entity_type: doc.entity_type,
        entity_id: doc.entity_id,
        version: doc.version,
        parent_id: doc.parent_id,
        access_level: doc.access_level,
        tags: doc.tags,
        metadata: doc.metadata,
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      },
      downloadUrl: urlData.signedUrl,
    };
  }

  /**
   * Get documents for an entity
   */
  async getEntityDocuments(entityType: string, entityId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      file_path: doc.file_path,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      document_type: doc.document_type,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
      version: doc.version,
      parent_id: doc.parent_id,
      access_level: doc.access_level,
      tags: doc.tags,
      metadata: doc.metadata,
      uploaded_by: doc.uploaded_by,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
  }

  /**
   * Get document versions
   */
  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await this.supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((v: any) => ({
      id: v.id,
      document_id: v.document_id,
      version: v.version,
      file_path: v.file_path,
      file_size: v.file_size,
      change_summary: v.change_summary,
      uploaded_by: v.uploaded_by,
      created_at: v.created_at,
    }));
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<Pick<Document, 'name' | 'description' | 'tags' | 'access_level' | 'metadata'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // Get document
      const { data: doc, error: fetchError } = await this.supabase
        .from('documents')
        .select('file_path, uploaded_by')
        .eq('id', documentId)
        .single();

      if (fetchError || !doc) {
        return false;
      }

      // Check ownership
      if (doc.uploaded_by !== userId) {
        return false;
      }

      // Delete file from storage
      await this.supabase.storage.from(this.storageBucket).remove([doc.file_path]);

      // Delete document record (versions cascade delete)
      const { error } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(
    query: string,
    filters?: {
      documentType?: DocumentType;
      entityType?: string;
      tags?: string[];
      userId?: string;
    }
  ): Promise<Document[]> {
    let dbQuery = this.supabase
      .from('documents')
      .select('*')
      .ilike('name', `%${query}%`);

    if (filters?.documentType) {
      dbQuery = dbQuery.eq('document_type', filters.documentType);
    }
    if (filters?.entityType) {
      dbQuery = dbQuery.eq('entity_type', filters.entityType);
    }
    if (filters?.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.contains('tags', filters.tags);
    }
    if (filters?.userId) {
      dbQuery = dbQuery.eq('uploaded_by', filters.userId);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false }).limit(50);

    if (error || !data) {
      return [];
    }

    return data.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      file_path: doc.file_path,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      document_type: doc.document_type,
      entity_type: doc.entity_type,
      entity_id: doc.entity_id,
      version: doc.version,
      parent_id: doc.parent_id,
      access_level: doc.access_level,
      tags: doc.tags,
      metadata: doc.metadata,
      uploaded_by: doc.uploaded_by,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
  }

  /**
   * Get storage usage for user
   */
  async getStorageUsage(userId: string): Promise<{ totalSize: number; documentCount: number }> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('file_size')
      .eq('uploaded_by', userId);

    if (error || !data) {
      return { totalSize: 0, documentCount: 0 };
    }

    const totalSize = data.reduce((sum, doc) => sum + doc.file_size, 0);

    return {
      totalSize,
      documentCount: data.length,
    };
  }
}

/**
 * Export document management utilities
 */
export const documentManagement = {
  createManager: (supabase: ReturnType<typeof createClient>, storageBucket?: string) =>
    new DocumentManager(supabase, storageBucket),
};

export default documentManagement;
