-- Database authorization boundary. Frontend checks are not trusted.
create or replace function public.current_user_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.is_operations_role() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('MUNICIPAL_OFFICER','ADMIN'), false)
$$;
create or replace function public.is_assigned_worker(target_incident uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.assignments a join public.team_members tm on tm.team_id = a.team_id
    where a.incident_id = target_incident and tm.user_id = auth.uid()
  )
$$;

alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_media enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.duplicate_clusters enable row level security;
alter table public.duplicate_cluster_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.vehicles enable row level security;
alter table public.assignments enable row level security;
alter table public.cleanup_verifications enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.hotspots enable row level security;
alter table public.incident_status_events enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid() or public.is_operations_role());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy profiles_admin_all on public.profiles for all using (public.current_user_role() = 'ADMIN') with check (public.current_user_role() = 'ADMIN');

create policy incidents_citizen_insert on public.incidents for insert with check (reporter_id = auth.uid() and public.current_user_role() = 'CITIZEN' and status = 'REPORTED');
create policy incidents_citizen_select on public.incidents for select using (reporter_id = auth.uid());
create policy incidents_worker_select on public.incidents for select using (public.current_user_role() = 'FIELD_WORKER' and public.is_assigned_worker(id));
create policy incidents_worker_update on public.incidents for update using (public.current_user_role() = 'FIELD_WORKER' and public.is_assigned_worker(id)) with check (public.is_assigned_worker(id));
create policy incidents_recycler_select on public.incidents for select using (public.current_user_role() = 'RECYCLING_PARTNER' and waste_category in ('Plastic waste','E-waste'));
create policy incidents_operations_all on public.incidents for all using (public.is_operations_role()) with check (public.is_operations_role());

create policy media_owner_select on public.incident_media for select using (exists(select 1 from public.incidents i where i.id=incident_id and i.reporter_id=auth.uid()));
create policy media_owner_insert on public.incident_media for insert with check (exists(select 1 from public.incidents i where i.id=incident_id and i.reporter_id=auth.uid()));
create policy media_worker_select on public.incident_media for select using (public.is_assigned_worker(incident_id));
create policy media_worker_insert on public.incident_media for insert with check (public.is_assigned_worker(incident_id));
create policy media_operations_all on public.incident_media for all using (public.is_operations_role()) with check (public.is_operations_role());

create policy analysis_related_select on public.ai_analyses for select using (public.is_operations_role() or public.is_assigned_worker(incident_id) or exists(select 1 from public.incidents i where i.id=incident_id and i.reporter_id=auth.uid()));
create policy analysis_service_ops on public.ai_analyses for all using (public.is_operations_role()) with check (public.is_operations_role());

create policy clusters_operations on public.duplicate_clusters for all using (public.is_operations_role()) with check (public.is_operations_role());
create policy cluster_members_operations on public.duplicate_cluster_members for all using (public.is_operations_role()) with check (public.is_operations_role());

create policy teams_authenticated_select on public.teams for select to authenticated using (true);
create policy teams_admin_manage on public.teams for all using (public.current_user_role()='ADMIN') with check (public.current_user_role()='ADMIN');
create policy team_members_self_select on public.team_members for select using (user_id=auth.uid() or public.is_operations_role());
create policy team_members_admin_manage on public.team_members for all using (public.current_user_role()='ADMIN') with check (public.current_user_role()='ADMIN');
create policy vehicles_authenticated_select on public.vehicles for select to authenticated using (true);
create policy vehicles_admin_manage on public.vehicles for all using (public.current_user_role()='ADMIN') with check (public.current_user_role()='ADMIN');

create policy assignments_worker_select on public.assignments for select using (exists(select 1 from public.team_members tm where tm.team_id=assignments.team_id and tm.user_id=auth.uid()));
create policy assignments_worker_update on public.assignments for update using (exists(select 1 from public.team_members tm where tm.team_id=assignments.team_id and tm.user_id=auth.uid())) with check (exists(select 1 from public.team_members tm where tm.team_id=assignments.team_id and tm.user_id=auth.uid()));
create policy assignments_operations_all on public.assignments for all using (public.is_operations_role()) with check (public.is_operations_role());
create policy assignments_recycler_select on public.assignments for select using (public.current_user_role()='RECYCLING_PARTNER' and exists(select 1 from public.incidents i where i.id=incident_id and i.waste_category in ('Plastic waste','E-waste')));

create policy verification_related_select on public.cleanup_verifications for select using (public.is_operations_role() or public.is_assigned_worker(incident_id) or exists(select 1 from public.incidents i where i.id=incident_id and i.reporter_id=auth.uid()));
create policy verification_worker_insert on public.cleanup_verifications for insert with check (public.is_assigned_worker(incident_id));
create policy verification_operations_all on public.cleanup_verifications for all using (public.is_operations_role()) with check (public.is_operations_role());

create policy notifications_owner_select on public.notifications for select using (user_id=auth.uid());
create policy notifications_owner_update on public.notifications for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy notifications_operations_insert on public.notifications for insert with check (public.is_operations_role());
create policy audit_operations_select on public.audit_logs for select using (public.is_operations_role());
create policy audit_authenticated_insert on public.audit_logs for insert to authenticated with check (user_id=auth.uid());
create policy hotspots_operations on public.hotspots for all using (public.is_operations_role()) with check (public.is_operations_role());
create policy hotspots_authenticated_select on public.hotspots for select to authenticated using (true);
create policy events_related_select on public.incident_status_events for select using (public.is_operations_role() or public.is_assigned_worker(incident_id) or exists(select 1 from public.incidents i where i.id=incident_id and i.reporter_id=auth.uid()));
create policy events_worker_insert on public.incident_status_events for insert with check (public.is_assigned_worker(incident_id) and actor_id=auth.uid());
create policy events_operations_all on public.incident_status_events for all using (public.is_operations_role()) with check (public.is_operations_role());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values
('incident-media','incident-media',false,8388608,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']),
('cleanup-evidence','cleanup-evidence',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy storage_incident_insert on storage.objects for insert to authenticated with check (bucket_id='incident-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy storage_incident_owner_select on storage.objects for select to authenticated using (bucket_id='incident-media' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_operations_role()));
create policy storage_cleanup_worker_insert on storage.objects for insert to authenticated with check (bucket_id='cleanup-evidence' and public.current_user_role()='FIELD_WORKER');
create policy storage_cleanup_related_select on storage.objects for select to authenticated using (bucket_id='cleanup-evidence' and public.current_user_role() in ('FIELD_WORKER','MUNICIPAL_OFFICER','ADMIN'));
