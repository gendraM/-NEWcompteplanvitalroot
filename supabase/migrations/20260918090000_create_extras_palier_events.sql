-- Conserve l'histoire des passages de palier Extras sans dupliquer les badges.
-- Les événements sont immuables : première obtention, retour à un ancien palier
-- ou adaptation vers un palier plus souple.

begin;

create table if not exists public.extras_palier_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('first_reached', 'reached_again', 'adapted_up')),
  palier_depart smallint not null check (palier_depart in (1, 2, 3, 5)),
  palier_arrivee smallint not null check (palier_arrivee in (1, 2, 3, 5)),
  semaine_decisive date not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint extras_palier_events_transition_valide
    check (palier_depart <> palier_arrivee),
  constraint extras_palier_events_unique
    unique (user_id, type, palier_arrivee, semaine_decisive)
);

alter table public.extras_palier_events enable row level security;

drop policy if exists extras_palier_events_select_own on public.extras_palier_events;
create policy extras_palier_events_select_own
  on public.extras_palier_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists extras_palier_events_insert_own on public.extras_palier_events;
create policy extras_palier_events_insert_own
  on public.extras_palier_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.extras_palier_events from anon;
grant select, insert on table public.extras_palier_events to authenticated;

create index if not exists extras_palier_events_user_palier_date_idx
  on public.extras_palier_events (user_id, palier_arrivee, semaine_decisive desc);

-- Reconstitue uniquement les premières obtentions déjà prouvées par un badge.
insert into public.extras_palier_events (
  user_id,
  type,
  palier_depart,
  palier_arrivee,
  semaine_decisive,
  details,
  created_at
)
select
  badge.user_id,
  'first_reached',
  (badge.details ->> 'palier_depart')::smallint,
  (badge.details ->> 'palier_atteint')::smallint,
  (badge.details ->> 'semaine_decisive')::date,
  jsonb_build_object(
    'semaines', coalesce(badge.details -> 'semaines', '[]'::jsonb),
    'semaines_requises', badge.details -> 'semaines_requises',
    'source', 'badge_existant'
  ),
  badge.date_obtention
from public.badges badge
where badge.type = 'extras_palier'
  and badge.details ? 'palier_depart'
  and badge.details ? 'palier_atteint'
  and badge.details ? 'semaine_decisive'
on conflict (user_id, type, palier_arrivee, semaine_decisive) do nothing;

commit;
