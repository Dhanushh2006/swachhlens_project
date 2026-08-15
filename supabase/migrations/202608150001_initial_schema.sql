-- SWACHHLENS operational schema
create extension if not exists pgcrypto;
create extension if not exists postgis with schema extensions;

create type public.user_role as enum ('CITIZEN','FIELD_WORKER','MUNICIPAL_OFFICER','ADMIN','RECYCLING_PARTNER');
create type public.incident_status as enum ('REPORTED','AI_ANALYZED','PRIORITIZED','ASSIGNED','ACCEPTED','DISPATCHED','ON_SITE','CLEANUP_IN_PROGRESS','CLEANUP_COMPLETED','VERIFICATION','RESOLVED');
create type public.priority_level as enum ('CRITICAL','HIGH','MEDIUM','LOW');
create type public.volume_category as enum ('Small','Medium','Large','Very Large');
create type public.resource_availability as enum ('AVAILABLE','ASSIGNED','OFF_DUTY','MAINTENANCE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'CITIZEN',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.incident_display_seq start with 2048;
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  display_id text unique not null default ('SW-' || nextval('public.incident_display_seq')::text),
  reporter_id uuid references public.profiles(id) on delete set null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text not null,
  captured_at timestamptz not null,
  description text not null default '',
  status public.incident_status not null default 'REPORTED',
  waste_category text,
  volume_category public.volume_category,
  action_score smallint check (action_score between 0 and 100),
  priority_level public.priority_level,
  location_sensitivity text check (location_sensitivity in ('HIGH','MEDIUM','LOW')),
  sensitivity_reason text,
  report_count integer not null default 1 check (report_count > 0),
  score_factors jsonb not null default '{}'::jsonb,
  duplicate_master_id uuid references public.incidents(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incident_media (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image','video')),
  uploaded_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  waste_categories jsonb not null,
  confidence_scores jsonb not null,
  volume_category public.volume_category not null,
  volume_confidence numeric(4,3) check (volume_confidence between 0 and 1),
  hazard_flags jsonb not null default '[]'::jsonb,
  detected_regions jsonb not null default '[]'::jsonb,
  recommended_action jsonb not null,
  model_version text not null,
  is_prototype boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.duplicate_clusters (
  id uuid primary key default gen_random_uuid(),
  master_incident_id uuid not null unique references public.incidents(id) on delete cascade,
  similarity_score numeric(4,3) not null check (similarity_score between 0 and 1),
  detection_reason jsonb not null,
  created_at timestamptz not null default now()
);
create table public.duplicate_cluster_members (
  cluster_id uuid not null references public.duplicate_clusters(id) on delete cascade,
  incident_id uuid not null references public.incidents(id) on delete cascade,
  similarity_score numeric(4,3) not null check (similarity_score between 0 and 1),
  primary key (cluster_id, incident_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_type text not null,
  worker_count integer not null check (worker_count >= 0),
  availability public.resource_availability not null default 'AVAILABLE',
  current_location jsonb,
  created_at timestamptz not null default now()
);
create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (team_id, user_id)
);
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vehicle_type text not null,
  capacity text not null,
  availability public.resource_availability not null default 'AVAILABLE',
  current_location jsonb
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  vehicle_id uuid not null references public.vehicles(id),
  assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  dispatched_at timestamptz,
  completed_at timestamptz,
  status text not null default 'ASSIGNED' check (status in ('ASSIGNED','ACCEPTED','DISPATCHED','ON_SITE','IN_PROGRESS','COMPLETED'))
);

create table public.cleanup_verifications (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  before_media_id uuid references public.incident_media(id),
  after_media_path text not null,
  verification_status text not null check (verification_status in ('VERIFIED','MANUAL_REVIEW')),
  confidence numeric(4,3) check (confidence between 0 and 1),
  remaining_waste_indicator text check (remaining_waste_indicator in ('LOW','MEDIUM','HIGH')),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'INFO',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.hotspots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  center_latitude double precision not null,
  center_longitude double precision not null,
  risk_score smallint not null check (risk_score between 0 and 100),
  report_count integer not null default 0,
  trend numeric not null default 0,
  dominant_category text,
  average_resolution_time numeric,
  signal text,
  recommendation text,
  is_prototype boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.incident_status_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  from_status public.incident_status,
  to_status public.incident_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index incidents_priority_score_idx on public.incidents (status, action_score desc) where status <> 'RESOLVED';
create index incidents_reporter_idx on public.incidents (reporter_id, created_at desc);
create index incidents_created_idx on public.incidents (created_at desc);
create index incidents_category_idx on public.incidents (waste_category, created_at desc);
create index incidents_geo_rough_idx on public.incidents (latitude, longitude);
create index incident_media_incident_idx on public.incident_media (incident_id);
create index ai_analyses_incident_idx on public.ai_analyses (incident_id, created_at desc);
create index assignments_incident_idx on public.assignments (incident_id);
create index assignments_team_status_idx on public.assignments (team_id, status);
create index notifications_user_unread_idx on public.notifications (user_id, read, created_at desc);
create index status_events_incident_idx on public.incident_status_events (incident_id, created_at);
create index cluster_members_incident_idx on public.duplicate_cluster_members (incident_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger incidents_updated_at before update on public.incidents for each row execute function public.set_updated_at();
create trigger hotspots_updated_at before update on public.hotspots for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email, 'CITIZEN');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
