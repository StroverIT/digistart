-- Custom domains for online store tenants (managed via Next.js + service role).

create type public.store_domain_status as enum (
  'pending',
  'configured',
  'misconfigured'
);

create table public.store_domains (
  id uuid primary key default gen_random_uuid(),
  order_item_id text not null,
  user_id text not null,
  service_id text not null default 'ready-store',
  tenant_project_id text,
  domain text not null,
  status public.store_domain_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_domains_order_item_id_key unique (order_item_id)
);

create unique index store_domains_domain_lower_idx on public.store_domains (lower(domain));
create index store_domains_user_id_idx on public.store_domains (user_id);
create index store_domains_status_idx on public.store_domains (status);

create or replace function public.set_store_domains_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger store_domains_updated_at
  before update on public.store_domains
  for each row
  execute function public.set_store_domains_updated_at();

alter table public.store_domains enable row level security;
