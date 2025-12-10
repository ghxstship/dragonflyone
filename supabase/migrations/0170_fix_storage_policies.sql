-- Migration: 0170_fix_storage_policies.sql
-- Description: Fix storage bucket policies to wrap auth.uid() and auth.role() in (SELECT ...)
-- This addresses Performance Advisor warnings about auth_rls_initplan

-- ============================================================================
-- HELPER FUNCTIONS (update to use SELECT wrapper)
-- ============================================================================

-- Update helper function to use SELECT wrapper
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.platform_users 
  WHERE auth_user_id = (SELECT auth.uid())
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update helper function to use SELECT wrapper
CREATE OR REPLACE FUNCTION public.storage_user_has_role(required_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.platform_users pu ON ur.platform_user_id = pu.id
    WHERE pu.auth_user_id = (SELECT auth.uid())
    AND ur.role_code = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;

CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "avatars_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "avatars_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ============================================================================
-- DOCUMENTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "documents_org_read" ON storage.objects;
DROP POLICY IF EXISTS "documents_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_org_update" ON storage.objects;
DROP POLICY IF EXISTS "documents_org_delete" ON storage.objects;

CREATE POLICY "documents_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "documents_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- UPLOADS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "uploads_user_read" ON storage.objects;
DROP POLICY IF EXISTS "uploads_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_user_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_user_delete" ON storage.objects;

CREATE POLICY "uploads_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads'
  AND (SELECT auth.role()) = 'authenticated'
  AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR (storage.foldername(name))[1] = public.get_user_organization_id()::text
  )
);

CREATE POLICY "uploads_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "uploads_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "uploads_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ============================================================================
-- PHOTOS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "photos_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "photos_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "photos_auth_delete" ON storage.objects;

CREATE POLICY "photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "photos_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND (SELECT auth.role()) = 'authenticated'
);

CREATE POLICY "photos_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "photos_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ============================================================================
-- MEDIA-KITS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "media_kits_public_read" ON storage.objects;
DROP POLICY IF EXISTS "media_kits_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_kits_org_update" ON storage.objects;
DROP POLICY IF EXISTS "media_kits_org_delete" ON storage.objects;

CREATE POLICY "media_kits_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-kits');

CREATE POLICY "media_kits_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-kits'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "media_kits_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-kits'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "media_kits_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-kits'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- ASSETS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "assets_org_read" ON storage.objects;
DROP POLICY IF EXISTS "assets_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "assets_org_update" ON storage.objects;
DROP POLICY IF EXISTS "assets_org_delete" ON storage.objects;

CREATE POLICY "assets_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "assets_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- ATTACHMENTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "attachments_org_read" ON storage.objects;
DROP POLICY IF EXISTS "attachments_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_org_update" ON storage.objects;
DROP POLICY IF EXISTS "attachments_org_delete" ON storage.objects;

CREATE POLICY "attachments_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "attachments_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "attachments_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'attachments'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "attachments_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'attachments'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- RECEIPTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "receipts_org_read" ON storage.objects;
DROP POLICY IF EXISTS "receipts_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "receipts_org_update" ON storage.objects;
DROP POLICY IF EXISTS "receipts_org_delete" ON storage.objects;

CREATE POLICY "receipts_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "receipts_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "receipts_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "receipts_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- CERTIFICATIONS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "certifications_org_read" ON storage.objects;
DROP POLICY IF EXISTS "certifications_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "certifications_org_update" ON storage.objects;
DROP POLICY IF EXISTS "certifications_org_delete" ON storage.objects;

CREATE POLICY "certifications_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certifications'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "certifications_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certifications'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "certifications_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certifications'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "certifications_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certifications'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- EXPORTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "exports_user_read" ON storage.objects;
DROP POLICY IF EXISTS "exports_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "exports_user_delete" ON storage.objects;

CREATE POLICY "exports_user_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "exports_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "exports_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ============================================================================
-- CONTRACTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "contracts_org_read" ON storage.objects;
DROP POLICY IF EXISTS "contracts_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "contracts_org_update" ON storage.objects;
DROP POLICY IF EXISTS "contracts_org_delete" ON storage.objects;

CREATE POLICY "contracts_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contracts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "contracts_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "contracts_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contracts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "contracts_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contracts'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- INVOICES BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "invoices_org_read" ON storage.objects;
DROP POLICY IF EXISTS "invoices_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "invoices_org_update" ON storage.objects;
DROP POLICY IF EXISTS "invoices_org_delete" ON storage.objects;

CREATE POLICY "invoices_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "invoices_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "invoices_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'invoices'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "invoices_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoices'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- REPORTS BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "reports_org_read" ON storage.objects;
DROP POLICY IF EXISTS "reports_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "reports_org_delete" ON storage.objects;

CREATE POLICY "reports_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "reports_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "reports_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- TEMPLATES BUCKET POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "templates_org_read" ON storage.objects;
DROP POLICY IF EXISTS "templates_org_insert" ON storage.objects;
DROP POLICY IF EXISTS "templates_org_update" ON storage.objects;
DROP POLICY IF EXISTS "templates_org_delete" ON storage.objects;

CREATE POLICY "templates_org_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'templates'
  AND (SELECT auth.role()) = 'authenticated'
);

CREATE POLICY "templates_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'templates'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "templates_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'templates'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

CREATE POLICY "templates_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'templates'
  AND (SELECT auth.role()) = 'authenticated'
  AND (storage.foldername(name))[1] = public.get_user_organization_id()::text
);

-- ============================================================================
-- BACKUPS BUCKET POLICIES (Admin only)
-- ============================================================================
DROP POLICY IF EXISTS "backups_admin_read" ON storage.objects;
DROP POLICY IF EXISTS "backups_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "backups_admin_delete" ON storage.objects;

CREATE POLICY "backups_admin_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'backups'
  AND (SELECT auth.role()) = 'authenticated'
  AND public.storage_user_has_role('LEGEND_SUPER_ADMIN')
);

CREATE POLICY "backups_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'backups'
  AND (SELECT auth.role()) = 'authenticated'
  AND public.storage_user_has_role('LEGEND_SUPER_ADMIN')
);

CREATE POLICY "backups_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'backups'
  AND (SELECT auth.role()) = 'authenticated'
  AND public.storage_user_has_role('LEGEND_SUPER_ADMIN')
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_user_organization_id() IS 'Helper function for storage policies - uses (SELECT auth.uid()) for performance';
COMMENT ON FUNCTION public.storage_user_has_role(text) IS 'Helper function for storage policies - uses (SELECT auth.uid()) for performance';
