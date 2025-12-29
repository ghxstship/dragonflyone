-- Migration: 0171_fix_all_auth_uid_policies.sql
-- Description: Fix ALL remaining policies that use auth.uid() without (SELECT ...) wrapper
-- This addresses Performance Advisor warnings about auth_rls_initplan

-- ============================================================================
-- 0037_collaboration_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- document_locks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_locks') THEN
    DROP POLICY IF EXISTS "Users can create their own locks" ON document_locks;
    DROP POLICY IF EXISTS "Users can release their own locks" ON document_locks;
    DROP POLICY IF EXISTS "Users can update their own locks" ON document_locks;
    DROP POLICY IF EXISTS "document_locks_insert" ON document_locks;
    CREATE POLICY "document_locks_insert" ON document_locks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "document_locks_delete" ON document_locks;
    CREATE POLICY "document_locks_delete" ON document_locks FOR DELETE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "document_locks_update" ON document_locks;
    CREATE POLICY "document_locks_update" ON document_locks FOR UPDATE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- status_updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'status_updates') THEN
    DROP POLICY IF EXISTS "Authenticated users can create status updates" ON status_updates;
    DROP POLICY IF EXISTS "Users can update their own status" ON status_updates;
    DROP POLICY IF EXISTS "status_updates_insert" ON status_updates;
    CREATE POLICY "status_updates_insert" ON status_updates FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    DROP POLICY IF EXISTS "status_updates_update" ON status_updates;
    CREATE POLICY "status_updates_update" ON status_updates FOR UPDATE USING (updated_by = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0039_advanced_features.sql policies
-- ============================================================================

DO $$
BEGIN
  -- saved_searches
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_searches') THEN
    DROP POLICY IF EXISTS "Users can view their own saved searches" ON saved_searches;
    DROP POLICY IF EXISTS "Users can create saved searches" ON saved_searches;
    DROP POLICY IF EXISTS "Users can update their own searches" ON saved_searches;
    DROP POLICY IF EXISTS "Users can delete their own searches" ON saved_searches;
    DROP POLICY IF EXISTS "saved_searches_select" ON saved_searches;
    CREATE POLICY "saved_searches_select" ON saved_searches FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = true);
    DROP POLICY IF EXISTS "saved_searches_insert" ON saved_searches;
    CREATE POLICY "saved_searches_insert" ON saved_searches FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_searches_update" ON saved_searches;
    CREATE POLICY "saved_searches_update" ON saved_searches FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_searches_delete" ON saved_searches;
    CREATE POLICY "saved_searches_delete" ON saved_searches FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- search_history
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_history') THEN
    DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
    DROP POLICY IF EXISTS "Users can create search history" ON search_history;
    DROP POLICY IF EXISTS "Users can delete their own history" ON search_history;
    DROP POLICY IF EXISTS "search_history_select" ON search_history;
    CREATE POLICY "search_history_select" ON search_history FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "search_history_insert" ON search_history;
    CREATE POLICY "search_history_insert" ON search_history FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "search_history_delete" ON search_history;
    CREATE POLICY "search_history_delete" ON search_history FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- export_jobs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'export_jobs') THEN
    DROP POLICY IF EXISTS "Users can view their own exports" ON export_jobs;
    DROP POLICY IF EXISTS "Users can create exports" ON export_jobs;
    DROP POLICY IF EXISTS "Users can update their own exports" ON export_jobs;
    DROP POLICY IF EXISTS "Users can delete their own exports" ON export_jobs;
    DROP POLICY IF EXISTS "export_jobs_select" ON export_jobs;
    CREATE POLICY "export_jobs_select" ON export_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_jobs_insert" ON export_jobs;
    CREATE POLICY "export_jobs_insert" ON export_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_jobs_update" ON export_jobs;
    CREATE POLICY "export_jobs_update" ON export_jobs FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_jobs_delete" ON export_jobs;
    CREATE POLICY "export_jobs_delete" ON export_jobs FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- export_templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'export_templates') THEN
    DROP POLICY IF EXISTS "Users can view their own templates" ON export_templates;
    DROP POLICY IF EXISTS "Users can create templates" ON export_templates;
    DROP POLICY IF EXISTS "Users can update their own templates" ON export_templates;
    DROP POLICY IF EXISTS "Users can delete their own templates" ON export_templates;
    DROP POLICY IF EXISTS "export_templates_select" ON export_templates;
    CREATE POLICY "export_templates_select" ON export_templates FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_templates_insert" ON export_templates;
    CREATE POLICY "export_templates_insert" ON export_templates FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_templates_update" ON export_templates;
    CREATE POLICY "export_templates_update" ON export_templates FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "export_templates_delete" ON export_templates;
    CREATE POLICY "export_templates_delete" ON export_templates FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- batch_operations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'batch_operations') THEN
    DROP POLICY IF EXISTS "Users can view their own batch operations" ON batch_operations;
    DROP POLICY IF EXISTS "Users can create batch operations" ON batch_operations;
    DROP POLICY IF EXISTS "Users can update their own operations" ON batch_operations;
    DROP POLICY IF EXISTS "Users can delete their own operations" ON batch_operations;
    DROP POLICY IF EXISTS "batch_operations_select" ON batch_operations;
    CREATE POLICY "batch_operations_select" ON batch_operations FOR SELECT USING (user_id = (SELECT auth.uid()) OR (SELECT auth.role()) = 'service_role');
    DROP POLICY IF EXISTS "batch_operations_insert" ON batch_operations;
    CREATE POLICY "batch_operations_insert" ON batch_operations FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "batch_operations_update" ON batch_operations;
    CREATE POLICY "batch_operations_update" ON batch_operations FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "batch_operations_delete" ON batch_operations;
    CREATE POLICY "batch_operations_delete" ON batch_operations FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- dashboard_widgets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dashboard_widgets') THEN
    DROP POLICY IF EXISTS "Users can view their own widgets" ON dashboard_widgets;
    DROP POLICY IF EXISTS "Users can create widgets" ON dashboard_widgets;
    DROP POLICY IF EXISTS "Users can update their own widgets" ON dashboard_widgets;
    DROP POLICY IF EXISTS "Users can delete their own widgets" ON dashboard_widgets;
    DROP POLICY IF EXISTS "dashboard_widgets_select" ON dashboard_widgets;
    CREATE POLICY "dashboard_widgets_select" ON dashboard_widgets FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "dashboard_widgets_insert" ON dashboard_widgets;
    CREATE POLICY "dashboard_widgets_insert" ON dashboard_widgets FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "dashboard_widgets_update" ON dashboard_widgets;
    CREATE POLICY "dashboard_widgets_update" ON dashboard_widgets FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "dashboard_widgets_delete" ON dashboard_widgets;
    CREATE POLICY "dashboard_widgets_delete" ON dashboard_widgets FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0041_integration_systems.sql policies
-- ============================================================================

DO $$
BEGIN
  -- webhooks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhooks') THEN
    DROP POLICY IF EXISTS "Users can manage their own webhooks" ON webhooks;
    DROP POLICY IF EXISTS "webhooks_all" ON webhooks;
    DROP POLICY IF EXISTS "webhooks_all" ON webhooks;
    CREATE POLICY "webhooks_all" ON webhooks FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- webhook_deliveries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_deliveries') THEN
    DROP POLICY IF EXISTS "Users can view their webhook deliveries" ON webhook_deliveries;
    DROP POLICY IF EXISTS "webhook_deliveries_select" ON webhook_deliveries;
    DROP POLICY IF EXISTS "webhook_deliveries_select" ON webhook_deliveries;
    CREATE POLICY "webhook_deliveries_select" ON webhook_deliveries FOR SELECT 
      USING (webhook_id IN (SELECT id FROM webhooks WHERE user_id = (SELECT auth.uid())));
  END IF;

  -- api_keys
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
    DROP POLICY IF EXISTS "api_keys_all" ON api_keys;
    DROP POLICY IF EXISTS "api_keys_all" ON api_keys;
    CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- api_key_usage
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_key_usage') THEN
    DROP POLICY IF EXISTS "Users can view their API key usage" ON api_key_usage;
    DROP POLICY IF EXISTS "api_key_usage_select" ON api_key_usage;
    DROP POLICY IF EXISTS "api_key_usage_select" ON api_key_usage;
    CREATE POLICY "api_key_usage_select" ON api_key_usage FOR SELECT 
      USING (api_key_id IN (SELECT id FROM api_keys WHERE user_id = (SELECT auth.uid())));
  END IF;

  -- notification_preferences
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_preferences') THEN
    DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON notification_preferences;
    DROP POLICY IF EXISTS "notification_preferences_all" ON notification_preferences;
    DROP POLICY IF EXISTS "notification_preferences_all" ON notification_preferences;
    CREATE POLICY "notification_preferences_all" ON notification_preferences FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0043_final_features.sql policies
-- ============================================================================

DO $$
BEGIN
  -- documents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can create documents" ON documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
    DROP POLICY IF EXISTS "documents_select" ON documents;
    CREATE POLICY "documents_select" ON documents FOR SELECT USING (uploaded_by = (SELECT auth.uid()) OR access_level = 'public');
    DROP POLICY IF EXISTS "documents_insert" ON documents;
    CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (uploaded_by = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "documents_update" ON documents;
    CREATE POLICY "documents_update" ON documents FOR UPDATE USING (uploaded_by = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "documents_delete" ON documents;
    CREATE POLICY "documents_delete" ON documents FOR DELETE USING (uploaded_by = (SELECT auth.uid()));
  END IF;

  -- document_versions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_versions') THEN
    DROP POLICY IF EXISTS "Users can view versions of their documents" ON document_versions;
    DROP POLICY IF EXISTS "document_versions_select" ON document_versions;
    CREATE POLICY "document_versions_select" ON document_versions FOR SELECT 
      USING (document_id IN (SELECT id FROM documents WHERE uploaded_by = (SELECT auth.uid())));
  END IF;

  -- activity_feed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_feed') THEN
    DROP POLICY IF EXISTS "Users can view their own activity" ON activity_feed;
    DROP POLICY IF EXISTS "activity_feed_select" ON activity_feed;
    CREATE POLICY "activity_feed_select" ON activity_feed FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;

  -- email_templates (uses created_by, not user_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_templates') THEN
    DROP POLICY IF EXISTS "Users can view email templates" ON email_templates;
    DROP POLICY IF EXISTS "email_templates_select" ON email_templates;
    CREATE POLICY "email_templates_select" ON email_templates FOR SELECT USING (created_by = (SELECT auth.uid()) OR (SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- entity_comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entity_comments') THEN
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON entity_comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON entity_comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON entity_comments;
    DROP POLICY IF EXISTS "entity_comments_insert" ON entity_comments;
    CREATE POLICY "entity_comments_insert" ON entity_comments FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "entity_comments_update" ON entity_comments;
    CREATE POLICY "entity_comments_update" ON entity_comments FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "entity_comments_delete" ON entity_comments;
    CREATE POLICY "entity_comments_delete" ON entity_comments FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- import_jobs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_jobs') THEN
    DROP POLICY IF EXISTS "Users can view their own import jobs" ON import_jobs;
    DROP POLICY IF EXISTS "Users can create import jobs" ON import_jobs;
    DROP POLICY IF EXISTS "Users can update their own imports" ON import_jobs;
    DROP POLICY IF EXISTS "Users can delete their own imports" ON import_jobs;
    DROP POLICY IF EXISTS "import_jobs_select" ON import_jobs;
    CREATE POLICY "import_jobs_select" ON import_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "import_jobs_insert" ON import_jobs;
    CREATE POLICY "import_jobs_insert" ON import_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "import_jobs_update" ON import_jobs;
    CREATE POLICY "import_jobs_update" ON import_jobs FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "import_jobs_delete" ON import_jobs;
    CREATE POLICY "import_jobs_delete" ON import_jobs FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0044_reviews_system.sql policies
-- ============================================================================

DO $$
BEGIN
  -- reviews
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update their pending reviews" ON reviews;
    DROP POLICY IF EXISTS "reviews_select" ON reviews;
    CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "reviews_insert" ON reviews;
    CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "reviews_update" ON reviews;
    CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (user_id = (SELECT auth.uid()) AND status = 'pending');
  END IF;

  -- review_reactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reactions') THEN
    DROP POLICY IF EXISTS "Authenticated users can react" ON review_reactions;
    DROP POLICY IF EXISTS "Users can remove their reactions" ON review_reactions;
    DROP POLICY IF EXISTS "review_reactions_insert" ON review_reactions;
    CREATE POLICY "review_reactions_insert" ON review_reactions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "review_reactions_delete" ON review_reactions;
    CREATE POLICY "review_reactions_delete" ON review_reactions FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0048_wallet_payment_methods_system.sql policies
-- ============================================================================

DO $$
BEGIN
  -- wallets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallets') THEN
    DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
    DROP POLICY IF EXISTS "wallets_select" ON wallets;
    CREATE POLICY "wallets_select" ON wallets FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;

  -- wallet_transactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallet_transactions') THEN
    DROP POLICY IF EXISTS "Users can view their wallet transactions" ON wallet_transactions;
    DROP POLICY IF EXISTS "wallet_transactions_select" ON wallet_transactions;
    CREATE POLICY "wallet_transactions_select" ON wallet_transactions FOR SELECT 
      USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = (SELECT auth.uid())));
  END IF;

  -- payment_methods
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
    DROP POLICY IF EXISTS "Users can manage their own payment methods" ON payment_methods;
    DROP POLICY IF EXISTS "payment_methods_all" ON payment_methods;
    CREATE POLICY "payment_methods_all" ON payment_methods FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- payment_authorizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_authorizations') THEN
    DROP POLICY IF EXISTS "Users can view their payment authorizations" ON payment_authorizations;
    DROP POLICY IF EXISTS "payment_authorizations_select" ON payment_authorizations;
    CREATE POLICY "payment_authorizations_select" ON payment_authorizations FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0050_referrals_program_system.sql policies
-- ============================================================================

DO $$
BEGIN
  -- referral_codes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_codes') THEN
    DROP POLICY IF EXISTS "Users can view their own referral codes" ON referral_codes;
    DROP POLICY IF EXISTS "Users can manage their own referral codes" ON referral_codes;
    DROP POLICY IF EXISTS "referral_codes_select" ON referral_codes;
    CREATE POLICY "referral_codes_select" ON referral_codes FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "referral_codes_all" ON referral_codes;
    CREATE POLICY "referral_codes_all" ON referral_codes FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- referrals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
    DROP POLICY IF EXISTS "Users can view their referrals" ON referrals;
    DROP POLICY IF EXISTS "referrals_select" ON referrals;
    CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (referrer_id = (SELECT auth.uid()) OR referee_id = (SELECT auth.uid()));
  END IF;

  -- referral_rewards
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_rewards') THEN
    DROP POLICY IF EXISTS "Users can view their own rewards" ON referral_rewards;
    DROP POLICY IF EXISTS "referral_rewards_select" ON referral_rewards;
    CREATE POLICY "referral_rewards_select" ON referral_rewards FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0062_comments_collaboration.sql policies
-- ============================================================================

DO $$
BEGIN
  -- comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    DROP POLICY IF EXISTS "Users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON comments;
    DROP POLICY IF EXISTS "comments_insert" ON comments;
    CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (author_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "comments_update" ON comments;
    CREATE POLICY "comments_update" ON comments FOR UPDATE USING (author_id = (SELECT auth.uid()));
  END IF;

  -- comment_reactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comment_reactions') THEN
    DROP POLICY IF EXISTS "Users can manage own reactions" ON comment_reactions;
    DROP POLICY IF EXISTS "comment_reactions_all" ON comment_reactions;
    CREATE POLICY "comment_reactions_all" ON comment_reactions FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0091_follower_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- artist_followers (uses user_id, not follower_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artist_followers') THEN
    DROP POLICY IF EXISTS "Users can follow artists" ON artist_followers;
    DROP POLICY IF EXISTS "Users can unfollow artists" ON artist_followers;
    DROP POLICY IF EXISTS "artist_followers_insert" ON artist_followers;
    CREATE POLICY "artist_followers_insert" ON artist_followers FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "artist_followers_delete" ON artist_followers;
    CREATE POLICY "artist_followers_delete" ON artist_followers FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- venue_followers (uses user_id, not follower_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venue_followers') THEN
    DROP POLICY IF EXISTS "Users can follow venues" ON venue_followers;
    DROP POLICY IF EXISTS "Users can unfollow venues" ON venue_followers;
    DROP POLICY IF EXISTS "venue_followers_insert" ON venue_followers;
    CREATE POLICY "venue_followers_insert" ON venue_followers FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "venue_followers_delete" ON venue_followers;
    CREATE POLICY "venue_followers_delete" ON venue_followers FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0097_user_favorites.sql policies
-- ============================================================================

DO $$
BEGIN
  -- user_favorites
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_favorites') THEN
    DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
    DROP POLICY IF EXISTS "Users can create favorites" ON user_favorites;
    DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
    DROP POLICY IF EXISTS "user_favorites_select" ON user_favorites;
    CREATE POLICY "user_favorites_select" ON user_favorites FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "user_favorites_insert" ON user_favorites;
    CREATE POLICY "user_favorites_insert" ON user_favorites FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "user_favorites_delete" ON user_favorites;
    CREATE POLICY "user_favorites_delete" ON user_favorites FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0101_direct_messaging.sql policies
-- ============================================================================

DO $$
BEGIN
  -- dm_conversations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dm_conversations') THEN
    DROP POLICY IF EXISTS "Users can view their conversations" ON dm_conversations;
    DROP POLICY IF EXISTS "dm_conversations_select" ON dm_conversations;
    CREATE POLICY "dm_conversations_select" ON dm_conversations FOR SELECT 
      USING (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()));
  END IF;

  -- dm_messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dm_messages') THEN
    DROP POLICY IF EXISTS "Users can send messages" ON dm_messages;
    DROP POLICY IF EXISTS "dm_messages_insert" ON dm_messages;
    CREATE POLICY "dm_messages_insert" ON dm_messages FOR INSERT WITH CHECK (sender_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0104_activity_feed.sql policies
-- ============================================================================

DO $$
BEGIN
  -- activity_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_items') THEN
    DROP POLICY IF EXISTS "Users can view their activity" ON activity_items;
    DROP POLICY IF EXISTS "Users can create activity" ON activity_items;
    DROP POLICY IF EXISTS "Users can update their activity" ON activity_items;
    DROP POLICY IF EXISTS "activity_items_select" ON activity_items;
    CREATE POLICY "activity_items_select" ON activity_items FOR SELECT USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "activity_items_insert" ON activity_items;
    CREATE POLICY "activity_items_insert" ON activity_items FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "activity_items_update" ON activity_items;
    CREATE POLICY "activity_items_update" ON activity_items FOR UPDATE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- activity_reactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_reactions') THEN
    DROP POLICY IF EXISTS "Users can manage reactions" ON activity_reactions;
    DROP POLICY IF EXISTS "activity_reactions_all" ON activity_reactions;
    CREATE POLICY "activity_reactions_all" ON activity_reactions FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- activity_comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_comments') THEN
    DROP POLICY IF EXISTS "Users can manage comments" ON activity_comments;
    DROP POLICY IF EXISTS "activity_comments_all" ON activity_comments;
    CREATE POLICY "activity_comments_all" ON activity_comments FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0112_social_extended_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- social_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_profiles') THEN
    DROP POLICY IF EXISTS "Users can manage their social profiles" ON social_profiles;
    DROP POLICY IF EXISTS "social_profiles_all" ON social_profiles;
    CREATE POLICY "social_profiles_all" ON social_profiles FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- social_connections
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_connections') THEN
    DROP POLICY IF EXISTS "Users can manage their connections" ON social_connections;
    DROP POLICY IF EXISTS "social_connections_all" ON social_connections;
    CREATE POLICY "social_connections_all" ON social_connections FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- social_posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_posts') THEN
    DROP POLICY IF EXISTS "Users can manage their posts" ON social_posts;
    DROP POLICY IF EXISTS "social_posts_all" ON social_posts;
    CREATE POLICY "social_posts_all" ON social_posts FOR ALL USING (author_id = (SELECT auth.uid()));
  END IF;

  -- social_interactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_interactions') THEN
    DROP POLICY IF EXISTS "Users can manage their interactions" ON social_interactions;
    DROP POLICY IF EXISTS "social_interactions_all" ON social_interactions;
    CREATE POLICY "social_interactions_all" ON social_interactions FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- social_notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_notifications') THEN
    DROP POLICY IF EXISTS "Users can view their notifications" ON social_notifications;
    DROP POLICY IF EXISTS "social_notifications_select" ON social_notifications;
    CREATE POLICY "social_notifications_select" ON social_notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0113_social_management_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- social_accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_accounts') THEN
    DROP POLICY IF EXISTS "Users can manage their social accounts" ON social_accounts;
    DROP POLICY IF EXISTS "social_accounts_all" ON social_accounts;
    CREATE POLICY "social_accounts_all" ON social_accounts FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- scheduled_social_posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scheduled_social_posts') THEN
    DROP POLICY IF EXISTS "Users can manage their scheduled posts" ON scheduled_social_posts;
    DROP POLICY IF EXISTS "scheduled_social_posts_all" ON scheduled_social_posts;
    CREATE POLICY "scheduled_social_posts_all" ON scheduled_social_posts FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;

  -- social_analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_analytics') THEN
    DROP POLICY IF EXISTS "Users can view their analytics" ON social_analytics;
    DROP POLICY IF EXISTS "social_analytics_select" ON social_analytics;
    CREATE POLICY "social_analytics_select" ON social_analytics FOR SELECT 
      USING (account_id IN (SELECT id FROM social_accounts WHERE user_id = (SELECT auth.uid())));
  END IF;

  -- social_content_library
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_content_library') THEN
    DROP POLICY IF EXISTS "Users can manage their content" ON social_content_library;
    DROP POLICY IF EXISTS "social_content_library_all" ON social_content_library;
    CREATE POLICY "social_content_library_all" ON social_content_library FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;

  -- social_hashtag_groups
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_hashtag_groups') THEN
    DROP POLICY IF EXISTS "Users can manage their hashtag groups" ON social_hashtag_groups;
    DROP POLICY IF EXISTS "social_hashtag_groups_all" ON social_hashtag_groups;
    CREATE POLICY "social_hashtag_groups_all" ON social_hashtag_groups FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0114_social_amplification_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- influencer_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'influencer_profiles') THEN
    DROP POLICY IF EXISTS "Users can manage their influencer profile" ON influencer_profiles;
    DROP POLICY IF EXISTS "influencer_profiles_all" ON influencer_profiles;
    CREATE POLICY "influencer_profiles_all" ON influencer_profiles FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- influencer_campaigns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'influencer_campaigns') THEN
    DROP POLICY IF EXISTS "Users can manage their campaigns" ON influencer_campaigns;
    DROP POLICY IF EXISTS "influencer_campaigns_all" ON influencer_campaigns;
    CREATE POLICY "influencer_campaigns_all" ON influencer_campaigns FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;

  -- campaign_applications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_applications') THEN
    DROP POLICY IF EXISTS "Users can manage their applications" ON campaign_applications;
    DROP POLICY IF EXISTS "campaign_applications_all" ON campaign_applications;
    CREATE POLICY "campaign_applications_all" ON campaign_applications FOR ALL USING (influencer_id = (SELECT auth.uid()));
  END IF;

  -- ugc_submissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ugc_submissions') THEN
    DROP POLICY IF EXISTS "Users can manage their submissions" ON ugc_submissions;
    DROP POLICY IF EXISTS "ugc_submissions_all" ON ugc_submissions;
    CREATE POLICY "ugc_submissions_all" ON ugc_submissions FOR ALL USING (submitted_by = (SELECT auth.uid()));
  END IF;

  -- social_contests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_contests') THEN
    DROP POLICY IF EXISTS "Users can manage their contests" ON social_contests;
    DROP POLICY IF EXISTS "social_contests_all" ON social_contests;
    CREATE POLICY "social_contests_all" ON social_contests FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0115_marketing_affiliate_tables.sql policies
-- Note: affiliates table doesn't have user_id, so we use authenticated-only access
-- ============================================================================

DO $$
BEGIN
  -- affiliate_clicks - authenticated users only
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_clicks') THEN
    DROP POLICY IF EXISTS "affiliate_clicks_select" ON affiliate_clicks;
    CREATE POLICY "affiliate_clicks_select" ON affiliate_clicks FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- affiliate_conversions - authenticated users only
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_conversions') THEN
    DROP POLICY IF EXISTS "affiliate_conversions_select" ON affiliate_conversions;
    CREATE POLICY "affiliate_conversions_select" ON affiliate_conversions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- affiliate_payouts - authenticated users only
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_payouts') THEN
    DROP POLICY IF EXISTS "Users can view their payouts" ON affiliate_payouts;
    DROP POLICY IF EXISTS "affiliate_payouts_select" ON affiliate_payouts;
    CREATE POLICY "affiliate_payouts_select" ON affiliate_payouts FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- 0116_communications_system.sql policies
-- ============================================================================

DO $$
BEGIN
  -- communication_threads
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'communication_threads') THEN
    DROP POLICY IF EXISTS "Users can view their threads" ON communication_threads;
    DROP POLICY IF EXISTS "communication_threads_select" ON communication_threads;
    CREATE POLICY "communication_threads_select" ON communication_threads FOR SELECT USING (created_by = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0123_campaign_tracking_tables.sql policies
-- ============================================================================

DO $$
BEGIN
  -- campaign_links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_links') THEN
    DROP POLICY IF EXISTS "Users can manage their campaign links" ON campaign_links;
    DROP POLICY IF EXISTS "campaign_links_all" ON campaign_links;
    CREATE POLICY "campaign_links_all" ON campaign_links FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;

  -- link_clicks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'link_clicks') THEN
    DROP POLICY IF EXISTS "Users can view their link clicks" ON link_clicks;
    DROP POLICY IF EXISTS "link_clicks_select" ON link_clicks;
    CREATE POLICY "link_clicks_select" ON link_clicks FOR SELECT 
      USING (link_id IN (SELECT id FROM campaign_links WHERE created_by = (SELECT auth.uid())));
  END IF;
END $$;

-- ============================================================================
-- 0141_lost_found_api_keys_metrics.sql policies
-- ============================================================================

DO $$
BEGIN
  -- api_rate_limits
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_rate_limits') THEN
    DROP POLICY IF EXISTS "api_rate_limits_select" ON api_rate_limits;
    DROP POLICY IF EXISTS "api_rate_limits_select" ON api_rate_limits;
    CREATE POLICY "api_rate_limits_select" ON api_rate_limits FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0143_sso_saml_enterprise.sql policies
-- ============================================================================

DO $$
BEGIN
  -- sso_sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sso_sessions') THEN
    DROP POLICY IF EXISTS "Users can view their own sessions" ON sso_sessions;
    DROP POLICY IF EXISTS "sso_sessions_select" ON sso_sessions;
    CREATE POLICY "sso_sessions_select" ON sso_sessions FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0147_saved_filters_views.sql policies
-- ============================================================================

DO $$
BEGIN
  -- saved_filters
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_filters') THEN
    DROP POLICY IF EXISTS "saved_filters_select_policy" ON saved_filters;
    DROP POLICY IF EXISTS "saved_filters_insert_policy" ON saved_filters;
    DROP POLICY IF EXISTS "saved_filters_update_policy" ON saved_filters;
    DROP POLICY IF EXISTS "saved_filters_delete_policy" ON saved_filters;
    DROP POLICY IF EXISTS "saved_filters_select" ON saved_filters;
    CREATE POLICY "saved_filters_select" ON saved_filters FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = true);
    DROP POLICY IF EXISTS "saved_filters_insert" ON saved_filters;
    CREATE POLICY "saved_filters_insert" ON saved_filters FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_filters_update" ON saved_filters;
    CREATE POLICY "saved_filters_update" ON saved_filters FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_filters_delete" ON saved_filters;
    CREATE POLICY "saved_filters_delete" ON saved_filters FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;

  -- saved_views
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_views') THEN
    DROP POLICY IF EXISTS "saved_views_select_policy" ON saved_views;
    DROP POLICY IF EXISTS "saved_views_insert_policy" ON saved_views;
    DROP POLICY IF EXISTS "saved_views_update_policy" ON saved_views;
    DROP POLICY IF EXISTS "saved_views_delete_policy" ON saved_views;
    DROP POLICY IF EXISTS "saved_views_select" ON saved_views;
    CREATE POLICY "saved_views_select" ON saved_views FOR SELECT USING (user_id = (SELECT auth.uid()) OR is_public = true);
    DROP POLICY IF EXISTS "saved_views_insert" ON saved_views;
    CREATE POLICY "saved_views_insert" ON saved_views FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_views_update" ON saved_views;
    CREATE POLICY "saved_views_update" ON saved_views FOR UPDATE USING (user_id = (SELECT auth.uid()));
    DROP POLICY IF EXISTS "saved_views_delete" ON saved_views;
    CREATE POLICY "saved_views_delete" ON saved_views FOR DELETE USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 0053_advanced_permissions.sql policies
-- ============================================================================

DO $$
BEGIN
  -- permission_grants
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permission_grants') THEN
    DROP POLICY IF EXISTS "Users can view their own grants" ON permission_grants;
    DROP POLICY IF EXISTS "permission_grants_select" ON permission_grants;
    CREATE POLICY "permission_grants_select" ON permission_grants FOR SELECT USING (grantee_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON SCHEMA public IS 'All auth.uid() calls in RLS policies have been wrapped in (SELECT ...) for performance optimization';
