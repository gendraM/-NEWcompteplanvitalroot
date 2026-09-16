alter table public.defis
  add column if not exists parent_defi_id integer references public.defis(id) on delete set null,
  add column if not exists tentative_no integer not null default 1;

create index if not exists defis_parent_defi_id_idx on public.defis(parent_defi_id);

create or replace function public.refaire_defi(p_defi_id integer)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_source public.defis%rowtype;
  v_root_id integer;
  v_next_no integer;
  v_new_id integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if exists (
    select 1 from public.defis
    where user_id = v_user_id and status = 'en cours'
  ) then
    raise exception 'active_challenge_exists';
  end if;

  select * into v_source
  from public.defis
  where id = p_defi_id and user_id = v_user_id and status = 'terminé';

  if not found then
    raise exception 'completed_challenge_not_found';
  end if;

  v_root_id := coalesce(v_source.parent_defi_id, v_source.id);

  select coalesce(max(tentative_no), 1) + 1 into v_next_no
  from public.defis
  where user_id = v_user_id
    and (id = v_root_id or parent_defi_id = v_root_id);

  insert into public.defis (
    type, theme, nom, description, duree, unite, status, progress,
    user_id, started_at, ended_at, progression_model, duree_unite,
    parent_defi_id, tentative_no
  ) values (
    v_source.type, v_source.theme, v_source.nom, v_source.description,
    v_source.duree, v_source.unite, 'disponible', 0,
    v_user_id, null, null, v_source.progression_model, v_source.duree_unite,
    v_root_id, v_next_no
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

revoke execute on function public.refaire_defi(integer) from public, anon;
grant execute on function public.refaire_defi(integer) to authenticated;
