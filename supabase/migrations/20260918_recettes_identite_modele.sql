-- Mon Plan Vital — Recettes intelligentes
-- Lot : identité stable recette -> planning -> occurrence réelle
-- Migration additive et rétrocompatible : aucun historique n'est réécrit.

create table if not exists public.recettes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  nom text not null,
  composition jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  portions integer null,
  temps_preparation_minutes integer null,
  difficulte text null,
  origine text not null default 'personnelle',
  image_url text null,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recettes_portions_positive check (portions is null or portions > 0),
  constraint recettes_temps_preparation_non_negatif check (temps_preparation_minutes is null or temps_preparation_minutes >= 0),
  constraint recettes_origine_valide check (origine in ('personnelle', 'catalogue', 'ia', 'reprise_jeune'))
);

-- Le lien est volontairement nullable : les repas historiques et les repas sans recette restent valides.
alter table public.repas_planifies
  add column if not exists recette_id uuid null references public.recettes(id) on delete set null;

alter table public.repas_reels
  add column if not exists recette_id uuid null references public.recettes(id) on delete set null;

create index if not exists idx_recettes_user_id
  on public.recettes(user_id);

create index if not exists idx_repas_planifies_recette_id
  on public.repas_planifies(recette_id)
  where recette_id is not null;

create index if not exists idx_repas_reels_recette_id
  on public.repas_reels(recette_id)
  where recette_id is not null;

alter table public.recettes enable row level security;

-- Même logique d'isolation utilisateur que les repas personnels existants.
drop policy if exists "recettes_select_owner" on public.recettes;
create policy "recettes_select_owner"
  on public.recettes
  for select
  using (auth.uid() = user_id);

drop policy if exists "recettes_insert_owner" on public.recettes;
create policy "recettes_insert_owner"
  on public.recettes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "recettes_update_owner" on public.recettes;
create policy "recettes_update_owner"
  on public.recettes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recettes_delete_owner" on public.recettes;
create policy "recettes_delete_owner"
  on public.recettes
  for delete
  using (auth.uid() = user_id);

comment on table public.recettes is
  'Modèles de recettes intelligentes. Une recette est distincte de ses planifications et occurrences réellement consommées.';
comment on column public.repas_planifies.recette_id is
  'Identité stable facultative de la recette ayant généré cette ligne planifiée.';
comment on column public.repas_reels.recette_id is
  'Identité stable facultative de la recette à l’origine de cette ligne réellement consommée. occurrence_repas_id identifie la consommation, pas le modèle.';
