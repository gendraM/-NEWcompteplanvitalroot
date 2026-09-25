begin;

-- La table existe déjà dans le projet. Cette migration la raccorde à Supabase Auth
-- et complète uniquement ce qui manque au comportement restauré.
alter table public.suivi_periodes_estimees
  alter column user_id type uuid using (user_id::uuid),
  add column if not exists statut text not null default 'reconstituee',
  add column if not exists reproposer_apres date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.suivi_periodes_estimees'::regclass
      and conname = 'suivi_periodes_estimees_user_id_fkey'
  ) then
    alter table public.suivi_periodes_estimees
      add constraint suivi_periodes_estimees_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.suivi_periodes_estimees'::regclass
      and conname = 'suivi_periodes_estimees_statut_check'
  ) then
    alter table public.suivi_periodes_estimees
      add constraint suivi_periodes_estimees_statut_check
      check (statut in ('reconstituee', 'reportee'));
  end if;
end
$$;

create unique index if not exists suivi_periodes_estimees_user_dates_unique
  on public.suivi_periodes_estimees (user_id, date_debut, date_fin);

create index if not exists suivi_periodes_estimees_user_date_idx
  on public.suivi_periodes_estimees (user_id, date_debut desc);

comment on table public.suivi_periodes_estimees is
  'Périodes de suivi reconstituées via questionnaire, séparées des repas réellement observés.';
comment on column public.suivi_periodes_estimees.user_id is
  'Utilisateur authentifié propriétaire de la période.';

alter table public.suivi_periodes_estimees enable row level security;

drop policy if exists "ok" on public.suivi_periodes_estimees;
drop policy if exists "suivi_periodes_select_own" on public.suivi_periodes_estimees;
drop policy if exists "suivi_periodes_insert_own" on public.suivi_periodes_estimees;
drop policy if exists "suivi_periodes_update_own" on public.suivi_periodes_estimees;
drop policy if exists "suivi_periodes_delete_own" on public.suivi_periodes_estimees;

create policy "suivi_periodes_select_own"
  on public.suivi_periodes_estimees for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "suivi_periodes_insert_own"
  on public.suivi_periodes_estimees for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "suivi_periodes_update_own"
  on public.suivi_periodes_estimees for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "suivi_periodes_delete_own"
  on public.suivi_periodes_estimees for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.suivi_periodes_estimees from anon;
revoke all on table public.suivi_periodes_estimees from authenticated;
grant select, insert, update, delete on table public.suivi_periodes_estimees to authenticated;

-- Les jours sans donnée ne doivent plus être confondus avec les jours reconstitués.
alter table public.semaines_validees
  add column if not exists jours_sans_donnee integer not null default 0
  check (jours_sans_donnee between 0 and 7);

commit;
