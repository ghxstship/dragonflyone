-- 0025_realtime_config.sql
-- Configure Realtime for key tables to enable real-time subscriptions

alter publication supabase_realtime add table deals;
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table assets;
alter publication supabase_realtime add table contacts;
alter publication supabase_realtime add table ledger_entries;
alter publication supabase_realtime add table finance_expenses;
alter publication supabase_realtime add table finance_purchase_orders;
alter publication supabase_realtime add table workforce_time_entries;
alter publication supabase_realtime add table webhook_event_logs;
alter publication supabase_realtime add table audit_log;

comment on publication supabase_realtime is 'Realtime publication for GHXSTSHIP platform tables enabling WebSocket subscriptions';
