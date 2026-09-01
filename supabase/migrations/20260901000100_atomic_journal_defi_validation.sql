-- Sprint 1 Defis: validation atomique et idempotente d'une journee de journal.
-- La fonction reste SECURITY INVOKER et verifie explicitement auth.uid().

create unique index if not exists journal_defis_user_defi_jour_uidx
on public.journal_defis (user_id, defi_id, jour)
where user_id is not null and defi_id is not null;

create or replace function public.valider_journal_defi_atomique(
  p_defi_id integer,
  p_jour integer,
  p_engagements jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_journal public.journal_defis%rowtype;
  v_defi public.defis%rowtype;
  v_total integer;
  v_tenus integer;
  v_score text;
  v_etape_validee boolean;
  v_new_progress integer;
  v_new_status text;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;
  if p_jour is null or p_jour < 1 then
    raise exception 'Jour invalide';
  end if;
  if p_engagements is null or jsonb_typeof(p_engagements) <> 'array' then
    raise exception 'Engagements invalides';
  end if;

  select * into v_journal
  from public.journal_defis
  where defi_id = p_defi_id and jour = p_jour and user_id = v_user_id
  for update;
  if not found then
    raise exception 'Journal du jour introuvable';
  end if;

  select * into v_defi
  from public.defis
  where id = p_defi_id and user_id = v_user_id
  for update;
  if not found then
    raise exception 'Defi introuvable';
  end if;

  v_total := jsonb_array_length(p_engagements);
  select count(*) into v_tenus
  from jsonb_array_elements(p_engagements) e
  where coalesce((e->>'tenu')::boolean, false) = true
     or coalesce((e->>'valide')::boolean, false) = true;
  v_score := v_tenus::text || '/' || v_total::text;
  v_etape_validee := v_total > 0 and (v_tenus::numeric / v_total::numeric) >= (2.0 / 3.0);

  if v_journal.valide is true then
    return jsonb_build_object(
      'success', true,
      'etapeValidee', true,
      'progressionIncrementee', false,
      'newProgress', coalesce(v_defi.progress, 0),
      'nouveauStatus', v_defi.status,
      'dejaValidee', true
    );
  end if;

  if not v_etape_validee then
    update public.journal_defis
    set engagements = p_engagements, score = v_score, valide = false, updated_at = now()
    where id = v_journal.id and user_id = v_user_id;
    return jsonb_build_object(
      'success', true,
      'etapeValidee', false,
      'progressionIncrementee', false,
      'newProgress', coalesce(v_defi.progress, 0),
      'nouveauStatus', v_defi.status
    );
  end if;

  if coalesce(v_defi.duree, 0) <= 0 then
    raise exception 'Duree du defi invalide';
  end if;

  v_new_progress := least(coalesce(v_defi.progress, 0) + 1, v_defi.duree);
  v_new_status := case when v_new_progress >= v_defi.duree then 'terminé' else 'en cours' end;

  update public.defis
  set progress = v_new_progress, status = v_new_status
  where id = p_defi_id and user_id = v_user_id;

  update public.journal_defis
  set engagements = p_engagements, score = v_score, valide = true, updated_at = now()
  where id = v_journal.id and user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'etapeValidee', true,
    'progressionIncrementee', true,
    'newProgress', v_new_progress,
    'nouvelleProgression', v_new_progress,
    'nouveauStatus', v_new_status,
    'dejaValidee', false
  );
end;
$$;

revoke all on function public.valider_journal_defi_atomique(integer, integer, jsonb) from public;
revoke all on function public.valider_journal_defi_atomique(integer, integer, jsonb) from anon;
grant execute on function public.valider_journal_defi_atomique(integer, integer, jsonb) to authenticated;
