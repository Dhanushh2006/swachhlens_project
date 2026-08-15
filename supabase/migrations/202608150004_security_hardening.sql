drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (id=auth.uid()) with check (id=auth.uid() and role=public.current_user_role());

create or replace function public.guard_worker_incident_update() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.current_user_role()='FIELD_WORKER' then
    if new.reporter_id is distinct from old.reporter_id or new.latitude is distinct from old.latitude or new.longitude is distinct from old.longitude
      or new.address is distinct from old.address or new.captured_at is distinct from old.captured_at or new.description is distinct from old.description
      or new.waste_category is distinct from old.waste_category or new.volume_category is distinct from old.volume_category
      or new.action_score is distinct from old.action_score or new.priority_level is distinct from old.priority_level
      or new.location_sensitivity is distinct from old.location_sensitivity or new.report_count is distinct from old.report_count
      or new.score_factors is distinct from old.score_factors or new.duplicate_master_id is distinct from old.duplicate_master_id then
      raise exception 'Field workers may only advance assigned incident workflow';
    end if;
  end if;
  return new;
end $$;
create trigger guard_worker_fields before update on public.incidents for each row execute function public.guard_worker_incident_update();

drop policy if exists storage_cleanup_worker_insert on storage.objects;
create policy storage_cleanup_worker_insert on storage.objects for insert to authenticated with check (
  bucket_id='cleanup-evidence' and public.current_user_role()='FIELD_WORKER' and exists(
    select 1 from public.assignments a join public.team_members tm on tm.team_id=a.team_id
    where a.incident_id::text=(storage.foldername(name))[1] and tm.user_id=auth.uid()
  )
);
