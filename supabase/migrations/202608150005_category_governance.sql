create table public.waste_categories (
  id text primary key,
  name text unique not null,
  active boolean not null default true,
  handling_notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger waste_categories_updated_at before update on public.waste_categories for each row execute function public.set_updated_at();
alter table public.waste_categories enable row level security;
create policy waste_categories_authenticated_select on public.waste_categories for select to authenticated using (true);
create policy waste_categories_admin_manage on public.waste_categories for all using (public.current_user_role()='ADMIN') with check (public.current_user_role()='ADMIN');
create index waste_categories_active_sort_idx on public.waste_categories (active, sort_order);

insert into public.waste_categories(id,name,handling_notes,sort_order) values
('cat-overflow','Overflowing bin','Standard collection; assess spill perimeter.',1),
('cat-dump','Garbage dump','Mixed-waste crew and segregation assessment.',2),
('cat-plastic','Plastic waste','Route recoverable material to recycling partner.',3),
('cat-construction','Construction debris','Bulk crew; inspect drains and road obstruction.',4),
('cat-organic','Organic waste','Covered collection and hygiene controls.',5),
('cat-ewaste','E-waste','Authorized recovery with battery precautions.',6),
('cat-hazardous','Hazardous waste','Immediate isolation and trained response.',7),
('cat-drain','Drain blockage','Drainage response and water-flow verification.',8)
on conflict (id) do nothing;
