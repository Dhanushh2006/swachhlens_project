create or replace function public.notify_assignment() returns trigger
language plpgsql security definer set search_path=public as $$
declare civic_id text; reporter uuid;
begin
  select display_id, reporter_id into civic_id, reporter from public.incidents where id=new.incident_id;
  insert into public.notifications(user_id,title,message,type)
  select tm.user_id,'New cleanup assignment',civic_id || ' has been assigned to your team.','ASSIGNMENT'
  from public.team_members tm where tm.team_id=new.team_id;
  if reporter is not null then
    insert into public.notifications(user_id,title,message,type)
    values(reporter,'Your report has been assigned',civic_id || ' has been assigned to a response team.','INFO');
  end if;
  return new;
end $$;
create trigger assignment_notifications after insert on public.assignments for each row execute function public.notify_assignment();

create or replace function public.notify_resolution() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.status='RESOLVED' and old.status is distinct from new.status and new.reporter_id is not null then
    insert into public.notifications(user_id,title,message,type)
    values(new.reporter_id,'Cleanup verified',new.display_id || ' has been resolved with verified cleanup evidence.','RESOLVED');
  end if;
  return new;
end $$;
create trigger resolution_notifications after update of status on public.incidents for each row execute function public.notify_resolution();
