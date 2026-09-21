alter table public.ideaux
  add column if not exists palier_numero integer not null default 1,
  add column if not exists cycle_paliers jsonb not null default '[]'::jsonb,
  add column if not exists reprise_etat jsonb;

alter table public.ideaux
  drop constraint if exists ideaux_palier_numero_check,
  add constraint ideaux_palier_numero_check check (palier_numero >= 1);

alter table public.seances_reelles
  add column if not exists palier_numero integer not null default 1;

alter table public.seances_reelles
  drop constraint if exists seances_reelles_palier_numero_check,
  add constraint seances_reelles_palier_numero_check check (palier_numero >= 1);

create index if not exists seances_reelles_ideal_palier_idx
  on public.seances_reelles (ideal_id, palier_numero, date_prevue);

comment on column public.ideaux.palier_numero is
  'Numero du palier actuellement actif. Les anciens paliers restent archives dans cycle_paliers.';
comment on column public.ideaux.cycle_paliers is
  'Historique immuable des paliers clotures avec parametres, plan, bilan et contexte de reprise.';
comment on column public.ideaux.reprise_etat is
  'Brouillon ou pause de reprise. La creation du palier suivant exige une validation utilisateur.';
comment on column public.seances_reelles.palier_numero is
  'Numero du palier auquel la seance prevue ou supplementaire appartient.';
