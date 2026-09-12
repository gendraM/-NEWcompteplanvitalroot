-- Migration appliquée au projet Supabase Becomingtherealme.
-- Identifie explicitement les défis de référence duration/occurrences et clôture
-- uniquement les défis de durée de l'utilisateur authentifié, en jours calendaires Europe/Paris.

alter table public.defis
  add column if not exists progression_model text,
  add column if not exists duree_unite text;

alter table public.defis drop constraint if exists defis_progression_model_check;
alter table public.defis add constraint defis_progression_model_check
  check (progression_model is null or progression_model in ('duration','occurrences'));

alter table public.defis drop constraint if exists defis_duree_unite_check;
alter table public.defis add constraint defis_duree_unite_check
  check (duree_unite is null or duree_unite in ('jour','semaine'));

update public.defis
set progression_model = case
      when nom in ('🍎 Pas de dessert par automatisme','🧀 1 portion ça suffit','💡 J’écoute mon ventre','🚫 Le faux allié','🔄 Je brise la chaîne','✨ Je me programme du plaisir','💧 1 cru par jour') then 'duration'
      when nom in ('🧠 Je suis plus fort·e que mes excuses','🌡️ Chaud devant… mais doux !','🔥 1 vraie faim = 1 vrai repas') then 'occurrences'
      else progression_model end,
    duree = case nom
      when '🍎 Pas de dessert par automatisme' then 5 when '🧀 1 portion ça suffit' then 3
      when '💡 J’écoute mon ventre' then 5 when '🚫 Le faux allié' then 3
      when '🔄 Je brise la chaîne' then 5 when '✨ Je me programme du plaisir' then 1
      when '💧 1 cru par jour' then 5 when '🧠 Je suis plus fort·e que mes excuses' then 3
      when '🌡️ Chaud devant… mais doux !' then 4 when '🔥 1 vraie faim = 1 vrai repas' then 5 else duree end,
    duree_unite = case
      when nom in ('🍎 Pas de dessert par automatisme','🧀 1 portion ça suffit','💡 J’écoute mon ventre','🚫 Le faux allié','🔄 Je brise la chaîne','💧 1 cru par jour') then 'jour'
      when nom = '✨ Je me programme du plaisir' then 'semaine' else null end
where nom in ('🍎 Pas de dessert par automatisme','🧠 Je suis plus fort·e que mes excuses','🧀 1 portion ça suffit','💡 J’écoute mon ventre','🚫 Le faux allié','🌡️ Chaud devant… mais doux !','🔄 Je brise la chaîne','🔥 1 vraie faim = 1 vrai repas','✨ Je me programme du plaisir','💧 1 cru par jour');

create or replace function public.clore_defis_duree()
returns jsonb language plpgsql security invoker set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_closed_ids integer[];
begin
  if v_user_id is null then raise exception 'Utilisateur non authentifie'; end if;
  with closed as (
    update public.defis d
    set status='terminé', progress=d.duree, ended_at=now()
    where d.user_id=v_user_id and d.status='en cours'
      and d.progression_model='duration' and d.started_at is not null
      and d.duree is not null and d.duree > 0 and d.duree_unite in ('jour','semaine')
      and ((d.duree_unite='jour' and (now() at time zone 'Europe/Paris')::date >= ((d.started_at at time zone 'Europe/Paris')::date + d.duree))
        or (d.duree_unite='semaine' and (now() at time zone 'Europe/Paris')::date >= ((d.started_at at time zone 'Europe/Paris')::date + (d.duree * 7))))
    returning d.id
  )
  select coalesce(array_agg(id), '{}'::integer[]) into v_closed_ids from closed;
  return jsonb_build_object('success',true,'closedCount',coalesce(array_length(v_closed_ids,1),0),'closedDefiIds',to_jsonb(v_closed_ids));
end;
$function$;

revoke all on function public.clore_defis_duree() from public, anon;
grant execute on function public.clore_defis_duree() to authenticated;
