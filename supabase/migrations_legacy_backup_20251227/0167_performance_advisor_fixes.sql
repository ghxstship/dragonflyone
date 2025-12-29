-- Migration: 0167_performance_advisor_fixes.sql
-- Description: Fix Performance Advisor warnings by wrapping auth.uid() in (SELECT ...)
-- and consolidating multiple permissive policies
-- All operations are wrapped in conditional blocks to handle missing tables gracefully

-- ============================================================================
-- PART 1: FIX CERTIFICATIONS/LICENSES SYSTEM (0046) - if tables exist
-- ============================================================================

DO $$
BEGIN
  -- certification_types
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certification_types') THEN
    DROP POLICY IF EXISTS "certification_types_admin_manage" ON certification_types;
    CREATE POLICY "certification_types_admin_manage" ON certification_types
      FOR ALL TO authenticated USING (role_in('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  -- crew_certifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crew_certifications') THEN
    DROP POLICY IF EXISTS "crew_certifications_view" ON crew_certifications;
    DROP POLICY IF EXISTS "crew_certifications_own_manage" ON crew_certifications;
    DROP POLICY IF EXISTS "crew_certifications_admin_manage" ON crew_certifications;
    CREATE POLICY "crew_certifications_unified" ON crew_certifications
      FOR ALL TO authenticated
      USING (
        EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = crew_certifications.crew_member_id AND cm.user_id = (SELECT auth.uid()))
        OR role_in('COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      );
  END IF;

  -- license_types
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'license_types') THEN
    DROP POLICY IF EXISTS "license_types_admin_manage" ON license_types;
    CREATE POLICY "license_types_admin_manage" ON license_types
      FOR ALL TO authenticated USING (role_in('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  -- certification_documents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certification_documents') THEN
    DROP POLICY IF EXISTS "certification_documents_view" ON certification_documents;
    DROP POLICY IF EXISTS "certification_documents_insert" ON certification_documents;
    CREATE POLICY "certification_documents_unified" ON certification_documents
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM crew_certifications cc
          JOIN crew_members cm ON cm.id = cc.crew_member_id
          WHERE cc.id = certification_documents.crew_certification_id
          AND (cm.user_id = (SELECT auth.uid()) OR role_in('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'))
        )
      );
  END IF;

  -- crew_licenses
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crew_licenses') THEN
    DROP POLICY IF EXISTS "crew_licenses_view" ON crew_licenses;
    DROP POLICY IF EXISTS "crew_licenses_admin_manage" ON crew_licenses;
    CREATE POLICY "crew_licenses_unified" ON crew_licenses
      FOR ALL TO authenticated
      USING (
        EXISTS (SELECT 1 FROM crew_members cm WHERE cm.id = crew_licenses.crew_member_id AND cm.user_id = (SELECT auth.uid()))
        OR role_in('COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      );
  END IF;
END $$;

-- ============================================================================
-- PART 2: FIX TIMEKEEPING SYSTEM (0042) - if tables exist
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_entries') THEN
    DROP POLICY IF EXISTS "time_entries_view" ON time_entries;
    DROP POLICY IF EXISTS "time_entries_create" ON time_entries;
    DROP POLICY IF EXISTS "time_entries_update_own" ON time_entries;
    DROP POLICY IF EXISTS "time_entries_admin_manage" ON time_entries;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timesheet_periods') THEN
    DROP POLICY IF EXISTS "timesheet_periods_view" ON timesheet_periods;
    DROP POLICY IF EXISTS "timesheet_periods_admin_manage" ON timesheet_periods;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'labor_rules') THEN
    DROP POLICY IF EXISTS "labor_rules_view" ON labor_rules;
    DROP POLICY IF EXISTS "labor_rules_admin_manage" ON labor_rules;
  END IF;
END $$;

-- ============================================================================
-- PART 3: FIX WALLET/PAYMENT SYSTEM (0048) - if tables exist
-- ============================================================================

DO $$
BEGIN
  -- wallets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallets') THEN
    DROP POLICY IF EXISTS "wallets_view" ON wallets;
    DROP POLICY IF EXISTS "wallets_select" ON wallets;
    DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
    CREATE POLICY "wallets_select" ON wallets
      FOR SELECT USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  -- wallet_transactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallet_transactions') THEN
    DROP POLICY IF EXISTS "wallet_transactions_view" ON wallet_transactions;
    DROP POLICY IF EXISTS "wallet_transactions_select" ON wallet_transactions;
    DROP POLICY IF EXISTS "Users can view their own transactions" ON wallet_transactions;
    CREATE POLICY "wallet_transactions_select" ON wallet_transactions
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM wallets w WHERE w.id = wallet_transactions.wallet_id AND w.user_id = (SELECT auth.uid()))
        OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      );
  END IF;

  -- payment_methods
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
    DROP POLICY IF EXISTS "payment_methods_view" ON payment_methods;
    DROP POLICY IF EXISTS "payment_methods_manage" ON payment_methods;
    DROP POLICY IF EXISTS "payment_methods_unified" ON payment_methods;
    DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
    DROP POLICY IF EXISTS "Users can manage their own payment methods" ON payment_methods;
    CREATE POLICY "payment_methods_unified" ON payment_methods
      FOR ALL USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  -- payment_authorizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_authorizations') THEN
    DROP POLICY IF EXISTS "payment_authorizations_view" ON payment_authorizations;
    DROP POLICY IF EXISTS "payment_authorizations_select" ON payment_authorizations;
    DROP POLICY IF EXISTS "Users can view their own authorizations" ON payment_authorizations;
    CREATE POLICY "payment_authorizations_select" ON payment_authorizations
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM payment_methods pm WHERE pm.id = payment_authorizations.payment_method_id AND pm.user_id = (SELECT auth.uid()))
        OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      );
  END IF;
END $$;

-- ============================================================================
-- PART 4: FIX REFERRALS SYSTEM (0050) - if tables exist
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_codes') THEN
    DROP POLICY IF EXISTS "referral_codes_view" ON referral_codes;
    DROP POLICY IF EXISTS "referral_codes_manage" ON referral_codes;
    DROP POLICY IF EXISTS "referral_codes_unified" ON referral_codes;
    DROP POLICY IF EXISTS "Users can view their own referral codes" ON referral_codes;
    DROP POLICY IF EXISTS "Users can manage their own referral codes" ON referral_codes;
    CREATE POLICY "referral_codes_unified" ON referral_codes
      FOR ALL USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
    DROP POLICY IF EXISTS "referrals_view" ON referrals;
    DROP POLICY IF EXISTS "referrals_select" ON referrals;
    DROP POLICY IF EXISTS "Users can view their referrals" ON referrals;
    CREATE POLICY "referrals_select" ON referrals
      FOR SELECT USING (
        referrer_id = (SELECT auth.uid()) OR referee_id = (SELECT auth.uid())
        OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_rewards') THEN
    DROP POLICY IF EXISTS "referral_rewards_view" ON referral_rewards;
    DROP POLICY IF EXISTS "referral_rewards_select" ON referral_rewards;
    DROP POLICY IF EXISTS "Users can view their own rewards" ON referral_rewards;
    CREATE POLICY "referral_rewards_select" ON referral_rewards
      FOR SELECT USING (user_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;
END $$;

-- ============================================================================
-- PART 5: FIX RISKS MANAGEMENT SYSTEM (0045) - if tables exist
-- ============================================================================

DO $$
BEGIN
  -- risks - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'risks' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "risks_view" ON risks;
    DROP POLICY IF EXISTS "risks_manage" ON risks;
    DROP POLICY IF EXISTS "risks_unified" ON risks;
    DROP POLICY IF EXISTS "Users can view risks in their organization" ON risks;
    DROP POLICY IF EXISTS "Admins can manage risks" ON risks;
    CREATE POLICY "risks_unified" ON risks FOR ALL USING (org_matches(organization_id));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risks') THEN
    DROP POLICY IF EXISTS "risks_view" ON risks;
    DROP POLICY IF EXISTS "risks_manage" ON risks;
    DROP POLICY IF EXISTS "risks_unified" ON risks;
    CREATE POLICY "risks_unified" ON risks FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- risk_assessments - check if risks table has organization_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'risks' AND column_name = 'organization_id') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_assessments') THEN
    DROP POLICY IF EXISTS "risk_assessments_view" ON risk_assessments;
    DROP POLICY IF EXISTS "risk_assessments_manage" ON risk_assessments;
    DROP POLICY IF EXISTS "risk_assessments_unified" ON risk_assessments;
    CREATE POLICY "risk_assessments_unified" ON risk_assessments
      FOR ALL USING (EXISTS (SELECT 1 FROM risks r WHERE r.id = risk_assessments.risk_id AND org_matches(r.organization_id)));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_assessments') THEN
    DROP POLICY IF EXISTS "risk_assessments_view" ON risk_assessments;
    DROP POLICY IF EXISTS "risk_assessments_manage" ON risk_assessments;
    DROP POLICY IF EXISTS "risk_assessments_unified" ON risk_assessments;
    CREATE POLICY "risk_assessments_unified" ON risk_assessments FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- risk_mitigations - check if risks table has organization_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'risks' AND column_name = 'organization_id') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_mitigations') THEN
    DROP POLICY IF EXISTS "risk_mitigations_view" ON risk_mitigations;
    DROP POLICY IF EXISTS "risk_mitigations_manage" ON risk_mitigations;
    DROP POLICY IF EXISTS "risk_mitigations_unified" ON risk_mitigations;
    CREATE POLICY "risk_mitigations_unified" ON risk_mitigations
      FOR ALL USING (EXISTS (SELECT 1 FROM risks r WHERE r.id = risk_mitigations.risk_id AND org_matches(r.organization_id)));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_mitigations') THEN
    DROP POLICY IF EXISTS "risk_mitigations_view" ON risk_mitigations;
    DROP POLICY IF EXISTS "risk_mitigations_manage" ON risk_mitigations;
    DROP POLICY IF EXISTS "risk_mitigations_unified" ON risk_mitigations;
    CREATE POLICY "risk_mitigations_unified" ON risk_mitigations FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- PART 6-12: REMAINING TABLES - wrapped in conditional blocks
-- ============================================================================

DO $$
BEGIN
  -- scheduled_social_posts (actual table name)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scheduled_social_posts') THEN
    DROP POLICY IF EXISTS "scheduled_social_posts_view" ON scheduled_social_posts;
    DROP POLICY IF EXISTS "scheduled_social_posts_manage" ON scheduled_social_posts;
    DROP POLICY IF EXISTS "scheduled_social_posts_unified" ON scheduled_social_posts;
    CREATE POLICY "scheduled_social_posts_unified" ON scheduled_social_posts
      FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- social_reactions (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_reactions') THEN
    DROP POLICY IF EXISTS "social_reactions_view" ON social_reactions;
    DROP POLICY IF EXISTS "social_reactions_manage" ON social_reactions;
    DROP POLICY IF EXISTS "social_reactions_unified" ON social_reactions;
    CREATE POLICY "social_reactions_unified" ON social_reactions FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- artist_followers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artist_followers') THEN
    DROP POLICY IF EXISTS "artist_followers_view" ON artist_followers;
    DROP POLICY IF EXISTS "artist_followers_manage" ON artist_followers;
  END IF;

  -- venue_followers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venue_followers') THEN
    DROP POLICY IF EXISTS "venue_followers_view" ON venue_followers;
    DROP POLICY IF EXISTS "venue_followers_manage" ON venue_followers;
  END IF;

  -- comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    DROP POLICY IF EXISTS "comments_view" ON comments;
    DROP POLICY IF EXISTS "comments_create" ON comments;
    DROP POLICY IF EXISTS "comments_update" ON comments;
    DROP POLICY IF EXISTS "comments_delete" ON comments;
    DROP POLICY IF EXISTS "comments_select" ON comments;
    DROP POLICY IF EXISTS "comments_insert" ON comments;
    CREATE POLICY "comments_select" ON comments FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (author_id = (SELECT auth.uid()));
    CREATE POLICY "comments_update" ON comments FOR UPDATE USING (author_id = (SELECT auth.uid()));
    CREATE POLICY "comments_delete" ON comments FOR DELETE USING (author_id = (SELECT auth.uid()) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  END IF;

  -- comment_reactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comment_reactions') THEN
    DROP POLICY IF EXISTS "comment_reactions_view" ON comment_reactions;
    DROP POLICY IF EXISTS "comment_reactions_manage" ON comment_reactions;
    DROP POLICY IF EXISTS "comment_reactions_unified" ON comment_reactions;
    CREATE POLICY "comment_reactions_unified" ON comment_reactions FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  -- entity_versions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entity_versions') THEN
    DROP POLICY IF EXISTS "entity_versions_view" ON entity_versions;
    DROP POLICY IF EXISTS "entity_versions_create" ON entity_versions;
    DROP POLICY IF EXISTS "entity_versions_select" ON entity_versions;
    DROP POLICY IF EXISTS "entity_versions_insert" ON entity_versions;
    CREATE POLICY "entity_versions_select" ON entity_versions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    CREATE POLICY "entity_versions_insert" ON entity_versions FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- campaign_clicks - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaign_clicks' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "campaign_clicks_view" ON campaign_clicks;
    DROP POLICY IF EXISTS "campaign_clicks_select" ON campaign_clicks;
    DROP POLICY IF EXISTS "campaign_clicks_insert" ON campaign_clicks;
    CREATE POLICY "campaign_clicks_select" ON campaign_clicks FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
    CREATE POLICY "campaign_clicks_insert" ON campaign_clicks FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_clicks') THEN
    -- Table exists but no organization_id, use user-based policy
    DROP POLICY IF EXISTS "campaign_clicks_view" ON campaign_clicks;
    DROP POLICY IF EXISTS "campaign_clicks_select" ON campaign_clicks;
    DROP POLICY IF EXISTS "campaign_clicks_insert" ON campaign_clicks;
    CREATE POLICY "campaign_clicks_select" ON campaign_clicks FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
    CREATE POLICY "campaign_clicks_insert" ON campaign_clicks FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- campaign_conversions - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaign_conversions' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "campaign_conversions_view" ON campaign_conversions;
    DROP POLICY IF EXISTS "campaign_conversions_select" ON campaign_conversions;
    CREATE POLICY "campaign_conversions_select" ON campaign_conversions FOR SELECT USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_conversions') THEN
    DROP POLICY IF EXISTS "campaign_conversions_view" ON campaign_conversions;
    DROP POLICY IF EXISTS "campaign_conversions_select" ON campaign_conversions;
    CREATE POLICY "campaign_conversions_select" ON campaign_conversions FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- alert_thresholds - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alert_thresholds' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "alert_thresholds_view" ON alert_thresholds;
    DROP POLICY IF EXISTS "alert_thresholds_manage" ON alert_thresholds;
    DROP POLICY IF EXISTS "alert_thresholds_unified" ON alert_thresholds;
    CREATE POLICY "alert_thresholds_unified" ON alert_thresholds FOR ALL USING (org_matches(organization_id) OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alert_thresholds') THEN
    DROP POLICY IF EXISTS "alert_thresholds_view" ON alert_thresholds;
    DROP POLICY IF EXISTS "alert_thresholds_manage" ON alert_thresholds;
    DROP POLICY IF EXISTS "alert_thresholds_unified" ON alert_thresholds;
    CREATE POLICY "alert_thresholds_unified" ON alert_thresholds FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- experience_templates - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'experience_templates' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "experience_templates_view" ON experience_templates;
    DROP POLICY IF EXISTS "experience_templates_manage" ON experience_templates;
    DROP POLICY IF EXISTS "experience_templates_unified" ON experience_templates;
    CREATE POLICY "experience_templates_unified" ON experience_templates FOR ALL USING (org_matches(organization_id) OR is_public = TRUE OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'experience_templates') THEN
    DROP POLICY IF EXISTS "experience_templates_view" ON experience_templates;
    DROP POLICY IF EXISTS "experience_templates_manage" ON experience_templates;
    DROP POLICY IF EXISTS "experience_templates_unified" ON experience_templates;
    CREATE POLICY "experience_templates_unified" ON experience_templates FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;

  -- generated_experiences - check for organization_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'generated_experiences' AND column_name = 'organization_id') THEN
    DROP POLICY IF EXISTS "generated_experiences_view" ON generated_experiences;
    DROP POLICY IF EXISTS "generated_experiences_manage" ON generated_experiences;
    DROP POLICY IF EXISTS "generated_experiences_unified" ON generated_experiences;
    CREATE POLICY "generated_experiences_unified" ON generated_experiences FOR ALL USING (created_by = (SELECT auth.uid()) OR org_matches(organization_id));
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_experiences') THEN
    DROP POLICY IF EXISTS "generated_experiences_view" ON generated_experiences;
    DROP POLICY IF EXISTS "generated_experiences_manage" ON generated_experiences;
    DROP POLICY IF EXISTS "generated_experiences_unified" ON generated_experiences;
    CREATE POLICY "generated_experiences_unified" ON generated_experiences FOR ALL USING (created_by = (SELECT auth.uid()));
  END IF;
END $$;
