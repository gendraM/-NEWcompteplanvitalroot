-- Étape 1 — Compléter la structure du parcours jeûne
-- Branche : finalisation-jeune-chatgpt
-- Migration additive : aucune table, colonne ou donnée supprimée.
-- IMPORTANT : cette migration n'active PAS le RLS et ne crée aucune politique RLS.

begin;

-- 1. Garantir que chaque parcours possède un identifiant réellement unique.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.parcours_jeune'::regclass
      and contype = 'p'
  ) then
    if exists (
      select id
      from public.parcours_jeune
      group by id
      having count(*) > 1
    ) then
      raise exception
        'Impossible d''ajouter la clé primaire : parcours_jeune contient des identifiants dupliqués.';
    end if;

    alter table public.parcours_jeune
      add constraint parcours_jeune_pkey primary key (id);
  end if;
end
$$;

-- 2. Ajouter les repères temporels du cycle complet.
alter table public.parcours_jeune
  add column if not exists date_debut_preparation date,
  add column if not exists date_fin_preparation date,
  add column if not exists date_debut_jeune date,
  add column if not exists date_fin_jeune date,
  add column if not exists date_debut_reprise date,
  add column if not exists date_fin_reprise date,
  add column if not exists date_debut_consolidation date,
  add column if not exists date_fin_consolidation date,
  add column if not exists duree_preparation_jours integer,
  add column if not exists duree_reprise_jours integer;

comment on column public.parcours_jeune.type is
  'Phase courante du cycle : preparation, jeune, reprise ou consolidation.';

comment on column public.parcours_jeune.duree_jours is
  'Durée prévue de la phase de jeûne, conservée pour compatibilité avec le code existant.';

-- 3. Accepter le statut "supprime" déjà utilisé par le code d'archivage.
alter table public.parcours_jeune
  drop constraint if exists parcours_jeune_statut_check;

alter table public.parcours_jeune
  add constraint parcours_jeune_statut_check
  check (
    statut::text = any (
      array[
        'en_cours'::text,
        'termine'::text,
        'abandonne'::text,
        'supprime'::text
      ]
    )
  );

-- 4. Préparer un lien explicite entre la préparation et le cycle central.
alter table public.preparations_jeune
  add column if not exists parcours_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.preparations_jeune'::regclass
      and conname = 'preparations_jeune_parcours_id_fkey'
  ) then
    alter table public.preparations_jeune
      add constraint preparations_jeune_parcours_id_fkey
      foreign key (parcours_id)
      references public.parcours_jeune(id)
      on delete set null;
  end if;
end
$$;

-- 5. Préparer le même lien entre la reprise et le cycle central.
alter table public.reprises_alimentaires
  add column if not exists parcours_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reprises_alimentaires'::regclass
      and conname = 'reprises_alimentaires_parcours_id_fkey'
  ) then
    alter table public.reprises_alimentaires
      add constraint reprises_alimentaires_parcours_id_fkey
      foreign key (parcours_id)
      references public.parcours_jeune(id)
      on delete set null;
  end if;
end
$$;

-- 6. Index utiles pour retrouver rapidement le cycle actif et ses étapes.
create index if not exists idx_parcours_jeune_user_statut
  on public.parcours_jeune (user_id, statut, created_at desc);

create index if not exists idx_preparations_jeune_parcours_id
  on public.preparations_jeune (parcours_id);

create index if not exists idx_reprises_alimentaires_parcours_id
  on public.reprises_alimentaires (parcours_id);

commit;

-- Vérification en lecture seule après exécution.
select
  c.table_name,
  c.column_name,
  c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and (
    (c.table_name = 'parcours_jeune'
      and c.column_name in (
        'date_debut_preparation',
        'date_fin_preparation',
        'date_debut_jeune',
        'date_fin_jeune',
        'date_debut_reprise',
        'date_fin_reprise',
        'date_debut_consolidation',
        'date_fin_consolidation',
        'duree_preparation_jours',
        'duree_reprise_jours'
      ))
    or
    (c.table_name in ('preparations_jeune', 'reprises_alimentaires')
      and c.column_name = 'parcours_id')
  )
order by c.table_name, c.ordinal_position;
