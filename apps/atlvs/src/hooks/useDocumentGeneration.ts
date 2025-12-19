import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DocumentTemplate {
  id: string;
  name: string;
  document_type: 'proposal' | 'contract' | 'invoice' | 'beo' | 'receipt' | 'report' | 'custom';
  format: 'pdf' | 'docx' | 'html';
  template_content: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'image' | 'table' | 'signature';
    description: string;
    required: boolean;
    default_value?: string;
  }>;
  header_html?: string;
  footer_html?: string;
  styles?: string;
  page_settings: {
    size: 'letter' | 'a4' | 'legal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  is_default: boolean;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  document_type: DocumentTemplate['document_type'];
  format: DocumentTemplate['format'];
  file_name: string;
  file_url: string;
  file_size: number;
  variables_used: Record<string, unknown>;
  related_to?: {
    type: 'booking' | 'contact' | 'invoice' | 'contract' | 'proposal';
    id: string;
  };
  generated_by: string;
  generated_at: string;
  expires_at?: string;
}

export interface GenerateDocumentInput {
  template_id: string;
  variables: Record<string, unknown>;
  format?: DocumentTemplate['format'];
  file_name?: string;
  related_to?: GeneratedDocument['related_to'];
}

async function fetchDocumentTemplates(documentType?: DocumentTemplate['document_type']): Promise<{
  templates: DocumentTemplate[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (documentType) params.set('type', documentType);

  const response = await fetch(`/api/document-templates?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch document templates');
  }
  return response.json();
}

async function fetchDocumentTemplate(id: string): Promise<DocumentTemplate> {
  const response = await fetch(`/api/document-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch document template');
  }
  return response.json();
}

async function generateDocument(input: GenerateDocumentInput): Promise<GeneratedDocument> {
  const response = await fetch('/api/documents/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate document');
  }
  return response.json();
}

async function previewDocument(input: GenerateDocumentInput): Promise<{ preview_url: string }> {
  const response = await fetch('/api/documents/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to preview document');
  }
  return response.json();
}

async function fetchGeneratedDocuments(filters?: {
  relatedType?: string;
  relatedId?: string;
  documentType?: string;
}): Promise<{ documents: GeneratedDocument[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.relatedType) params.set('related_type', filters.relatedType);
  if (filters?.relatedId) params.set('related_id', filters.relatedId);
  if (filters?.documentType) params.set('type', filters.documentType);

  const response = await fetch(`/api/documents?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch generated documents');
  }
  return response.json();
}

async function regenerateDocument(documentId: string): Promise<GeneratedDocument> {
  const response = await fetch(`/api/documents/${documentId}/regenerate`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to regenerate document');
  }
  return response.json();
}

export function useDocumentTemplates(documentType?: DocumentTemplate['document_type']) {
  return useQuery({
    queryKey: ['document-templates', documentType],
    queryFn: () => fetchDocumentTemplates(documentType),
  });
}

export function useDocumentTemplate(id: string) {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: () => fetchDocumentTemplate(id),
    enabled: !!id,
  });
}

export function useGenerateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
    },
  });
}

export function usePreviewDocument() {
  return useMutation({
    mutationFn: previewDocument,
  });
}

export function useGeneratedDocuments(filters?: {
  relatedType?: string;
  relatedId?: string;
  documentType?: string;
}) {
  return useQuery({
    queryKey: ['generated-documents', filters],
    queryFn: () => fetchGeneratedDocuments(filters),
  });
}

export function useRegenerateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
    },
  });
}
