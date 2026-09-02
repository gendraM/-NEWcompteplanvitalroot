-- Align-Life / My Way — fondation P2.5 + P3
-- Migration appliquée au projet Supabase connecté le 2 septembre 2026.
begin;
alter table public.profil alter column user_id set not null;
alter table public.profil enable row level security;
drop policy if exists "Allow select for al" on public.profil;
drop policy if exists "Allow select for all" on public.profil;
drop policy if exists "Allow select for all e" on public.profil;
create policy "profil_select_own" on public.profil for select to authenticated using ((select auth.uid()) = user_id);
create policy "profil_insert_own" on public.profil for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profil_update_own" on public.profil for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profil_delete_own" on public.profil for delete to authenticated using ((select auth.uid()) = user_id);
create table if not exists public.my_way_items (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_type text not null check (item_type in ('direction','aspiration','incarnation','grow')), content text not null check (length(trim(content)) > 0), source text not null default 'user' check (source in ('user','grow','ai')), status text not null default 'validated' check (status in ('draft','proposed','validated','refused','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists idx_my_way_items_user_id on public.my_way_items(user_id);
create index if not exists idx_my_way_items_user_type_status on public.my_way_items(user_id,item_type,status);
alter table public.my_way_items enable row level security;
drop policy if exists "my_way_items_select_own" on public.my_way_items;
drop policy if exists "my_way_items_insert_own" on public.my_way_items;
drop policy if exists "my_way_items_update_own" on public.my_way_items;
drop policy if exists "my_way_items_delete_own" on public.my_way_items;
create policy "my_way_items_select_own" on public.my_way_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "my_way_items_insert_own" on public.my_way_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "my_way_items_update_own" on public.my_way_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "my_way_items_delete_own" on public.my_way_items for delete to authenticated using ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.my_way_items to authenticated;
commit;
