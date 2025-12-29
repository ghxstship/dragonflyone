-- 0127_reenable_auth_trigger.sql
-- Re-enable the auth user trigger after seeding

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_insert();
