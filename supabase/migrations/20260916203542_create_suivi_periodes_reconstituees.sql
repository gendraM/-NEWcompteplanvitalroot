create table if not exists public.suivi_periodes_reconstituees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_debut date not null,
  date_fin date not null,
  statut text not null default 'reconstituee'
    check (statut in ('reconstituee', 'reportee')),
  reproposer_apres date,
  qualite_alimentaire text,
  frequence_extras text,
  repas_moyens integer check (repas_moyens between 1 and 4),
  challenge_realise boolean not null default false,
  challenge_type text,
  challenge_duree text,
  evolution_poids text,
  energie_globale text,
  classification jsonb not null default '{}'::jsonb,
  source text not null default 'questionnaire'
    check (source = 'questionnaire'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suivi_periodes_dates_valides check (date_fin >= date_debut),
  constraint suivi_periodes_user_dates_unique unique (user_id, date_debut, date_fin)
);

create index if not exists suivi_periodes_reconstituees_user_date_idx
  on public.suivi_periodes_reconstituees (user_id, date_debut desc);

alter table public.suivi_periodes_reconstituees enable row level security;

drop policy if exists "suivi_periodes_select_own" on public.suivi_periodes_reconstituees;
create policy "suivi_periodes_select_own"
  on public.suivi_periodes_reconstituees for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "suivi_periodes_insert_own" on public.suivi_periodes_reconstituees;
create policy "suivi_periodes_insert_own"
  on public.suivi_periodes_reconstituees for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "suivi_periodes_update_own" on public.suivi_periodes_reconstituees;
create policy "suivi_periodes_update_own"
  on public.suivi_periodes_reconstituees for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "suivi_periodes_delete_own" on public.suivi_periodes_reconstituees;
create policy "suivi_periodes_delete_own"
  on public.suivi_periodes_reconstituees for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.suivi_periodes_reconstituees to authenticated;

-- Les jours sans donnée ne doivent plus être confondus avec les jours reconstitués.
alter table public.semaines_validees
  add column if not exists jours_sans_donnee integer not null default 0
  check (jours_sans_donnee between 0 and 7);
