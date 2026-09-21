do $$
begin
  if exists (select 1 from public.ideaux where user_id is null) then
    raise exception 'Migration interrompue : ideaux contient encore des user_id NULL';
  end if;
  if exists (select 1 from public.seances_reelles where user_id is null) then
    raise exception 'Migration interrompue : seances_reelles contient encore des user_id NULL';
  end if;
  if exists (
    select 1 from public.seances_reelles s
    join public.ideaux i on i.id = s.ideal_id
    where s.user_id is distinct from i.user_id
  ) then
    raise exception 'Migration interrompue : propriétaires incohérents';
  end if;
end $$;

alter table public.ideaux alter column user_id set default auth.uid(), alter column user_id set not null;
alter table public.seances_reelles alter column user_id set default auth.uid(), alter column user_id set not null;
create index if not exists seances_reelles_user_id_ideal_id_idx on public.seances_reelles (user_id, ideal_id);
alter table public.ideaux enable row level security;
alter table public.seances_reelles enable row level security;

drop policy if exists "all" on public.ideaux;
drop policy if exists "allow" on public.seances_reelles;
drop policy if exists "ideaux_select_owner" on public.ideaux;
drop policy if exists "ideaux_insert_owner" on public.ideaux;
drop policy if exists "ideaux_update_owner" on public.ideaux;
drop policy if exists "ideaux_delete_owner" on public.ideaux;
create policy "ideaux_select_owner" on public.ideaux for select to authenticated using ((select auth.uid()) = user_id);
create policy "ideaux_insert_owner" on public.ideaux for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ideaux_update_owner" on public.ideaux for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ideaux_delete_owner" on public.ideaux for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "seances_reelles_select_owner" on public.seances_reelles;
drop policy if exists "seances_reelles_insert_owner" on public.seances_reelles;
drop policy if exists "seances_reelles_update_owner" on public.seances_reelles;
drop policy if exists "seances_reelles_delete_owner" on public.seances_reelles;
create policy "seances_reelles_select_owner" on public.seances_reelles for select to authenticated using ((select auth.uid()) = user_id);
create policy "seances_reelles_insert_owner" on public.seances_reelles for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (select 1 from public.ideaux i where i.id = ideal_id and i.user_id = (select auth.uid())));
create policy "seances_reelles_update_owner" on public.seances_reelles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and exists (select 1 from public.ideaux i where i.id = ideal_id and i.user_id = (select auth.uid())));
create policy "seances_reelles_delete_owner" on public.seances_reelles for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.ideaux from anon, authenticated;
revoke all on table public.seances_reelles from anon, authenticated;
grant select, insert, update, delete on table public.ideaux to authenticated;
grant select, insert, update, delete on table public.seances_reelles to authenticated;
grant usage, select on sequence public.seances_reelles_id_seq to authenticated;
