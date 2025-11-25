-- 0026_performance_tuning.sql
-- Performance optimization and query tuning configurations

-- Configure connection pooling parameters
-- Note: These settings require superuser privileges and should be configured at the infrastructure level
-- alter system set max_connections = 100;
-- alter system set shared_buffers = '256MB';
-- alter system set effective_cache_size = '1GB';
-- alter system set maintenance_work_mem = '128MB';
-- alter system set checkpoint_completion_target = 0.9;
-- alter system set wal_buffers = '16MB';
-- alter system set default_statistics_target = 100;
-- alter system set random_page_cost = 1.1;
-- alter system set effective_io_concurrency = 200;
-- alter system set work_mem = '4MB';
-- alter system set min_wal_size = '1GB';
-- alter system set max_wal_size = '4GB';

-- Create query optimization hints function
create or replace function explain_query(query_text text)
returns table (plan text)
language plpgsql
security definer
as $$
begin
  return query execute 'explain (analyze, buffers, format json) ' || query_text;
end;
$$;

-- Create function to analyze slow queries
create or replace function analyze_slow_queries(
  min_duration_ms int default 1000,
  limit_rows int default 100
)
returns table (
  query text,
  calls bigint,
  total_time double precision,
  mean_time double precision,
  max_time double precision
)
language sql
security definer
as $$
  select 
    query,
    calls,
    total_exec_time as total_time,
    mean_exec_time as mean_time,
    max_exec_time as max_time
  from pg_stat_statements
  where mean_exec_time > min_duration_ms
  order by total_exec_time desc
  limit limit_rows;
$$;

-- Create function to monitor table bloat
create or replace function check_table_bloat()
returns table (
  schemaname name,
  tablename name,
  row_count bigint,
  dead_tuple_count bigint,
  dead_tuple_percent numeric
)
language sql
security definer
as $$
  select 
    schemaname,
    relname as tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_tuple_count,
    case 
      when n_live_tup > 0 
      then round((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
      else 0
    end as dead_tuple_percent
  from pg_stat_user_tables
  where n_dead_tup > 1000
  order by n_dead_tup desc;
$$;

-- Add query timeout to prevent long-running queries
-- Note: This should be configured at the application connection level
-- alter database postgres set statement_timeout = '30s';

-- Create function to reset connection pool stats
create or replace function reset_connection_stats()
returns void
language sql
security definer
as $$
  select pg_stat_reset();
$$;

comment on function explain_query is 'Analyze query execution plan with buffers and timing';
comment on function analyze_slow_queries is 'Identify slow queries for optimization';
comment on function check_table_bloat is 'Monitor table bloat for maintenance planning';
comment on function reset_connection_stats is 'Reset PostgreSQL statistics';
