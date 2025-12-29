-- 0126_disable_auth_trigger_for_seeding.sql
-- Temporarily disable the auth user trigger to allow seeding demo users
-- The trigger will be re-enabled in the next migration

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
