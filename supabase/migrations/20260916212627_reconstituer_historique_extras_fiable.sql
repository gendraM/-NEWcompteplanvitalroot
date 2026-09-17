-- Cloture la mise en conformite de l'historique Extras sans perdre de donnees.
-- 1. Les anciens budgets du dimanche qui ont deja un equivalent canonique le
--    lundi sont conserves comme archives, mais ne sont plus des budgets actifs.
-- 2. Les anciennes semaines du dimanche ne sont completees que lorsqu'elles
--    possedent des repas reels. Le budget historique reste NULL s'il n'existe
--    aucune preuve : ces semaines restent visibles sans compter dans le palier.

begin;

alter table public.extras_budget
  add column if not exists est_archive boolean not null default false,
  add column if not exists remplace_par uuid references public.extras_budget(id);

alter table public.extras_budget
  drop constraint if exists extras_budget_date_semaine_lundi;

update public.extras_budget as ancien
set est_archive = true,
    remplace_par = lundi.id
from public.extras_budget as lundi
where extract(isodow from ancien.date_semaine) = 7
  and lundi.user_id = ancien.user_id
  and lundi.date_semaine = ancien.date_semaine + 1
  and lundi.id <> ancien.id;

alter table public.extras_budget
  add constraint extras_budget_date_semaine_lundi
  check (est_archive or extract(isodow from date_semaine) = 1);

comment on column public.extras_budget.est_archive is
  'Vrai pour une ancienne reference hebdomadaire conservee uniquement comme trace historique.';
comment on column public.extras_budget.remplace_par is
  'Budget canonique du lundi qui remplace cette ancienne reference archivee.';

with semaines_candidates as (
  select sv.id, sv.user_id, sv."weekStart"
  from public.semaines_validees sv
  where sv.validee is true
    and sv.extras_count is null
    and sv.kcal_extras is null
    and sv.budget_extras is null
    and extract(isodow from sv."weekStart") = 7
    and not exists (
      select 1
      from public.semaines_validees canonique
      where canonique.user_id = sv.user_id
        and canonique."weekStart" = sv."weekStart" - 6
        and canonique.id <> sv.id
    )
    and exists (
      select 1
      from public.repas_reels repas
      where repas.user_id = sv.user_id
        and repas.date between sv."weekStart" - 6 and sv."weekStart"
    )
),
moments as (
  select
    semaine.id as semaine_id,
    coalesce(repas.occurrence_repas_id::text, 'historique:' || repas.id::text) as moment_id,
    min(repas.date) as date,
    min(coalesce(repas.type, repas.type_repas, 'inconnu')) as moment,
    jsonb_agg(coalesce(repas.aliment, 'Extra') order by repas.id) as aliments,
    sum(coalesce(repas.kcal, repas.calories, 0))::numeric as kcal
  from semaines_candidates semaine
  join public.repas_reels repas
    on repas.user_id = semaine.user_id
   and repas.date between semaine."weekStart" - 6 and semaine."weekStart"
  where repas.est_extra is true
     or lower(trim(coalesce(repas.categorie, ''))) = 'extra'
  group by semaine.id, coalesce(repas.occurrence_repas_id::text, 'historique:' || repas.id::text)
),
reconstitution as (
  select
    semaine.id,
    count(moment.moment_id)::integer as extras_count,
    coalesce(sum(moment.kcal), 0)::numeric as kcal_extras,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'type', 'extra',
          'nom', array_to_string(array(select jsonb_array_elements_text(moment.aliments)), ' + '),
          'aliments', moment.aliments,
          'date', moment.date,
          'moment', moment.moment,
          'kcal', moment.kcal,
          'occurrence_repas_id', case when moment.moment_id like 'historique:%' then null else moment.moment_id end
        ) order by moment.date, moment.moment_id
      ) filter (where moment.moment_id is not null),
      '[]'::jsonb
    ) as extras_details
  from semaines_candidates semaine
  left join moments moment on moment.semaine_id = semaine.id
  group by semaine.id
)
update public.semaines_validees sv
set extras_count = reconstitution.extras_count,
    kcal_extras = reconstitution.kcal_extras,
    extras_details = reconstitution.extras_details
from reconstitution
where sv.id = reconstitution.id;

commit;
