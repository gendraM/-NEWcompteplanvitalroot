create table if not exists public.points_ajustement_alimentaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semaine_debut date not null,
  observation_debut date not null,
  observation_fin date not null,
  affichage_debut date not null,
  affichage_fin date not null,
  carte jsonb not null,
  cree_le timestamptz not null default now(),
  affiche_le timestamptz,
  ferme_le timestamptz,
  unique (user_id, semaine_debut)
);

alter table public.points_ajustement_alimentaires enable row level security;

grant select, insert on public.points_ajustement_alimentaires to authenticated;
revoke update on public.points_ajustement_alimentaires from authenticated;
grant update (affiche_le, ferme_le) on public.points_ajustement_alimentaires to authenticated;

drop policy if exists "Utilisateur propriétaire"
  on public.points_ajustement_alimentaires;

create policy "Utilisateur propriétaire"
on public.points_ajustement_alimentaires
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
