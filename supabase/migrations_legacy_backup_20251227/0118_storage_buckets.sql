-- =====================================================
-- Storage Buckets Configuration
-- =====================================================
-- Creates all required storage buckets with appropriate
-- RLS policies for the Dragonfly platform
-- =====================================================

-- Note: Storage is a built-in Supabase feature, not a PostgreSQL extension.
-- The storage schema is automatically created by Supabase.

-- =====================================================
-- BUCKET DEFINITIONS
-- =====================================================

-- 1. AVATARS - User profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. DOCUMENTS - General document storage (contracts, reports, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. UPLOADS - General file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. PHOTOS - Event and crew photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. MEDIA-KITS - Press and marketing materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-kits',
  'media-kits',
  true,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'video/mp4',
    'video/quicktime'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 6. ASSETS - Equipment and inventory images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. LOGOS - Organization and event logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 8. ATTACHMENTS - Email and message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  26214400, -- 25MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 9. CONTRACTS - Contract documents (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 10. INVOICES - Invoice documents (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 11. RECEIPTS - Receipt images and documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 12. CERTIFICATIONS - Certification and license documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certifications',
  'certifications',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 13. TEMPLATES - Document and email templates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'templates',
  'templates',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/html',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 14. EXPORTS - Generated export files (temporary)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600, -- 100MB
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/zip',
    'application/json'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 15. BACKUPS - System backup files (admin only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  1073741824, -- 1GB
  ARRAY['application/zip', 'application/x-zip-compressed', 'application/gzip', 'application/json']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- RLS POLICIES FOR STORAGE BUCKETS
-- =====================================================

-- Helper function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.platform_users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.storage_user_has_role(required_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.platform_users pu ON ur.platform_user_id = pu.id
    WHERE pu.auth_user_id = auth.uid()
    AND ur.role_code = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- AVATARS BUCKET POLICIES (Public read, authenticated write own)
-- =====================================================
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- DOCUMENTS BUCKET POLICIES (Organization-scoped)
-- =====================================================
CREATE POLICY "documents_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- UPLOADS BUCKET POLICIES (User-scoped)
-- =====================================================
CREATE POLICY "uploads_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_organization_id()::text
  )
);

CREATE POLICY "uploads_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "uploads_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "uploads_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PHOTOS BUCKET POLICIES (Public read, authenticated write)
-- =====================================================
CREATE POLICY "photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "photos_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "photos_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "photos_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- MEDIA-KITS BUCKET POLICIES (Public read, org write)
-- =====================================================
CREATE POLICY "media_kits_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-kits');

CREATE POLICY "media_kits_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-kits'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "media_kits_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-kits'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "media_kits_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-kits'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- ASSETS BUCKET POLICIES (Organization-scoped)
-- =====================================================
CREATE POLICY "assets_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- LOGOS BUCKET POLICIES (Public read, org write)
-- =====================================================
CREATE POLICY "logos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "logos_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "logos_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "logos_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- ATTACHMENTS BUCKET POLICIES (User-scoped)
-- =====================================================
CREATE POLICY "attachments_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_organization_id()::text
  )
);

CREATE POLICY "attachments_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "attachments_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CONTRACTS BUCKET POLICIES (Organization-scoped, restricted)
-- =====================================================
CREATE POLICY "contracts_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "contracts_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "contracts_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- No delete policy for contracts - they should be archived, not deleted

-- =====================================================
-- INVOICES BUCKET POLICIES (Organization-scoped)
-- =====================================================
CREATE POLICY "invoices_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "invoices_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- RECEIPTS BUCKET POLICIES (User-scoped)
-- =====================================================
CREATE POLICY "receipts_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_organization_id()::text
  )
);

CREATE POLICY "receipts_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "receipts_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CERTIFICATIONS BUCKET POLICIES (User-scoped)
-- =====================================================
CREATE POLICY "certifications_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certifications'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_organization_id()::text
  )
);

CREATE POLICY "certifications_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certifications'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "certifications_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certifications'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "certifications_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certifications'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- TEMPLATES BUCKET POLICIES (Organization-scoped)
-- =====================================================
CREATE POLICY "templates_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'templates'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "templates_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'templates'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "templates_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'templates'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "templates_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'templates'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- =====================================================
-- EXPORTS BUCKET POLICIES (User-scoped, time-limited)
-- =====================================================
CREATE POLICY "exports_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "exports_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "exports_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- BACKUPS BUCKET POLICIES (Admin only)
-- =====================================================
CREATE POLICY "backups_admin_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'backups'
  AND auth.role() = 'authenticated'
  AND public.storage_user_has_role('SYSTEM_ADMIN')
);

CREATE POLICY "backups_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'backups'
  AND auth.role() = 'authenticated'
  AND public.storage_user_has_role('SYSTEM_ADMIN')
);

CREATE POLICY "backups_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'backups'
  AND auth.role() = 'authenticated'
  AND public.storage_user_has_role('SYSTEM_ADMIN')
);

-- =====================================================
-- CLEANUP FUNCTION FOR EXPIRED EXPORTS
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'exports'
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-exports', '0 3 * * *', 'SELECT public.cleanup_expired_exports()');

COMMENT ON FUNCTION public.cleanup_expired_exports() IS 'Removes export files older than 7 days';
