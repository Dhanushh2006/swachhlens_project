-- Validated status machine and transactional assignment functions.
create or replace function public.status_position(value public.incident_status) returns integer
language sql immutable as $$ select array_position(array['REPORTED','AI_ANALYZED','PRIORITIZED','ASSIGNED','ACCEPTED','DISPATCHED','ON_SITE','CLEANUP_IN_PROGRESS','CLEANUP_COMPLETED','VERIFICATION','RESOLVED']::text[], value::text) $$;

create or replace function public.validate_incident_transition() returns trigger language plpgsql as $$
begin
  if new.status <> old.status and coalesce(current_setting('app.seed_mode',true),'off') <> 'on' then
    if public.status_position(new.status) <> public.status_position(old.status)+1 then
      raise exception 'Invalid incident transition: % -> %', old.status, new.status using errcode='check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger validate_status before update of status on public.incidents for each row execute function public.validate_incident_transition();

create or replace function public.record_incident_transition() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status <> old.status then
    insert into public.incident_status_events(incident_id,from_status,to_status,actor_id) values(new.id,old.status,new.status,auth.uid());
    insert into public.audit_logs(user_id,action,entity_type,entity_id,metadata) values(auth.uid(),'STATUS_'||new.status::text,'incident',new.id::text,jsonb_build_object('from',old.status,'to',new.status));
  end if;
  return new;
end $$;
create trigger record_status after update of status on public.incidents for each row execute function public.record_incident_transition();

create or replace function public.assign_response(target_incident uuid, target_team uuid, target_vehicle uuid) returns public.assignments
language plpgsql security definer set search_path=public as $$
declare result public.assignments;
begin
  if not public.is_operations_role() then raise exception 'Not authorized'; end if;
  if not exists(select 1 from incidents where id=target_incident and status='PRIORITIZED' and duplicate_master_id is null for update) then raise exception 'Incident is not ready for assignment'; end if;
  if not exists(select 1 from teams where id=target_team and availability='AVAILABLE' for update) then raise exception 'Team unavailable'; end if;
  if not exists(select 1 from vehicles where id=target_vehicle and availability='AVAILABLE' for update) then raise exception 'Vehicle unavailable'; end if;
  insert into assignments(incident_id,team_id,vehicle_id,assigned_by) values(target_incident,target_team,target_vehicle,auth.uid()) returning * into result;
  update incidents set status='ASSIGNED' where id=target_incident;
  update teams set availability='ASSIGNED' where id=target_team;
  update vehicles set availability='ASSIGNED' where id=target_vehicle;
  return result;
end $$;

create or replace function public.advance_incident_status(target_incident uuid, target_status public.incident_status, transition_note text default null) returns public.incidents
language plpgsql security definer set search_path=public as $$
declare result public.incidents; current_state public.incident_status;
begin
  select status into current_state from incidents where id=target_incident for update;
  if current_state is null then raise exception 'Incident not found'; end if;
  if not (public.is_operations_role() or public.is_assigned_worker(target_incident)) then raise exception 'Not authorized'; end if;
  update incidents set status=target_status where id=target_incident returning * into result;
  update incident_status_events set note=transition_note where incident_id=target_incident and to_status=target_status and actor_id=auth.uid() and created_at>now()-interval '5 seconds';
  return result;
end $$;

grant execute on function public.assign_response(uuid,uuid,uuid) to authenticated;
grant execute on function public.advance_incident_status(uuid,public.incident_status,text) to authenticated;

alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.assignments;
alter publication supabase_realtime add table public.cleanup_verifications;
alter publication supabase_realtime add table public.notifications;
