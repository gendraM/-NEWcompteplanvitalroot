-- Migration déjà appliquée au projet Supabase Becomingtherealme.
-- Source de vérité Git du moteur Défis V2 : progression atomique par preuve.

alter table public.journal_defis
  add column if not exists validation_mode text,
  add column if not exists preuve_id text,
  add column if not exists preuve_source text;

create unique index if not exists journal_defis_preuve_unique
  on public.journal_defis (user_id, defi_id, preuve_id)
  where preuve_id is not null and valide is true;

create or replace function public.valider_preuve_defi_atomique(
  p_defi_id integer,
  p_preuve_id text,
  p_validation_mode text,
  p_preuve_source text default null,
  p_donnees jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_defi public.defis%rowtype;
  v_journal public.journal_defis%rowtype;
  v_jour integer;
  v_new_progress integer;
  v_new_status text;
  v_engagements jsonb;
begin
  if v_user_id is null then raise exception 'Utilisateur non authentifie'; end if;
  if p_preuve_id is null or btrim(p_preuve_id) = '' then raise exception 'Preuve invalide'; end if;
  if p_validation_mode not in ('automatic','declarative','mixed') then raise exception 'Mode de validation invalide'; end if;

  select * into v_defi from public.defis where id=p_defi_id and user_id=v_user_id for update;
  if not found then raise exception 'Defi introuvable'; end if;
  if v_defi.status <> 'en cours' then raise exception 'Defi non actif'; end if;
  if coalesce(v_defi.duree,0) <= 0 then raise exception 'Duree du defi invalide'; end if;

  select * into v_journal from public.journal_defis
  where user_id=v_user_id and defi_id=p_defi_id and preuve_id=p_preuve_id and valide is true limit 1;
  if found then
    return jsonb_build_object('success',true,'etapeValidee',true,'progressionIncrementee',false,'dejaValidee',true,'newProgress',coalesce(v_defi.progress,0),'nouveauStatus',v_defi.status);
  end if;

  v_jour := least(coalesce(v_defi.progress,0)+1,v_defi.duree);
  v_engagements := jsonb_build_array(jsonb_build_object('tenu',true,'valide',true,'preuve_id',p_preuve_id,'source',p_preuve_source,'mode',p_validation_mode,'donnees',coalesce(p_donnees,'{}'::jsonb)));

  select * into v_journal from public.journal_defis where user_id=v_user_id and defi_id=p_defi_id and jour=v_jour for update;
  if found and v_journal.valide is true then
    return jsonb_build_object('success',true,'etapeValidee',true,'progressionIncrementee',false,'dejaValidee',true,'newProgress',coalesce(v_defi.progress,0),'nouveauStatus',v_defi.status);
  elsif found then
    update public.journal_defis set engagements=v_engagements,score='1/1',valide=true,validation_mode=p_validation_mode,preuve_id=p_preuve_id,preuve_source=p_preuve_source,updated_at=now() where id=v_journal.id and user_id=v_user_id;
  else
    insert into public.journal_defis(defi_id,jour,engagements,score,valide,user_id,validation_mode,preuve_id,preuve_source) values(p_defi_id,v_jour,v_engagements,'1/1',true,v_user_id,p_validation_mode,p_preuve_id,p_preuve_source);
  end if;

  v_new_progress := least(coalesce(v_defi.progress,0)+1,v_defi.duree);
  v_new_status := case when v_new_progress >= v_defi.duree then 'terminé' else 'en cours' end;
  update public.defis set progress=v_new_progress,status=v_new_status where id=p_defi_id and user_id=v_user_id;

  return jsonb_build_object('success',true,'etapeValidee',true,'progressionIncrementee',true,'dejaValidee',false,'newProgress',v_new_progress,'nouvelleProgression',v_new_progress,'nouveauStatus',v_new_status);
end;
$function$;

revoke all on function public.valider_preuve_defi_atomique(integer,text,text,text,jsonb) from public, anon;
grant execute on function public.valider_preuve_defi_atomique(integer,text,text,text,jsonb) to authenticated;
