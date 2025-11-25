-- 0031_production_advancing_automation.sql
-- Automation triggers and actions for Production Advancing workflow

-- Add automation triggers for production advancing
insert into automation_trigger_catalog (key, label, description, platform_scope, payload_schema)
values
  ('compvss.advance.submitted', 'Production Advance Submitted', 
   'Fired when a production advance is submitted from COMPVSS to ATLVS for review', 
   array['COMPVSS', 'ATLVS'],
   '{"type":"object","required":["advance_id","submitter_id"],"properties":{"advance_id":{"type":"string"},"submitter_id":{"type":"string"},"estimated_cost":{"type":"number"}}}'::jsonb),
   
  ('atlvs.advance.approved', 'Production Advance Approved', 
   'Fired when ATLVS approves a production advance request', 
   array['ATLVS', 'COMPVSS'],
   '{"type":"object","required":["advance_id","reviewed_by"],"properties":{"advance_id":{"type":"string"},"reviewed_by":{"type":"string"},"approved_cost":{"type":"number"}}}'::jsonb),
   
  ('atlvs.advance.rejected', 'Production Advance Rejected', 
   'Fired when ATLVS rejects a production advance request', 
   array['ATLVS', 'COMPVSS'],
   '{"type":"object","required":["advance_id","reviewed_by","reason"],"properties":{"advance_id":{"type":"string"},"reviewed_by":{"type":"string"},"reason":{"type":"string"}}}'::jsonb),
   
  ('compvss.advance.fulfilled', 'Production Advance Fulfilled', 
   'Fired when COMPVSS marks a production advance as fulfilled', 
   array['COMPVSS', 'ATLVS'],
   '{"type":"object","required":["advance_id","fulfilled_by"],"properties":{"advance_id":{"type":"string"},"fulfilled_by":{"type":"string"},"actual_cost":{"type":"number"}}}'::jsonb)
on conflict (key) do update set 
  label = excluded.label,
  description = excluded.description,
  platform_scope = excluded.platform_scope,
  payload_schema = excluded.payload_schema,
  enabled = true,
  updated_at = now();

-- Add automation actions for production advancing  
insert into automation_action_catalog (key, label, description, platform_scope, payload_schema, requires_confirmation)
values
  ('atlvs.advance.review', 'Review Production Advance in ATLVS', 
   'Create notification in ATLVS for production advance review', 
   array['ATLVS'],
   '{"type":"object","required":["advance_id"],"properties":{"advance_id":{"type":"string"},"priority":{"type":"string","enum":["low","medium","high","urgent"]}}}'::jsonb,
   false),
   
  ('compvss.advance.notify_status', 'Notify COMPVSS of Advance Status Change', 
   'Send notification to COMPVSS when advance status changes', 
   array['COMPVSS'],
   '{"type":"object","required":["advance_id","status"],"properties":{"advance_id":{"type":"string"},"status":{"type":"string"},"message":{"type":"string"}}}'::jsonb,
   false),
   
  ('atlvs.advance.create_po', 'Create Purchase Order from Advance', 
   'Automatically create a purchase order in ATLVS from approved advance', 
   array['ATLVS'],
   '{"type":"object","required":["advance_id","vendor_id"],"properties":{"advance_id":{"type":"string"},"vendor_id":{"type":"string"},"project_id":{"type":"string"}}}'::jsonb,
   true),
   
  ('compvss.advance.alert_fulfillment', 'Alert COMPVSS for Fulfillment', 
   'Send alert to COMPVSS team to fulfill approved advance', 
   array['COMPVSS'],
   '{"type":"object","required":["advance_id"],"properties":{"advance_id":{"type":"string"},"due_date":{"type":"string"}}}'::jsonb,
   false)
on conflict (key) do update set 
  label = excluded.label,
  description = excluded.description,
  platform_scope = excluded.platform_scope,
  payload_schema = excluded.payload_schema,
  requires_confirmation = excluded.requires_confirmation,
  enabled = true,
  updated_at = now();

-- Create helper function to log advance events
create or replace function log_advance_event(
  p_advance_id uuid,
  p_event_type text,
  p_user_id uuid default null,
  p_notes text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_advance production_advances;
  v_org_slug text;
begin
  -- Get advance details
  select * into v_advance from production_advances where id = p_advance_id;
  
  if not found then
    raise exception 'Advance not found: %', p_advance_id;
  end if;
  
  -- Get org slug
  select slug into v_org_slug from organizations where id = v_advance.organization_id;
  
  -- Log the event
  perform rpc_log_automation_event(
    'trigger'::automation_kind,
    p_event_type,
    'success'::automation_status,
    case when p_event_type like 'compvss%' then 'COMPVSS' else 'ATLVS' end,
    v_org_slug,
    jsonb_build_object(
      'advance_id', p_advance_id,
      'status', v_advance.status,
      'user_id', coalesce(p_user_id, current_platform_user_id()),
      'notes', p_notes
    )
  );
end;
$$;

grant execute on function log_advance_event(uuid, text, uuid, text) to authenticated;

-- Trigger function to log advance status changes
create or replace function trigger_advance_status_change()
returns trigger as $$
begin
  -- Log status change events
  if old.status is distinct from new.status then
    case new.status
      when 'submitted' then
        perform log_advance_event(new.id, 'compvss.advance.submitted', new.submitter_id, 'Advance submitted for review');
      when 'approved' then
        perform log_advance_event(new.id, 'atlvs.advance.approved', new.reviewed_by, new.reviewer_notes);
      when 'rejected' then
        perform log_advance_event(new.id, 'atlvs.advance.rejected', new.reviewed_by, new.reviewer_notes);
      when 'fulfilled' then
        perform log_advance_event(new.id, 'compvss.advance.fulfilled', new.fulfilled_by, new.fulfillment_notes);
      else
        null; -- No logging for other status changes
    end case;
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger production_advances_status_change
  after update on production_advances
  for each row
  when (old.status is distinct from new.status)
  execute function trigger_advance_status_change();

comment on function log_advance_event is 'Helper function to log production advance events to automation_usage_log';
comment on function trigger_advance_status_change is 'Automatically log advance status changes to automation system';
